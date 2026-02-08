import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import User from "../models/User.js";

// 🔐 AUTH (FIXED – ROLE SAFE)
export const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select(
      "_id role classId class_id class isActive"
    );

    if (!user || !user.isActive) {
      return res.status(401).json({
        message: "User not active or not found",
      });
    }

    /* ================================
       STUDENT CLASS NORMALIZATION
       (ONLY IF STUDENT)
    ================================= */
    if (user.role === "student") {
      const rawClassId =
        user.classId || user.class_id || user.class || null;

      if (
        rawClassId &&
        mongoose.Types.ObjectId.isValid(rawClassId)
      ) {
        user.classId = new mongoose.Types.ObjectId(rawClassId);
      } else {
        user.classId = null;
      }
    }

    // cleanup (safe)
    user.class = undefined;
    user.class_id = undefined;

    req.user = user;
    next();
  } catch (err) {
    console.error("Auth error:", err);
    return res.status(401).json({ message: "Invalid token" });
  }
};

// (UNCHANGED)
export const onlyAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res
      .status(403)
      .json({ message: "Admin only access" });
  }
  next();
};
