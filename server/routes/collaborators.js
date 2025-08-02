// import express from "express";
// import User from "../models/User.js";
// import Document from "../models/Document.js";
// import { jwtAuth } from "../middleware/auth.js";

// const router = express.Router();

// // Add collaborator to a document
// router.post("/:docId/collaborators", jwtAuth, async (req, res) => {
//   const { username } = req.body;
//   const { docId } = req.params;

//   try {
//     const userToAdd = await User.findOne({ username });
//     if (!userToAdd) return res.status(404).json({ error: "User not found" });

//     const doc = await Document.findById(docId);
//     if (!doc) return res.status(404).json({ error: "Document not found" });

//     if (!doc.owner.equals(req.user._id)) {
//       return res.status(403).json({ error: "Only the owner can modify collaborators" });
//     }

//     // Check if already a collaborator
//     const alreadyExists = doc.collaborators.some(c =>
//       c._id.equals(userToAdd._id)
//     );

//     if (alreadyExists) {
//       return res.status(400).json({ error: "User already a collaborator" });
//     }

//     doc.collaborators.push({
//       _id: userToAdd._id,
//       username: userToAdd.username
//     });

//     await doc.save();
//     res.json({ message: "Collaborator added", collaborators: doc.collaborators });

//   } catch (err) {
//     res.status(500).json({ error: "Server error" });
//   }
// });

// // Remove collaborator from a document
// router.delete("/:docId/collaborators", jwtAuth, async (req, res) => {
//   const { username } = req.body;
//   const { docId } = req.params;

//   try {
//     const userToRemove = await User.findOne({ username });
//     if (!userToRemove) return res.status(404).json({ error: "User not found" });

//     const doc = await Document.findById(docId);
//     if (!doc) return res.status(404).json({ error: "Document not found" });

//     if (!doc.owner.equals(req.user._id)) {
//       return res.status(403).json({ error: "Only the owner can modify collaborators" });
//     }

//     doc.collaborators = doc.collaborators.filter(
//       c => !c._id.equals(userToRemove._id)
//     );

//     await doc.save();
//     res.json({ message: "Collaborator removed", collaborators: doc.collaborators });

//   } catch (err) {
//     res.status(500).json({ error: "Server error" });
//   }
// });

// export default router;
