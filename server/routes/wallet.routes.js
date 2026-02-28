import express from "express";
import { listByShareholder, summary } from "../controllers/wallet.controller.js";

const router = express.Router();

router.get("/summary", summary);
router.get("/shareholder/:shareholderId", listByShareholder);

export default router;
