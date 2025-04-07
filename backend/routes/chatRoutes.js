const express = require("express");
const router = express.Router();
const ChatRoom = require("../models/ChatRoom");
const Message = require("../models/Message");
const User = require("../models/User");
const Alumni = require("../models/Alumni");
const auth = require("../middleware/auth");
const mongoose = require("mongoose");

// Create a new chat room or get existing one
router.post("/room", auth, async (req, res) => {
  try {
    const { alumniId } = req.body;
    const userId = req.user.id;

    // Validate alumniId
    if (!mongoose.Types.ObjectId.isValid(alumniId)) {
      return res.status(400).json({ msg: "Invalid alumni ID" });
    }

    // Check if alumni exists
    const alumni = await Alumni.findById(alumniId);
    if (!alumni) {
      return res.status(404).json({ msg: "Alumni not found" });
    }

    // Check if alumni is available for chat
    if (!alumni.isAvailableForChat) {
      return res.status(400).json({ msg: "Alumni is not available for chat at the moment" });
    }

    // Check if chat room already exists
    let chatRoom = await ChatRoom.findOne({
      alumni: alumniId,
      user: userId,
    });

    if (chatRoom) {
      // If inactive, reactivate it
      if (!chatRoom.isActive) {
        chatRoom.isActive = true;
        await chatRoom.save();
      }
    } else {
      // Create a new chat room
      chatRoom = new ChatRoom({
        alumni: alumniId,
        user: userId,
      });
      await chatRoom.save();
    }

    res.json(chatRoom);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// Get all chat rooms for a user
router.get("/rooms", auth, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Check if user is alumni or regular user
    const alumni = await Alumni.findById(userId);
    
    let chatRooms;
    if (alumni) {
      // If alumni, get all chat rooms where they are the alumni
      chatRooms = await ChatRoom.find({ alumni: userId, isActive: true })
        .populate("user", "name email")
        .sort({ lastMessageTime: -1 });
    } else {
      // If regular user, get all chat rooms where they are the user
      chatRooms = await ChatRoom.find({ user: userId, isActive: true })
        .populate("alumni", "name email company position")
        .sort({ lastMessageTime: -1 });
    }
    
    res.json(chatRooms);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// Get messages for a specific chat room
router.get("/messages/:roomId", auth, async (req, res) => {
  try {
    const { roomId } = req.params;
    const userId = req.user.id;
    
    // Validate roomId
    if (!mongoose.Types.ObjectId.isValid(roomId)) {
      return res.status(400).json({ msg: "Invalid room ID" });
    }
    
    // Check if chat room exists and user has access
    const chatRoom = await ChatRoom.findById(roomId);
    if (!chatRoom) {
      return res.status(404).json({ msg: "Chat room not found" });
    }
    
    // Verify user has access to this chat room
    if (chatRoom.user.toString() !== userId && chatRoom.alumni.toString() !== userId) {
      return res.status(401).json({ msg: "Not authorized to access this chat room" });
    }
    
    // Get pagination parameters
    const page = parseInt(req.query.page) || 0;
    const limit = parseInt(req.query.limit) || 50;
    
    // Get messages for this chat room
    const messages = await Message.find({ chatRoom: roomId })
      .sort({ createdAt: -1 })
      .skip(page * limit)
      .limit(limit);
    
    // Mark messages as read if user is the recipient
    const userType = chatRoom.alumni.toString() === userId ? "alumni" : "user";
    await Message.updateMany(
      { 
        chatRoom: roomId, 
        senderType: userType === "alumni" ? "user" : "alumni",
        readStatus: false 
      },
      { readStatus: true }
    );
    
    res.json(messages.reverse()); // Reverse to get chronological order
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// Send a message
router.post("/message", auth, async (req, res) => {
  try {
    const { roomId, content, attachments } = req.body;
    const userId = req.user.id;
    
    // Validate roomId
    if (!mongoose.Types.ObjectId.isValid(roomId)) {
      return res.status(400).json({ msg: "Invalid room ID" });
    }
    
    // Check if content is provided
    if (!content && (!attachments || attachments.length === 0)) {
      return res.status(400).json({ msg: "Message content or attachments are required" });
    }
    
    // Check if chat room exists and user has access
    const chatRoom = await ChatRoom.findById(roomId);
    if (!chatRoom) {
      return res.status(404).json({ msg: "Chat room not found" });
    }
    
    // Determine if sender is user or alumni
    let senderType;
    if (chatRoom.user.toString() === userId) {
      senderType = "user";
    } else if (chatRoom.alumni.toString() === userId) {
      senderType = "alumni";
    } else {
      return res.status(401).json({ msg: "Not authorized to send messages in this chat room" });
    }
    
    // Create and save the message
    const message = new Message({
      chatRoom: roomId,
      sender: userId,
      senderType,
      content,
      attachments: attachments || []
    });
    
    await message.save();
    
    // Update the chat room's last message and time
    chatRoom.lastMessage = content;
    chatRoom.lastMessageTime = Date.now();
    await chatRoom.save();
    
    res.json(message);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// Close a chat room (mark as inactive)
router.put("/room/:roomId/close", auth, async (req, res) => {
  try {
    const { roomId } = req.params;
    const userId = req.user.id;
    
    // Validate roomId
    if (!mongoose.Types.ObjectId.isValid(roomId)) {
      return res.status(400).json({ msg: "Invalid room ID" });
    }
    
    // Check if chat room exists
    const chatRoom = await ChatRoom.findById(roomId);
    if (!chatRoom) {
      return res.status(404).json({ msg: "Chat room not found" });
    }
    
    // Verify user has access to close this chat room
    if (chatRoom.user.toString() !== userId && chatRoom.alumni.toString() !== userId) {
      return res.status(401).json({ msg: "Not authorized to close this chat room" });
    }
    
    // Mark chat room as inactive
    chatRoom.isActive = false;
    await chatRoom.save();
    
    res.json({ msg: "Chat room closed successfully" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// Get unread message count
router.get("/unread", auth, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Check if user is alumni or regular user
    const alumni = await Alumni.findById(userId);
    const userType = alumni ? "alumni" : "user";
    
    // Find all active chat rooms for this user
    let chatRooms;
    if (userType === "alumni") {
      chatRooms = await ChatRoom.find({ alumni: userId, isActive: true });
    } else {
      chatRooms = await ChatRoom.find({ user: userId, isActive: true });
    }
    
    // Get room IDs
    const roomIds = chatRooms.map(room => room._id);
    
    // Count unread messages for each room
    const unreadCounts = await Promise.all(
      roomIds.map(async (roomId) => {
        const count = await Message.countDocuments({
          chatRoom: roomId,
          senderType: userType === "alumni" ? "user" : "alumni",
          readStatus: false
        });
        
        return {
          roomId,
          count
        };
      })
    );
    
    // Calculate total unread count
    const totalUnread = unreadCounts.reduce((total, item) => total + item.count, 0);
    
    res.json({
      totalUnread,
      roomCounts: unreadCounts
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
