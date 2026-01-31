import mongoose from "mongoose";
import crypto from "crypto";
import bcrypt from "bcrypt";
import Student from "../models/student.model.js";
import { sendVerificationEmail } from "../utils/email.js";

const VERIFICATION_EXPIRY_MINUTES = 10;
const RESEND_COOLDOWN_MS = 60 * 1000;
const MAX_RESENDS_PER_HOUR = 5;
const MAX_ATTEMPTS_PER_CODE = 5;

const hashCode = (code) => crypto.createHash("sha256").update(code).digest("hex");
const generateCode = () => Math.floor(100000 + Math.random() * 900000).toString();

export const createStudent = async (req, res) => {
    const student = req.body;

    if (
        !student._fName ||
        !student._lName ||
        !student._sex ||
        !student._college ||
        !student._course ||
        !student._year ||
        !student._section ||
        !student._umakEmail ||
        !student._umakID ||
        !student._password ||
        !student._lastLogin
    ) {
        return res.status(400).json({ success: false, message: "Please fill in all fields" });
    }

    try {
        const existingEmail = await Student.findOne({ _umakEmail: student._umakEmail });
        if (existingEmail) {
            return res.status(409).json({ success: false, message: "Email is already registered." });
        }

        const existingId = await Student.findOne({ _umakID: student._umakID });
        if (existingId) {
            return res.status(409).json({ success: false, message: "Student ID is already registered." });
        }

        const verificationCode = generateCode();
        const expiresAt = new Date(Date.now() + VERIFICATION_EXPIRY_MINUTES * 60 * 1000);
        const now = new Date();

const hashedPassword = await bcrypt.hash(student._password, 10);

    const newStudent = new Student({
      ...student,
      _password: hashedPassword,
      _unsuccessfulAttempts: 0,
            _noShows: 0,
            _attendedSlots: 0,
            _emailVerified: false,
            _verificationCode: hashCode(verificationCode),
            _verificationCodeExpires: expiresAt,
            _verificationResendCount: 1,
            _verificationLastSent: now,
            _verificationAttemptCount: 0,
        });

        await newStudent.save();

        try {
            await sendVerificationEmail(student._umakEmail, verificationCode);
        } catch (mailError) {
            await Student.findByIdAndDelete(newStudent._id);
            throw mailError;
        }

        res.status(201).json({
            success: true,
            message: "Verification code sent to your email.",
            data: {
                _id: newStudent._id,
                _umakEmail: newStudent._umakEmail,
            },
        });
    } catch (error) {
        console.error("Error in Creating Student: ", error.message);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

export const verifyEmailCode = async (req, res) => {
    const { email, code } = req.body;

    if (!email || !code) {
        return res.status(400).json({ success: false, message: "Email and code are required." });
    }

    try {
        const student = await Student.findOne({ _umakEmail: email });
        if (!student) {
            return res.status(404).json({ success: false, message: "Student not found." });
        }

        if (student._emailVerified) {
            return res.status(400).json({ success: false, message: "Email is already verified." });
        }

        const now = new Date();

        if (!student._verificationCode || !student._verificationCodeExpires || student._verificationCodeExpires < now) {
            return res.status(400).json({ success: false, message: "Verification code has expired. Please resend." });
        }

        if (student._verificationAttemptCount >= MAX_ATTEMPTS_PER_CODE) {
            return res.status(429).json({ success: false, message: "Too many attempts. Please request a new code." });
        }

        const hashedInput = hashCode(code);

        if (hashedInput !== student._verificationCode) {
            student._verificationAttemptCount += 1;
            await student.save();
            return res.status(400).json({ success: false, message: "Invalid verification code." });
        }

        student._emailVerified = true;
        student._verificationCode = undefined;
        student._verificationCodeExpires = undefined;
        student._verificationAttemptCount = 0;
        student._verificationResendCount = 0;
        student._verificationLastSent = undefined;

        await student.save();

        res.status(200).json({ success: true, message: "Email verified. You can now log in." });
    } catch (error) {
        console.error("Error verifying code: ", error.message);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

export const resendVerificationCode = async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ success: false, message: "Email is required." });
    }

    try {
        const student = await Student.findOne({ _umakEmail: email });
        if (!student) {
            return res.status(404).json({ success: false, message: "Student not found." });
        }

        if (student._emailVerified) {
            return res.status(400).json({ success: false, message: "Email is already verified." });
        }

        const now = new Date();

        if (student._verificationLastSent) {
            const elapsed = now.getTime() - student._verificationLastSent.getTime();

            if (elapsed < RESEND_COOLDOWN_MS) {
                const waitSeconds = Math.ceil((RESEND_COOLDOWN_MS - elapsed) / 1000);
                return res.status(429).json({
                    success: false,
                    message: `Please wait ${waitSeconds} seconds before requesting another code.`,
                });
            }

            if (elapsed > 60 * 60 * 1000) {
                student._verificationResendCount = 0;
            } else if (student._verificationResendCount >= MAX_RESENDS_PER_HOUR) {
                return res.status(429).json({ success: false, message: "Too many requests. Try again in 1 hour." });
            }
        }

        const newCode = generateCode();

        student._verificationCode = hashCode(newCode);
        student._verificationCodeExpires = new Date(now.getTime() + VERIFICATION_EXPIRY_MINUTES * 60 * 1000);
        student._verificationResendCount = (student._verificationResendCount || 0) + 1;
        student._verificationLastSent = now;
        student._verificationAttemptCount = 0;

        await student.save();
        await sendVerificationEmail(email, newCode);

        res.status(200).json({ success: true, message: "Verification code resent." });
    } catch (error) {
        console.error("Error resending code: ", error.message);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

export const loginStudent = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ success: false, message: "Email and password are required." });
    }

    try {
        const student = await Student.findOne({ _umakEmail: email });
        if (!student) {
            return res.status(401).json({ success: false, message: "Invalid email or password." });
        }

        if (student._password !== password) {
            return res.status(401).json({ success: false, message: "Invalid email or password." });
        }

        if (!student._emailVerified) {
            return res.status(403).json({ success: false, message: "Please verify your email to continue." });
        }

        student._activeStat = true;
        await student.save();

        res.status(200).json({
            success: true,
            user: {
                _id: student._id,
                _fName: student._fName,
                _lName: student._lName,
                _sex: student._sex,
                _college: student._college,
                _course: student._course,
                _year: student._year,
                _section: student._section,
                _umakEmail: student._umakEmail,
                _umakID: student._umakID,
                _activeStat: student._activeStat,
                _profileImage: student._profileImage,
            },
        });
    } catch (error) {
        console.error("Error during student login: ", error.message);
        res.status(500).json({ success: false, message: "Server error." });
    }
};

