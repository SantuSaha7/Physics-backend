import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const panelAuth = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token)
    return res.status(401).json({ message: "No token provided" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id);
    if (!user || !["admin", "sir"].includes(user.role)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    req.user = user; // 🔥 FULL USER OBJECT
    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
  }
};
