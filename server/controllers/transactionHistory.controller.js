import TransactionHistory from "../models/TransactionHistory.js";
import mongoose from "mongoose";

export const list = async (req, res) => {
  try {
    const { shareholder_id, payment_id, transaction_type, transaction_number, from, to } = req.query;
    const filter = {};

    if (shareholder_id) filter.shareholder_id = new mongoose.Types.ObjectId(shareholder_id);
    if (payment_id) filter.payment_id = new mongoose.Types.ObjectId(payment_id);
    if (transaction_type) filter.transaction_type = transaction_type;
    if (transaction_number) filter.transaction_number = { $regex: transaction_number, $options: "i" };
    if (from || to) {
      filter.date = {};
      if (from) filter.date.$gte = new Date(from);
      if (to) filter.date.$lte = new Date(to);
    }

    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      TransactionHistory.find(filter)
        .populate("shareholder_id", "name phone email")
        .populate("payment_id", "name currency_type")
        .sort({ date: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      TransactionHistory.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;
    res.json({ success: true, data, total, page, limit, totalPages });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
