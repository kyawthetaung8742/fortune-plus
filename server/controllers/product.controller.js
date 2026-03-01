import Joi from "joi";
import Product from "../models/Product.js";
import { deleteFromS3 } from "../utils/s3Delete.js";

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
    const body = { ...req.body };
    if (body.quantity !== undefined && body.quantity !== "")
      body.quantity = Number(body.quantity);
    if (body.purchase_price !== undefined && body.purchase_price !== "")
      body.purchase_price = Number(body.purchase_price);
    if (body.sale_price !== undefined && body.sale_price !== "")
      body.sale_price = Number(body.sale_price);

    const { error } = createSchema.validate(body);
    if (error)
      return res.status(400).json({ message: error.details[0].message });

    const payload = {
      ...body,
      created_by: req.user._id,
    };
    if (req.file?.location) payload.image = req.file.location;

    const created = await Product.create(payload);
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
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    res.json({ success: true, data: product });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const update = async (req, res) => {
  try {
    const body = { ...req.body };
    if (body.quantity !== undefined && body.quantity !== "")
      body.quantity = Number(body.quantity);
    if (body.purchase_price !== undefined && body.purchase_price !== "")
      body.purchase_price = Number(body.purchase_price);
    if (body.sale_price !== undefined && body.sale_price !== "")
      body.sale_price = Number(body.sale_price);

    const { error } = updateSchema.validate(body);
    if (error)
      return res.status(400).json({ message: error.details[0].message });

    const existing = await Product.findById(req.params.id).lean();
    if (!existing)
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });

    const payload = { ...body };
    if (req.file?.location) {
      if (existing.image) await deleteFromS3(existing.image);
      payload.image = req.file.location;
    } else if (Object.prototype.hasOwnProperty.call(body, "image")) {
      payload.image = body.image || undefined;
    }

    const updated = await Product.findByIdAndUpdate(req.params.id, payload, {
      new: true,
    })
      .populate("category_id", "name is_sale")
      .lean();
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
