import TransactionHistory from "../models/TransactionHistory.js";
import mongoose from "mongoose";

export const list = async (req, res) => {
  try {
    const { shareholder_id, payment_id, transaction_type, transaction_number, from, to } = req.query;
    const filter = {};

    if (shareholder_id) filter.shareholder_id = new mongoose.Types.ObjectId(shareholder_id);
    if (payment_id) filter.payment_id = new mongoose.Types.ObjectId(payment_id);
    if (transaction_type) {
      const types = String(transaction_type).split(",").map((t) => t.trim()).filter(Boolean);
      filter.transaction_type = types.length > 1 ? { $in: types } : types[0];
    }
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
        .populate("created_by", "name")
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

export const exchangeReport = async (req, res) => {
  try {
    const { from, to, shareholder_id, page: pageQuery, limit: limitQuery } = req.query;
    const filter = { transaction_type: { $in: ["exchange_out", "exchange_in"] } };
    if (shareholder_id) filter.shareholder_id = new mongoose.Types.ObjectId(shareholder_id);
    if (from || to) {
      filter.date = {};
      if (from) filter.date.$gte = new Date(from);
      if (to) filter.date.$lte = new Date(to);
    }

    const page = Math.max(1, parseInt(pageQuery, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(limitQuery, 10) || 20));
    const skip = (page - 1) * limit;

    const [data, total, summaryAgg] = await Promise.all([
      TransactionHistory.find(filter)
        .populate("shareholder_id", "name phone email")
        .populate("payment_id", "name currency_type")
        .populate("created_by", "name")
        .sort({ date: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      TransactionHistory.countDocuments(filter),
      TransactionHistory.aggregate([
        { $match: filter },
        {
          $lookup: {
            from: "payments",
            localField: "payment_id",
            foreignField: "_id",
            as: "payment",
          },
        },
        { $unwind: { path: "$payment", preserveNullAndEmptyArrays: true } },
        {
          $group: {
            _id: { type: "$transaction_type", currency: { $toLower: "$payment.currency_type" } },
            totalAmount: { $sum: { $abs: "$amount" } },
          },
        },
      ]),
    ]);

    const summary = { exchange_out: {}, exchange_in: {} };
    for (const row of summaryAgg) {
      const currency = row._id.currency || "other";
      if (row._id.type === "exchange_out") summary.exchange_out[currency] = row.totalAmount;
      else if (row._id.type === "exchange_in") summary.exchange_in[currency] = row.totalAmount;
    }

    const totalPages = Math.ceil(total / limit) || 1;
    res.json({
      success: true,
      data,
      total,
      page,
      limit,
      totalPages,
      summary,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
