import express from "express";
import { panelLogin } from "../controllers/panel.auth.controller.js";

const router = express.Router();

router.post("/login", panelLogin);

export default router;
