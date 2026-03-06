import Joi from "joi";
import mongoose from "mongoose";
import Shareholder from "../models/Shareholder.js";
import Payment from "../models/Payment.js";
import Wallet from "../models/Wallet.js";
import TransactionHistory from "../models/TransactionHistory.js";
import { getNextTransactionNumber } from "../utils/transactionNumber.js";

const createSchema = Joi.object({
  name: Joi.string().required(),
  phone: Joi.string().allow(""),
  email: Joi.string().email().allow(""),
  address: Joi.string().allow(""),
});

const updateSchema = createSchema;

export const list = async (req, res) => {
  try {
    const shareholders = await Shareholder.find()
      .sort({ createdAt: -1 })
      .lean();
    res.json({ success: true, data: shareholders });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const create = async (req, res) => {
  try {
    const { error } = createSchema.validate(req.body);
    if (error)
      return res.status(400).json({ message: error.details[0].message });

    const created = await Shareholder.create({
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
    const shareholder = await Shareholder.findById(req.params.id).lean();
    if (!shareholder)
      return res
        .status(404)
        .json({ success: false, message: "Shareholder not found" });
    res.json({ success: true, data: shareholder });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const update = async (req, res) => {
  try {
    const { error } = updateSchema.validate(req.body);
    if (error)
      return res.status(400).json({ message: error.details[0].message });

    const updated = await Shareholder.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true },
    ).lean();
    if (!updated)
      return res
        .status(404)
        .json({ success: false, message: "Shareholder not found" });
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const depositSchema = Joi.object({
  payment_id: Joi.string().required(),
  amount: Joi.number().min(0.01).required(),
  note: Joi.string().allow(""),
});

export const deposit = async (req, res) => {
  try {
    const { error } = depositSchema.validate(req.body);
    if (error)
      return res.status(400).json({ message: error.details[0].message });

    const shareholderId = new mongoose.Types.ObjectId(req.params.id);
    const paymentId = new mongoose.Types.ObjectId(req.body.payment_id);
    const amount = Number(req.body.amount);
    const note = req.body.note || "";
    const createdBy = req.user._id;

    let wallet = await Wallet.findOne({
      shareholder_id: shareholderId,
      payment_id: paymentId,
    });
    const beforeAmount = wallet ? wallet.amount : 0;
    const afterAmount = beforeAmount + amount;

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
      date: new Date(),
      before_amount: beforeAmount,
      amount,
      after_amount: afterAmount,
      transaction_type: "deposit",
      note,
      created_by: createdBy,
    });

    res.status(201).json({
      success: true,
      data: { wallet, transaction_number: transactionNumber },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const withdrawSchema = Joi.object({
  payment_id: Joi.string().required(),
  amount: Joi.number().min(0.01).required(),
  note: Joi.string().allow(""),
});

export const withdraw = async (req, res) => {
  try {
    const { error } = withdrawSchema.validate(req.body);
    if (error)
      return res.status(400).json({ message: error.details[0].message });

    const shareholderId = new mongoose.Types.ObjectId(req.params.id);
    const paymentId = new mongoose.Types.ObjectId(req.body.payment_id);
    const amount = Number(req.body.amount);
    const note = req.body.note || "";
    const createdBy = req.user._id;

    const wallet = await Wallet.findOne({
      shareholder_id: shareholderId,
      payment_id: paymentId,
    });
    if (!wallet)
      return res
        .status(400)
        .json({ message: "Wallet not found for this shareholder and payment" });
    if (wallet.amount < amount)
      return res.status(400).json({ message: "Insufficient balance" });

    const beforeAmount = wallet.amount;
    const afterAmount = beforeAmount - amount;
    wallet.amount = afterAmount;
    await wallet.save();

    const transactionNumber = await getNextTransactionNumber();
    await TransactionHistory.create({
      shareholder_id: shareholderId,
      payment_id: paymentId,
      transaction_number: transactionNumber,
      date: new Date(),
      before_amount: beforeAmount,
      amount: -amount,
      after_amount: afterAmount,
      transaction_type: "withdraw",
      note,
      created_by: createdBy,
    });

    res.status(201).json({
      success: true,
      data: { wallet, transaction_number: transactionNumber },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const transferSchema = Joi.object({
  payment_id: Joi.string().required(),
  to_shareholder_id: Joi.string().required(),
  to_payment_id: Joi.string().allow(""),
  amount: Joi.number().min(0.01).required(),
  note: Joi.string().allow(""),
});

export const transfer = async (req, res) => {
  try {
    const { error } = transferSchema.validate(req.body);
    if (error)
      return res.status(400).json({ message: error.details[0].message });

    const fromShareholderId = new mongoose.Types.ObjectId(req.params.id);
    const toShareholderId = new mongoose.Types.ObjectId(
      req.body.to_shareholder_id,
    );
    const fromPaymentId = new mongoose.Types.ObjectId(req.body.payment_id);
    const toPaymentId = req.body.to_payment_id
      ? new mongoose.Types.ObjectId(req.body.to_payment_id)
      : fromPaymentId;
    const amount = Number(req.body.amount);
    const note = req.body.note || "";
    const createdBy = req.user._id;

    if (!toPaymentId.equals(fromPaymentId)) {
      const fromPayment = await Payment.findById(fromPaymentId).lean();
      const toPayment = await Payment.findById(toPaymentId).lean();
      if (!fromPayment || !toPayment)
        return res.status(400).json({ message: "Invalid payment" });
      const fromType = (fromPayment.currency_type || "").toLowerCase();
      const toType = (toPayment.currency_type || "").toLowerCase();
      if (fromType !== toType)
        return res.status(400).json({
          message: "To payment must have same currency type as from payment",
        });
    }

    const fromWallet = await Wallet.findOne({
      shareholder_id: fromShareholderId,
      payment_id: fromPaymentId,
    });
    if (!fromWallet)
      return res.status(400).json({ message: "Sender wallet not found" });
    if (fromWallet.amount < amount)
      return res.status(400).json({ message: "Insufficient balance" });

    let toWallet = await Wallet.findOne({
      shareholder_id: toShareholderId,
      payment_id: toPaymentId,
    });
    const toBeforeAmount = toWallet ? toWallet.amount : 0;
    const toAfterAmount = toBeforeAmount + amount;

    if (!toWallet) {
      toWallet = await Wallet.create({
        shareholder_id: toShareholderId,
        payment_id: toPaymentId,
        amount: toAfterAmount,
        created_by: createdBy,
      });
    } else {
      toWallet.amount = toAfterAmount;
      await toWallet.save();
    }

    const fromBeforeAmount = fromWallet.amount;
    const fromAfterAmount = fromBeforeAmount - amount;
    fromWallet.amount = fromAfterAmount;
    await fromWallet.save();

    const transactionNumber = await getNextTransactionNumber();

    await TransactionHistory.insertMany([
      {
        shareholder_id: fromShareholderId,
        payment_id: fromPaymentId,
        transaction_number: transactionNumber,
        date: new Date(),
        before_amount: fromBeforeAmount,
        amount: -amount,
        after_amount: fromAfterAmount,
        transaction_type: "transfer",
        note,
        created_by: createdBy,
      },
      {
        shareholder_id: toShareholderId,
        payment_id: toPaymentId,
        transaction_number: transactionNumber,
        date: new Date(),
        before_amount: toBeforeAmount,
        amount,
        after_amount: toAfterAmount,
        transaction_type: "receive",
        note,
        created_by: createdBy,
      },
    ]);

    res.status(201).json({
      success: true,
      data: { transaction_number: transactionNumber },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const exchangeSchema = Joi.object({
  from_payment_id: Joi.string().required(),
  to_payment_id: Joi.string().required(),
  to_shareholder_id: Joi.string().allow(""),
  from_amount: Joi.number().min(0.01).required(),
  rate: Joi.number().min(0.0001).required(),
  note: Joi.string().allow(""),
});

export const exchange = async (req, res) => {
  try {
    const { error } = exchangeSchema.validate(req.body);
    if (error)
      return res.status(400).json({ message: error.details[0].message });

    const fromShareholderId = new mongoose.Types.ObjectId(req.params.id);
    const toShareholderId = req.body.to_shareholder_id
      ? new mongoose.Types.ObjectId(req.body.to_shareholder_id)
      : fromShareholderId;
    const fromPaymentId = new mongoose.Types.ObjectId(req.body.from_payment_id);
    const toPaymentId = new mongoose.Types.ObjectId(req.body.to_payment_id);
    const fromAmount = Number(req.body.from_amount);
    const rate = Number(req.body.rate);
    const note = req.body.note || "";
    const createdBy = req.user._id;

    if (fromPaymentId.equals(toPaymentId))
      return res.status(400).json({
        message: "From and to payment must be different (e.g. Kyat and Baht)",
      });

    const toAmount = fromAmount / rate;

    const fromWallet = await Wallet.findOne({
      shareholder_id: fromShareholderId,
      payment_id: fromPaymentId,
    });
    if (!fromWallet)
      return res
        .status(400)
        .json({ message: "Source wallet not found for this payment" });
    if (fromWallet.amount < fromAmount)
      return res
        .status(400)
        .json({ message: "Insufficient balance in source currency" });

    let toWallet = await Wallet.findOne({
      shareholder_id: toShareholderId,
      payment_id: toPaymentId,
    });
    const toBeforeAmount = toWallet ? toWallet.amount : 0;
    const toAfterAmount = toBeforeAmount + toAmount;

    if (!toWallet) {
      toWallet = await Wallet.create({
        shareholder_id: toShareholderId,
        payment_id: toPaymentId,
        amount: toAfterAmount,
        created_by: createdBy,
      });
    } else {
      toWallet.amount = toAfterAmount;
      await toWallet.save();
    }

    const fromBeforeAmount = fromWallet.amount;
    const fromAfterAmount = fromBeforeAmount - fromAmount;
    fromWallet.amount = fromAfterAmount;
    await fromWallet.save();

    const transactionNumber = await getNextTransactionNumber();

    await TransactionHistory.insertMany([
      {
        shareholder_id: fromShareholderId,
        payment_id: fromPaymentId,
        transaction_number: transactionNumber,
        date: new Date(),
        before_amount: fromBeforeAmount,
        amount: -fromAmount,
        after_amount: fromAfterAmount,
        transaction_type: "exchange_out",
        note: note || "Exchange to other currency",
        created_by: createdBy,
      },
      {
        shareholder_id: toShareholderId,
        payment_id: toPaymentId,
        transaction_number: transactionNumber,
        date: new Date(),
        before_amount: toBeforeAmount,
        amount: toAmount,
        after_amount: toAfterAmount,
        transaction_type: "exchange_in",
        note: note || "Exchange from other currency",
        created_by: createdBy,
      },
    ]);

    res.status(201).json({
      success: true,
      data: { transaction_number: transactionNumber, to_amount: toAmount },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
