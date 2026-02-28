import express from "express";
import {
  list,
  create,
  getById,
  update,
  deposit,
  withdraw,
  transfer,
  exchange,
} from "../controllers/shareholder.controller.js";

const router = express.Router();

router.get("/", list);
router.post("/", create);
router.get("/:id", getById);
router.put("/:id", update);
router.post("/:id/deposit", deposit);
router.post("/:id/withdraw", withdraw);
router.post("/:id/transfer", transfer);
router.post("/:id/exchange", exchange);

export default router;
