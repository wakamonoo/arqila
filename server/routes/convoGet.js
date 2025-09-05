import express from "express";
import clientPromise from "../lib/mongodb.js";

const router = express.Router();

router.get("/convoGet", async (req, res) => {
  try {
    const { carId, userId, driverId } = req.query;
    const client = await clientPromise;
    const db = client.db("arqila");

    const convo = await db.collection("messages").findOne({ carId, userId, driverId });
    res.status(200).json({ carName: convo.carName });
  } catch (err) {
    console.error("carname fetch error", err);
  }
});

export default router;
