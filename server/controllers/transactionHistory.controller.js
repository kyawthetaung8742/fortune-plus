import TransactionHistory from "../models/TransactionHistory.js";
import mongoose from "mongoose";

export const list = async (req, res) => {
  try {
    const { shareholder_id, payment_id, transaction_type } = req.query;
    const filter = {};

    if (shareholder_id) filter.shareholder_id = new mongoose.Types.ObjectId(shareholder_id);
    if (payment_id) filter.payment_id = new mongoose.Types.ObjectId(payment_id);
    if (transaction_type) filter.transaction_type = transaction_type;

    const transactions = await TransactionHistory.find(filter)
      .populate("shareholder_id", "name phone email")
      .populate("payment_id", "name currency_type")
      .sort({ createdAt: -1 })
      .lean();

    res.json({ success: true, data: transactions });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
