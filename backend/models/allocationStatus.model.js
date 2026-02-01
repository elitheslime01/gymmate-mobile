import mongoose from "mongoose";

const allocationStatusSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
    },
    status: {
      type: String,
      enum: ["WAITING", "ALLOCATED", "FAILED"],
      required: true,
      default: "WAITING",
    },
    reason: {
      type: String,
    },
    allocatedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

allocationStatusSchema.index({ user: 1 });
allocationStatusSchema.index({ booking: 1 });
allocationStatusSchema.index({ user: 1, booking: 1, status: 1 });

const AllocationStatus = mongoose.model("AllocationStatus", allocationStatusSchema);

export default AllocationStatus;
