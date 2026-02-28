import Joi from "joi";
import Category from "../models/Category.js";

const createSchema = Joi.object({
  name: Joi.string().required(),
  is_sale: Joi.boolean(),
});

const updateSchema = createSchema;

export const list = async (req, res) => {
  try {
    const filter = {};
    if (req.query.is_sale !== undefined) filter.is_sale = req.query.is_sale === "true";
    const categories = await Category.find(filter).sort({ createdAt: -1 }).lean();
    res.json({ success: true, data: categories });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const create = async (req, res) => {
  try {
    const { error } = createSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const created = await Category.create({
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
    const category = await Category.findById(req.params.id).lean();
    if (!category)
      return res.status(404).json({ success: false, message: "Category not found" });
    res.json({ success: true, data: category });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const update = async (req, res) => {
  try {
    const { error } = updateSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const updated = await Category.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    }).lean();
    if (!updated)
      return res.status(404).json({ success: false, message: "Category not found" });
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
