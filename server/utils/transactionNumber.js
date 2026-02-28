import TransactionCounter from "../models/TransactionCounter.js";

export async function getNextTransactionNumber() {
  const result = await TransactionCounter.findByIdAndUpdate(
    "transaction_number",
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  const num = result.seq;
  return String(num).padStart(8, "0");
}
