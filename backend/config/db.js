const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      console.error("FATAL ERROR: MONGO_URI is not defined in environment variables");
      console.log("Using fallback connection string for development only");
      // Use a fallback connection string for development only
      process.env.MONGO_URI = "mongodb://localhost:27017/alumni_connect_dev";
    }

    console.log("Connecting to MongoDB...");
    console.log("MongoDB URI prefix:", process.env.MONGO_URI.substring(0, 20) + "...");
    
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // Timeout after 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
    };
    
    await mongoose.connect(process.env.MONGO_URI, options);
    
    console.log("MongoDB Connected");
    console.log("Connection state:", mongoose.connection.readyState);
    console.log("Database name:", mongoose.connection.db.databaseName);
    
    // Set up connection error handlers
    mongoose.connection.on("error", (err) => {
      console.error("MongoDB connection error:", err);
    });
    
    mongoose.connection.on("disconnected", () => {
      console.log("MongoDB disconnected");
    });
    
    // Handle application termination
    process.on("SIGINT", async () => {
      await mongoose.connection.close();
      console.log("MongoDB connection closed due to app termination");
      process.exit(0);
    });
    
  } catch (error) {
    console.error("MongoDB connection error:", error.message);
    
    // More detailed error info for common MongoDB errors
    if (error.name === "MongoNetworkError") {
      console.error("Network error - check if MongoDB server is running");
    } else if (error.name === "MongoServerSelectionError") {
      console.error("Server selection error - check MongoDB URI and network connectivity");
    } else if (error.code === 18) {
      console.error("Authentication error - check username and password in MongoDB URI");
    } else if (error.codeName === "HostNotFound") {
      console.error("Host not found - check the hostname in MongoDB URI");
    }
    
    // Don't exit process, allow the application to continue with fallbacks
    console.log("Continuing execution without MongoDB connection...");
  }
};

module.exports = connectDB;
