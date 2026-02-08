import express from "express";
import {
  // student
  getResults,
  saveResult,

  // panel
  getAllMockResults,
  getMockStudentResults,
  getStudentMockResultDetail,
} from "../controllers/result.controller.js";

import { protect } from "../middleware/auth.middleware.js";
import { panelAuth } from "../middleware/panel.auth.middleware.js";
import { allowRoles } from "../middleware/role.middleware.js";

const router = express.Router();

/* ======================================
   🟦 PANEL / ADMIN / SIR ROUTES
   👉 ONLY CLASS-WISE RESULT SYSTEM
====================================== */

// ✅ CLASS-WISE mock result summary
// GET /api/results/panel?classId=XXXX
router.get(
  "/panel",
  panelAuth,
  allowRoles("admin", "sir"),
  getAllMockResults
);

// ✅ One mock → attempted students (CLASS FILTER INSIDE CONTROLLER)
// GET /api/results/panel/mock/:mockId
router.get(
  "/panel/mock/:mockId",
  panelAuth,
  allowRoles("admin", "sir"),
  getMockStudentResults
);

// ✅ One student → one mock full detail
// GET /api/results/panel/mock/:mockId/student/:studentId
router.get(
  "/panel/mock/:mockId/student/:studentId",
  panelAuth,
  allowRoles("admin", "sir"),
  getStudentMockResultDetail
);

/* ======================================
   🟢 STUDENT ROUTES (UNCHANGED)
====================================== */

// ✅ Student: get own results
router.get("/", protect, getResults);

// ✅ Student: save result
router.post("/save", protect, saveResult);

export default router;
