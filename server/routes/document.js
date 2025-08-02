import express from "express";
import Document from "../models/Document.js";
import User from "../models/User.js";
import { jwtAuth } from "../middleware/auth.js";

const router = express.Router();

// Create new document
router.post("/", jwtAuth, async (req, res) => {
  try {
    const doc = new Document({
      title: req.body.title || "Untitled Document",
      content: "",
      owner: req.user._id
    });
    await doc.save();
    res.status(201).json(doc);
  } catch (err) {
    res.status(500).json({ error: "Failed to create document" });
  }
});

router.get("/:docId", jwtAuth, async (req, res) => {
  try {
    const doc = await Document.findById(req.params.docId)
      .populate("owner", "name email");
    
    if (!doc) {
      return res.status(404).json({ error: "Document not found" });
    }

    // Check if the requesting user is the owner or a collaborator
    const isOwner = doc.owner._id.equals(req.user._id);
    const isCollaborator = doc.collaborators.some(
      collaborator => collaborator._id.equals(req.user._id)
    );

    if (!isOwner && !isCollaborator) {
      return res.status(403).json({ error: "Unauthorized access" });
    }

    res.json(doc);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// Update document content (any logged-in user with the link)
router.put("/:docId", jwtAuth, async (req, res) => {
  try {
    const doc = await Document.findByIdAndUpdate(
      req.params.docId,
      { content: req.body.content, updatedAt: Date.now() },
      { new: true }
    );
    if (!doc) return res.status(404).json({ error: "Document not found" });
    res.json(doc);
  } catch (err) {
    res.status(500).json({ error: "Failed to update document" });
  }
});

// Add collaborator to a document
router.post("/:docId/collab", jwtAuth, async (req, res) => {
  const  username  = req.body.username;
  const { docId } = req.params;

  try {
    const userToAdd = await User.findOne({ username });
    if (!userToAdd) return res.status(404).json({ error: "User not found" });

    const doc = await Document.findById(docId);
    if (!doc) return res.status(404).json({ error: "Document not found" });

    if (!doc.owner.equals(req.user._id)) {
      return res.status(403).json({ error: "Only the owner can modify collaborators" });
    }

    // Check if already a collaborator
    const alreadyExists = doc.collaborators.some(c =>
      c._id.equals(userToAdd._id)
    );

    if (alreadyExists) {
      return res.status(400).json({ error: "User already a collaborator" });
    }

    doc.collaborators.push({
      _id: userToAdd._id,
      username: userToAdd.username
    });

    await doc.save();
    res.json({ message: "Collaborator added", collaborators: doc.collaborators });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Remove collaborator from a document
router.delete("/:docId/collab", jwtAuth, async (req, res) => {
  const { username } = req.body;
  const { docId } = req.params;

  try {
    const userToRemove = await User.findOne({ username });
    if (!userToRemove) return res.status(404).json({ error: "User not found" });

    const doc = await Document.findById(docId);
    if (!doc) return res.status(404).json({ error: "Document not found" });

    if (!doc.owner.equals(req.user._id)) {
      return res.status(403).json({ error: "Only the owner can modify collaborators" });
    }

    doc.collaborators = doc.collaborators.filter(
      c => !c._id.equals(userToRemove._id)
    );

    await doc.save();
    res.json({ message: "Collaborator removed", collaborators: doc.collaborators });

  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
