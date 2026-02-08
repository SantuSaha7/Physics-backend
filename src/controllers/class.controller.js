import mongoose from "mongoose";
import Class from "../models/class.model.js";

/* ================================
   ➕ ADD CLASS
================================ */

export const addClass = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Class name is required" });
    }

    const exists = await Class.findOne({ name: name.trim() });
    if (exists) {
      return res.status(400).json({ message: "Class already exists" });
    }

    const newClass = await Class.create({ name: name.trim() });

    res.status(201).json({
      message: "Class added successfully",
      class: newClass,
    });
  } catch {
    res.status(500).json({ message: "Failed to add class" });
  }
};

/* ================================
   📄 GET ALL CLASSES
================================ */

export const getClasses = async (req, res) => {
  try {
    const classes = await Class.find()
      .select("_id name")
      .sort({ name: 1 });

    res.status(200).json(classes);
  } catch {
    res.status(500).json({ message: "Failed to load classes" });
  }
};

/* ==================================================
   🚫 DISABLE + ❌ DELETE STUDENT (FINAL)
================================================== */

export const disableStudent = async (req, res) => {
  try {
    const { studentId } = req.params;
    const User = mongoose.model("User");

    if (!studentId) {
      return res.status(400).json({ message: "Student ID required" });
    }

    let student = null;

    // Case 1: Mongo _id
    if (mongoose.Types.ObjectId.isValid(studentId)) {
      student = await User.findById(studentId);
    }

    // Case 2: STU-xxx
    if (!student) {
      student = await User.findOne({ studentId });
    }

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    if (student.role !== "student") {
      return res
        .status(400)
        .json({ message: "Only students can be disabled" });
    }

    // 🔒 Disable
    student.isActive = false;
    await student.save();

    // ❌ Permanent delete
    await User.deleteOne({ _id: student._id });

    res.status(200).json({
      message: "Student disabled and deleted successfully",
    });
  } catch (err) {
    console.error("Disable+Delete student error:", err);
    res.status(500).json({
      message: "Failed to disable student",
    });
  }
};
