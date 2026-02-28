import mongoose from "mongoose";

const walletSchema = new mongoose.Schema(
  {
    shareholder_id: { type: mongoose.Schema.Types.ObjectId, ref: "Shareholder", required: true },
    payment_id: { type: mongoose.Schema.Types.ObjectId, ref: "Payment", required: true },
    amount: { type: Number, required: true, default: 0 },
    created_by: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

walletSchema.index({ shareholder_id: 1, payment_id: 1 }, { unique: true });

export default mongoose.model("Wallet", walletSchema);
