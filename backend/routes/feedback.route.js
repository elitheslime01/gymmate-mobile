import express from "express";
import upload from "../utils/multer.js";
import { createFeedback, listFeedback } from "../controller/feedback.controller.js";

const router = express.Router();

router.post("/", upload.array("attachments", 3), createFeedback);
router.get("/", listFeedback);

const feedbackRoutes = router;

export default feedbackRoutes;
