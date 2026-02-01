import mongoose from "mongoose";
import Notification from "../models/notification.model.js";
import Student from "../models/student.model.js";
import { broadcastPushNotifications } from "../utils/push.js";

const DEFAULT_ICON_PATH = "/gymmate_logo.png";

const sendPushForNotification = async (notification) => {
    try {
        const student = await Student.findById(notification.user).select("_pushSubscriptions");
        if (!student || !student._pushSubscriptions || student._pushSubscriptions.length === 0) {
            return;
        }

        const payload = {
            title: "GymMate",
            body: notification.message,
            icon: DEFAULT_ICON_PATH,
            data: {
                url: notification.link || "/notification",
                type: notification.type,
                notificationId: notification._id?.toString(),
            },
        };

        const invalidEndpoints = await broadcastPushNotifications(student._pushSubscriptions, payload);
        if (invalidEndpoints.length > 0) {
            student._pushSubscriptions = student._pushSubscriptions.filter(
                (sub) => !invalidEndpoints.includes(sub.endpoint)
            );
            await student.save();
        }
    } catch (error) {
        console.error("Error sending push notification:", error);
    }
};

// Find an existing notification to avoid duplicates for the same booking/type or context
export const findExistingNotification = async ({ user, booking, type, contextId }) => {
    const filters = [];

    if (user && type && contextId) {
        filters.push({ user, type, contextId });
    }

    if (user && booking && type) {
        filters.push({ user, booking, type });
    }

    if (filters.length === 0) {
        return null;
    }

    const query = filters.length === 1 ? filters[0] : { $or: filters };
    return Notification.findOne(query);
};

// This is an internal function to create a notification
// It will be called from other controllers (e.g., booking, queue)
export const createNotification = async (notificationData) => {
    try {
        const existing = await findExistingNotification(notificationData);
        if (existing) {
            return existing;
        }

        const notification = new Notification(notificationData);
        await notification.save();

        console.log("Notification created:", notification);
        await sendPushForNotification(notification);
        return notification;
    } catch (error) {
        if (error.code === 11000) {
            return null;
        }
        console.error("Error creating notification:", error);
        return null;
    }
};

// Get all notifications for a specific user
export const getNotifications = async (req, res) => {
    try {
        // Assuming the user's ID is available in the request (e.g., from auth middleware)
        const { userId } = req.params; 
        const notifications = await Notification.find({ user: userId }).sort({ createdAt: -1 });
        res.status(200).json(notifications);
    } catch (error) {
        console.error("Error fetching notifications:", error);
        res.status(500).json({ message: "Server error" });
    }
};

