import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    category_id: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
    name: { type: String, required: true },
    quantity: { type: Number, required: true, default: 0, min: 0 },
    image: { type: String },
    purchase_price: { type: Number, required: true, min: 0 },
    sale_price: { type: Number, required: true, min: 0 },
    note: { type: String },
    created_by: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export default mongoose.model("Product", productSchema);
