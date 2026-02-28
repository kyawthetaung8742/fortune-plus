import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import User from "../models/User.js";

dotenv.config();

const users = [
  { name: "Kyaw Thet Aung", username: "kyawthetaung", password: "password123" },
  { name: "Aung Aung", username: "aungaung", password: "password123" },
  { name: "Cho Cho", username: "chocho", password: "password123" },
];

async function seedUsers() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    const hashed = await Promise.all(
      users.map(async (u) => ({
        name: u.name,
        username: u.username,
        password: await bcrypt.hash(u.password, 12),
      }))
    );

    await User.deleteMany({});
    await User.insertMany(hashed);

    console.log("Seeded 3 users successfully");
  } catch (err) {
    console.error("Seed failed:", err.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
    process.exit(0);
  }
}

seedUsers();
