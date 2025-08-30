import mongoose from "mongoose";

const MONGO_URI = "mongodb+srv://pos:pos@pos.dbt37.mongodb.net/?retryWrites=true&w=majority&appName=POS";

export const connectDB = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log("✅ Connected to MongoDB successfully");
    } catch (err) {
        console.error("❌ Failed to connect to MongoDB", err);
        process.exit(1); // Stop server if DB fails
    }
};
