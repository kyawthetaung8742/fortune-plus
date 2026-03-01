import express from "express";
import {
  list,
  create,
  getById,
  update,
} from "../controllers/product.controller.js";
import uploadProductImage from "../middleware/uploadProductImage.js";

const router = express.Router();

router.get("/", list);
router.post("/", uploadProductImage.single("image"), create);
router.get("/:id", getById);
router.put("/:id", uploadProductImage.single("image"), update);

export default router;
