"use client";
import { useState, useRef, useEffect, act } from "react";
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
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [convos, setConvos] = useState([]);
  const [active, setActive] = useState(null);
  const [messages, setMessages] = useState([]);
  const [reply, setReply] = useState("");
  const listRef = useRef(null);
  const [loader, setLoader] = useState(false);
  const [carName, setCarName] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (authUser) => {
      if (authUser) {
        try{
          const res = await fetch(`${BASE_URL}/api/users/users/${authUser.uid}`);
          const dbUser = await res.json();

          setUser({
            uid: authUser.uid,
            name: dbUser.name || authUser.displayName || authUser.email,
          });
          setRole(dbUser.role)
        } catch (err) {
          console.error("failed to fetch user", err);
        }
      } else {
        setUser(null);
        setRole(null);
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!user?.uid || !role) return;
    setLoader(true);

    if(role === "driver") {
      socket.emit("join_driver", { driverId: user.uid });
    } else {
      socket.emit("join_user", { userId: user.uid });
    }

    const onConvos = (data) => {
      setConvos(data || []);
      setLoader(false);
    };

    const onNewMessage = (msg) => {
      if (msg.driverId !== user.uid && msg.userId !== user.uid) return;
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
          senderId: msg.senderId,
          driverId: msg.driverId,
          driverName: msg.driverName,
          client: msg.client,
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
        setMessages((prev) => {
          if (
            prev.some((m) => m.time === msg.time && m.senderId === msg.senderId)
          ) {
            return prev;
          }
          return [...prev, msg];
        });
      }
    };

    socket.off("driver_conversations", onConvos);
    socket.off("user_conversations", onConvos);
    socket.off("new_message", onNewMessage);

    socket.on(role === "driver" ? "driver_conversations" : "user_conversations", onConvos);
    socket.on("new_message", onNewMessage);

    return () => {
      socket.off("driver_conversations", onConvos);
      socket.off("new_message", onNewMessage);
    };
  }, [user?.uid, role, active]);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages]);

  const openConversation = ({ userId, driverId, carId }) => {
    if (!user?.uid) return;

    setActive({ userId, driverId, carId });
    setMessages([]);

    socket.off("conversation_history");
    socket.off("new_message");

    const onHistory = (history) => {
      setMessages(history || []);
    };

    const onNew = (msg) => {
      if (msg.carId === carId && msg.userId === userId) {
        setMessages((prev) => {
          if (
            prev.some((m) => m.time === msg.time && m.senderId === msg.senderId)
          ) {
            return prev;
          }
          return [...prev, msg];
        });
      }
    };

    socket.on("conversation_history", onHistory);
    socket.on("new_message", onNew);

    socket.emit("join_conversation", { carId, driverId, userId });
  };

  const sendReply = () => {
    if (!reply.trim() || !active || !user) return;

    const messageData = {
      carId: active.carId,
      driverId: role === "driver" ? user.uid : active?.driverId,
      driverName: role === "driver" ? user.name : convo?.driverName,
      userId: active.userId,
      text: reply,
      sender: user.name,
      senderId: user.uid,
      client: convo?.client,
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

  useEffect(() => {
    if (!active || !user) return;

    const fetchCarName = async () => {
      try {
        const res = await fetch(
          `${BASE_URL}/api/convo/convoGet?carId=${active.carId}&userId=${active.userId}&driverId=${active.driverId}`
        );
        const data = await res.json();
        setCarName(data.carName);
      } catch (err) {
        console.error(err);
      }
    };

    fetchCarName();
  }, [active, user]);

  return (
    <div className="flex  h-screen">
      <aside className={`bg-brand md:w-[28%] ${active ? "hidden md:flex md:flex-col" : "w-full"}`}>
        <div className="flex justify-between items-center gap-2 p-4">
          <a href="/">
            <FaArrowLeft className="text-2xl sm:text-3xl md:text-4xl font-bold duration-200 hover:scale-110 active:scale-110" />
          </a>
          <h2 className="font-bold text-header text-2xl sm:text-3xl md:text-4xl flex justify-center">
            arqchat
          </h2>
          <div />
        </div>
        {!user ? (
          <div className="flex flex-col gap-2 justify-center items-center absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <FaUserAltSlash className="text-7xl sm:text-8xl md:text-9xl" />
            <p className="text-header text-base sm:text-xl md:text-2xl font-bold">
              kindly login first
            </p>
          </div>
        ) : (
          <div>
            <p className="font-semibold text-base text-center leading-5 sm:text-xl md:text-2xl px-2 uppercase -mt-4 md:-mt-2 flex justify-center">
              Hey {user.name}!
            </p>
            <div className="flex flex-col gap-2 mt-4 p-8 md:p-2">
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
                        driverId: chat.driverId,
                        carId: chat.carId,
                      })
                    }
                    className="bg-second rounded p-4 cursor-pointer duration-200 hover:bg-[var(--color-highlight)] active:bg-[var(--color-highlight)]"
                  >
                    <p className="text-base sm:text-xl md:text-2xl font-bold leading-5">
                      {role === "driver" ? chat.client || chat.userId : chat.driverName || active.driverId}
                    </p>
                    <div className="flex gap-1 items-end py-4">
                      <p className="font-light text-sm sm:text-base md:text-xl leading-6 sm:leading-9 md:leading-8">
                        { chat.senderId === user.uid ? "you:" : "" }
                      </p>
                      <p className="text-base sm:text-xl md:text-2xl py-2 text-normal line-clamp-1 h-8 sm:h-10">
                        {chat.lastMessage}
                      </p>
                    </div>
                    <p className="text-xs sm:tex-sm md:text-base text-label flex justify-end">
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
        className={`flex flex-col bg-second md:w-[72%] ${active ? "w-full" : "hidden md:flex"}`}
        style={{ height: "100dvh" }}
      >
        <div className="bg-panel p-4 flex gap-8 items-center">
          <button onClick={() => setActive(null)} className="flex md:hidden">
            <FaArrowLeft className="text-2xl sm:text-3xl md:text-4xl font-bold duration-200 hover:scale-110 active:scale-110" />
          </button>
          <div className="flex flex-col md:px-4 lg:px-8">
            <p className="text-base sm:text-xl md:text-2xl leading-3.5">{active ? role === "driver" ? convo?.client || active.userId : convo.driverName || active.driverId : "select conversation"}</p>
            <p className="text-xs sm:text-sm md:text-base text-label">{active ? carName || "carname" : "select conversation"}</p>
          </div>
        </div>

        <div ref={listRef} className="flex-1 overflow-y-auto p-4 min-h-0">
          {loader ? (
            <Loader />
          ) : messages.length === 0 ? (
            <div className="flex justify-center items-center h-full">
              <p className="text-xs sm:text-sm md:text-base text-label">no messages</p>
            </div>
          ) : (
            messages.map((msg, index) => (
              <div
                key={index}
                className={`mb-3 flex ${
                  msg.senderId === user.uid ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`p-4 md:p-6 rounded-xl max-w-[70%] ${
                    msg.senderId === user.uid ? "bg-brand" : "bg-panel"
                  }`}
                >
                  <p className={`text-label text-sm sm:text-base md:text-xl font-semibold flex ${msg.senderId === user.uid ? "justify-end" : "justify-start"}`}>{msg.sender}</p>
                  <p className="text-base sm:text-xl md:text-2xl py-4">{msg.text}</p>
                  <p className={`text-label text-xs sm:text-sm md:text-base flex ${msg.senderId === user.uid ? "justify-end" : "justify-start"}`}>
                    {msg.time ? new Date(msg.time).toLocaleString() : ""}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="flex gap-1 p-2 bg-panel w-full">
          <textarea
            className="text-base sm:text-xl md:text-2xl rounded px-2 bg-second flex-1"
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
            <MdSend className="text-xl sm:text-2xl md:text-3xl duration-200 hover:scale-110 active:scale-110" />
          </button>
        </div>
      </main>
    </div>
  );
}
