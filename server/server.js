import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import http from "http";
import { Server as SocketServer } from "socket.io";

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

  socket.on("send_message", (data) => {
    const { carId, driverId, userId, message, sender, time } = data;
    const roomId = `${carId}_${driverId}_${userId}`;
    io.to(roomId).emit("message_display", { message, sender, time });
  });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () =>
  console.log(`server running on http://localhost:${PORT}`)
);
