import { Response } from "express";

export const handleError = (res: Response, error: any) => {
  console.error("API Error:", error);

  // Handle Mongoose validation errors
  if (error.name === "ValidationError") {
    const errors = Object.values(error.errors).map((err: any) => err.message);
    return res.status(400).json({
      success: false,
      error: "Validation Error",
      message: errors.join(", "),
    });
  }

  // Handle Mongoose duplicate key errors
  if (error.code === 11000) {
    const field = Object.keys(error.keyValue)[0];
    return res.status(400).json({
      success: false,
      error: "Duplicate Entry",
      message: `${field} already exists`,
    });
  }

  // Handle JWT errors
  if (error.name === "JsonWebTokenError") {
    return res.status(401).json({
      success: false,
      error: "Invalid Token",
      message: "Please provide a valid token",
    });
  }

  if (error.name === "TokenExpiredError") {
    return res.status(401).json({
      success: false,
      error: "Token Expired",
      message: "Token has expired, please login again",
    });
  }

  // Handle Cast errors (invalid ObjectId)
  if (error.name === "CastError") {
    return res.status(400).json({
      success: false,
      error: "Invalid ID",
      message: "Invalid ID format",
    });
  }

  // Default error response
  return res.status(500).json({
    success: false,
    error: "Internal Server Error",
    message: process.env.NODE_ENV === "development" ? error.message : "Something went wrong",
  });
};

export const handleSuccess = (res: Response, data: any, message = "Success", statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};
