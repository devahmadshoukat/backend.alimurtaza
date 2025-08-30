"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../models/User"));
const ApiResponseHandler_1 = require("../utils/ApiResponseHandler");
const router = (0, express_1.Router)();
// Generate JWT Token
const generateToken = (userId) => {
    return jsonwebtoken_1.default.sign({ userId }, process.env.JWT_SECRET || "your-secret-key", {
        expiresIn: "30d",
    });
};
// User Signup
router.post("/signup", async (req, res) => {
    try {
        const { name, email, password, phone } = req.body;
        // Check if user already exists
        const existingUser = await User_1.default.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                error: "User already exists",
                message: "A user with this email already exists"
            });
        }
        // Create new user
        const user = new User_1.default({
            name,
            email,
            password,
            phone,
        });
        await user.save();
        // Generate token
        const token = generateToken(user._id);
        res.status(201).json({
            success: true,
            message: "User registered successfully",
            data: {
                user: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    phone: user.phone,
                },
                token,
            },
        });
    }
    catch (error) {
        return (0, ApiResponseHandler_1.handleError)(res, error);
    }
});
// User Signin
router.post("/signin", async (req, res) => {
    try {
        const { email, password } = req.body;
        // Find user by email
        const user = await User_1.default.findOne({ email });
        if (!user) {
            return res.status(401).json({
                success: false,
                error: "Invalid credentials",
                message: "Email or password is incorrect"
            });
        }
        // Check password
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                error: "Invalid credentials",
                message: "Email or password is incorrect"
            });
        }
        // Generate token
        const token = generateToken(user._id);
        res.json({
            success: true,
            message: "Login successful",
            data: {
                user: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    phone: user.phone,
                },
                token,
            },
        });
    }
    catch (error) {
        return (0, ApiResponseHandler_1.handleError)(res, error);
    }
});
// Get current user profile
router.get("/profile", async (req, res) => {
    try {
        const token = req.header("Authorization")?.replace("Bearer ", "");
        if (!token) {
            return res.status(401).json({
                success: false,
                error: "Authentication required",
                message: "Please provide a valid token"
            });
        }
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || "your-secret-key");
        const user = await User_1.default.findById(decoded.userId).select("-password");
        if (!user) {
            return res.status(401).json({
                success: false,
                error: "Invalid token",
                message: "User not found"
            });
        }
        res.json({
            success: true,
            data: {
                user,
            },
        });
    }
    catch (error) {
        return (0, ApiResponseHandler_1.handleError)(res, error);
    }
});
module.exports = router;
