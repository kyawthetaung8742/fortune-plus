import express from "express";
import { list } from "../controllers/transactionHistory.controller.js";

const router = express.Router();

router.get("/", list);

export default router;
