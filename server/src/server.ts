import express from "express";
import http from "http";
import cors from "cors";
import { Server } from "socket.io";

import { registerChatSocket } from "./socket/chat.socket.js";

const app = express();

app.use(cors());

const httpServer = http.createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173",
  },
});

// Create /chat namespace
const chat = io.of("/chat");

chat.use((socket, next) => {
  console.log("Chat middleware running");

  next();
});

// chat.use((socket, next) => {
//   const username = socket.handshake.auth.username;

//   console.log("Middleware username:", username);

//   if (!username) {
//     return next(new Error("Username is required"));
//   }

//   socket.data.username = username;

//   next();
// });
// Register chat events inside /chat
registerChatSocket(chat);

httpServer.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});