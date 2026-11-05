
import pool from "../config/database";
import { RowDataPacket, ResultSetHeader } from "mysql2";

// Chat Member Interface
interface MemberRow extends RowDataPacket {
  user_id: number;
}

// ================= VERIFY CHAT MEMBER =================

export const verifyChatMember = async (
  chatId: string,
  userId: string
): Promise<boolean> => {
  try {
    const [rows] = await pool.execute<MemberRow[]>(
      `SELECT user_id
       FROM chat_members
       WHERE chat_id = ?
       AND user_id = ?
       LIMIT 1`,
      [chatId, userId]
    );

    return rows.length > 0;
  } catch (error) {
    console.error("Verify chat member error:", error);
    throw error;
  }
};

// ================= CREATE DIRECT CHAT =================

export const createDirectChat = async (
  userId1: string,
  userId2: string
): Promise<number> => {
  const connection = await pool.getConnection();

  try {
    if (userId1 === userId2) {
      throw new Error("Cannot create chat with yourself");
    }

    const sortedIds = [Number(userId1), Number(userId2)].sort(
      (a, b) => a - b
    );

    const pairKey = `${sortedIds[0]}_${sortedIds[1]}`;

    await connection.beginTransaction();

    // Check existing direct chat
    const [existingChats] = await connection.execute<RowDataPacket[]>(
      `SELECT id
       FROM chats
       WHERE pair_key = ?
       LIMIT 1`,
      [pairKey]
    );

    if (existingChats.length > 0) {
      await connection.commit();
      return Number(existingChats[0].id);
    }

    // Create chat
    const [chatResult] = await connection.execute<ResultSetHeader>(
      `INSERT INTO chats (type, pair_key)
       VALUES ('direct', ?)`,
      [pairKey]
    );

    const chatId = chatResult.insertId;

    // Add members
    await connection.execute(
      `INSERT INTO chat_members (chat_id, user_id)
       VALUES (?, ?), (?, ?)`,
      [chatId, sortedIds[0], chatId, sortedIds[1]]
    );

    await connection.commit();

    return chatId;
  } catch (error) {
    await connection.rollback();
    console.error("Create direct chat error:", error);
    throw error;
  } finally {
    connection.release();
  }
};

// ================= GET USER CHATS =================

export const getUserChats = async (
  userId: string
): Promise<RowDataPacket[]> => {
  try {
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT
         c.id AS chatId,
         c.type,
         c.created_at AS createdAt
       FROM chats c
       INNER JOIN chat_members cm
         ON cm.chat_id = c.id
       WHERE cm.user_id = ?
       ORDER BY c.created_at DESC`,
      [userId]
    );

    return rows;
  } catch (error) {
    console.error("Get user chats error:", error);
    throw error;
  }
};

// ================= ADD CHAT MEMBER =================

export const addChatMember = async (
  chatId: string,
  userId: string
): Promise<boolean> => {
  try {
    await pool.execute(
      `INSERT IGNORE INTO chat_members (chat_id, user_id)
       VALUES (?, ?)`,
      [chatId, userId]
    );

    return true;
  } catch (error) {
    console.error("Add chat member error:", error);
    throw error;
  }
};
