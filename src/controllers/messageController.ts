
import { Request, Response } from "express";
import { db, FieldValue } from "../config/firebase";
import { verifyChatMember } from "../services/chatService";

export const sendMessage = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    console.log("STEP 1: Send message started");

    const chatId = String(req.params.chatId ?? "");
    const userId = String(req.user?.id ?? "");

    const { message, type = "text" } = req.body;

    console.log("Chat ID:", chatId);
    console.log("User ID:", userId);

    if (!chatId || !userId) {
      res.status(400).json({
        success: false,
        message: "Invalid chat or user ID"
      });
      return;
    }

    if (!message || !String(message).trim()) {
      res.status(400).json({
        success: false,
        message: "Message is required"
      });
      return;
    }

    console.log("STEP 2: Checking chat membership");

    const isMember = await verifyChatMember(chatId, userId);

    console.log("Membership:", isMember);

    if (!isMember) {
      res.status(403).json({
        success: false,
        message: "You are not a member of this chat"
      });
      return;
    }

    console.log("STEP 3: Creating Firestore reference");

    const messageRef = db
      .collection("chats")
      .doc(chatId)
      .collection("messages")
      .doc();

    const messageData = {
      messageId: messageRef.id,
      chatId,
      senderId: userId,
      message: String(message).trim(),
      type,
      readBy: [userId],
      createdAt: FieldValue.serverTimestamp()
    };

    console.log("STEP 4: Saving message to Firestore");

    await messageRef.set(messageData);

    console.log("STEP 5: Message saved successfully");

    res.status(200).json({
      success: true,
      message: "Message sent successfully",
      data: {
        messageId: messageRef.id,
        chatId,
        senderId: userId,
        message: String(message).trim(),
        type,
        readBy: [userId],
        createdAt: new Date().toISOString()
      }
    });

  } catch (error: unknown) {
    console.error("SEND MESSAGE ERROR:", error);

    const errorMessage =
      error instanceof Error ? error.message : String(error);

    res.status(500).json({
      success: false,
      message: "Failed to send message",
      debug: errorMessage
    });
  }
};
// ================= GET MESSAGES =================

export const getMessages = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const chatId = String(req.params.chatId ?? "");
    const userId = String(req.user?.id ?? "");

    if (!chatId || !userId) {
      res.status(400).json({
        success: false,
        message: "Invalid chat or user ID"
      });
      return;
    }

    const isMember = await verifyChatMember(chatId, userId);

    if (!isMember) {
      res.status(403).json({
        success: false,
        message: "You are not a member of this chat"
      });
      return;
    }

    const limit = Math.min(
      Math.max(Number(req.query.limit) || 50, 1),
      100
    );

    const snapshot = await db
      .collection("chats")
      .doc(chatId)
      .collection("messages")
      .orderBy("createdAt", "desc")
      .limit(limit)
      .get();

    const messages = snapshot.docs
      .map((doc) => ({
        id: doc.id,
        ...doc.data()
      }))
      .reverse();

    res.status(200).json({
      success: true,
      count: messages.length,
      data: messages
    });
  } catch (error) {
    console.error("Get messages error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to get messages"
    });
  }
};


// ================= MARK MESSAGE READ =================

export const markMessageRead = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { chatId, messageId } = req.params;
    const userId = String(req.user?.id ?? "");

    console.log("Mark Read API:", {
      chatId,
      messageId,
      userId
    });

    if (!chatId || !messageId || !userId) {
      res.status(400).json({
        success: false,
        message: "Invalid chat, message or user ID"
      });
      return;
    }

    // Check chat membership
    const isMember = await verifyChatMember(chatId, userId);

    if (!isMember) {
      res.status(403).json({
        success: false,
        message: "You are not a member of this chat"
      });
      return;
    }

    // Find message in Firestore
    const messageRef = db
      .collection("chats")
      .doc(chatId)
      .collection("messages")
      .doc(messageId);

    const messageDoc = await messageRef.get();

    if (!messageDoc.exists) {
      res.status(404).json({
        success: false,
        message: "Message not found"
      });
      return;
    }

    // Update readBy array
    await messageRef.update({
      readBy: FieldValue.arrayUnion(userId)
    });

    res.status(200).json({
      success: true,
      message: "Message marked as read",
      data: {
        chatId,
        messageId,
        readBy: [
          ...(messageDoc.data()?.readBy || []),
          userId
        ]
      }
    });

  } catch (error) {
    console.error("Mark Message Read Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to mark message as read",
      error:
        error instanceof Error
          ? error.message
          : "Unknown error"
    });
  }
};


// ================= UPDATE LAST SEEN =================

export const updateLastSeen = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const chatId = String(req.params.chatId ?? "");
    const userId = String(req.user?.id ?? "");

    if (!chatId || !userId) {
      res.status(400).json({
        success: false,
        message: "Invalid chat or user ID"
      });
      return;
    }

    const isMember = await verifyChatMember(chatId, userId);

    if (!isMember) {
      res.status(403).json({
        success: false,
        message: "You are not a member of this chat"
      });
      return;
    }

    await db
      .collection("chats")
      .doc(chatId)
      .collection("lastSeen")
      .doc(userId)
      .set({
        userId,
        lastSeen: FieldValue.serverTimestamp()
      });

    res.status(200).json({
      success: true,
      message: "Last seen updated successfully"
    });
  } catch (error) {
    console.error("Update last seen error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update last seen"
    });
  }
};
