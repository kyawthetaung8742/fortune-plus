import express from "express";
import { list, update } from "../controllers/exchangeRate.controller.js";

const router = express.Router();

router.get("/", list);
router.put("/:id", update);

export default router;
