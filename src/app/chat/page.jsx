"use client";
import { useState, useRef, useEffect } from "react";
import { MdSend } from "react-icons/md";
import Loader from "@/components/loader";
import { auth } from "@/firebase/firebaseConfig";
import { io } from "socket.io-client";
import {
  FaArrowLeft,
  FaHandPaper,
  FaInbox,
  FaUserAltSlash,
} from "react-icons/fa";
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
  const [loader, setLoader] = useState(false);

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
    setLoader(true);

    socket.emit("join_driver", { driverId: driver.uid });

    const onConvos = (data) => {
      setConvos(data || []);
      setLoader(false);
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

  const convo = active
    ? convos.find(
        (chat) => chat.userId === active.userId && chat.carId === active.carId
      )
    : null;

  return (
    <div className="flex h-screen w-screen">
      <aside className={`bg-brand ${active ? "hidden" : "w-full"}`}>
        <div className="flex justify-between items-center gap-2 p-4">
          <a href="/">
            <FaArrowLeft className="cursor-pointer text-2xl" />
          </a>
          <h2 className="font-bold text-header text-2xl flex justify-center">
            arqchat
          </h2>
          <div />
        </div>
        {!driver ? (
          <div className="flex flex-col gap-2 justify-center items-center absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <FaUserAltSlash className="text-7xl sm:text-8xl md:text-9xl" />
            <p className="text-header text-base sm:text-xl md:text-2xl font-bold">
              kindly login first
            </p>
          </div>
        ) : (
          <div>
            <p className="font-semibold text-base px-2 uppercase -mt-4 flex justify-center">
              Hey {driver.name}!
            </p>
            <div className="flex flex-col gap-2 mt-4 p-4">
              {loader ? (
                <Loader />
              ) : convos.length === 0 ? (
                <div className="flex flex-col gap-2 justify-center items-center absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                  <FaInbox className="text-7xl sm:text-8xl md:text-9xl" />
                  <p className="text-header text-base sm:text-xl md:text-2xl font-bold">
                    no messages yet
                  </p>
                </div>
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
                    className="bg-second rounded p-4 cursor-pointer duration-200 hover:bg-[var(--color-highlight)] active:bg-[var(--color-highlight)]"
                  >
                    <p className="text-base font-bold leading-3">
                      {chat.sender || chat.userId}
                    </p>
                    <p className="text-base py-2 text-normal">
                      {chat.lastMessage}
                    </p>
                    <p className="text-xs text-label flex justify-end">
                      {chat.time ? new Date(chat.time).toLocaleString() : ""}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </aside>

      <main
        className={`flex flex-col bg-second ${active ? "w-full" : "hidden"}`}
      >
        <div className="bg-panel p-4 flex gap-8 items-center">
          <button onClick={() => setActive(null)}>
            <FaArrowLeft />
          </button>
          <p className="text-base text-normal font-semibold">
            {active ? convo?.sender || active.userId : "select conversation"} |{" "}
            {active ? convo?.carName || "carname" : "select conversation"}
          </p>
        </div>

        <div ref={listRef} className="flex-1 overflow-y-auto p-4 min-h-0">
          {loader ? (
            <Loader />
          ) : messages.length === 0 ? (
            <div className="flex justify-center items-center h-full">
              <p className="text-xs text-label">no messages</p>
            </div>
          ) : (
            messages.map((msg, index) => (
              <div
                key={index}
                className={`mb-3 flex ${
                  msg.senderId === driver.uid ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`p-3 rounded-xl max-w-[70%] ${
                    msg.senderId === driver.uid ? "bg-brand" : "bg-panel"
                  }`}
                >
                  <p className="text-sm font-semibold">{msg.sender}</p>
                  <p className="text-base">{msg.text}</p>
                  <p className="text-label text-xs">
                    {msg.time ? new Date(msg.time).toLocaleString() : ""}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="flex gap-1 p-2 bg-panel w-full">
          <textarea
            className="text-base rounded px-2 bg-second flex-1"
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
          <button
            onClick={sendReply}
            disabled={!active}
            className="bg-second rounded cursor-pointer p-2"
          >
            <MdSend className="text-xl" />
          </button>
        </div>
      </main>
    </div>
  );
}
