import express from "express";
import { list, create, getById, update } from "../controllers/payment.controller.js";
import uploadPaymentLogo from "../middleware/uploadPaymentLogo.js";

const router = express.Router();

router.get("/", list);
router.post("/", uploadPaymentLogo.single("logo"), create);
router.get("/:id", getById);
router.put("/:id", uploadPaymentLogo.single("logo"), update);

export default router;
