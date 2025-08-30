"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const User_1 = __importDefault(require("../models/User"));
const Product_1 = __importDefault(require("../models/Product"));
const ApiResponseHandler_1 = require("../utils/ApiResponseHandler");
const router = (0, express_1.Router)();
// Add item to shopping bag
router.post("/add", auth_1.auth, async (req, res) => {
    try {
        const { productId, quantity = 1, selectedColor, selectedSize } = req.body;
        const userId = req.user._id;
        // Check if product exists
        const product = await Product_1.default.findById(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                error: "Product not found",
                message: "The product you're trying to add doesn't exist"
            });
        }
        // Check if product is active
        if (!product.isActive) {
            return res.status(400).json({
                success: false,
                error: "Product unavailable",
                message: "This product is currently unavailable"
            });
        }
        // Find user and check if item already exists in bag
        const user = await User_1.default.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                error: "User not found",
                message: "User not found"
            });
        }
        const existingItemIndex = user.shoppingBag.findIndex(item => item.productId.toString() === productId);
        if (existingItemIndex > -1) {
            // Update existing item
            user.shoppingBag[existingItemIndex].quantity += quantity;
            user.shoppingBag[existingItemIndex].selectedColor = selectedColor;
            user.shoppingBag[existingItemIndex].selectedSize = selectedSize;
            user.shoppingBag[existingItemIndex].addedAt = new Date();
        }
        else {
            // Add new item
            user.shoppingBag.push({
                productId,
                quantity,
                selectedColor,
                selectedSize,
                addedAt: new Date(),
            });
        }
        await user.save();
        // Populate product details for response
        await user.populate({
            path: "shoppingBag.productId",
            select: "name price media category slug"
        });
        res.json({
            success: true,
            message: "Item added to bag successfully",
            data: {
                shoppingBag: user.shoppingBag,
                totalItems: user.shoppingBag.length,
            },
        });
    }
    catch (error) {
        return (0, ApiResponseHandler_1.handleError)(res, error);
    }
});
// Get user's shopping bag
router.get("/", auth_1.auth, async (req, res) => {
    try {
        const userId = req.user._id;
        const user = await User_1.default.findById(userId).populate({
            path: "shoppingBag.productId",
            select: "name price media category slug isActive"
        });
        if (!user) {
            return res.status(404).json({
                success: false,
                error: "User not found",
                message: "User not found"
            });
        }
        // Filter out inactive products
        const activeItems = user.shoppingBag.filter(item => item.productId && item.productId.isActive);
        // Calculate total
        const total = activeItems.reduce((sum, item) => {
            const product = item.productId;
            return sum + (product.price.current * item.quantity);
        }, 0);
        res.json({
            success: true,
            data: {
                shoppingBag: activeItems,
                totalItems: activeItems.length,
                total: total,
            },
        });
    }
    catch (error) {
        return (0, ApiResponseHandler_1.handleError)(res, error);
    }
});
// Update item quantity in bag
router.put("/update/:productId", auth_1.auth, async (req, res) => {
    try {
        const { productId } = req.params;
        const { quantity, selectedColor, selectedSize } = req.body;
        const userId = req.user._id;
        if (quantity < 1) {
            return res.status(400).json({
                success: false,
                error: "Invalid quantity",
                message: "Quantity must be at least 1"
            });
        }
        const user = await User_1.default.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                error: "User not found",
                message: "User not found"
            });
        }
        const itemIndex = user.shoppingBag.findIndex(item => item.productId.toString() === productId);
        if (itemIndex === -1) {
            return res.status(404).json({
                success: false,
                error: "Item not found",
                message: "Item not found in shopping bag"
            });
        }
        // Update item
        user.shoppingBag[itemIndex].quantity = quantity;
        if (selectedColor)
            user.shoppingBag[itemIndex].selectedColor = selectedColor;
        if (selectedSize)
            user.shoppingBag[itemIndex].selectedSize = selectedSize;
        await user.save();
        // Populate product details
        await user.populate({
            path: "shoppingBag.productId",
            select: "name price media category slug"
        });
        res.json({
            success: true,
            message: "Item updated successfully",
            data: {
                shoppingBag: user.shoppingBag,
                totalItems: user.shoppingBag.length,
            },
        });
    }
    catch (error) {
        return (0, ApiResponseHandler_1.handleError)(res, error);
    }
});
// Remove item from bag
router.delete("/remove/:productId", auth_1.auth, async (req, res) => {
    try {
        const { productId } = req.params;
        const userId = req.user._id;
        const user = await User_1.default.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                error: "User not found",
                message: "User not found"
            });
        }
        const itemIndex = user.shoppingBag.findIndex(item => item.productId.toString() === productId);
        if (itemIndex === -1) {
            return res.status(404).json({
                success: false,
                error: "Item not found",
                message: "Item not found in shopping bag"
            });
        }
        // Remove item
        user.shoppingBag.splice(itemIndex, 1);
        await user.save();
        res.json({
            success: true,
            message: "Item removed from bag successfully",
            data: {
                totalItems: user.shoppingBag.length,
            },
        });
    }
    catch (error) {
        return (0, ApiResponseHandler_1.handleError)(res, error);
    }
});
// Clear shopping bag
router.delete("/clear", auth_1.auth, async (req, res) => {
    try {
        const userId = req.user._id;
        const user = await User_1.default.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                error: "User not found",
                message: "User not found"
            });
        }
        user.shoppingBag = [];
        await user.save();
        res.json({
            success: true,
            message: "Shopping bag cleared successfully",
            data: {
                totalItems: 0,
            },
        });
    }
    catch (error) {
        return (0, ApiResponseHandler_1.handleError)(res, error);
    }
});
module.exports = router;