// Function to update student metrics
export const updateStudentMetrics = async (studentId, status) => {
    try {
        const student = await Student.findById(studentId);
        if (!student) return;

        switch (status) {
            case "attended":
                student._attendedSlots += 1;
                student._unsuccessfulAttempts = 0;
                if (student._attendedSlots % 3 === 0 && student._noShows > 0) {
                    student._noShows -= 1;
                }
                break;
            case "noShow":
                student._noShows += 1;
                break;
            case "unsuccessful":
                student._unsuccessfulAttempts += 1;
                break;
            default:
                break;
        }

        student._priorityScore = student._unsuccessfulAttempts + student._attendedSlots - Math.floor(student._noShows / 2);

        await student.save();
        return student;
    } catch (error) {
        console.error("Error updating student metrics:", error);
        throw error;
    }
};

export const logoutStudent = async (req, res) => {
    const { userId } = req.body;

    try {
        const student = await Student.findById(userId);
        if (!student) {
            return res.status(404).json({ success: false, message: "Student not found." });
        }
        student._activeStat = false;
        await student.save();

        res.status(200).json({ success: true, message: "Logout successful." });
    } catch (error) {
        console.error("Error during student logout: ", error.message);
        res.status(500).json({ success: false, message: "Server error." });
    }
};

export const updateStudent = async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ success: false, message: "Invalid student ID" });
    }

    try {
        if (req.file) {
            updateData._profileImage = req.file.buffer.toString("base64");
        }

        const updatedStudent = await Student.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });

        if (!updatedStudent) {
            return res.status(404).json({ success: false, message: "Student not found" });
        }

        res.status(200).json({
            success: true,
            data: {
                _id: updatedStudent._id,
                _fName: updatedStudent._fName,
                _lName: updatedStudent._lName,
                _sex: updatedStudent._sex,
                _college: updatedStudent._college,
                _course: updatedStudent._course,
                _year: updatedStudent._year,
                _section: updatedStudent._section,
                _umakEmail: updatedStudent._umakEmail,
                _umakID: updatedStudent._umakID,
                _activeStat: updatedStudent._activeStat,
                _profileImage: updatedStudent._profileImage,
            },
        });
    } catch (error) {
        console.error("Error updating student:", error.message);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};