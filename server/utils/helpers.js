import jwt from "jsonwebtoken";

export const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });

export const generateInviteCode = () => {
  return Math.random().toString(36).substring(2, 10).toUpperCase();
};
