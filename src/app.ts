
import express from "express";
import cors from "cors";

import authRoutes from "./routes/authRoutes";
import chatRoutes from "./routes/chatRoutes";
import messageRoutes from "./routes/messageRoutes";
import userRoutes from "./routes/authRoutes";

const app = express();

app.use(cors());
app.use(express.json({ limit: "1mb" }));

app.get("/", (_req, res) => {
  res.json({
    success: true,
    message: "Chat Backend API is running"
  });
});

app.use("/auth", authRoutes);
app.use("/chat", chatRoutes);
app.use("/chat", messageRoutes);
app.use("/user", userRoutes);

app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: "API endpoint not found"
  });
});

export default app;
