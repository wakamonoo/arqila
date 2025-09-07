"use client";
import { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import { MdClose, MdSend, MdWarning } from "react-icons/md";
import { FaTrash } from "react-icons/fa";
import Swal from "sweetalert2";

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
  carName,
  driver,
  setShowChat,
}) {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const listRef = useRef(null);
  const [delConfirm, setDelConfirm] = useState(false);
  const [selectedMsgId, setSelectedMsgId] = useState(null);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages]);

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

    const messageData = {
      carId: car,
      carName: carName,
      driverId: driver,
      userId: user.uid,
      text: message,
      sender: user.name || user.displayName || user.email,
      senderId: user.uid,
      client: user.name,
      time: new Date().toISOString(),
    };

    socket.emit("send_message", messageData);
    setMessage("");
  };

  const delMessage = async (msgId) => {
    try {
      const res = await fetch(`${BASE_URL}/api/messages/msgDel/${msgId}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (res.ok) {
        Swal.fire({
          title: "Sucess",
          text: "message deleted",
          icon: "success",
          timer: 2000,
          showConfirmButton: false,
        });
        setMessages((prev) => prev.filter((m) => m.msgId !== msgId));
      } else {
        console.error("failed to delete message");
        Swal.fire({
          title: "Error",
          text: data.error || "message deletion failed",
          icon: "error",
          timer: 2000,
          showConfirmButton: false,
        });
      }
    } catch (err) {
      console.error(err);
    }
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

      <div ref={listRef} className="flex-1 overflow-auto p-4">
        {messages.length === 0 ? (
          <div className="flex justify-center items-center h-full">
            <p className="text-xs text-label">no messages</p>
          </div>
        ) : (
          messages.map((msg, index) => {
            const time = msg.time ? new Date(msg.time).toLocaleString() : "";
            const isMe = msg.senderId === user.uid;
            return (
              <div
                key={index}
                className={`mb-3 flex ${
                  isMe ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`p-3 rounded-xl max-w-[70%] ${
                    isMe ? "bg-brand" : "bg-panel"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    {isMe && (
                      <FaTrash
                        className="text-xs sm:text-sm md:text-base text-label duration-200 hover:text-[var(--color-text)] cursor-pointer"
                        onClick={() => {
                          setSelectedMsgId(msg.msgId);
                          setDelConfirm(true);
                        }}
                      />
                    )}
                    <p
                      className={`text-label text-sm sm:text-base md:text-xl font-semibold flex ${
                        isMe ? "justify-end" : "justify-start"
                      }`}
                    >
                      {isMe ? "you" : msg.sender}
                    </p>
                  </div>
                  <p className="text-base sm:text-xl md:text-2xl py-4">
                    {msg.text}
                  </p>
                  <p
                    className={`text-label text-xs sm:text-sm md:text-base flex ${
                      isMe ? "justify-end" : "justify-start"
                    }`}
                  >
                    {time}
                  </p>
                </div>
              </div>
            );
          })
        )}
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
      {delConfirm && (
        <div
          onClick={() => setDelConfirm(false)}
          className="fixed w-full inset-0 backdrop-blur-xs z-[70] flex items-center justify-center"
        >
          <div className="relative bg-panel w-[350px] sm:w-[400px] md:w-[450px] h-[400px] sm:h-[450px] md:h-[500px] rounded-2xl p-6">
            <MdClose
              onClick={() => setDelConfirm(false)}
              className="absolute cursor-pointer right-4 top-4 text-2xl sm:text-3xl md:text-4xl font-bold duration-200 hover:scale-110 active:scale-110"
            />
            <div className="flex flex-col justify-center mt-[35%] items-center">
              <div className="flex gap-2 items-center">
                <MdWarning className="text-2xl sm:text-3xl md:text-4xl" />
                <p className="text-center text-xl sm:text-2xl md:text-3xl  text-highlight capitalize font-bold">
                  delete message?
                </p>
              </div>
              <div className="flex flex-col mt-4 px-12 w-full gap-2">
                <button
                  onClick={() => {
                    delMessage(selectedMsgId);
                    setDelConfirm(false);
                  }}
                  className="bg-red-600 p-2 rounded-full w-full duration-200 hover:bg-red-700 active:bg-red-700 cursor-pointer text-base sm:text-xl md:text-2xl"
                >
                  Yes, Delete it
                </button>
                <button
                  onClick={() => setDelConfirm(false)}
                  className="bg-highlight p-2 rounded-full w-full duration-200 hover:bg-[var(--color-highlight-hover)] active:bg-[var(--color-highlight-hover)] cursor-pointer text-base sm:text-xl md:text-2xl"
                >
                  No, Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
