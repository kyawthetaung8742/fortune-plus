import Joi from "joi";
import mongoose from "mongoose";
import Expense from "../models/Expense.js";
import Wallet from "../models/Wallet.js";
import TransactionHistory from "../models/TransactionHistory.js";
import { getNextTransactionNumber } from "../utils/transactionNumber.js";

const createSchema = Joi.object({
  shareholder_id: Joi.string().required(),
  payment_id: Joi.string().required(),
  date: Joi.date().required(),
  amount: Joi.number().min(0.01).required(),
  note: Joi.string().allow(""),
});

export const list = async (req, res) => {
  try {
    const filter = {};
    if (req.query.shareholder_id) filter.shareholder_id = req.query.shareholder_id;
    if (req.query.payment_id) filter.payment_id = req.query.payment_id;
    const expenses = await Expense.find(filter)
      .populate("shareholder_id", "name")
      .populate("payment_id", "name currency_type")
      .sort({ date: -1, createdAt: -1 })
      .lean();
    res.json({ success: true, data: expenses });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const create = async (req, res) => {
  try {
    const { error } = createSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const shareholderId = new mongoose.Types.ObjectId(req.body.shareholder_id);
    const paymentId = new mongoose.Types.ObjectId(req.body.payment_id);
    const date = new Date(req.body.date);
    const amount = Number(req.body.amount);
    const note = req.body.note || "";
    const createdBy = req.user._id;

    const wallet = await Wallet.findOne({ shareholder_id: shareholderId, payment_id: paymentId });
    if (!wallet)
      return res.status(400).json({ message: "Wallet not found for this shareholder and payment" });
    if (wallet.amount < amount)
      return res.status(400).json({ message: "Insufficient balance" });

    const beforeAmount = wallet.amount;
    const afterAmount = beforeAmount - amount;
    wallet.amount = afterAmount;
    await wallet.save();

    const transactionNumber = await getNextTransactionNumber();
    const transaction = await TransactionHistory.create({
      shareholder_id: shareholderId,
      payment_id: paymentId,
      transaction_number: transactionNumber,
      date,
      before_amount: beforeAmount,
      amount: -amount,
      after_amount: afterAmount,
      transaction_type: "expense",
      note,
      created_by: createdBy,
    });

    const expense = await Expense.create({
      shareholder_id: shareholderId,
      payment_id: paymentId,
      date,
      amount,
      note,
      created_by: createdBy,
    });

    const populated = await Expense.findById(expense._id)
      .populate("shareholder_id", "name")
      .populate("payment_id", "name currency_type")
      .lean();

    res.status(201).json({
      success: true,
      data: populated,
      transaction_number: transactionNumber,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getById = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id)
      .populate("shareholder_id", "name")
      .populate("payment_id", "name currency_type")
      .lean();
    if (!expense)
      return res.status(404).json({ success: false, message: "Expense not found" });
    res.json({ success: true, data: expense });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const remove = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);
    if (!expense)
      return res.status(404).json({ success: false, message: "Expense not found" });

    const shareholderId = expense.shareholder_id;
    const paymentId = expense.payment_id;
    const amount = Number(expense.amount);
    const createdBy = req.user._id;

    let wallet = await Wallet.findOne({ shareholder_id: shareholderId, payment_id: paymentId });
    if (!wallet) {
      wallet = await Wallet.create({
        shareholder_id: shareholderId,
        payment_id: paymentId,
        amount: amount,
        created_by: createdBy,
      });
    } else {
      wallet.amount += amount;
      await wallet.save();
    }

    const beforeAmount = wallet.amount - amount;
    const afterAmount = wallet.amount;
    const transactionNumber = await getNextTransactionNumber();
    await TransactionHistory.create({
      shareholder_id: shareholderId,
      payment_id: paymentId,
      transaction_number: transactionNumber,
      date: new Date(),
      before_amount: beforeAmount,
      amount,
      after_amount: afterAmount,
      transaction_type: "expense_reversal",
      note: `Expense reversal (deleted expense)`,
      created_by: createdBy,
    });

    await Expense.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: "Expense deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
