import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import User from "../models/User.js";

// 🔐 AUTH (CRASH SAFE – LOGIC UNCHANGED)
export const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers?.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "Invalid token format" });
    }

    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET missing in .env");
      return res.status(500).json({ message: "Server config error" });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ message: "Invalid token" });
    }

    if (!decoded?.id) {
      return res.status(401).json({ message: "Invalid token payload" });
    }

    const user = await User.findById(decoded.id).select(
      "_id role classId class_id class isActive"
    );

    if (!user) {
      return res.status(401).json({
        message: "User not found",
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        message: "User not active",
      });
    }

    /* ================================
       STUDENT CLASS NORMALIZATION
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

    // cleanup
    user.class = undefined;
    user.class_id = undefined;

    req.user = user;
    next();
  } catch (err) {
    console.error("Auth crash prevented:", err);
    return res.status(500).json({ message: "Authentication failed" });
  }
};

// (UNCHANGED)
export const onlyAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ message: "Admin only access" });
  }
  next();
};
