
import { Request, Response } from "express";
import pool from "../config/database";
import { ResultSetHeader, RowDataPacket } from "mysql2";

interface IdRow extends RowDataPacket {
  id: number;
}

export const createOrGetChat = async (
  req: Request,
  res: Response
): Promise<void> => {
  const connection = await pool.getConnection();

  try {
    const { userAId, userBId } = req.body as {
      userAId?: number;
      userBId?: number;
    };

    const currentUserId = req.user?.id;

    if (
      !userAId ||
      !userBId ||
      userAId === userBId ||
      !currentUserId ||
      ![userAId, userBId].includes(currentUserId)
    ) {
      res.status(400).json({
        success: false,
        message: "Invalid chat participants"
      });
      return;
    }

    const firstId = Math.min(userAId, userBId);
    const secondId = Math.max(userAId, userBId);
    const pairKey = `${firstId}:${secondId}`;

    await connection.beginTransaction();

    const [users] = await connection.execute<IdRow[]>(
      "SELECT id FROM users WHERE id IN (?, ?)",
      [firstId, secondId]
    );

    if (users.length !== 2) {
      await connection.rollback();
      res.status(404).json({
        success: false,
        message: "One or both users not found"
      });
      return;
    }

    await connection.execute(
      `INSERT INTO chats (type, pair_key)
       VALUES ('direct', ?)
       ON DUPLICATE KEY UPDATE id = LAST_INSERT_ID(id)`,
      [pairKey]
    );

    const [chatRows] = await connection.execute<IdRow[]>(
      "SELECT id FROM chats WHERE pair_key = ?",
      [pairKey]
    );

    const chatId = chatRows[0].id;

    await connection.execute(
      `INSERT IGNORE INTO chat_members (chat_id, user_id)
       VALUES (?, ?), (?, ?)`,
      [chatId, firstId, chatId, secondId]
    );

    await connection.commit();

    res.status(200).json({
      success: true,
      message: "Chat created or retrieved successfully",
      chatId
    });
  } catch (error) {
    await connection.rollback();
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Unable to create chat"
    });
  } finally {
    connection.release();
  }
};
