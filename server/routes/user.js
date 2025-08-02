import express from "express";
import User from "../models/User.js";
import Document from "../models/Document.js";
import { jwtAuth } from "../middleware/auth.js";

const router = express.Router();

// Route 1: Get user profile (public view for others, full for self)
router.get("/:username", jwtAuth, async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username }).select("-password -__v");
    if (!user) return res.status(404).json({ error: "User not found" });

    const response = {
      username: user.username,
      fullName: user.fullName,
    };

    if (user._id.toString() === req.user._id.toString()) {
      response.email = user.email;
      response.isPrivate = false;
    } else {
      response.isPrivate = true;
    }

    res.json(response);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// Route 2: Get documents owned by the user (public)
router.get("/:username/owned-docs", async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username }).select("_id");
    if (!user) return res.status(404).json({ error: "User not found" });

    const docs = await Document.find({ owner: user._id }).select("title collaborators");

    res.json({ ownedDocs: docs });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// Route 3: Get documents shared to the user (public)
router.get("/:username/shared-docs", async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username }).select("_id");
    if (!user) return res.status(404).json({ error: "User not found" });

    const docs = await Document.find({
      collaborators: {
        $elemMatch: { _id: user._id }
      },
      owner: { $ne: user._id }
    })
      .select("title owner") // _id is included by default
      .populate("owner", "username");

    const formattedDocs = docs.map(doc => ({
      docId: doc._id,
      title: doc.title,
      owner: doc.owner.username
    }));

    res.json({ sharedDocs: formattedDocs });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
