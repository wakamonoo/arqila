import express from "express";
import clientPromise from "../lib/mongodb.js";

const router = express.Router();

router.post("/driverReg", async (req, res) => {
  const { uid, name, orcr, license } = req.body;
  try {
    const client = await clientPromise;
    const db = client.db("arqila");

    await db
      .collection("registration")
      .updateOne(
        { uid },
        {
          $setOnInsert: {
            uid,
            name,
            orcr,
            license,
            status: "pending",
            submittedAt: new Date().toISOString().split("T")[0],
          },
        },
        { upsert: true }
      );

    res
      .status(200)
      .json({ message: "user application for driverpreneur success" });
  } catch (err) {
    console.error(err);
    res.status(401).json({ error: "user application for driverpreneur error" });
  }
});

router.put("/driverUp", async (req, res) => {
  const { uid  } = req.body;
  try {
    const client = await clientPromise;
    const db = client.db("arqila");

    await db
      .collection("registration")
      .updateOne({ uid }, { $set: { status: "approved" } }, { upsert: true });
      
      res.status(200).json({ message: "status changed"})
  } catch (err) {
    console.error(err);
    res.status(401).json({ error: "approval process failed"});
  }
});

router.put("/driverDem", async (req, res) => {
  const { uid  } = req.body;
  try {
    const client = await clientPromise;
    const db = client.db("arqila");

    await db
      .collection("registration")
      .updateOne({ uid }, { $set: { status: "pending" } }, { upsert: true });
      
      res.status(200).json({ message: "status changed"})
  } catch (err) {
    console.error(err);
    res.status(401).json({ error: "approval process failed"});
  }
});

export default router;
