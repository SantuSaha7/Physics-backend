import express from "express";
import {
  getFeesByClass,
  updateStudentFee,
  getMyFees,
} from "../controllers/feeController.js";

import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

/* =========================
   ROLE CHECK MIDDLEWARE
========================= */
const allowSirOrAdmin = (req, res, next) => {
  if (!req.user || (req.user.role !== "sir" && req.user.role !== "admin")) {
    return res.status(403).json({ message: "Sir only access" });
  }
  next();
};

const allowStudent = (req, res, next) => {
  if (!req.user || req.user.role !== "student") {
    return res.status(403).json({ message: "Student only access" });
  }
  next();
};

/* =========================
   GET FEES BY CLASS (SIR)
========================= */
router.get(
  "/class/:classId",
  protect,
  allowSirOrAdmin,
  getFeesByClass
);

/* =========================
   UPDATE STUDENT FEE (SIR)
========================= */
router.put(
  "/student/:studentId",
  protect,
  allowSirOrAdmin,
  updateStudentFee
);

/* =========================
   GET OWN FEE (STUDENT)
========================= */
router.get(
  "/my",
  protect,
  allowStudent,
  getMyFees
);

export default router;
