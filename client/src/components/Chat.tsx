import { useEffect, useState } from "react";
import { socket } from "../socket/socket";
import type { ChatMessage } from "../types/Chat";

function Chat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [username, setUsername] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [typingUser, setTypingUser] = useState("");

  const [text, setText] = useState("");
  let typingTimer: ReturnType<typeof setTimeout>;

  useEffect(() => {
    const handleConnect = () => {
      console.log("Connected to server");
      console.log("Socket ID:", socket.id);
      setIsConnected(true);
    };

    const handleTyping = (username: string) => {
      setTypingUser(`${username} is typing...`);
    };

    const handleStopTyping = () => {
      setTypingUser("");
    };
    const handleConnectError = (error: Error) => {
      console.log("Connection error:", error.message);
      setIsConnected(false);
    };

    const handleDisconnect = () => {
      console.log("Disconnect from the server.");
      setIsConnected(false);
    };

    const handleMessage = (message: ChatMessage) => {
      console.log("New message:", message);

      setMessages((previousMessages) => [...previousMessages, message]);
    };

    socket.on("connect", handleConnect);
    socket.on("typing", handleTyping);
    socket.on("stop_typing", handleStopTyping);
    socket.on("disconnect", handleDisconnect);
    socket.on("message", handleMessage);
    socket.on("connect_error", handleConnectError);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("typing", handleTyping);
      socket.off("message", handleMessage);
      socket.off("disconnect", handleDisconnect);
      socket.on("stop_typing", handleStopTyping);
    };
  }, []);

  const sendMessage = () => {
    if (!username.trim() || !text.trim()) {
      return;
    }

    const message: ChatMessage = {
      username,
      text,
    };

    socket.emit("message", message);

    setText("");
  };

  return (
    <div>
      <h2>Chat</h2>
      <p>status: {isConnected ? "connected" : "Disconnect"}</p>

      <div>
        {messages.map((message, index) => (
          <p key={index}>
            <strong>{message.username}:</strong> {message.text}
          </p>
        ))}
        {typingUser && <p>{typingUser}</p>}
      </div>
      <input
        type="text"
        value={username}
        onChange={(event) => setUsername(event.target.value)}
        placeholder="Enter username"
      />
      <input
        type="text"
        value={text}
        onChange={(event) => {
          setText(event.target.value);

          socket.emit("typing", username);

          clearTimeout(typingTimer);

          typingTimer = setTimeout(() => {
            socket.emit("stop_typing");
          }, 1000);
        }}
        placeholder="Type a message..."
      />

      <button onClick={sendMessage}>Send</button>
    </div>
  );
}

export default Chat;
