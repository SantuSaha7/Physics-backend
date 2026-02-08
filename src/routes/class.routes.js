import express from "express";
import {
  addClass,
  getClasses,
  disableStudent,
} from "../controllers/class.controller.js";
import { panelAuth } from "../middleware/panel.auth.middleware.js";
import { allowRoles } from "../middleware/role.middleware.js";

const router = express.Router();

/* ================================
   🧑‍🏫 PANEL / ADMIN / SIR ONLY
================================ */

// ➕ Add class
router.post(
  "/add",
  panelAuth,
  allowRoles("admin", "sir"),
  addClass
);

// 📄 Get all classes
router.get(
  "/",
  panelAuth,
  allowRoles("admin", "sir"),
  getClasses
);

// 🚫 Disable student (NO DELETE)
router.patch(
  "/students/:studentId/disable",
  panelAuth,
  allowRoles("admin", "sir"),
  disableStudent
);

export default router;
