import mongoose from "mongoose";
import dotenv from "dotenv";
import ExchangeRate from "../models/ExchangeRate.js";

dotenv.config();

const rates = [
  { type: "baht_to_kyat", rate: 126 },
  { type: "kyat_to_baht", rate: 128 },
];

async function seedExchangeRates() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    for (const r of rates) {
      await ExchangeRate.findOneAndUpdate(
        { type: r.type },
        { $set: { rate: r.rate } },
        { upsert: true, new: true }
      );
    }

    console.log("Seeded 2 exchange rates successfully");
  } catch (err) {
    console.error("Seed failed:", err.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
    process.exit(0);
  }
}

seedExchangeRates();
