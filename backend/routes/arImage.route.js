import express from "express";
import { uploadARImage, getARImage } from "../controller/arImage.controller.js";
import upload from "../utils/multer.js";

const router = express.Router();

router.post("/upload", upload.single("_arImage"), uploadARImage);

router.get("/:studentId", getARImage);

const arImageRoutes = router;

export default arImageRoutes;