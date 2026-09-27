import { Request, Response } from "express";
import {
  loginSchema,
  registerSchema,
} from "../validators/auth.validator.js";
import {
  loginUser,
  registerUser,
} from "../services/auth.service.js";

export const register = async (req: Request, res: Response) => {
  const data = registerSchema.parse(req.body);

  const result = await registerUser(data);

  res.status(201).json({
    success: true,
    data: result,
  });
};

export const login = async (req: Request, res: Response) => {
  const data = loginSchema.parse(req.body);

  const result = await loginUser(data);

  res.status(200).json({
    success: true,
    data: result,
  });
};