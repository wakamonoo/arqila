import express from "express";
import clientPromise from "../lib/mongodb.js";

const router = express.Router();

router.get("/:carId", async (req, res) => {
  try {
    const { carId } = req.params;
    const client = await clientPromise;
    const db = client.db("arqila");
    const history = await db
      .collection("messages")
      .find({ carId })
      .sort({ createdAt: 1 })
      .toArray();

    res.status(200).json(history);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "failed to fetch chat history" });
  }
});

export default router;
