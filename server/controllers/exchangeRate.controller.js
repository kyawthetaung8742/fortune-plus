import Joi from "joi";
import ExchangeRate from "../models/ExchangeRate.js";

const updateSchema = Joi.object({
  rate: Joi.number().min(0).required(),
});

export const list = async (req, res) => {
  try {
    const rates = await ExchangeRate.find().sort({ type: 1 }).lean();
    res.json({ success: true, data: rates });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const update = async (req, res) => {
  try {
    const { error } = updateSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const updated = await ExchangeRate.findByIdAndUpdate(
      req.params.id,
      { rate: req.body.rate },
      { new: true }
    ).lean();
    if (!updated)
      return res.status(404).json({ success: false, message: "Exchange rate not found" });
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
