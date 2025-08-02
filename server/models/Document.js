import mongoose from "mongoose";

const DocumentSchema = new mongoose.Schema(
  {
    title: { type: String, default: "Untitled Document" },
    content: { type: mongoose.Schema.Types.Mixed, default: {} },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    collaborators: [
      {
        _id: { type: mongoose.Schema.Types.ObjectId, required: true },
        username: { type: String, required: true }
      }
    ],

    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
  },
  {
    timestamps: false 
  }
);

DocumentSchema.pre("save", function (next) {
  if (this.isModified("content")) {
    this.updatedAt = Date.now();
  }
  next();
});

const Document = mongoose.model("Document", DocumentSchema);
export default Document;
