// server/server.js
// CHANGED/ADDED: replaced server logic to persist messages and provide conversation endpoints via socket
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import http from "http";
import { Server as SocketServer } from "socket.io";
import clientPromise from "./lib/mongodb.js"; // CHANGED/ADDED: import the mongodb client

import userRoutes from "./routes/userRoutes.js";
import userGet from "./routes/userGet.js";
import carRoute from "./routes/carRoute.js";
import carGet from "./routes/carGet.js";
import imageRoute from "./routes/imageRoute.js";
import regRoute from "./routes/regRoute.js";
import regGet from "./routes/regGet.js";

dotenv.config();

const app = express();
const server = http.createServer(app);

const allowedOrigins = [
  "http://localhost:3000",
  "https://arqila-wakamonoo.vercel.app",
];

const io = new SocketServer(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
  },
});

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);
app.use(express.json());

app.use("/api/users", userRoutes);
app.use("/api/users", userGet);
app.use("/api/cars", carRoute);
app.use("/api/cars", carGet);
app.use("/api/register", regRoute);
app.use("/api/register", regGet);
app.use("/api/images", imageRoute);

// CHANGED/ADDED: helper to get messages collection
async function messagesCollection() {
  const client = await clientPromise;
  const dbName = process.env.MONGODB_DB || "arqila";
  return client.db(dbName).collection("messages");
}

// helper for unique convo room
const convoRoomId = ({ carId, driverId, userId }) => `${carId}_${driverId}_${userId}`;

io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

  // join a 1:1 conversation room (car + driver + user)
  socket.on("join_conversation", async ({ carId, driverId, userId }) => {
    try {
      if (!carId || !driverId || !userId) return;
      const room = convoRoomId({ carId, driverId, userId });
      socket.join(room);
      console.log(`Socket ${socket.id} joined conv room ${room}`);

      // Fetch history and send to socket
      const col = await messagesCollection();
      const history = await col
        .find({ carId, driverId, userId })
        .sort({ time: 1 })
        .toArray();

      socket.emit("conversation_history", history);
    } catch (err) {
      console.error("join_conversation error:", err);
    }
  });

  // driver dashboard: join driver room and send a summary of conversations
  socket.on("join_driver", async ({ driverId }) => {
    try {
      if (!driverId) return;
      const driverRoom = `driver_${driverId}`;
      socket.join(driverRoom);
      console.log(`Socket ${socket.id} joined driver room ${driverRoom}`);

      const col = await messagesCollection();
      // aggregate last message per user+car
      const pipeline = [
        { $match: { driverId } },
        { $sort: { time: -1 } },
        {
          $group: {
            _id: { userId: "$userId", carId: "$carId" },
            lastMessage: { $first: "$text" },
            sender: { $first: "$sender" },
            time: { $first: "$time" },
          },
        },
        {
          $project: {
            _id: 0,
            userId: "$_id.userId",
            carId: "$_id.carId",
            lastMessage: 1,
            sender: 1,
            time: 1,
          },
        },
        { $sort: { time: -1 } },
      ];

      const convos = await col.aggregate(pipeline).toArray();
      socket.emit("driver_conversations", convos);
    } catch (err) {
      console.error("join_driver error:", err);
    }
  });

  // join personal user room (optional notifications)
  socket.on("join_user", ({ userId }) => {
    if (!userId) return;
    const userRoom = `user_${userId}`;
    socket.join(userRoom);
    console.log(`Socket ${socket.id} joined user room ${userRoom}`);
  });

  // send_message: persist & broadcast
  socket.on("send_message", async (data) => {
    try {
      // data shape: { carId, driverId, userId, text, sender, senderId, time }
      const { carId, driverId, userId, text, sender, senderId } = data;
      if (!carId || !driverId || !userId || !text) {
        console.warn("send_message missing fields", data);
        return;
      }

      const msg = {
        carId,
        driverId,
        userId,
        text,
        sender: sender || senderId,
        senderId,
        time: data.time ? new Date(data.time) : new Date(),
      };

      // persist
      const col = await messagesCollection();
      await col.insertOne(msg);

      // emit to conversation room
      const room = convoRoomId({ carId, driverId, userId });
      io.to(room).emit("new_message", msg);

      // update driver & user personal rooms too
      io.to(`driver_${driverId}`).emit("new_message", msg);
      io.to(`user_${userId}`).emit("new_message", msg);
    } catch (err) {
      console.error("send_message error:", err);
    }
  });

  socket.on("disconnect", () => {
    console.log("Socket disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => console.log(`server running on http://localhost:${PORT}`));
