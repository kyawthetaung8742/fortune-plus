import express from "express";
import { list, create, getById, remove } from "../controllers/expense.controller.js";

const router = express.Router();

router.get("/", list);
router.post("/", create);
router.get("/:id", getById);
router.delete("/:id", remove);

export default router;
