import Joi from "joi";
import mongoose from "mongoose";
import SaleList from "../models/SaleList.js";
import Product from "../models/Product.js";
import Wallet from "../models/Wallet.js";
import TransactionHistory from "../models/TransactionHistory.js";
import { getNextTransactionNumber } from "../utils/transactionNumber.js";

const createItemSchema = Joi.object({
  product_id: Joi.string().required(),
  quantity: Joi.number().min(1).required(),
  original_price: Joi.number().required(),
  sale_price: Joi.number().required(),
  discount: Joi.number().min(0),
  note: Joi.string().allow(""),
});

const createSchema = Joi.object({
  date: Joi.date(),
  customer_id: Joi.string().required(),
  shareholder_id: Joi.string().required(),
  payment_id: Joi.string().required(),
  currency_type: Joi.string().valid("kyat", "baht").required(),
  transaction_amount: Joi.number().min(0).required(),
  rate: Joi.number().min(0),
  items: Joi.array().items(createItemSchema).min(1).required(),
});

export const list = async (req, res) => {
  try {
    const filter = {};
    if (req.query.customer_id) filter.customer_id = req.query.customer_id;
    if (req.query.from || req.query.to) {
      filter.date = {};
      if (req.query.from) filter.date.$gte = new Date(req.query.from);
      if (req.query.to) filter.date.$lte = new Date(req.query.to);
    }
    const saleLists = await SaleList.find(filter)
      .populate("product_id", "name image sale_price")
      .populate("customer_id", "name phone")
      .sort({ date: -1, createdAt: -1 })
      .lean();
    res.json({ success: true, data: saleLists });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const create = async (req, res) => {
  try {
    const { error } = createSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const date = req.body.date ? new Date(req.body.date) : new Date();
    const customerId = new mongoose.Types.ObjectId(req.body.customer_id);
    const shareholderId = new mongoose.Types.ObjectId(req.body.shareholder_id);
    const paymentId = new mongoose.Types.ObjectId(req.body.payment_id);
    const currencyType = req.body.currency_type;
    const transactionAmount = Number(req.body.transaction_amount);
    const rate = req.body.rate != null ? Number(req.body.rate) : undefined;
    const createdBy = req.user._id;
    const items = req.body.items;

    const created = [];
    for (const item of items) {
      const productId = new mongoose.Types.ObjectId(item.product_id);
      const product = await Product.findById(productId);
      if (!product)
        return res.status(400).json({ message: `Product ${item.product_id} not found` });
      if (product.quantity < item.quantity)
        return res.status(400).json({
          message: `Insufficient quantity for ${product.name}. Available: ${product.quantity}`,
        });

      const saleListItem = await SaleList.create({
        date,
        product_id: productId,
        customer_id: customerId,
        currency_type: currencyType,
        ...(currencyType === "kyat" && rate != null && { rate }),
        quantity: item.quantity,
        original_price: item.original_price,
        sale_price: item.sale_price,
        discount: item.discount ?? 0,
        note: item.note ?? "",
        created_by: createdBy,
      });
      await Product.findByIdAndUpdate(productId, {
        $inc: { quantity: -item.quantity },
      });
      const populated = await SaleList.findById(saleListItem._id)
        .populate("product_id", "name image sale_price")
        .populate("customer_id", "name phone")
        .lean();
      created.push(populated);
    }

    let wallet = await Wallet.findOne({ shareholder_id: shareholderId, payment_id: paymentId });
    const beforeAmount = wallet ? wallet.amount : 0;
    const afterAmount = beforeAmount + transactionAmount;
    if (!wallet) {
      wallet = await Wallet.create({
        shareholder_id: shareholderId,
        payment_id: paymentId,
        amount: afterAmount,
        created_by: createdBy,
      });
    } else {
      wallet.amount = afterAmount;
      await wallet.save();
    }

    const transactionNumber = await getNextTransactionNumber();
    await TransactionHistory.create({
      shareholder_id: shareholderId,
      payment_id: paymentId,
      transaction_number: transactionNumber,
      date,
      before_amount: beforeAmount,
      amount: transactionAmount,
      after_amount: afterAmount,
      transaction_type: "product_sale",
      note: "Product sale",
      created_by: createdBy,
    });

    res.status(201).json({ success: true, data: created });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getById = async (req, res) => {
  try {
    const saleList = await SaleList.findById(req.params.id)
      .populate("product_id", "name image sale_price")
      .populate("customer_id", "name phone")
      .lean();
    if (!saleList)
      return res.status(404).json({ success: false, message: "Sale not found" });
    res.json({ success: true, data: saleList });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
