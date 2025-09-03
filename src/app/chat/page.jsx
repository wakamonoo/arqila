// src/app/driver/chat/page.jsx
// CHANGED/ADDED: driver inbox page - fetches current firebase user, joins driver room, lists convos, open convo and reply
"use client";
import { useEffect, useState, useRef } from "react";
import { MdSend } from "react-icons/md";
import { auth } from "@/firebase/firebaseConfig"; // your firebase client config
import { io } from "socket.io-client";
const BASE_URL =
  process.env.NODE_ENV === "production"
    ? "https://arqila.onrender.com"
    : "http://localhost:4000";
const socket = io.connect(`${BASE_URL}`);

export default function DriverChatPage() {
  const [driver, setDriver] = useState(null);
  const [convos, setConvos] = useState([]);
  const [active, setActive] = useState(null); // { userId, carId }
  const [messages, setMessages] = useState([]);
  const [reply, setReply] = useState("");
  const listRef = useRef();

  // get logged in driver from firebase auth
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        // map Firebase user to the shape used in this chat: uid and name
        setDriver({
          uid: user.uid,
          name: user.displayName || user.email || "Driver",
        });
      } else {
        setDriver(null);
      }
    });
    return () => unsubscribe();
  }, []);

  // when driver available, join driver room and get convos
  useEffect(() => {
    if (!driver?.uid) return;

    socket.emit("join_driver", { driverId: driver.uid });

    const onConvos = (data) => {
      setConvos(data || []);
    };

    const onNewMessage = (msg) => {
      if (msg.driverId !== driver.uid) return;
      // move or add convo
      setConvos((prev) => {
        const copy = [...prev];
        const idx = copy.findIndex((c) => c.userId === msg.userId && c.carId === msg.carId);
        const item = { userId: msg.userId, carId: msg.carId, lastMessage: msg.text, sender: msg.sender, time: msg.time };
        if (idx === -1) {
          copy.unshift(item);
        } else {
          copy.splice(idx, 1);
          copy.unshift(item);
        }
        return copy;
      });

      // append message to active conversation if matches
      if (active && active.userId === msg.userId && active.carId === msg.carId) {
        setMessages((prev) => [...prev, msg]);
      }
    };

    socket.on("driver_conversations", onConvos);
    socket.on("new_message", onNewMessage);

    // ensure driver personal room joined
    socket.emit("join_user", { userId: driver.uid }); // if you want personal notifications

    return () => {
      socket.off("driver_conversations", onConvos);
      socket.off("new_message", onNewMessage);
    };
  }, [driver?.uid, socket, active]);

  // scroll to bottom when messages change
  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages]);

  const openConversation = ({ userId, carId }) => {
    if (!driver?.uid) return;
    setActive({ userId, carId });
    setMessages([]);

    // remove previous listeners on new_message and conversation_history, then attach new
    socket.off("conversation_history");
    socket.off("new_message");

    const onHistory = (history) => {
      setMessages(history || []);
    };
    const onNew = (msg) => {
      if (msg.carId === carId && msg.userId === userId) {
        setMessages((prev) => [...prev, msg]);
      }
    };

    socket.on("conversation_history", onHistory);
    socket.on("new_message", onNew);

    socket.emit("join_conversation", { carId, driverId: driver.uid, userId });
  };

  const sendReply = () => {
    if (!reply.trim() || !active || !driver) return;

    const payload = {
      carId: active.carId,
      driverId: driver.uid,
      userId: active.userId,
      text: reply,
      sender: driver.name,
      senderId: driver.uid,
      time: new Date().toISOString(),
    };

    socket.emit("send_message", payload);
    setMessages((prev) => [...prev, { ...payload, time: new Date(payload.time) }]);
    setReply("");
  };

  return (
    <div className="min-h-screen flex">
      <aside className="w-80 border-r p-4 bg-panel">
        <h2 className="font-bold mb-2">Driver Inbox</h2>
        {!driver && <p className="text-sm">Please login (driver) to see chats.</p>}
        {driver && (
          <>
            <div className="mb-2 text-sm">Logged in as: <strong>{driver.name}</strong></div>
            <div className="overflow-y-auto max-h-[70vh]">
              {convos.length === 0 && <p className="text-sm text-gray-500">No conversations yet</p>}
              {convos.map((c, idx) => (
                <button
                  key={idx}
                  onClick={() => openConversation({ userId: c.userId, carId: c.carId })}
                  className="block w-full text-left p-3 mb-2 bg-white rounded shadow-sm"
                >
                  <div className="font-semibold text-sm">{c.sender || c.userId}</div>
                  <div className="text-xs text-gray-600 truncate">{c.lastMessage}</div>
                  <div className="text-xs opacity-60">{c.time ? new Date(c.time).toLocaleString() : ""}</div>
                </button>
              ))}
            </div>
          </>
        )}
      </aside>

      <main className="flex-1 p-4 flex flex-col">
        <div className="bg-panel p-2 rounded">
          <h3 className="font-bold">{active ? `Conversation: ${active.userId} / ${active.carId}` : "Select a conversation"}</h3>
        </div>

        <div ref={listRef} className="flex-1 overflow-y-auto p-4">
          {messages.length === 0 && <p className="text-gray-500">No messages in this conversation</p>}
          {messages.map((m, i) => (
            <div key={i} className={`mb-3 flex ${m.senderId === driver?.uid ? "justify-end" : "justify-start"}`}>
              <div className={`p-3 rounded-xl max-w-[70%] ${m.senderId === driver?.uid ? "bg-green-500 text-white" : "bg-gray-300"}`}>
                <div className="text-xs font-semibold">{m.sender}</div>
                <div>{m.text}</div>
                <div className="text-xs opacity-70 text-right">{m.time ? new Date(m.time).toLocaleString() : ""}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-2 p-2 flex gap-2 bg-panel">
          <textarea
            placeholder={active ? "Write a reply..." : "Open a conversation to reply"}
            className="flex-1 p-2 rounded"
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            disabled={!active}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendReply();
              }
            }}
          />
          <button onClick={sendReply} className="bg-highlight p-3 rounded" disabled={!active}>
            <MdSend />
          </button>
        </div>
      </main>
    </div>
  );
}
