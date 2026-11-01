export const errorHandler = (err, req, res, next) => {
  const isProduction = process.env.NODE_ENV === "production";

  if (!isProduction) {
    console.error("Express Error:", err);
  } else {
    console.error(`Express Error [${err.name || "Error"}]:`, err.message);
  }

  // Handle Mongoose CastError (e.g. invalid ObjectId format)
  if (err.name === "CastError") {
    return res.status(400).json({
      message: `Invalid format for field '${err.path}': ${err.value}`,
    });
  }

  // Handle Mongoose ValidationError
  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors || {}).map((e) => e.message);
    return res.status(400).json({
      message: messages.join(", ") || "Validation failed",
      errors: messages,
    });
  }

  // Handle Mongo duplicate key error (code 11000)
  if (err.code === 11000) {
    const fields = Object.keys(err.keyPattern || err.keyValue || {});
    return res.status(409).json({
      message: `A resource with that ${fields.join(", ") || "field"} already exists.`,
    });
  }

  // Handle JWT errors
  if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
    return res.status(401).json({
      message: "Invalid or expired token",
    });
  }

  // Handle CORS errors
  if (err.message && err.message.startsWith("CORS origin not allowed")) {
    return res.status(403).json({
      message: err.message,
    });
  }

  // General HTTP status resolution
  const statusCode =
    typeof err.status === "number"
      ? err.status
      : typeof err.statusCode === "number"
      ? err.statusCode
      : 500;

  const message =
    statusCode === 500 && isProduction
      ? "Internal server error"
      : err.message || "Internal server error";

  res.status(statusCode).json({
    message,
    ...(isProduction ? {} : { stack: err.stack }),
  });
};
