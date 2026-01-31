import Notification from "../models/notification.model.js";

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
