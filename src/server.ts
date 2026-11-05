
import dotenv from "dotenv";
dotenv.config();

import app from "./app";
import pool from "./config/database";
import "./config/firebase";

const PORT = Number(process.env.PORT || 5000);

const startServer = async (): Promise<void> => {
  try {
    await pool.query("SELECT 1");

    console.log("MySQL connected successfully");

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Server startup failed:", error);
    process.exit(1);
  }
};

void startServer();
