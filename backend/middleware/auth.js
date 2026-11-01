import jwt from "jsonwebtoken";
import config from "../config/env.js";

export const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith("Bearer ")
    ? authHeader.slice(7).trim()
    : authHeader?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, config.JWT_SECRET, { algorithms: ["HS256"] });
    if (!decoded || !decoded.id || decoded.type === "password_reset") {
      return res.status(401).json({ message: "Invalid or expired token" });
    }
    req.userId = decoded.id;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

export const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith("Bearer ")
    ? authHeader.slice(7).trim()
    : authHeader?.split(" ")[1];

  if (token) {
    try {
      const decoded = jwt.verify(token, config.JWT_SECRET, { algorithms: ["HS256"] });
      if (decoded && decoded.id && decoded.type !== "password_reset") {
        req.userId = decoded.id;
      }
    } catch {
      // Ignore invalid token and continue as unauthenticated
    }
  }
  next();
};
