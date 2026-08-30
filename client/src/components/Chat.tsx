import { useEffect, useRef, useState } from "react";
import { socket } from "../socket/socket";
import type { ChatMessage } from "../types/Chat";

type SocketResponse = {
  success: boolean;
  message: string;
};

function Chat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [username, setUsername] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [text, setText] = useState("");

  // Room state
  const [room, setRoom] = useState("");
  const [currentRoom, setCurrentRoom] = useState("");

  const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const handleConnect = () => {
      console.log("Connected to server");
      console.log("Socket ID:", socket.id);

      setIsConnected(true);
    };

    const handleTypingUsers = (users: string[]) => {
      setTypingUsers(users);
    };

    const handleConnectError = (error: Error) => {
      console.log("Connection error:", error.message);

      setIsConnected(false);
    };

    const handleDisconnect = () => {
      console.log("Disconnected from the server.");

      setIsConnected(false);
    };

    const handleRoomMessage = (message: ChatMessage) => {
      console.log("Room message:", message);

      setMessages((previousMessages) => [
        ...previousMessages,
        message,
      ]);
    };

    socket.on("connect", handleConnect);
    socket.on("typing_users", handleTypingUsers);
    socket.on("disconnect", handleDisconnect);
    socket.on("room_message", handleRoomMessage);
    socket.on("connect_error", handleConnectError);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("typing_users", handleTypingUsers);
      socket.off("disconnect", handleDisconnect);
      socket.off("room_message", handleRoomMessage);
      socket.off("connect_error", handleConnectError);

      if (typingTimer.current) {
        clearTimeout(typingTimer.current);
      }
    };
  }, []);

  // Join a room
  const joinRoom = () => {
    const roomName = room.trim();

    if (!roomName) {
      return;
    }

    socket.emit(
      "join_room",
      roomName,
      (response: SocketResponse) => {
        console.log("Join response:", response);

        if (response.success) {
          setCurrentRoom(roomName);
          setMessages([]);
          setTypingUsers([]);
        }
      }
    );
  };

  // Send message to current room
  const sendMessage = () => {
    if (
      !username.trim() ||
      !text.trim() ||
      !currentRoom
    ) {
      return;
    }

    const message: ChatMessage = {
      username,
      text,
    };

    socket.emit(
      "room_message",
      currentRoom,
      message,
      (response: SocketResponse) => {
        console.log("Server response:", response);
      }
    );

    setText("");

    // Stop typing after sending
    if (typingTimer.current) {
      clearTimeout(typingTimer.current);
      typingTimer.current = null;
    }

    socket.emit("stop_typing", currentRoom);
  };

  return (
    <div>
      <h2>Chat</h2>

      {/* Connection status */}
      <p>
        Status:{" "}
        {isConnected ? "Connected" : "Disconnected"}
      </p>

      {/* Username */}
      <div>
        <input
          type="text"
          value={username}
          onChange={(event) =>
            setUsername(event.target.value)
          }
          placeholder="Enter username"
        />
      </div>

      {/* Room */}
      <div>
        <input
          type="text"
          value={room}
          onChange={(event) =>
            setRoom(event.target.value)
          }
          placeholder="Enter room name"
        />

        <button onClick={joinRoom}>
          Join Room
        </button>
      </div>

      {/* Current room */}
      {currentRoom && (
        <p>
          Current room:{" "}
          <strong>{currentRoom}</strong>
        </p>
      )}

      {/* Messages */}
      <div>
        {messages.map((message, index) => (
          <p key={index}>
            <strong>{message.username}:</strong>{" "}
            {message.text}
          </p>
        ))}

        {/* Typing users */}
        {typingUsers.length > 0 && (
          <p>
            {typingUsers.join(", ")}{" "}
            {typingUsers.length === 1
              ? "is"
              : "are"}{" "}
            typing...
          </p>
        )}
      </div>

      {/* Message input */}
      <input
        type="text"
        value={text}
        onChange={(event) => {
          const newText = event.target.value;

          setText(newText);

          // Clear previous timer
          if (typingTimer.current) {
            clearTimeout(typingTimer.current);
          }

          // Empty message = stop typing
          if (!newText.trim()) {
            if (currentRoom) {
              socket.emit(
                "stop_typing",
                currentRoom
              );
            }

            return;
          }

          // Tell room that this user is typing
          if (
            username.trim() &&
            currentRoom
          ) {
            socket.emit(
              "typing",
              username,
              currentRoom
            );
          }

          // Stop typing after 1 second
          typingTimer.current = setTimeout(() => {
            if (currentRoom) {
              socket.emit(
                "stop_typing",
                currentRoom
              );
            }

            typingTimer.current = null;
          }, 1000);
        }}
        placeholder="Type a message..."
      />

      <button
        onClick={sendMessage}
        disabled={!currentRoom}
      >
        Send
      </button>
    </div>
  );
}

export default Chat;

