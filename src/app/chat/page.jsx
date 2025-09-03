"use client";
import { useEffect, useState } from "react";
import { MdSend } from "react-icons/md";
import { io } from "socket.io-client";

const BASE_URL =
  process.env.NODE_ENV === "production"
    ? "https://arqila.onrender.com"
    : "http://localhost:4000";

const socket = io(BASE_URL);

export default function DriverChatPage({ driver }) {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    if (!driver || !driver._id) return;

    // Join driver's personal room
    socket.emit("joinDriverRoom", driver._id);

    const handleMessages = (data) => {
      // Only keep messages for this driver
      if (data.driverId === driver._id) {
        setMessages((prev) => [...prev, data]);
      }
    };

    socket.on("receiveMessage", handleMessages);

    return () => {
      socket.off("receiveMessage", handleMessages);
    };
  }, [driver._id]);

  const sendMessage = (userId, carId) => {
    if (!message.trim()) return;

    const newMessage = {
      carId,
      driverId: driver._id,
      userId,
      senderId: driver._id,
      sender: driver.name,
      text: message,
      time: new Date(),
    };

    socket.emit("sendMessage", newMessage);
    setMessages((prev) => [...prev, newMessage]);
    setMessage("");
  };

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Header */}
      <div className="bg-panel p-3 text-xl font-bold">Driver Chat</div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`mb-3 flex ${
              msg.senderId === driver._id ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`p-3 rounded-xl max-w-[70%] ${
                msg.senderId === driver._id
                  ? "bg-green-500 text-white"
                  : "bg-gray-300"
              }`}
            >
              <p className="font-bold text-sm">{msg.sender}</p>
              {msg.text}
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="flex bg-panel justify-between gap-2 items-center p-3">
        <textarea
          className="w-[85%] h-[6vh] text-normal placeholder-[var(--color-label)] text-base sm:text-xl md:text-2xl bg-second p-2 rounded-md"
          placeholder="Reply to user..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <MdSend
          onClick={() => {
            if (messages.length > 0) {
              const lastMsg = messages[messages.length - 1];
              sendMessage(lastMsg.userId, lastMsg.carId);
            }
          }}
          className="cursor-pointer text-5xl text-normal bg-second p-2 w-[15%] h-[6vh] rounded-md transition duration-100 hover:scale-110 active:scale-110"
        />
      </div>
    </div>
  );
}
