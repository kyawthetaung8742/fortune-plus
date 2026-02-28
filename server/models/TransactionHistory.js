import mongoose from "mongoose";

const transactionHistorySchema = new mongoose.Schema(
  {
    shareholder_id: { type: mongoose.Schema.Types.ObjectId, ref: "Shareholder", required: true },
    payment_id: { type: mongoose.Schema.Types.ObjectId, ref: "Payment", required: true },
    transaction_number: { type: String, required: true },
    date: { type: Date, required: true, default: Date.now },
    before_amount: { type: Number, required: true, default: 0 },
    amount: { type: Number, required: true },
    after_amount: { type: Number, required: true },
    transaction_type: {
      type: String,
      enum: ["deposit", "withdraw", "transfer", "receive", "buy", "exchange_out", "exchange_in", "expense", "expense_reversal", "product_sale"],
      required: true,
    },
    note: { type: String },
    created_by: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export default mongoose.model("TransactionHistory", transactionHistorySchema);
