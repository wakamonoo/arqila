"use client";
import { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import { MdClose, MdSend } from "react-icons/md";

const BASE_URL =
  process.env.NODE_ENV === "production"
    ? "https://arqila.onrender.com"
    : "http://localhost:4000";
const socket = io.connect(`${BASE_URL}`);

export default function Chat({ chatRef, user, owner, car, driver, setShowChat }) {
  const [message, setMessage] = useState("");
  const [messageSent, setMessageSent] = useState([]);

  useEffect(() => {
    if(!user || !user.uid) return;
    
    socket.emit("join_room", {
      carId: car,
      driverId: driver,
      userId: user.uid,
    });

    const handleMessages = (data) => {
      setMessageSent((prev) => [...prev, data]);
    };

    socket.on("message_display", handleMessages);

    return () => {
      socket.off("message_display", handleMessages);
    };
  }, [user.uid, car, driver]);

  const sendMessage = () => {
    if(!user || !user.uid) {
      alert("kindly login first");
    }
    if(!message.trim()) return;

    if(driver === user.uid) {
      alert("you cant fucking chat with your own dumbass");
      return;
    }
    const msgData = {
      carId: car,
      driverId: driver,
      userId: user.uid,
      message,
      sender: user.name,
      time: new Date(),
    };

    socket.emit("send_message", msgData );
    setMessage("");
  };

  return (
    <div
      ref={chatRef}
      className="fixed flex flex-col bottom-22 lg:bottom-25 right-4 z-100 bg-second shadow-2xl w-[90vw] sm:w-[80vw] md:w-[65vw] lg:w-[50vw] xl:w-[40vw] 2xl:w-[30vw] h-[70vh] rounded-2xl overflow-hidden"
    >
      <div className="flex justify-between bg-panel p-4">
        <div>
          <h1 className="text-base sm:text-xl md:text-2xl font-bold">
            {owner?.name}
          </h1>
        </div>
        <button onClick={() => setShowChat(false)}>
          <MdClose className="cursor-pointer text-2xl sm:text-3xl md:text-4xl font-bold duration-200 hover:scale-110 active:scale-110" />
        </button>
      </div>
      <div className="flex-1">
        {messageSent.map((msg, index) => {
          return <p key={index}> {msg.message}</p>;
        })}
      </div>
      <div className="flex bg-panel justify-between gap-2 items-center p-3">
        <textarea
          className="w-[85%] h-[6vh] text-normal placeholder-[var(--color-label)] text-base sm:text-xl md:text-2xl bg-second p-2 rounded-md"
          placeholder="kindly type your message!"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => {
            if(e.key === "Enter" && !e.shiftKey) {
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
