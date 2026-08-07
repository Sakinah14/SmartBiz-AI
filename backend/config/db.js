const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB Connected Successfully");
  } catch (error) {
    console.error("❌ MongoDB Connection Failed:", error.message);
    console.error("👉 FIX: If using MongoDB Atlas, go to Atlas -> Network Access -> Add IP Address -> 'Allow Access From Anywhere' (0.0.0.0/0).");
    process.exit(1);
  }
};

module.exports = connectDB;