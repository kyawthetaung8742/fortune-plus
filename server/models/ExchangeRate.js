import mongoose from "mongoose";

const exchangeRateSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["baht_to_kyat", "kyat_to_baht"],
      required: true,
      unique: true,
    },
    rate: { type: Number, required: true, min: 0 },
  },
  { timestamps: true }
);

export default mongoose.model("ExchangeRate", exchangeRateSchema);
