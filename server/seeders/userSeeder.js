import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import User from "../models/User.js";

dotenv.config();

const users = [
  { name: "Alice Johnson", username: "alice", password: "password123" },
  { name: "Bob Smith", username: "bob", password: "password123" },
  { name: "Carol Williams", username: "carol", password: "password123" },
  { name: "David Brown", username: "david", password: "password123" },
  { name: "Eve Davis", username: "eve", password: "password123" },
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

    console.log("Seeded 5 users successfully");
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
