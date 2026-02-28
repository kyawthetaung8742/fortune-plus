import express from "express";
import shareholderRoutes from "./shareholder.routes.js";
import paymentRoutes from "./payment.routes.js";
import walletRoutes from "./wallet.routes.js";
import transactionHistoryRoutes from "./transactionHistory.routes.js";
import customerRoutes from "./customer.routes.js";
import expenseRoutes from "./expense.routes.js";
import categoryRoutes from "./category.routes.js";
import productRoutes from "./product.routes.js";
import saleListRoutes from "./saleList.routes.js";
import exchangeRateRoutes from "./exchangeRate.routes.js";

const router = express.Router();

router.use("/shareholders", shareholderRoutes);
router.use("/payments", paymentRoutes);
router.use("/wallets", walletRoutes);
router.use("/transaction-history", transactionHistoryRoutes);
router.use("/customers", customerRoutes);
router.use("/expenses", expenseRoutes);
router.use("/categories", categoryRoutes);
router.use("/products", productRoutes);
router.use("/sale-list", saleListRoutes);
router.use("/exchange-rates", exchangeRateRoutes);

export default router;
