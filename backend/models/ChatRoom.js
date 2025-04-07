const mongoose = require("mongoose");

const ChatRoomSchema = new mongoose.Schema({
  alumni: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Alumni",
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  lastMessage: {
    type: String,
    default: ""
  },
  lastMessageTime: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

// Ensure each user can only have one active chat room with a specific alumni
ChatRoomSchema.index({ alumni: 1, user: 1 }, { unique: true });

module.exports = mongoose.model("ChatRoom", ChatRoomSchema);
