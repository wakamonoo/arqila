"use client";
import { useState, useRef, useEffect } from "react";
import { MdSend } from "react-icons/md";
import { auth } from "@/firebase/firebaseConfig";
import { io } from "socket.io-client";
const BASE_URL =
  process.env.NODE_ENV === "production"
    ? "https://arqila.onrender.com"
    : "http://localhost:4000";

const socket = io.connect(`${BASE_URL}`);

export default function ArqChat() {
  const [driver, setDriver] = useState(null);
  const [convos, setConvos] = useState([]);
  const [active, setActive] = useState(null);
  const [messages, setMessages] = useState([]);
  const [reply, setReply] = useState("");
  const listRef = useRef(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setDriver({
          uid: user.uid,
          name: user.displayName || user.email || "Driver",
        });
      } else {
        setDriver(null);
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!driver?.uid) return;

    socket.emit("join_driver", { driverId: driver.uid });

    const onConvos = (data) => {
      setConvos(data || []);
    };

    const onNewMessage = (msg) => {
      if (msg.driverId !== driver.uid) return;
      setConvos((prev) => {
        const copy = [...prev];
        const targetIndex = copy.findIndex(
          (chat) => chat.userId === msg.userId && chat.carId === msg.carId
        );
        const item = {
          userId: msg.userId,
          carId: msg.carId,
          lastMessage: msg.text,
          sender: msg.sender,
          time: msg.time,
        };
        if (targetIndex === -1) {
          copy.unshift(item);
        } else {
          copy.splice(targetIndex, 1);
          copy.unshift(item);
        }
        return copy;
      });

      if (
        active &&
        active.userId === msg.userId &&
        active.carId === msg.carId
      ) {
        setMessages((prev) => [...prev, msg]);
      }
    };

    socket.on("driver_conversations", onConvos);
    socket.on("new_message", onNewMessage);

    return () => {
      socket.off("driver_conversations", onConvos);
      socket.off("new_message", onNewMessage);
    };
  }, [driver?.uid, socket, active]);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages]);

  const openConversation = ({ userId, carId }) => {
    if (!driver?.uid) return;
    setActive({ userId, carId });
    setMessages([]);

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

    const messageData = {
      carId: active.carId,
      driverId: driver.uid,
      userId: active.userId,
      text: reply,
      sender: driver.name,
      senderId: driver.uid,
      time: new Date().toISOString(),
    };

    socket.emit("send_message", messageData);
    setReply("");
  };

  return (
    <div className="flex min-h-screen">
      <aside className="bg-panel w-32">
        <h2 className="font-bold text-header text-xl flex justify-center">arqchat</h2>
        {!driver ? (
          <p>fuck u are not a fucking driver</p>
        ) : (
          <div>
            <p className="font-semibold text-base px-2 uppercase ">{driver.name}</p>
            <div className="flex flex-col gap-2 mt-4">
              {convos.length === 0 ? (
                <p>no convo yet</p>
              ) : (
                convos.map((chat, targetIndex) => (
                  <div
                    key={targetIndex}
                    onClick={() =>
                      openConversation({
                        userId: chat.userId,
                        carId: chat.carId,
                      })
                    }
                    className="bg-second p-2"
                  >
                    <p className="text-base font-semibold">{chat.sender || chat.userId}</p>
                    <p className="text-sm text-label">{chat.lastMessage}</p>
                    <p className="text-xs text-label">
                      {chat.time ? new Date(chat.time).toLocaleString() : ""}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </aside>

      <main>
        <h3>
          {active
            ? `conversation: ${active.userId} / ${active.carId}`
            : "select conversation"}
        </h3>

        <div ref={listRef}>
          {messages.length === 0 ? (
            <p>no fucking message yet</p>
          ) : (
            messages.map((msg, index) => (
              <div
                key={index}
                className={`mb-3 flex ${
                  msg.sender === driver.uid ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`${
                    msg.sender === driver.uid ? "bg-amber-300" : "bg-amber-950"
                  }`}
                >
                  <h4>{msg.sender}</h4>
                  <p>{msg.text}</p>
                  <p>{msg.time ? new Date(msg.time).toLocaleString() : ""}</p>
                </div>
              </div>
            ))
          )}
        </div>

        <div>
          <textarea
            placeholder={
              active ? "write a reply.." : "open convsation to reply"
            }
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            disabled={!active}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendReply();
              }
            }}
          ></textarea>
          <button>
            <MdSend onClick={sendReply} disabled={!active} />
          </button>
        </div>
      </main>
    </div>
  );
}
