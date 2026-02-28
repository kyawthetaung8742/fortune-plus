import mongoose from "mongoose";

const saleListSchema = new mongoose.Schema(
  {
    date: { type: Date, required: true, default: Date.now },
    product_id: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    customer_id: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", required: true },
    currency_type: { type: String, enum: ["kyat", "baht"], required: true },
    rate: { type: Number },
    quantity: { type: Number, required: true, min: 1 },
    original_price: { type: Number, required: true },
    sale_price: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    note: { type: String },
    created_by: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export default mongoose.model("SaleList", saleListSchema);
