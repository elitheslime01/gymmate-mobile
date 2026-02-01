import mongoose from "mongoose";
import AllocationStatus from "../models/allocationStatus.model.js";
import Booking from "../models/booking.model.js";
import { createNotification } from "./notification.controller.js";

export const notifyAllocationStatus = async (req, res) => {
  try {
    const { userId, bookingId } = req.body;

    if (!userId || !bookingId) {
      return res.status(400).json({ success: false, message: "userId and bookingId are required." });
    }

    if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(bookingId)) {
      return res.status(400).json({ success: false, message: "Invalid userId or bookingId." });
    }

    const allocation = await AllocationStatus.findOne({ user: userId, booking: bookingId });
    if (!allocation) {
      return res.status(404).json({ success: false, message: "Allocation status not found for this user and booking." });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found." });
    }

    const dateLabel = new Date(booking._date).toLocaleDateString("en-US", { month: "short", day: "numeric" });
    const slotLabel = `${booking._timeSlot.startTime} - ${booking._timeSlot.endTime}`;

    if (allocation.status === "WAITING") {
      return res.status(200).json({ success: true, message: "Allocation still pending. No notification sent." });
    }

    const notificationType = allocation.status === "ALLOCATED" ? "BOOKING_CONFIRMED" : "QUEUE_FAIL";
    const defaultMessage = allocation.status === "ALLOCATED"
      ? `Booking confirmed for ${dateLabel} (${slotLabel}).`
      : allocation.reason
        ? `Unable to secure a slot for ${dateLabel} (${slotLabel}). Reason: ${allocation.reason}.`
        : `Unable to secure a slot for ${dateLabel} (${slotLabel}).`;

    const notification = await createNotification({
      user: userId,
      booking: bookingId,
      message: defaultMessage,
      type: notificationType,
      link: "/booking",
      contextId: `${bookingId}-${userId}-${notificationType.toLowerCase()}`,
      scheduledFor: booking._date,
    });

    if (!notification) {
      return res.status(500).json({ success: false, message: "Failed to create notification." });
    }

    return res.status(200).json({ success: true, message: "Notification dispatched.", status: allocation.status });
  } catch (error) {
    console.error("Error notifying allocation status:", error.message);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};
