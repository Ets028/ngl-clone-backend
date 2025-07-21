import { Router } from "express";
import {
  syncUser,
  createQuestion,
  getMyQuestions,
} from "../controllers/main.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();
router.post("/questions/:username", createQuestion);
router.post("/auth/sync", authMiddleware, syncUser);
router.get("/questions/me", authMiddleware, getMyQuestions);

export default router;
