import type { Namespace } from "socket.io";

type ChatMessage = {
  username: string;
  text: string;
};

export function registerChatSocket(chat: Namespace) {
  const typingUsers = new Map<string, string>();

  chat.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    // JOIN ROOM
    socket.on("join_room", (room: string, callback) => {
      const roomName = room.trim();

      if (!roomName) {
        return callback({
          success: false,
          message: "Room name is required",
        });
      }

      socket.join(roomName);

      console.log(`${socket.id} joined room: ${roomName}`);

      callback({
        success: true,
        message: `Joined room: ${roomName}`,
      });
    });

    // ROOM MESSAGE
    socket.on(
      "room_message",
      (room: string, message: ChatMessage, callback) => {
        console.log(`Message for room ${room}:`, message);

        chat.to(room).emit("room_message", message);

        callback({
          success: true,
          message: "Message sent",
        });
      }
    );

    // TYPING
    socket.on("typing", (username: string, room: string) => {
      typingUsers.set(socket.id, username);

      socket.to(room).emit(
        "typing_users",
        Array.from(typingUsers.values())
      );
    });

    // STOP TYPING
    socket.on("stop_typing", (room: string) => {
      typingUsers.delete(socket.id);

      socket.to(room).emit(
        "typing_users",
        Array.from(typingUsers.values())
      );
    });

    // DISCONNECT
    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);

      typingUsers.delete(socket.id);
    });
  });
}