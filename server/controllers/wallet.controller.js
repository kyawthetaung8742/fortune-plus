import Wallet from "../models/Wallet.js";
import TransactionHistory from "../models/TransactionHistory.js";
import mongoose from "mongoose";

export const listByShareholder = async (req, res) => {
  try {
    const shareholderId = new mongoose.Types.ObjectId(req.params.shareholderId);
    const wallets = await Wallet.find({ shareholder_id: shareholderId })
      .populate("payment_id", "name currency_type logo_url")
      .lean();
    res.json({ success: true, data: wallets });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const summary = async (req, res) => {
  try {
    const wallets = await Wallet.find()
      .populate("payment_id", "name currency_type logo_url")
      .populate("shareholder_id", "name")
      .lean();

    const byPaymentMap = new Map();
    const byShareholderMap = new Map();

    for (const w of wallets) {
      const payment = w.payment_id;
      const paymentId = payment?._id ? String(payment._id) : (payment ? String(payment) : "");
      const paymentName = payment?.name ?? "";
      const currencyType = payment?.currency_type ?? "";
      const logo_url = payment?.logo_url ?? undefined;
      const amount = Number(w.amount) || 0;

      if (paymentId) {
        const existing = byPaymentMap.get(paymentId) || {
          payment_id: paymentId,
          paymentName,
          currency_type: currencyType,
          logo_url,
          totalAmount: 0,
        };
        existing.totalAmount += amount;
        if (logo_url) existing.logo_url = logo_url;
        byPaymentMap.set(paymentId, existing);
      }

      const sh = w.shareholder_id;
      const shId = sh?._id ? String(sh._id) : (sh ? String(sh) : "");
      const shName = sh?.name ?? "";
      if (shId) {
        let shEntry = byShareholderMap.get(shId);
        if (!shEntry) {
          shEntry = { shareholder_id: shId, shareholderName: shName, wallets: [] };
          byShareholderMap.set(shId, shEntry);
        }
        const walletEntry = {
          payment_id: paymentId,
          paymentName,
          currency_type: currencyType,
          logo_url,
          amount,
        };
        const existingWallet = shEntry.wallets.find((x) => x.payment_id === paymentId);
        if (existingWallet) {
          existingWallet.amount += amount;
          if (logo_url && !existingWallet.logo_url) existingWallet.logo_url = logo_url;
        } else shEntry.wallets.push(walletEntry);
      }
    }

    const byShareholderList = Array.from(byShareholderMap.values());
    const shareholderIds = byShareholderList.map((s) => new mongoose.Types.ObjectId(s.shareholder_id));

    const transactions = await TransactionHistory.find({
      shareholder_id: { $in: shareholderIds },
      transaction_type: { $in: ["deposit", "withdraw"] },
    })
      .populate("payment_id", "currency_type")
      .lean();

    const depositByShAndCurrency = new Map();
    const withdrawByShAndCurrency = new Map();

    for (const t of transactions) {
      const shId = t.shareholder_id?.toString?.() ?? String(t.shareholder_id);
      const payment = t.payment_id;
      const currencyType = (payment?.currency_type ?? "").toLowerCase();
      if (!currencyType) continue;

      const amount = Number(t.amount) || 0;
      if (t.transaction_type === "deposit") {
        const key = `${shId}:${currencyType}`;
        depositByShAndCurrency.set(key, (depositByShAndCurrency.get(key) ?? 0) + amount);
      } else if (t.transaction_type === "withdraw") {
        const key = `${shId}:${currencyType}`;
        withdrawByShAndCurrency.set(key, (withdrawByShAndCurrency.get(key) ?? 0) + Math.abs(amount));
      }
    }

    for (const sh of byShareholderList) {
      sh.depositByCurrency = {};
      sh.withdrawByCurrency = {};
      for (const w of sh.wallets ?? []) {
        const type = (w.currency_type || "").toLowerCase();
        if (!type) continue;
        const depKey = `${sh.shareholder_id}:${type}`;
        const witKey = `${sh.shareholder_id}:${type}`;
        sh.depositByCurrency[type] = depositByShAndCurrency.get(depKey) ?? 0;
        sh.withdrawByCurrency[type] = withdrawByShAndCurrency.get(witKey) ?? 0;
      }
    }

    res.json({
      success: true,
      data: {
        byPayment: Array.from(byPaymentMap.values()),
        byShareholder: byShareholderList,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
