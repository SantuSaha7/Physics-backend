import bcrypt from "bcrypt";
import UserModel from "../models/User.js";
import Class from "../models/class.model.js";
import Chapter from "../models/chapter.model.js";
import MockTest from "../models/mocktest.model.js";

// ================= DASHBOARD =================
export const panelDashboard = (req, res) => {
  res.json({
    message: "Welcome to Admin / Sir Panel",
    role: req.user.role,
  });
};

// ================= CREATE STUDENT =================
export const createStudent = async (req, res) => {
  try {
    const { username, password, classId } = req.body;

    if (!username || !password || !classId) {
      return res.status(400).json({
        message: "username, password and class are required",
      });
    }

    // 🔒 username unique
    const existingUser = await UserModel.findOne({ username });
    if (existingUser) {
      return res.status(409).json({
        message: "Username already exists",
      });
    }

    // 🔐 hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // ❗ studentId auto-generate হবে (pre-save hook)
    const student = await UserModel.create({
      username,
      password: hashedPassword,
      role: "student",
      classId,
    });

    res.status(201).json({
      message: "Student created successfully",
      student: {
        id: student._id,
        studentId: student.studentId,
        username: student.username,
        classId: student.classId,
      },

      // 🔥 ONLY FOR SIR VIEW (one-time)
      credentials: {
        studentId: student.studentId,
        password: password,
      },
    });
  } catch (error) {
    console.error("Create student error:", error);
    res.status(500).json({
      message: "Server error while creating student",
    });
  }
};

// ================= PANEL STATS =================
export const getPanelStats = async (req, res) => {
  try {
    const [classes, chapters, mocks, students] = await Promise.all([
      Class.countDocuments(),
      Chapter.countDocuments(),
      MockTest.countDocuments(),
      UserModel.countDocuments({ role: "student" }),
    ]);

    res.json({
      classes,
      chapters,
      mocks,
      students,
    });
  } catch (error) {
    console.error("Panel stats error:", error);
    res.status(500).json({
      message: "Failed to load dashboard stats",
    });
  }
};

// ================= STUDENTS BY CLASS =================
export const getStudentsByClass = async (req, res) => {
  try {
    const { classId } = req.params;

    const students = await UserModel.find({
      role: "student",
      classId,
      isActive: true, // 🔥 future-ready (disable করলে আর দেখাবে না)
    })
      .select("username studentId")
      .sort({ createdAt: 1 });

    res.json(students);
  } catch (error) {
    console.error("Get students by class error:", error);
    res.status(500).json({
      message: "Failed to load students",
    });
  }
};
