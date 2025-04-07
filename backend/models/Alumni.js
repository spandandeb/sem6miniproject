const mongoose = require("mongoose");

const AlumniSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  graduationYear: { type: Number },
  company: { type: String },
  position: { type: String },
  bio: { type: String },
  profilePicture: { type: String },
  isAvailableForChat: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model("Alumni", AlumniSchema);
