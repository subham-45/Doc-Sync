import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  fullName: { type: String },
  username: { type: String, unique: true },
  email: { type: String, unique: true, required: true },
  password: { type: String },
  googleId: { type: String },
});

export default mongoose.model("User", userSchema);
