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



io.on("connection", (socket) => {
  socket.on("join_room", ({ carId, driverId, userId }) => {
    const roomId = `${carId}_${driverId}_${userId}`;
    socket.join(roomId);
    console.log(`User ${socket.id} joined room: ${roomId}`);
  });

  socket.on("send_message", async (data) => {
    const roomId = `${data.carId}_${data.driverId}_${data.userId}`;

    const client = await clientPromise;
    const db = client.db("arqila");

    await db.collection("messages").insertOne({
      carId: data.carId,
      message: data.message,
      sender: data.sender,
      time: new Date(),
    })

    io.to(roomId).emit("message_display", { message: data.message, sender: data.sender, time: data.time });
  });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () =>
  console.log(`server running on http://localhost:${PORT}`)
);
