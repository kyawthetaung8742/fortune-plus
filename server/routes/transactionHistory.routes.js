import express from "express";
import { list, exchangeReport } from "../controllers/transactionHistory.controller.js";

const router = express.Router();

router.get("/", list);
router.get("/exchange-report", exchangeReport);

export default router;
