import express from "express";
import { list, create, getById } from "../controllers/saleList.controller.js";

const router = express.Router();

router.get("/", list);
router.post("/", create);
router.get("/:id", getById);

export default router;
