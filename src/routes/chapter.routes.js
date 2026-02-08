import express from "express";
import {
  getChapters,
  createChapter,
  updateChapter,
  deleteChapter,
} from "../controllers/chapter.controller.js";

import { protect } from "../middleware/auth.middleware.js";
import { panelAuth } from "../middleware/panel.auth.middleware.js";
import { allowRoles } from "../middleware/role.middleware.js";

const router = express.Router();

/* ===============================
   STUDENT → view only
================================ */
router.get("/student", protect, getChapters);

/* ===============================
   PANEL → manage + view
================================ */
router.get("/", panelAuth, allowRoles("admin", "sir"), getChapters);

router.post(
  "/",
  panelAuth,
  allowRoles("admin", "sir"),
  createChapter
);

router.put(
  "/:id",
  panelAuth,
  allowRoles("admin", "sir"),
  updateChapter
);

router.delete(
  "/:id",
  panelAuth,
  allowRoles("admin", "sir"),
  deleteChapter
);

export default router;