export const savePushSubscription = async (req, res) => {
    try {
        const { userId, subscription } = req.body;

        if (!userId || !subscription || typeof subscription !== "object") {
            return res.status(400).json({ success: false, message: "userId and subscription are required." });
        }

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ success: false, message: "Invalid userId." });
        }

        if (!subscription.endpoint || !subscription.keys?.p256dh || !subscription.keys?.auth) {
            return res.status(400).json({ success: false, message: "Subscription endpoint and keys are required." });
        }

        const student = await Student.findById(userId);
        if (!student) {
            return res.status(404).json({ success: false, message: "Student not found." });
        }

        // Ensure _pushSubscriptions is an array (for existing students)
        if (!Array.isArray(student._pushSubscriptions)) {
            student._pushSubscriptions = [];
        }

        const existingIndex = student._pushSubscriptions.findIndex(
            (sub) => sub.endpoint === subscription.endpoint
        );

        if (existingIndex >= 0) {
            student._pushSubscriptions[existingIndex] = {
                ...student._pushSubscriptions[existingIndex].toObject(),
                ...subscription,
            };
        } else {
            student._pushSubscriptions.push(subscription);
        }

        await student.save();
        res.status(200).json({ success: true, message: "Subscription saved." });
    } catch (error) {
        console.error("Error saving subscription:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

export const triggerPushNotification = async (req, res) => {
    try {
        const { userId, title, body, link, icon } = req.body;

        if (!userId || !title || !body) {
            return res.status(400).json({ success: false, message: "userId, title, and body are required." });
        }

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ success: false, message: "Invalid userId." });
        }

        const student = await Student.findById(userId).select("_pushSubscriptions");
        if (!student) {
            return res.status(404).json({ success: false, message: "Student not found." });
        }

        if (!student._pushSubscriptions || student._pushSubscriptions.length === 0) {
            return res.status(200).json({ success: true, message: "No active push subscriptions for user." });
        }

        const payload = {
            title,
            body,
            icon: icon || DEFAULT_ICON_PATH,
            data: {
                url: link || "/notification",
                type: "MANUAL_TRIGGER",
            },
        };

        const invalidEndpoints = await broadcastPushNotifications(student._pushSubscriptions, payload);
        if (invalidEndpoints.length > 0) {
            student._pushSubscriptions = student._pushSubscriptions.filter(
                (sub) => !invalidEndpoints.includes(sub.endpoint)
            );
            await student.save();
        }

        res.status(200).json({ success: true, message: "Push notification dispatched." });
    } catch (error) {
        console.error("Error triggering push notification:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// Endpoint so external systems (e.g., admin allocation app) can trigger booking lifecycle notifications instantly
export const triggerBookingNotification = async (req, res) => {
    try {
        const { userId, bookingId, type, date, startTime, endTime, message, link } = req.body;

        const allowedTypes = ["BOOKING_CONFIRMED", "BOOKING_START", "BOOKING_END", "BOOKING_MISSED", "BOOKING_CANCELLED"];

        if (!userId || !bookingId || !type || !date || !startTime || !endTime) {
            return res.status(400).json({ success: false, message: "userId, bookingId, type, date, startTime, and endTime are required." });
        }

        if (!allowedTypes.includes(type)) {
            return res.status(400).json({ success: false, message: "Invalid notification type for booking." });
        }

        if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(bookingId)) {
            return res.status(400).json({ success: false, message: "Invalid userId or bookingId." });
        }

        const student = await Student.findById(userId).select("_pushSubscriptions");
        if (!student) {
            return res.status(404).json({ success: false, message: "Student not found." });
        }

        const dateLabel = new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" });
        const slotLabel = `${startTime} - ${endTime}`;

        const defaultMessages = {
            BOOKING_CONFIRMED: `Booking confirmed for ${dateLabel} (${slotLabel}).`,
            BOOKING_START: `Your session is starting now for ${dateLabel} (${slotLabel}). Please time in.`,
            BOOKING_END: `Your session ended for ${dateLabel} (${slotLabel}). Please time out.`,
            BOOKING_MISSED: `You missed your booking on ${dateLabel} (${slotLabel}).`,
            BOOKING_CANCELLED: `Your booking on ${dateLabel} (${slotLabel}) was cancelled.`,
        };

        const finalMessage = message || defaultMessages[type] || "Booking update.";
        const contextId = `${bookingId}-${userId}-${type.toLowerCase()}`;

        const notification = await createNotification({
            user: userId,
            booking: bookingId,
            message: finalMessage,
            type,
            link: link || "/booking",
            contextId,
            scheduledFor: new Date(date),
        });

        if (notification) {
            return res.status(200).json({ success: true, message: "Booking notification sent." });
        }

        return res.status(500).json({ success: false, message: "Failed to create booking notification." });
    } catch (error) {
        console.error("Error triggering booking notification:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// Mark a specific notification as read
export const markAsRead = async (req, res) => {
    try {
        const { notificationId } = req.params;
        const notification = await Notification.findById(notificationId);

        if (!notification) {
            return res.status(404).json({ message: "Notification not found" });
        }

        notification.read = true;
        await notification.save();

        res.status(200).json({ message: "Notification marked as read", notification });
    } catch (error) {
        console.error("Error marking notification as read:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// Mark all notifications for a user as read
export const markAllAsRead = async (req, res) => {
    try {
        const { userId } = req.params;
        await Notification.updateMany({ user: userId, read: false }, { read: true });
        res.status(200).json({ message: "All notifications marked as read" });
    } catch (error) {
        console.error("Error marking all notifications as read:", error);
        res.status(500).json({ message: "Server error" });
    }
};
