import express from "express";
import { login } from "../controllers/auth.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import User from "../models/User.js";

const router = express.Router();

/* =====================
   STUDENT LOGIN (UNCHANGED)
===================== */
router.post("/login", login);

/* =====================
   GET LOGGED IN STUDENT
   GET /api/auth/me
===================== */
router.get("/me", protect, async (req, res) => {
  try {
    const student = await User.findById(req.user._id);

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // ✅ FINAL SAFE CLASS RESOLUTION (NO CRASH)
    let classObj = null;

    if (student.classId) {
      classObj = await student.populate("classId", "name").then(s => s.classId);
    } else if (student.class_id) {
      classObj = await student.populate("class_id", "name").then(s => s.class_id);
    } else if (student.class) {
      classObj = student.class;
    }

    res.status(200).json({
      _id: student._id,
      name: student.name,
      class: classObj || null, // ✅ ALWAYS SAFE
    });
  } catch (err) {
    console.error("Student /me error:", err);
    res.status(500).json({ message: "Failed to load student data" });
  }
});

export default router;
