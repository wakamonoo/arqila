"use client";
import { useEffect, useState } from "react";
import { MdClose, MdSend } from "react-icons/md";
import { io } from "socket.io-client";

const BASE_URL =
  process.env.NODE_ENV === "production"
    ? "https://arqila.onrender.com"
    : "http://localhost:4000";

const socket = io(BASE_URL);

export default function CarPageChat({ chatRef, user, car, driver, setShowChat }) {
  const [message, setMessage] = useState("");
  const [messageSent, setMessageSent] = useState([]);

  useEffect(() => {
    if (!user || !user.uid) {
      alert("You must be logged in first");
      return;
    }

    // Join user's personal room
    socket.emit("joinUserRoom", user.uid);

    const handleMessages = (data) => {
      // Only display messages related to this car & driver
      if (data.carId === car && data.driverId === driver) {
        setMessageSent((prev) => [...prev, data]);
      }
    };

    socket.on("receiveMessage", handleMessages);

    return () => {
      socket.off("receiveMessage", handleMessages);
    };
  }, [user.uid, car, driver]);

  const sendMessage = () => {
    if (!message.trim()) return;

    if (driver === user.uid) {
      alert("You can't chat with your own listing");
      return;
    }

    const msgData = {
      carId: car,
      driverId: driver,
      userId: user.uid,
      senderId: user.uid,
      sender: user.name,
      text: message,
      time: new Date(),
    };

    socket.emit("sendMessage", msgData);
    setMessage("");
  };

  return (
    <div
      ref={chatRef}
      className="fixed flex flex-col bottom-22 lg:bottom-25 right-4 z-100 bg-second shadow-2xl w-[90vw] sm:w-[80vw] md:w-[65vw] lg:w-[50vw] xl:w-[40vw] 2xl:w-[30vw] h-[70vh] rounded-2xl overflow-hidden"
    >
      {/* Header */}
      <div className="flex justify-between bg-panel p-4">
        <div>
          <h1 className="text-base sm:text-xl md:text-2xl font-bold">
            Chat with Driver
          </h1>
        </div>
        <button onClick={() => setShowChat(false)}>
          <MdClose className="cursor-pointer text-2xl sm:text-3xl md:text-4xl font-bold duration-200 hover:scale-110 active:scale-110" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 p-3 overflow-y-auto">
        {messageSent.map((msg, index) => (
          <div
            key={index}
            className={`mb-3 flex ${
              msg.senderId === user.uid ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`p-3 rounded-xl max-w-[70%] ${
                msg.senderId === user.uid
                  ? "bg-blue-500 text-white"
                  : "bg-gray-300"
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
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
