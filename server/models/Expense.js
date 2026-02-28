import mongoose from "mongoose";

const expenseSchema = new mongoose.Schema(
  {
    shareholder_id: { type: mongoose.Schema.Types.ObjectId, ref: "Shareholder", required: true },
    payment_id: { type: mongoose.Schema.Types.ObjectId, ref: "Payment", required: true },
    date: { type: Date, required: true, default: Date.now },
    amount: { type: Number, required: true, min: 0.01 },
    note: { type: String },
    created_by: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export default mongoose.model("Expense", expenseSchema);
