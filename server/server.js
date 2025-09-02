import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import http from "http";
import { Server as SocketIOServer } from "socket.io";

import userRoutes from "./routes/userRoutes.js";
import userGet from "./routes/userGet.js";
import carRoute from "./routes/carRoute.js";
import carGet from "./routes/carGet.js";
import imageRoute from "./routes/imageRoute.js";
import regRoute from "./routes/regRoute.js";
import regGet from "./routes/regGet.js";
import chatGet from "./routes/chatGet.js";
import clientPromise from "./lib/mongodb.js";

dotenv.config();

const allowedOrigins = [
  "http://localhost:3000",
  "https://arqila-wakamonoo.vercel.app",
  "https://arqila.onrender.com",
];

const app = express();
const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: (origin, cb) => {
      if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
      return cb(new Error("Not allowed by CORS"), false);
    },
    credentials: true,
  },
});

app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
      return cb(new Error("Not allowed by CORS"), false);
    },
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
app.use("/api/chat", chatGet);

io.on("connection", (socket) => {
  socket.on("chat:join", ({ carId }) => {
    if (carId) {
      socket.join(carId);
      socket.emit("chat:joined", { carId });
    }
  });

  socket.on("chat:message", async (payload, ack) => {
    try {
      const { carId, senderUid, receiverUid, text } = payload || {};
      if (!carId || !senderUid || !receiverUid || !text) {
        if (ack) ack({ ok: false, error: "Missing fields" });
        return;
      }

      const doc = {
        carId,
        senderUid,
        receiverUid,
        text,
        createdAt: new Date(),
      };

      const client = await clientPromise;
      const db = client.db("arqila");
      await db.collection("messages").insertOne(doc);

      io.to(carId).emit("chat:message", doc);
      if (ack) ack({ ok: true });
    } catch (err) {
      console.error("chat:message error", err);
      if (ack) ack({ ok: false, error: "Server error" });
    }
  });

  socket.on("disconnect", () => {});
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`server + socket running on http://localhost:${PORT}`);
});
