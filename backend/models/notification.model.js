import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student",
        required: true,
    },
    booking: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Booking",
    },
    message: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        enum: [
            "QUEUE_SUCCESS",
            "QUEUE_FAIL",
            "BOOKING_REMINDER_1D",
            "BOOKING_REMINDER_1H",
            "BOOKING_START",
            "BOOKING_END",
            "BOOKING_MISSED",
            "BOOKING_COMPLETED",
            "BOOKING_CANCELLED"
        ],
        required: true,
    },
    read: {
        type: Boolean,
        default: false,
    },
    link: {
        type: String,
    },
    contextId: {
        type: String,
    },
    scheduledFor: {
        type: Date,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

notificationSchema.index({ user: 1, type: 1, contextId: 1 }, {
    unique: true,
    partialFilterExpression: { contextId: { $exists: true, $type: "string" } },
});

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;
