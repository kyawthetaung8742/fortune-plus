import ExchangeTransaction from "../models/ExchangeTransaction.js";
import mongoose from "mongoose";

const summarySchema = Joi.object({
  from: Joi.date().iso(),
  to: Joi.date().iso(),
  created_by: Joi.string(), // admin only
});

// Use Joi only if we have it; otherwise inline validation
let Joi;
try {
  Joi = (await import("joi")).default;
} catch {
  Joi = null;
}

export const getSummary = async (req, res) => {
  try {
    const { from, to, created_by } = req.query;
    const filter = { status: "completed" };

    const fromDate = from ? new Date(from) : new Date();
    fromDate.setHours(0, 0, 0, 0);
    const toDate = to ? new Date(to) : new Date();
    toDate.setHours(23, 59, 59, 999);
    filter.occurred_at = { $gte: fromDate, $lte: toDate };

    if (req.user.role === "staff") {
      filter.created_by = req.user._id;
    } else if (created_by) {
      filter.created_by = new mongoose.Types.ObjectId(created_by);
    }

    const [count, thbToMmk, mmkToThb] = await Promise.all([
      ExchangeTransaction.countDocuments(filter),
      ExchangeTransaction.aggregate([
        { $match: { ...filter, direction: "THB_TO_MMK" } },
        { $group: { _id: null, count: { $sum: 1 }, source_total: { $sum: "$source_amount" }, target_total: { $sum: "$target_amount" } } },
      ]),
      ExchangeTransaction.aggregate([
        { $match: { ...filter, direction: "MMK_TO_THB" } },
        { $group: { _id: null, count: { $sum: 1 }, source_total: { $sum: "$source_amount" }, target_total: { $sum: "$target_amount" } } },
      ]),
    ]);

    res.json({
      total_count: count,
      thb_to_mmk: thbToMmk[0] ? { count: thbToMmk[0].count, source_total: thbToMmk[0].source_total, target_total: thbToMmk[0].target_total } : { count: 0, source_total: 0, target_total: 0 },
      mmk_to_thb: mmkToThb[0] ? { count: mmkToThb[0].count, source_total: mmkToThb[0].source_total, target_total: mmkToThb[0].target_total } : { count: 0, source_total: 0, target_total: 0 },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
