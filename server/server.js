import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import http from "http";
import { Server as SocketServer } from "socket.io";
import clientPromise from "./lib/mongodb.js";

import userRoutes from "./routes/userRoutes.js";
import userGet from "./routes/userGet.js";
import carRoute from "./routes/carRoute.js";
import carGet from "./routes/carGet.js";
import imageRoute from "./routes/imageRoute.js";
import regRoute from "./routes/regRoute.js";
import regGet from "./routes/regGet.js";
import convoGet from "./routes/convoGet.js";


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
app.use("/api/convo", convoGet);

async function messsageCollection() {
  const client = await clientPromise;
  const db = client.db("arqila");

  return db.collection("messages");
}

const convoRoomId = ({ carId, driverId, userId }) =>
  `${carId}_${driverId}_${userId}`;

io.on("connection", (socket) => {
  socket.on("join_conversation", async ({ carId, driverId, userId }) => {
    try {
      if (!carId || !driverId || !userId) return;
      const room = convoRoomId({ carId, driverId, userId });
      socket.join(room);
      console.log(`socket &{socket.id} has joined convo room ${room}`);

      const col = await messsageCollection();
      const history = await col
        .find({ carId, driverId, userId })
        .sort({ time: 1 })
        .toArray();

      socket.emit("conversation_history", history);
    } catch (err) {
      console.error("joining the room failed", err);
    }
  });

  socket.on("join_driver", async ({ driverId }) => {
    try {
      if (!driverId) return;
      const driverRoom = `driver_${driverId}`;
      socket.join(driverRoom);
      console.log(`socket ${socket.id} joined driver room ${driverRoom}`);

      const col = await messsageCollection();
      const pipeline = [
        { $match: {driverId} },
        { $sort: { time: -1 } },
        {
          $group: {
            _id: { userId: "$userId", carId: "$carId" },
            lastMessage: { $first: "$text"},
            sender: { $first: "$sender"},
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
        { $sort: { time: -1 } }
    ]

    const convos = await col.aggregate(pipeline).toArray();
    socket.emit("driver_conversations", convos);
    } catch (err) {
      console.error("driver_conversation error", err)
    }
  });

  socket.on("send_message", async (data) => {
    try {
      const { carId, carName, driverId, userId, text, sender, senderId } = data;
      if (!carId || !driverId || !userId || !text) {
        console.warn("send_message is missing fields", data);
        return;
      }

      const msg = {
        carId,
        carName,
        driverId,
        userId,
        text,
        sender,
        senderId,
        time: data.time ? new Date(data.time) : new Date(),
      };

      const col = await messsageCollection();
      await col.insertOne(msg);

      const room = convoRoomId({ carId, driverId, userId });
      io.to(room).emit("new_message", msg);
      const driverRoom = `driver_${driverId}`;
      io.to(driverRoom).emit("new_message", msg);
    } catch (err) {
      console.error("send_message error", err);
    }
  });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () =>
  console.log(`server running on http://localhost:${PORT}`)
);
