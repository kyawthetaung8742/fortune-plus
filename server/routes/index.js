import express from "express";
import shareholderRoutes from "./shareholder.routes.js";
import paymentRoutes from "./payment.routes.js";
import walletRoutes from "./wallet.routes.js";
import transactionHistoryRoutes from "./transactionHistory.routes.js";

const router = express.Router();

router.use("/shareholders", shareholderRoutes);
router.use("/payments", paymentRoutes);
router.use("/wallets", walletRoutes);
router.use("/transaction-history", transactionHistoryRoutes);

export default router;
