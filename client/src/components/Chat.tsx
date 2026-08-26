import { useEffect, useState } from "react";
import { socket } from "../socket/socket";
import type { ChatMessage } from "../types/Chat";

function Chat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState("");

  useEffect(() => {
    const handleConnect = () => {
      console.log("Connected to server");
      console.log("Socket ID:", socket.id);
    };

    const handleMessage = (message: ChatMessage) => {
      console.log("New message:", message);

      setMessages((previousMessages) => [
        ...previousMessages,
        message,
      ]);
    };

    socket.on("connect", handleConnect);
    socket.on("message", handleMessage);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("message", handleMessage);
    };
  }, []);

  const sendMessage = () => {
    if (!text.trim()) {
      return;
    }

    const message: ChatMessage = {
      username: "Alice",
      text: text,
    };

    socket.emit("message", message);

    setText("");
  };

  return (
    <div>
      <h2>Chat</h2>

      <div>
        {messages.map((message, index) => (
          <p key={index}>
            <strong>{message.username}:</strong>{" "}
            {message.text}
          </p>
        ))}
      </div>

      <input
        type="text"
        value={text}
        onChange={(event) => setText(event.target.value)}
        placeholder="Type a message..."
      />

      <button onClick={sendMessage}>
        Send
      </button>
    </div>
  );
}

export default Chat;