import express from "express";
import { addPdf, getPdfsByChapter } from "../controllers/pdf.controller.js";

const router = express.Router();

router.post("/add", addPdf);
router.get("/chapter/:chapterId", getPdfsByChapter);

export default router;
