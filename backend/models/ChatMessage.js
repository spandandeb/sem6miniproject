const mongoose = require("mongoose");

const ChatMessageSchema = new mongoose.Schema({
  chatRoom: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ChatRoom",
    required: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  senderType: {
    type: String,
    enum: ["user", "alumni"],
    required: true
  },
  content: {
    type: String,
    required: true
  },
  readStatus: {
    type: Boolean,
    default: false
  },
  attachments: [{
    type: String
  }]
}, { timestamps: true });

// Index for efficient querying of messages by chat room
ChatMessageSchema.index({ chatRoom: 1, createdAt: -1 });

module.exports = mongoose.model("ChatMessage", ChatMessageSchema);
