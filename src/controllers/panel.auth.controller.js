import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const panelLogin = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password)
      return res.status(400).json({ message: "All fields required" });

    const user = await User.findOne({ username });

    if (!user)
      return res.status(401).json({ message: "Invalid credentials" });

    if (!["admin", "sir"].includes(user.role))
      return res.status(403).json({ message: "Access denied" });

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch)
      return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      message: "Login success",
      token,
      role: user.role
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
