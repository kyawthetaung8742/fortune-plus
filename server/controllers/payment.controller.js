import Joi from "joi";
import Payment from "../models/Payment.js";

const createSchema = Joi.object({
  name: Joi.string().required(),
  currency_type: Joi.string().valid("kyat", "baht").required(),
});

const updateSchema = createSchema;

export const list = async (req, res) => {
  try {
    const payments = await Payment.find().sort({ createdAt: -1 }).lean();
    res.json({ success: true, data: payments });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const create = async (req, res) => {
  try {
    const { error } = createSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const created = await Payment.create({
      ...req.body,
      created_by: req.user._id,
    });
    res.status(201).json({ success: true, data: created });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getById = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id).lean();
    if (!payment)
      return res.status(404).json({ success: false, message: "Payment not found" });
    res.json({ success: true, data: payment });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const update = async (req, res) => {
  try {
    const { error } = updateSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const updated = await Payment.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    }).lean();
    if (!updated)
      return res.status(404).json({ success: false, message: "Payment not found" });
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
