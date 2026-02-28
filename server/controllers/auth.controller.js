import bcrypt from "bcryptjs";
import User from "../models/User.js";
import Joi from "joi";
import { generateToken } from "../utils/jwt.js";

export const signupNormal = async (req, res) => {
  try {
    const schema = Joi.object({
      name: Joi.string().required(),
      phone: Joi.string().required(),
      email: Joi.string().email().required(),
      password: Joi.string().min(8).required(),
    });

    const { error } = schema.validate(req.body);
    if (error)
      return res.status(400).json({ message: error.details[0].message });

    const { name, phone, email, password } = req.body;

    const existing = await User.findOne({ $or: [{ email }, { phone }] });
    if (existing)
      return res.status(400).json({ message: "Email or phone already exists" });

    const hashed = await bcrypt.hash(password, 12);

    const user = await User.create({
      name,
      phone,
      email,
      password: hashed,
    });

    const token = generateToken(user);

    res.status(201).json({ message: "Signup success", user, token });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const signin = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      message: "Username and password are required.",
    });
  }

  const user = await User.findOne({ username });

  if (!user) {
    return res.status(401).json({
      message: "Invalid username or password. Please check and try again.",
    });
  }

  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    return res
      .status(401)
      .json({ message: "Invalid username or password. Please check and try again." });
  }

  res.json({
    _id: user._id,
    username: user.username,
    name: user.name,
    token: generateToken(user._id),
  });
};
