import Joi from "joi";
import Customer from "../models/Customer.js";

const createSchema = Joi.object({
  name: Joi.string().required(),
  phone: Joi.string().allow(""),
  address: Joi.string().allow(""),
  note: Joi.string().allow(""),
});

const updateSchema = createSchema;

export const list = async (req, res) => {
  try {
    const customers = await Customer.find().sort({ createdAt: -1 }).lean();
    res.json({ success: true, data: customers });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const create = async (req, res) => {
  try {
    const { error } = createSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const created = await Customer.create({
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
    const customer = await Customer.findById(req.params.id).lean();
    if (!customer)
      return res.status(404).json({ success: false, message: "Customer not found" });
    res.json({ success: true, data: customer });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const update = async (req, res) => {
  try {
    const { error } = updateSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const updated = await Customer.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    }).lean();
    if (!updated)
      return res.status(404).json({ success: false, message: "Customer not found" });
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
