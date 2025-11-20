import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import adminsRoutes from "./routes/admin.route.js";
import scheduleRoutes from "./routes/schedule.route.js"; // Import the schedule routes
import cors from 'cors';
import studentsRoutes from "./routes/student.route.js";
import arRoutes from "./routes/ar.route.js";
import queueRoutes from "./routes/queue.route.js";
import { fileURLToPath } from 'url';
import { dirname } from 'path'
import path from 'path';
import arImageRoutes from "./routes/arImage.route.js";
import bookingRoutes from "./routes/booking.route.js";
import feedbackRoutes from "./routes/feedback.route.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env from backend directory (handles both running from root and backend dir)
dotenv.config({ path: path.join(__dirname, '.env') })

console.log('Environment check:');
console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'loaded' : 'MISSING');
console.log('PORT:', process.env.PORT);

const app = express()
const PORT = process.env.PORT || 5001

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/public', express.static(path.join(__dirname, '../public'))); 

// Register API routes BEFORE app.listen()
app.use("/api/admins", adminsRoutes)
app.use("/api/schedules", scheduleRoutes);
app.use("/api/students", studentsRoutes);
app.use("/api/ARCodes", arRoutes);
app.use("/api/queues", queueRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/arImage", arImageRoutes);
app.use("/api/feedback", feedbackRoutes);

app.listen(PORT, '0.0.0.0', () => {
    connectDB();
    console.log("Server started at http://localhost:" + PORT);
    console.log("Network access enabled - use your IP address for mobile devices");
});
