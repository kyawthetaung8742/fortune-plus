import Joi from "joi";
import Product from "../models/Product.js";

const createSchema = Joi.object({
  category_id: Joi.string().required(),
  name: Joi.string().required(),
  quantity: Joi.number().min(0),
  image: Joi.string().allow(""),
  purchase_price: Joi.number().min(0).required(),
  sale_price: Joi.number().min(0).required(),
  note: Joi.string().allow(""),
});

const updateSchema = createSchema;

export const list = async (req, res) => {
  try {
    const filter = {};
    if (req.query.category_id) filter.category_id = req.query.category_id;
    if (req.query.available === "true") filter.quantity = { $gt: 0 };
    const products = await Product.find(filter)
      .populate("category_id", "name is_sale")
      .sort({ createdAt: -1 })
      .lean();
    res.json({ success: true, data: products });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const create = async (req, res) => {
  try {
    const { error } = createSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const created = await Product.create({
      ...req.body,
      created_by: req.user._id,
    });
    const populated = await Product.findById(created._id)
      .populate("category_id", "name is_sale")
      .lean();
    res.status(201).json({ success: true, data: populated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate("category_id", "name is_sale")
      .lean();
    if (!product)
      return res.status(404).json({ success: false, message: "Product not found" });
    res.json({ success: true, data: product });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const update = async (req, res) => {
  try {
    const { error } = updateSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const updated = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    })
      .populate("category_id", "name is_sale")
      .lean();
    if (!updated)
      return res.status(404).json({ success: false, message: "Product not found" });
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
