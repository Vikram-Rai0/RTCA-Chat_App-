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

      // socket.broadcast.emit("message", message);
      io.emit("message", message);
    });

    socket.on("typing", (username: string) => {
      socket.broadcast.emit("typing", username);
    })

    socket.on("stop_typing",()=>{
      socket.broadcast.emit("stop_typing");
    })

    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
    });
  });
}