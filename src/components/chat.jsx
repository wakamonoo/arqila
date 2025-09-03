// src/components/chat.jsx
// CHANGED/ADDED: uses conversation join, conversation_history, new_message, send_message
"use client";
import { useEffect, useState, useRef } from "react";
import { MdClose, MdSend } from "react-icons/md";
import { io } from "socket.io-client";
const BASE_URL =
  process.env.NODE_ENV === "production"
    ? "https://arqila.onrender.com"
    : "http://localhost:4000";
const socket = io.connect(`${BASE_URL}`);

export default function CarPageChat({ chatRef, user, car, driver, setShowChat, owner }) {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const listRef = useRef(null);

  useEffect(() => {
    // auto-scroll when messages update
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (!user || !user.uid) return;
    if (!car || !driver) return;

    const payload = { carId: car, driverId: driver, userId: user.uid };

    socket.emit("join_conversation", payload);
    socket.emit("join_user", { userId: user.uid }); // personal room

    const handleHistory = (history) => {
      setMessages(history || []);
    };
    const handleNew = (msg) => {
      // only accept messages for this convo
      if (msg.carId === car && msg.driverId === driver && msg.userId === user.uid) {
        setMessages((prev) => [...prev, msg]);
      }
    };

    socket.on("conversation_history", handleHistory);
    socket.on("new_message", handleNew);

    return () => {
      socket.off("conversation_history", handleHistory);
      socket.off("new_message", handleNew);
    };
  }, [user, car, driver, socket]);

  const sendMessage = () => {
    if (!message.trim()) return;

    if (driver === user.uid) {
      alert("You can't chat with your own listing");
      return;
    }

    const payload = {
      carId: car,
      driverId: driver,
      userId: user.uid,
      text: message,
      sender: user.name || user.displayName || user.email,
      senderId: user.uid,
      time: new Date().toISOString(),
    };

    socket.emit("send_message", payload);
    // optimistic update (server will also emit new_message)
    setMessages((prev) => [...prev, { ...payload, time: new Date(payload.time) }]);
    setMessage("");
  };

  return (
    <div
      ref={chatRef}
      className="fixed flex flex-col bottom-22 lg:bottom-25 right-4 z-100 bg-second shadow-2xl w-[90vw] sm:w-[80vw] md:w-[65vw] lg:w-[50vw] xl:w-[40vw] 2xl:w-[30vw] h-[70vh] rounded-2xl overflow-hidden"
    >
      <div className="flex justify-between bg-panel p-4">
        <div>
          <h1 className="text-base sm:text-xl md:text-2xl font-bold">{owner?.name || "Owner"}</h1>
        </div>
        <button onClick={() => setShowChat(false)}>
          <MdClose className="cursor-pointer text-2xl sm:text-3xl md:text-4xl font-bold duration-200 hover:scale-110 active:scale-110" />
        </button>
      </div>

      <div ref={listRef} className="flex-1 p-3 overflow-y-auto">
        {messages.length === 0 ? (
          <p className="text-gray-500 text-center mt-4">No messages yet</p>
        ) : (
          messages.map((m, i) => {
            const time = m.time ? new Date(m.time).toLocaleString() : "";
            const amISender = m.senderId === user.uid;
            return (
              <div key={i} className={`mb-3 flex ${amISender ? "justify-end" : "justify-start"}`}>
                <div className={`p-3 rounded-xl max-w-[70%] ${amISender ? "bg-blue-500 text-white" : "bg-gray-300 text-black"}`}>
                  <div className="text-xs font-semibold">{m.sender}</div>
                  <div>{m.text}</div>
                  <div className="text-xs text-right opacity-60 mt-1">{time}</div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="flex bg-panel justify-between gap-2 items-center p-3">
        <textarea
          className="w-[85%] h-[6vh] text-normal placeholder-[var(--color-label)] text-base sm:text-xl md:text-2xl bg-second p-2 rounded-md"
          placeholder="Type your message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              sendMessage();
            }
          }}
        />
        <MdSend
          onClick={sendMessage}
          className="cursor-pointer text-5xl text-normal bg-second p-2 w-[15%] h-[6vh] rounded-md transition duration-100 hover:scale-110 active:scale-110"
        />
      </div>
    </div>
  );
}
