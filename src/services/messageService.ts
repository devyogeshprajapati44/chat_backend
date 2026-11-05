
import pool from "../config/database";
import { db, FieldValue } from "../config/firebase";
import { RowDataPacket } from "mysql2";

interface MembershipRow extends RowDataPacket {
  id: number;
}

export const verifyChatMember = async (
  chatId: string,
  userId: number
): Promise<boolean> => {
  const [rows] = await pool.execute<MembershipRow[]>(
    `SELECT id FROM chat_members
     WHERE chat_id = ? AND user_id = ?`,
    [chatId, userId]
  );

  return rows.length > 0;
};

export const sendMessageToFirestore = async (
  chatId: string,
  senderId: number,
  text: string
): Promise<string> => {
  const messageRef = db
    .collection("chats")
    .doc(chatId)
    .collection("messages")
    .doc();

  await messageRef.set({
    senderId,
    text,
    createdAt: FieldValue.serverTimestamp(),
    editedAt: null,
    deletedAt: null
  });

  return messageRef.id;
};
