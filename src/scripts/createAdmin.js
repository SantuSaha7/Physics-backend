import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import User from "../models/User.js";

dotenv.config();

async function createAdmin() {
  await mongoose.connect(process.env.MONGO_URI);

  const hashed = await bcrypt.hash("12345", 10);

  await User.findOneAndUpdate(
    { username: "admin" },
    {
      username: "admin",
      password: hashed,
      role: "admin",
      isActive: true,
    },
    { upsert: true }
  );

  console.log("ADMIN CREATED");
  process.exit(0);
}

createAdmin();
