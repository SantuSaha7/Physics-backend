import express from "express";
import dotenv from "dotenv";
import cors from "cors";

import connectDB from "./config/db.js";

// ================= ROUTES =================

// STUDENT
import authRoutes from "./routes/auth.routes.js";
import chapterRoutes from "./routes/chapter.routes.js";
import classRoutes from "./routes/class.routes.js";
import pdfRoutes from "./routes/pdf.routes.js";
import mockRoutes from "./routes/mock.routes.js";
import resultRoutes from "./routes/result.routes.js";

// PANEL
import panelAuthRoutes from "./routes/panel.auth.routes.js";
import panelRoutes from "./routes/panel.routes.js";

// ✅ FEES
import feeRoutes from "./routes/feeRoutes.js";

// ================= CONFIG =================

dotenv.config();
connectDB();

const app = express();

// ================= MIDDLEWARE =================

app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://physics-frontend-ten.vercel.app",
      "https://physicsbysantu.vercel.app",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

// ================= ROUTES =================

// 🔐 STUDENT AUTH
app.use("/api/auth", authRoutes);

// 🔐 PANEL AUTH
app.use("/api/panel/auth", panelAuthRoutes);
app.use("/api/panel/login", panelAuthRoutes);

// 🧑‍🏫 PANEL APIs
app.use("/api/panel", panelRoutes);

// 💰 FEES (Sir + Student)
app.use("/api/fees", feeRoutes);

// 📚 ACADEMIC DATA
app.use("/api/classes", classRoutes);
app.use("/api/chapters", chapterRoutes);
app.use("/api/pdfs", pdfRoutes);

// 📝 MOCKS
app.use("/api/mocks", mockRoutes);

// 📊 RESULTS
app.use("/api/results", resultRoutes);

// ================= HEALTH =================

app.get("/", (req, res) => {
  res.status(200).send("Physics By Santu Sir API running 🚀");
});

app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

// ================= 404 =================

app.use((req, res) => {
  res.status(404).json({ message: "API route not found" });
});

// ================= START =================

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
