import express from "express";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import {generateToken} from "../utils/jwtAuth.js"
import passport from "passport";

const router = express.Router();

router.post("/register", async (req, res) => {
  try {
    const { fullName, email, username, password } = req.body;
    const hash = await bcrypt.hash(password, 10);
    const existingUser = await User.findOne({ email });
    if(existingUser) throw Error("Email Already Exists, Try Logging In");
    const user = await User.create({ fullName, email, username, password: hash });
    const token = generateToken(user);
    res.json({ token, username });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(404).json({ error: "User Not Found" });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const token = generateToken(user);
  res.json({ token, username: user.username });
});

router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

router.get("/google/callback", passport.authenticate("google", {
  session: false,
  failureRedirect: "/login",
}), (req, res) => {
  const token = generateToken(req.user);
  res.redirect(`${process.env.CLIENT_URL}/google-auth?token=${token}&username=${req.user.username}`);
});

export default router;
