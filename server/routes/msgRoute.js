import express from "express";
import clientPromise from "../lib/mongodb.js";

const router = express.Router();

router.delete("/msgDel/:msgId", async (req, res) => {
  try {
    const { msgId } = req.params;

    const client = await clientPromise;
    const db = client.db("arqila");

    await db.collection("messages").deleteOne({ msgId });
    res.status(200).json({ message: "succefully deleted message" });
  } catch (err) {
    console.error("delete error", err);
    res.status(500).json({ error: "message delete failed" });
  }
});

export default router;
