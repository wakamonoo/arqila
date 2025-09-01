import express from "express";
import clientPromise from "../lib/mongodb.js";
import admin from "../lib/firebaseAdmin.js";

const router = express.Router();

router.post("/signup", async (req, res) => {
  const { token } = req.body;
  try {
    const decoded = await admin.auth().verifyIdToken(token);
    const { uid, email, name } = decoded;

    const client = await clientPromise;
    const db = client.db("arqila");

    await db
      .collection("users")
      .updateOne(
        { uid },
        { $setOnInsert: { uid, email, name, role: "user" } },
        { upsert: true }
      );

    res.status(200).json({ message: "user signed up" });
  } catch (err) {
    console.error(err);
    res.status(401).json({ error: "token invalid " });
  }
});

router.put("/updateUser", async (req, res) => {
  const { uid, name, contact, address, info } = req.body;
  try {
    const client = await clientPromise;
    const db = client.db("arqila");

    const result = await db
      .collection("users")
      .updateOne(
        { uid },
        { $set: { name, contact, address, info } },
        { upsert: true }
      );

    if (result.modifiedCount>0) {
      res.status(200).json({message: "user updated"})
    } else {
      res.status(200).json({message: "no changes made"})
    }
  } catch (err) {
    console.error(err);
    res.status(401).json({ error: "failed to update user" });
  }
});

router.put("/driverReg", async (req, res) => {
  const { uid } = req.body;
  try {
    const client = await clientPromise;
    const db = client.db("arqila");

    const result = await db
      .collection("users")
      .updateOne(
        { uid },
        { $set: { role: "driver" } },
        { upsert: true }
      );

    res.json(200).json({message: "success"});
  } catch (err) {
    console.error(err);
    res.status(401).json({ error: "failed to update user" });
  }
});


export default router;
