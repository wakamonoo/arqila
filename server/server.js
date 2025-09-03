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
  console.log("⚡ New connection:", socket.id);

  // User joins their personal room
  socket.on("joinUserRoom", (userId) => {
    socket.join(`user_${userId}`);
    console.log(`User joined room: user_${userId}`);
  });

  // Driver joins their personal room
  socket.on("joinDriverRoom", (driverId) => {
    socket.join(`driver_${driverId}`);
    console.log(`Driver joined room: driver_${driverId}`);
  });

  // Handle sending messages
  socket.on("sendMessage", (data) => {
    console.log("📩 Message:", data);

    // Send to driver
    io.to(`driver_${data.driverId}`).emit("receiveMessage", data);

    // Send to user
    io.to(`user_${data.userId}`).emit("receiveMessage", data);
  });

  socket.on("disconnect", () => {
    console.log("❌ Disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () =>
  console.log(`server running on http://localhost:${PORT}`)
);
