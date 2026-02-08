import express from "express";
import {
  // student side
  getAllMocks,
  getMockQuestions,
  submitResult,

  // sir/admin side
  createMockTest,
  addQuestionToMock,
  toggleMockStatus,
  deleteMock,
  getMockWithQuestions,
  deleteQuestion,
  getAllMocksForPanel
} from "../controllers/mock.controller.js";

import { protect } from "../middleware/auth.middleware.js";
import { panelAuth } from "../middleware/panel.auth.middleware.js";
import { allowRoles } from "../middleware/role.middleware.js";

const router = express.Router();

/* =====================================================
   PANEL / ADMIN SIDE (KEEP FIRST)
===================================================== */

// ✅ PANEL MOCK LIST
router.get(
  "/panel",
  panelAuth,
  allowRoles("admin", "sir"),
  getAllMocksForPanel
);

// CREATE MOCK TEST
router.post(
  "/panel/create",
  panelAuth,
  allowRoles("admin", "sir"),
  createMockTest
);

// ADD QUESTION
router.post(
  "/panel/add-question",
  panelAuth,
  allowRoles("admin", "sir"),
  addQuestionToMock
);

// GET MOCK WITH QUESTIONS
router.get(
  "/panel/:mockId/details",
  panelAuth,
  allowRoles("admin", "sir"),
  getMockWithQuestions
);

// TOGGLE MOCK
router.patch(
  "/panel/:mockId/toggle",
  panelAuth,
  allowRoles("admin", "sir"),
  toggleMockStatus
);

// DELETE QUESTION
router.delete(
  "/panel/question/:questionId",
  panelAuth,
  allowRoles("admin", "sir"),
  deleteQuestion
);

// DELETE MOCK
router.delete(
  "/panel/:mockId",
  panelAuth,
  allowRoles("admin", "sir"),
  deleteMock
);

/* =====================================================
   STUDENT SIDE
===================================================== */

// ✅ STUDENT MOCK LIST
router.get("/", protect, getAllMocks);

// SUBMIT RESULT
router.post("/submit", protect, submitResult);

// QUESTIONS BY MOCK ID
router.get("/:mockId/questions", protect, getMockQuestions);

export default router;
