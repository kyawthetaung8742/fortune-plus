import express from "express";
import { signin, signupNormal } from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/signin", signin);
router.post("/signup", signupNormal);

export default router;
