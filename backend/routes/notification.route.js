import express from "express";
import {
    getNotifications,
    markAsRead,
    markAllAsRead,
} from "../controller/notification.controller.js";

const router = express.Router();

// Route for getting all notifications for a user
router.get("/:userId", getNotifications);

// Route for marking a notification as read
router.patch("/:notificationId/read", markAsRead);

// Route for marking all notifications for a user as read
router.patch("/user/:userId/read", markAllAsRead);

const notificationRoutes = router;

export default notificationRoutes;
