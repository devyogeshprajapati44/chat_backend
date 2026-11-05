import { Router } from "express";
import { createOrGetChat } from "../controllers/chatController";
import { authenticate } from "../middleware/authMiddleware";

const router = Router();

router.post("/create", authenticate, createOrGetChat);

export default router;