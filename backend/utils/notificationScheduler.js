import Booking from "../models/booking.model.js";
import { createNotification } from "../controller/notification.controller.js";

// Run frequently to avoid delayed push delivery (e.g., session start/end firing late)
const CHECK_INTERVAL_MS = 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;
const HOUR_MS = 60 * 60 * 1000;

const parseTimeOnDate = (dateValue, timeString) => {
  const [_, hours, minutes, meridiem] = timeString.match(/(\d+):(\d+) (AM|PM)/) || [];
  if (!hours || !minutes || !meridiem) return null;

  const date = new Date(dateValue);
  let hour = parseInt(hours, 10);
  const minute = parseInt(minutes, 10);
  const isPm = meridiem === "PM";

  if (isPm && hour !== 12) hour += 12;
  if (!isPm && hour === 12) hour = 0;

  date.setHours(hour, minute, 0, 0);
  return date;
};

const buildContextId = (bookingId, studentId, label) => `${bookingId}-${studentId}-${label}`;

const shouldRemind = (status) => !["Completed", "Cancelled", "Not Attended"].includes(status || "");

const runBookingNotificationSweep = async () => {
  const now = new Date();
  const rangeStart = new Date(now.getTime() - DAY_MS);
  const rangeEnd = new Date(now.getTime() + DAY_MS);

  const bookings = await Booking.find({
    _date: { $gte: rangeStart, $lte: rangeEnd },
  }).populate("students._studentId");

  for (const booking of bookings) {
    const start = parseTimeOnDate(booking._date, booking._timeSlot.startTime);
    const end = parseTimeOnDate(booking._date, booking._timeSlot.endTime);
    if (!start || !end) continue;

    for (const student of booking.students) {
      const studentId = student._studentId?._id || student._studentId;
      const status = student._bookingStatus;
      const base = {
        user: studentId,
        booking: booking._id,
        link: "/booking",
        scheduledFor: start,
      };

      if (shouldRemind(status) && start > now && start.getTime() - now.getTime() <= DAY_MS) {
        const bookingDate = new Date(start);
        const today = new Date(now);
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        let message = "Reminder: you have a booking.";
        if (bookingDate.toDateString() === today.toDateString()) {
          message = "Reminder: you have a booking today.";
        } else if (bookingDate.toDateString() === tomorrow.toDateString()) {
          message = "Reminder: you have a booking tomorrow.";
        } else {
          message = `Reminder: you have a booking on ${bookingDate.toLocaleDateString()}.`;
        }

        await createNotification({
          ...base,
          message,
          type: "BOOKING_REMINDER_1D",
          contextId: buildContextId(booking._id, studentId, "1d"),
        });
      }

      if (shouldRemind(status) && start > now && start.getTime() - now.getTime() <= HOUR_MS) {
        await createNotification({
          ...base,
          message: "Reminder: your booking starts in 1 hour.",
          type: "BOOKING_REMINDER_1H",
          contextId: buildContextId(booking._id, studentId, "1h"),
        });
      }

      if (status === "Awaiting Arrival" && now >= start && now <= end) {
        await createNotification({
          ...base,
          message: "Your session is starting. Please time in.",
          type: "BOOKING_START",
          contextId: buildContextId(booking._id, studentId, "start"),
        });
      }

      if (!student._timedOut && now >= end) {
        await createNotification({
          ...base,
          message: "Your session ended. Please time out.",
          type: "BOOKING_END",
          contextId: buildContextId(booking._id, studentId, "end"),
        });
      }

      if (status === "Awaiting Arrival" && !student._timedIn && !student._timedOut && now > end) {
        await createNotification({
          ...base,
          message: "You missed your booking. No time-in was recorded.",
          type: "BOOKING_MISSED",
          contextId: buildContextId(booking._id, studentId, "missed"),
        });
      }
    }
  }
};

export const startNotificationScheduler = () => {
  runBookingNotificationSweep().catch((error) => console.error("Notification sweep error:", error));
  setInterval(() => {
    runBookingNotificationSweep().catch((error) => console.error("Notification sweep error:", error));
  }, CHECK_INTERVAL_MS);
};
