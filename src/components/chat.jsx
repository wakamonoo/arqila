"use client";
import { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import { MdClose, MdSend } from "react-icons/md";

const BASE_URL =
  process.env.NODE_ENV === "production"
    ? "https://arqila.onrender.com"
    : "http://localhost:4000";
const socket = io.connect(`${BASE_URL}`);

export default function Chat({
  chatRef,
  user,
  owner,
  car,
  driver,
  setShowChat,
}) {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const listRef = useRef(null);

  useEffect(() => {
    if(listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages])

  useEffect(() => {
    if (!user || !user.uid) return;
    if (!car || !driver) return;

    const joinData = { carId: car, driverId: driver, userId: user.uid };
    socket.emit("join_conversation", joinData);

    const handleHistory = (history) => {
      setMessages(history || []);
    };

    const handleNew = (msg) => {
      if (
        msg.carId === car &&
        msg.driverId === driver &&
        msg.userId === user.uid
      ) {
        setMessages((prev) => [...prev, msg]);
      }
    };

    socket.on("conversation_history", handleHistory);
    socket.on("new_message", handleNew);

    return () => {
      socket.off("conversation_history", handleHistory);
      socket.off("new_message", handleNew);
    };
  }, [user?.uid, car, driver]);

  const sendMessage = () => {
    if (!message.trim()) return;
    if (!user || !user.uid) {
      alert("kindly login first");
    }
    

    if (driver === user.uid) {
      alert("you cant fucking chat with your own dumbass");
      return;
    }
    const messageData = {
      carId: car,
      driverId: driver,
      userId: user.uid,
      text: message,
      sender: user.name || user.displayName || user.email,
      senderId: user.uid,
      time: new Date().toISOString(),
    };

    socket.emit("send_message", messageData);
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

      <div ref={listRef} className="flex-1">
        {messages.length === 0 ? (
          <p>no messages yet</p>
        ) : (
          messages.map((msg, index) => {
            const time = msg.time ? new Date(msg.time).toLocaleString() : "";
            const isMe = msg.senderId === user.uid;
            return (
              <div key={index} className={`mb-3 flex ${isMe? "justify-end"  : "justify-start"}`}>
                <div className={`p-3 rounded-xl max-w-[70%] ${isMe ? "bg-amber-50" : "bg-amber-600"}`}>
                  <p>{msg.sender}</p>
                  <p>{msg.text}</p>
                  <p>{time}</p>
                </div>
              </div>
            )
          })
        )

        }
      </div>

      <div className="flex bg-panel justify-between gap-2 items-center p-3">
        <textarea
          className="w-[85%] h-[6vh] text-normal placeholder-[var(--color-label)] text-base sm:text-xl md:text-2xl bg-second p-2 rounded-md"
          placeholder="kindly type your message!"
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
