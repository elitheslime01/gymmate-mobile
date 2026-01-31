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

// This is an internal function to create a notification
// It will be called from other controllers (e.g., booking, queue)
export const createNotification = async (notificationData) => {
    try {
        const { user, type, contextId } = notificationData;

        if (user && type && contextId) {
            const existing = await Notification.findOne({ user, type, contextId });
            if (existing) {
                return existing;
            }
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
