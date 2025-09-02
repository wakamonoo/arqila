"use client";
import { useEffect, useRef, useState } from "react";
import { MdClose, MdSend } from "react-icons/md";
import io from "socket.io-client";
import { auth } from "@/firebase/firebaseConfig";

const BASE_URL =
  process.env.NODE_ENV === "production"
    ? "https://arqila.onrender.com"
    : "http://localhost:4000";

let socket;

export default function Chat({ chatRef, user, carId, driverUid, setShowChat }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const listRef = useRef(null);

  useEffect(() => {
    const init = async () => {
      const res = await fetch(`${BASE_URL}/api/chat/${carId}`);
      const data = await res.json();
      setMessages(data || []);

      if (!socket) {
        socket = io(BASE_URL, { withCredentials: true });
      }
      socket.emit("chat:join", { carId });

      socket.on("chat:message", (msg) => {
        if (msg && msg.carId === carId) {
          setMessages((prev) => [...prev, msg]);
        }
      });
    };
    init();

    return () => {
      if (socket) {
        socket.off("chat:message");
      }
    };
  }, [carId]);

  useEffect(() => {
    listRef.current?.scrollTo(0, listRef.current.scrollHeight);
  }, [messages]);

  const send = () => {
    const senderUid = auth.currentUser?.uid;
    if (!senderUid || !input.trim()) return;

    const payload = {
      carId,
      senderUid,
      receiverUid: driverUid,
      text: input.trim(),
    };
    socket.emit("chat:message", payload, () => {});
    setInput("");
  };

  const isMine = (m) => m.senderUid === auth.currentUser?.uid;

  return (
    <div
      ref={chatRef}
      className="fixed flex flex-col bottom-22 lg:bottom-25 right-8 w-[92vw] sm:w-[60vw] md:w-[45vw] lg:w-[36vw] xl:w-[30vw] 2xl:w-[28vw] h-[70vh] rounded-2xl overflow-hidden shadow-2xl"
    >
      <div className="flex justify-between bg-panel p-4">
        <div>
          <h1 className="text-base sm:text-xl md:text-2xl font-bold">
            {user?.name || "Chat"}
          </h1>
          <p className="text-xs opacity-70">Car Room: {carId}</p>
        </div>
        <button onClick={() => setShowChat(false)} aria-label="Close chat">
          <MdClose className="cursor-pointer text-2xl sm:text-3xl md:text-4xl font-bold duration-200 hover:scale-110 active:scale-110" />
        </button>
      </div>

      <div
        ref={listRef}
        className="flex-1 bg-second p-3 overflow-y-auto space-y-2"
      >
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`max-w-[80%] px-3 py-2 rounded-xl ${
              isMine(m)
                ? "ml-auto bg-[var(--color-highlight)] text-[var(--color-panel)]"
                : "bg-panel text-normal"
            }`}
          >
            <div className="text-xs opacity-60 mb-0.5">
              {isMine(m) ? "You" : user?.name || "Driver"}
            </div>
            <div className="whitespace-pre-wrap break-words">{m.text}</div>
          </div>
        ))}
      </div>

      <div className="flex bg-panel justify-between gap-2 items-center p-3">
        <textarea
          className="w-[85%] h-[6vh] text-normal placeholder-[var(--color-label)] text-base sm:text-xl md:text-2xl bg-second p-2 rounded-md"
          placeholder="Type your message…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
        />
        <button onClick={send} aria-label="Send message">
          <MdSend className="cursor-pointer text-5xl text-normal bg-second p-2 rounded-md transition duration-100 hover:scale-110 active:scale-110" />
        </button>
      </div>
    </div>
  );
}
