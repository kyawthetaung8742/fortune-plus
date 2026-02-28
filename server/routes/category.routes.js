import express from "express";
import { list, create, getById, update } from "../controllers/category.controller.js";

const router = express.Router();

router.get("/", list);
router.post("/", create);
router.get("/:id", getById);
router.put("/:id", update);

export default router;
