const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const feedbackRoutes = require("./routes/feedbackRoutes");
const predictRoutes = require("./routes/predictRoutes");
const interviewRoutes = require('./routes/interview');
const alumniRoutes = require('./routes/alumniRoutes');
const chatRoutes = require('./routes/chatRoutes');
const forumRoutes = require('./routes/forumRoutes');
const cors = require("cors");

dotenv.config();
connectDB();

const app = express();
app.use(express.json());
app.use(cors());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api", predictRoutes);
app.use('/api/interview', interviewRoutes);
app.use('/api/alumni', alumniRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/forum', forumRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
