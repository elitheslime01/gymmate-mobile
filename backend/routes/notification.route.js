import express from "express";
import {
    getNotifications,
    markAsRead,
    markAllAsRead,
    savePushSubscription,
    triggerPushNotification,
} from "../controller/notification.controller.js";

const router = express.Router();

// Routes for push subscription and manual trigger
router.post("/subscribe", savePushSubscription);
router.post("/send", triggerPushNotification);

// Route for getting all notifications for a user
router.get("/:userId", getNotifications);

// Route for marking a notification as read
router.patch("/:notificationId/read", markAsRead);

// Route for marking all notifications for a user as read
router.patch("/user/:userId/read", markAllAsRead);

const notificationRoutes = router;

export default notificationRoutes;
