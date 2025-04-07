const mongoose = require("mongoose");

const ReplySchema = new mongoose.Schema({
  content: { type: String, required: true },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  username: { type: String, required: true },
  avatar: { type: String },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const ForumMessageSchema = new mongoose.Schema({
  content: { type: String, required: true },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  username: { type: String, required: true },
  avatar: { type: String },
  replies: [ReplySchema],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("ForumMessage", ForumMessageSchema);
