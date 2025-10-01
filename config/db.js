import mongoose from "mongoose";

export const connectDB = async (uri) => {
    try {
        await mongoose.connect(uri, {
            // options are fine as defaults in mongoose v7
        });
        console.log("MongoDB connected");
    } catch (err) {
        console.error("MongoDB connection error:", err);
        process.exit(1);
    }
};
