const express = require("express");
const router = express.Router();
const ChatRoom = require("../models/ChatRoom");
const ChatMessage = require("../models/ChatMessage");
const User = require("../models/User");
const Alumni = require("../models/Alumni");
const auth = require("../middleware/auth");
const mongoose = require("mongoose");

// Create a new chat room or get existing one
router.post("/rooms", auth, async (req, res) => {
  try {
    console.log("Chat room creation request received");
    console.log("Request body:", req.body);
    console.log("User from auth:", req.user);
    
    const { alumniId, alumniName, alumniCompany, alumniPosition } = req.body;
    const userId = req.user.id;

    console.log("Creating chat room:", { alumniId, alumniName, userId });

    // Validate alumniId
    if (!alumniId) {
      console.log("Error: Alumni ID is required");
      return res.status(400).json({ msg: "Alumni ID is required" });
    }

    // Find the alumni by ID - handle both MongoDB ObjectId and numeric ID
    let alumni;
    
    if (mongoose.Types.ObjectId.isValid(alumniId)) {
      // If it's a valid MongoDB ObjectId, search by _id
      alumni = await Alumni.findById(alumniId);
      console.log("Found alumni by ObjectId:", alumni);
    } else {
      // If it's not a valid ObjectId (likely a numeric ID from frontend)
      // Try to find alumni with a numeric ID field if it exists
      console.log("Searching for alumni with numeric ID:", alumniId);
      alumni = await Alumni.findOne({ numericId: parseInt(alumniId) });
      console.log("Found alumni by numericId:", alumni);
      
      // If not found, search all alumni and try to match by other fields
      if (!alumni) {
        console.log("Alumni not found with numeric ID, searching all alumni");
        const allAlumni = await Alumni.find({});
        console.log("Total alumni found:", allAlumni.length);
        
        // Try to find alumni with matching name if provided
        if (alumniName) {
          alumni = allAlumni.find(a => a.name === alumniName);
          if (alumni) {
            console.log("Found alumni by name:", alumni);
            // Update the alumni with the numericId for future lookups
            alumni.numericId = parseInt(alumniId);
            await alumni.save();
          }
        }
        
        // If still not found, check if we have any alumni at all
        if (!alumni && allAlumni.length > 0) {
          // Use the first alumni as fallback
          alumni = allAlumni[0];
          console.log("Using first alumni as fallback:", alumni);
          
          // Update the alumni with the requested numericId for future lookups
          alumni.numericId = parseInt(alumniId);
          await alumni.save();
          console.log("Updated alumni with numericId:", alumni);
        }
        // If no alumni at all, we'll create one later
      }
    }
    
    // If no alumni found, create a mock one for testing purposes
    if (!alumni) {
      console.log("No alumni found, creating a mock one for chat testing");
      
      // Create a simple hash for the password (in production, use bcrypt)
      const mockPassword = "password123";
      
      try {
        const newAlumni = new Alumni({
          name: alumniName || "Mock Alumni",
          email: alumniName ? 
            `${alumniName.replace(/\s+/g, '.').toLowerCase()}@example.com` : 
            "mock@example.com",
          password: mockPassword, // In production, this should be hashed with bcrypt
          company: alumniCompany || "Example Company",
          position: alumniPosition || "Example Position",
          numericId: parseInt(alumniId),
          isAvailableForChat: true,
          graduationYear: 2020
        });
        
        alumni = await newAlumni.save();
        console.log("Created mock alumni for testing:", alumni);
      } catch (err) {
        console.error("Error creating mock alumni:", err);
        return res.status(500).json({ msg: "Error creating mock alumni" });
      }
    }
    
    if (!alumni) {
      console.log("Error: Could not find or create alumni");
      return res.status(500).json({ msg: "Could not find or create alumni" });
    }
    
    console.log("Alumni found or created:", alumni);

    // Check if chat room already exists
    let chatRoom = await ChatRoom.findOne({
      alumni: alumni._id,
      user: userId,
    });

    if (chatRoom) {
      console.log("Existing chat room found:", chatRoom._id);
      // If inactive, reactivate it
      if (!chatRoom.isActive) {
        chatRoom.isActive = true;
        await chatRoom.save();
        console.log("Chat room reactivated");
      }
      
      // Populate the alumni and user information
      await chatRoom.populate("alumni", "name email company position numericId");
      await chatRoom.populate("user", "name email");
    } else {
      console.log("Creating new chat room for alumni:", alumni._id, "and user:", userId);
      // Create a new chat room
      chatRoom = new ChatRoom({
        alumni: alumni._id,
        user: userId,
      });
      await chatRoom.save();
      console.log("New chat room created with ID:", chatRoom._id);
      
      // Populate the alumni and user information
      await chatRoom.populate("alumni", "name email company position numericId");
      await chatRoom.populate("user", "name email");
    }

    console.log("Chat room created/found:", chatRoom);
    res.json(chatRoom);
  } catch (err) {
    console.error("Error creating chat room:", err);
    res.status(500).json({ msg: "Server Error", error: err.message });
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
    const messages = await ChatMessage.find({ chatRoom: roomId })
      .sort({ createdAt: -1 })
      .skip(page * limit)
      .limit(limit);
    
    // Mark messages as read if user is the recipient
    const userType = chatRoom.alumni.toString() === userId ? "alumni" : "user";
    await ChatMessage.updateMany(
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

// Mark messages as read
router.put("/messages/read/:roomId", auth, async (req, res) => {
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
    
    // Determine user type
    const userType = chatRoom.alumni.toString() === userId ? "alumni" : "user";
    
    // Mark messages as read
    await ChatMessage.updateMany(
      { 
        chatRoom: roomId, 
        senderType: userType === "alumni" ? "user" : "alumni",
        readStatus: false 
      },
      { readStatus: true }
    );
    
    res.json({ msg: "Messages marked as read" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// Send a message
router.post("/messages", auth, async (req, res) => {
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
    const message = new ChatMessage({
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
router.put("/rooms/:roomId/close", auth, async (req, res) => {
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
        const count = await ChatMessage.countDocuments({
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
