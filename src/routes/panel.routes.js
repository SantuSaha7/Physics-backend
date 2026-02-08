import express from "express";

import {
  panelDashboard,
  createStudent,
  getPanelStats,
  getStudentsByClass, // ✅ IMPORT HERE
} from "../controllers/panel.controller.js";

import {
  getAllMockResults,
  getMockStudentResults,
  getStudentMockResultDetail,
} from "../controllers/result.controller.js";

import { panelAuth } from "../middleware/panel.auth.middleware.js";
import { allowRoles } from "../middleware/role.middleware.js";

const router = express.Router();

// ================= DASHBOARD =================
router.get(
  "/dashboard",
  panelAuth,
  allowRoles("admin", "sir"),
  panelDashboard
);

// ================= DASHBOARD STATS =================
router.get(
  "/stats",
  panelAuth,
  allowRoles("admin", "sir"),
  getPanelStats
);

// ================= CREATE STUDENT =================
router.post(
  "/students",
  panelAuth,
  allowRoles("admin", "sir"),
  createStudent
);

// ================= STUDENTS BY CLASS (🔥 STEP 2) =================
router.get(
  "/classes/:classId/students",
  panelAuth,
  allowRoles("admin", "sir"),
  getStudentsByClass
);

/* ======================================================
   RESULTS (READ ONLY)
====================================================== */

// 🔹 All mock results
router.get(
  "/results",
  panelAuth,
  allowRoles("admin", "sir"),
  getAllMockResults
);

// 🔹 One mock → all student results
router.get(
  "/results/mock/:mockId",
  panelAuth,
  allowRoles("admin", "sir"),
  getMockStudentResults
);

// 🔹 One student → one mock detail
router.get(
  "/results/mock/:mockId/student/:studentId",
  panelAuth,
  allowRoles("admin", "sir"),
  getStudentMockResultDetail
);

export default router;
