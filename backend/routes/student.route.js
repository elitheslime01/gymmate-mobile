import express from "express";
import { createStudent, loginStudent, logoutStudent, updateStudent } from "../controller/student.controller.js";
import upload from "../utils/multer.js";

const router = express.Router();

// Route for creating a new student
router.post("/", createStudent);

// Route for logging in a new student
router.post("/login", loginStudent);

// Route for logging out a new student
router.post("/logout", logoutStudent);

// Route for updating student profile
router.put("/:id", upload.single("profileImage"), updateStudent);

const studentsRoutes = router;

export default studentsRoutes;