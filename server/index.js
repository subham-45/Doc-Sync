import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import passport from "passport";
import session from "express-session";
import { Server } from "socket.io";
import http from "http";

import "./passport.js";
import authRoutes from "./routes/auth.js";
import documentRoutes from "./routes/document.js";
import userRoutes from "./routes/user.js";
import Document from "./models/Document.js";

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL,
    credentials: true,
  },
});

app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json());
app.use(
  session({
    secret: "doc_secret",
    resave: false,
    saveUninitialized: true,
  })
);
app.use(passport.initialize());
app.use(passport.session());

app.use("/api/auth", authRoutes);
app.use("/api/docs", documentRoutes);
app.use("/api/user", userRoutes);

const documentUsers = {};
const socketToUser = {};

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on("joinDoc", ({ docId, username }) => {
    socket.join(docId);
    socketToUser[socket.id] = { username, docId };

    if (!documentUsers[docId]) documentUsers[docId] = new Set();
    documentUsers[docId].add(username);

    io.to(docId).emit("user-presence", Array.from(documentUsers[docId]));
  });

  socket.on("sendChanges", ({ docId, delta }) => {
    socket.to(docId).emit("receiveChanges", delta);
  });

  socket.on("get-document", async (docId) => {
    try {
      const doc = await Document.findById(docId);
      if (doc) socket.emit("load-document", doc.content || {});
    } catch (err) {
      console.error("Error loading document:", err.message);
    }
  });

  socket.on("save-document", async ({ docId, data }) => {
    try {
      await Document.findByIdAndUpdate(docId, {
        content: data,
        updatedAt: Date.now(),
      });
    } catch (err) {
      console.error("Error saving document:", err.message);
    }
  });

  socket.on("user-editing", ({ docId, username }) => {
    socket.to(docId).emit("user-editing", { username });
  });
  

  socket.on("disconnect", () => {
    const userInfo = socketToUser[socket.id];
    if (userInfo) {
      const { username, docId } = userInfo;
      if (documentUsers[docId]) {
        documentUsers[docId].delete(username);
        io.to(docId).emit("user-presence", Array.from(documentUsers[docId]));
      }
      delete socketToUser[socket.id];
    }
    console.log(`User disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 5000;
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Socket.IO connected`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });
