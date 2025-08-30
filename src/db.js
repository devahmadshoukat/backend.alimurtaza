const mongoose = require("mongoose");

const MONGO_URI = "mongodb+srv://pos:pos@pos.dbt37.mongodb.net/?retryWrites=true&w=majority&appName=POS";

let isConnected = false;

const connectDB = async () => {
    if (isConnected) {
        console.log("✅ Using existing database connection");
        return;
    }

    try {
        await mongoose.connect(MONGO_URI, {
            bufferCommands: false,
        });
        isConnected = true;
        console.log("✅ Connected to MongoDB successfully");
    } catch (err) {
        console.error("❌ Failed to connect to MongoDB", err);
        throw err;
    }
};

module.exports = { connectDB };
