import dotenv from "dotenv";
dotenv.config();

const NODE_ENV = process.env.NODE_ENV || "development";
const isProduction = NODE_ENV === "production";

const errors = [];

const MONGO_URI = process.env.MONGO_URI;
if (isProduction && !MONGO_URI) {
  errors.push("Missing required environment variable: MONGO_URI");
}

const JWT_SECRET = process.env.JWT_SECRET;
if (isProduction) {
  if (!JWT_SECRET) {
    errors.push("Missing required environment variable: JWT_SECRET");
  } else if (JWT_SECRET.length < 32) {
    errors.push(
      `JWT_SECRET must be at least 32 characters long in production (current length: ${JWT_SECRET.length})`
    );
  }
}

const rawClientUrls = process.env.CLIENT_URLS;
if (isProduction && !rawClientUrls) {
  errors.push("Missing required environment variable: CLIENT_URLS");
}

const rawClientUrl = process.env.CLIENT_URL;
if (isProduction && !rawClientUrl) {
  errors.push("Missing required environment variable: CLIENT_URL");
}

if (errors.length > 0) {
  console.error("\n================ FATAL CONFIGURATION ERROR ================");
  console.error("The backend server cannot start in production due to invalid configuration:");
  errors.forEach((err) => console.error(`  - ${err}`));
  console.error("============================================================\n");
  process.exit(1);
}

const normalizeOrigin = (val) => {
  if (!val) return "";
  try {
    return new URL(val.trim()).origin;
  } catch {
    return val.trim().replace(/\/+$/, "");
  }
};

// Fallbacks are allowed ONLY when NODE_ENV !== "production"
const effectiveMongoUri = MONGO_URI || "mongodb://127.0.0.1:27017/splitsvilla";
const effectiveJwtSecret =
  JWT_SECRET || "splitsvilla_super_secure_dev_jwt_secret_32chars_long";
const effectiveClientUrls =
  rawClientUrls || "http://localhost:8080,http://localhost:5173";
const effectiveClientUrl = rawClientUrl || "http://localhost:8080";
const PORT = parseInt(process.env.PORT || "5000", 10);

const clientUrlsArray = effectiveClientUrls
  .split(",")
  .map(normalizeOrigin)
  .filter(Boolean);

export const config = {
  NODE_ENV,
  isProduction,
  PORT,
  MONGO_URI: effectiveMongoUri,
  JWT_SECRET: effectiveJwtSecret,
  CLIENT_URL: normalizeOrigin(effectiveClientUrl),
  CLIENT_URLS: effectiveClientUrls,
  CLIENT_URLS_ARRAY: [...new Set(clientUrlsArray)],
  EMAIL_USER: process.env.EMAIL_USER || "",
  EMAIL_PASSWORD: process.env.EMAIL_PASSWORD || "",
  ALLOW_SEED: process.env.ALLOW_SEED === "true",
};

export default config;
