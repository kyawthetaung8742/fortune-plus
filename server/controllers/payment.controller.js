import Joi from "joi";
import Payment from "../models/Payment.js";
import { deleteFromS3 } from "../utils/s3Delete.js";

const createSchema = Joi.object({
  name: Joi.string().required(),
  currency_type: Joi.string().valid("kyat", "baht").required(),
  logo_url: Joi.string().allow("", null),
  clear_logo: Joi.string().allow("", "true"),
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
    const body = { ...req.body };
    const { error } = createSchema.validate(body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const payload = {
      name: body.name,
      currency_type: body.currency_type,
      created_by: req.user._id,
    };
    if (req.file?.location) payload.logo_url = req.file.location;
    else if (body.logo_url) payload.logo_url = body.logo_url;

    const created = await Payment.create(payload);
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
    const body = { ...req.body };
    const { error } = updateSchema.validate(body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const existing = await Payment.findById(req.params.id).lean();
    if (!existing)
      return res.status(404).json({ success: false, message: "Payment not found" });

    const payload = {
      name: body.name,
      currency_type: body.currency_type,
    };

    if (req.file?.location) {
      if (existing.logo_url) await deleteFromS3(existing.logo_url);
      payload.logo_url = req.file.location;
    } else if (Object.prototype.hasOwnProperty.call(body, "clear_logo") && body.clear_logo === "true") {
      if (existing.logo_url) await deleteFromS3(existing.logo_url);
      payload.logo_url = null;
    } else if (Object.prototype.hasOwnProperty.call(body, "logo_url")) {
      payload.logo_url = body.logo_url || undefined;
    }

    const updated = await Payment.findByIdAndUpdate(req.params.id, payload, {
      new: true,
    }).lean();
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
