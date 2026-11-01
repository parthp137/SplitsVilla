import jwt from "jsonwebtoken";
import config from "../config/env.js";

export const generateToken = (id) =>
  jwt.sign({ id }, config.JWT_SECRET, { algorithm: "HS256", expiresIn: "30d" });

export const generateInviteCode = () => {
  return Math.random().toString(36).substring(2, 10).toUpperCase();
};
