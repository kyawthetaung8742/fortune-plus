import express from "express";
import {
  list,
  create,
  getById,
  update,
  deposit,
  withdraw,
  transfer,
} from "../controllers/shareholder.controller.js";

const router = express.Router();

router.get("/", list);
router.post("/", create);
router.get("/:id", getById);
router.put("/:id", update);
router.post("/:id/deposit", deposit);
router.post("/:id/withdraw", withdraw);
router.post("/:id/transfer", transfer);

export default router;
