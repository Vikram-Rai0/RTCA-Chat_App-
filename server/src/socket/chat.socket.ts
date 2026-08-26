import type { Server } from "socket.io";

type ChatMessage = {
  username: string;
  text: string;
};

export function registerChatSocket(io: Server) {
  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    socket.on("message", (message: ChatMessage) => {
      console.log("Received message:", message);

      io.emit("message", message);
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
    });
  });
}