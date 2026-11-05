
import { Router } from "express";
import { authenticate } from "../middleware/authMiddleware";

import {
  sendMessage,
  getMessages,
  markMessageRead,
  updateLastSeen
} from "../controllers/messageController";

const router = Router();

router.post("/:chatId/message/send", authenticate, sendMessage);

router.get("/:chatId/messages", authenticate, getMessages);

router.post(
  "/:chatId/message/:messageId/read",
  authenticate,
  markMessageRead
);

router.post("/:chatId/lastseen", authenticate, updateLastSeen);

export default router;
