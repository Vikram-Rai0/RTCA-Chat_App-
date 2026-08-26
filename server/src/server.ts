import express from "express";
import http from "http";
import cors from "cors";
import { Server } from "socket.io";

import { registerChatSocket } from "./chat.socket.js";

const app = express();

app.use(cors());

const httpServer = http.createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173",
  },
});

registerChatSocket(io);

httpServer.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});