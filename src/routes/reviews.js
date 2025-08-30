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
const mongoose_1 = __importDefault(require("mongoose"));
const router = (0, express_1.Router)();
// Add review to product
router.post("/add", auth_1.auth, async (req, res) => {
    try {
        const { productId, rating, comment } = req.body;
        const userId = req.user._id;
        // Validate rating
        if (rating < 1 || rating > 5) {
            return res.status(400).json({
                success: false,
                error: "Invalid rating",
                message: "Rating must be between 1 and 5"
            });
        }
        // Check if product exists
        const product = await Product_1.default.findById(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                error: "Product not found",
                message: "The product you're trying to review doesn't exist"
            });
        }
        // Check if user already reviewed this product
        const user = await User_1.default.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                error: "User not found",
                message: "User not found"
            });
        }
        const existingReviewIndex = user.reviews.findIndex(review => review.productId.toString() === productId);
        if (existingReviewIndex > -1) {
            return res.status(400).json({
                success: false,
                error: "Review already exists",
                message: "You have already reviewed this product"
            });
        }
        // Add review to user
        user.reviews.push({
            productId,
            rating,
            comment,
            createdAt: new Date(),
        });
        await user.save();
        // Update product rating
        const allReviews = await User_1.default.aggregate([
            { $unwind: "$reviews" },
            { $match: { "reviews.productId": product._id } },
            {
                $group: {
                    _id: "$reviews.productId",
                    averageRating: { $avg: "$reviews.rating" },
                    totalReviews: { $sum: 1 }
                }
            }
        ]);
        if (allReviews.length > 0) {
            product.rating = {
                average: Math.round(allReviews[0].averageRating * 10) / 10,
                count: allReviews[0].totalReviews
            };
            await product.save();
        }
        res.json({
            success: true,
            message: "Review added successfully",
            data: {
                review: {
                    productId,
                    rating,
                    comment,
                    createdAt: new Date(),
                },
            },
        });
    }
    catch (error) {
        return (0, ApiResponseHandler_1.handleError)(res, error);
    }
});
// Update review
router.put("/update/:productId", auth_1.auth, async (req, res) => {
    try {
        const { productId } = req.params;
        const { rating, comment } = req.body;
        const userId = req.user._id;
        // Validate rating
        if (rating < 1 || rating > 5) {
            return res.status(400).json({
                success: false,
                error: "Invalid rating",
                message: "Rating must be between 1 and 5"
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
        const reviewIndex = user.reviews.findIndex(review => review.productId.toString() === productId);
        if (reviewIndex === -1) {
            return res.status(404).json({
                success: false,
                error: "Review not found",
                message: "Review not found"
            });
        }
        // Update review
        user.reviews[reviewIndex].rating = rating;
        user.reviews[reviewIndex].comment = comment;
        user.reviews[reviewIndex].createdAt = new Date();
        await user.save();
        // Update product rating
        const product = await Product_1.default.findById(productId);
        if (product) {
            const allReviews = await User_1.default.aggregate([
                { $unwind: "$reviews" },
                { $match: { "reviews.productId": product._id } },
                {
                    $group: {
                        _id: "$reviews.productId",
                        averageRating: { $avg: "$reviews.rating" },
                        totalReviews: { $sum: 1 }
                    }
                }
            ]);
            if (allReviews.length > 0) {
                product.rating = {
                    average: Math.round(allReviews[0].averageRating * 10) / 10,
                    count: allReviews[0].totalReviews
                };
                await product.save();
            }
        }
        res.json({
            success: true,
            message: "Review updated successfully",
            data: {
                review: user.reviews[reviewIndex],
            },
        });
    }
    catch (error) {
        return (0, ApiResponseHandler_1.handleError)(res, error);
    }
});
// Delete review
router.delete("/delete/:productId", auth_1.auth, async (req, res) => {
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
        const reviewIndex = user.reviews.findIndex(review => review.productId.toString() === productId);
        if (reviewIndex === -1) {
            return res.status(404).json({
                success: false,
                error: "Review not found",
                message: "Review not found"
            });
        }
        // Remove review
        user.reviews.splice(reviewIndex, 1);
        await user.save();
        // Update product rating
        const product = await Product_1.default.findById(productId);
        if (product) {
            const allReviews = await User_1.default.aggregate([
                { $unwind: "$reviews" },
                { $match: { "reviews.productId": product._id } },
                {
                    $group: {
                        _id: "$reviews.productId",
                        averageRating: { $avg: "$reviews.rating" },
                        totalReviews: { $sum: 1 }
                    }
                }
            ]);
            if (allReviews.length > 0) {
                product.rating = {
                    average: Math.round(allReviews[0].averageRating * 10) / 10,
                    count: allReviews[0].totalReviews
                };
            }
            else {
                product.rating = {
                    average: 0,
                    count: 0
                };
            }
            await product.save();
        }
        res.json({
            success: true,
            message: "Review deleted successfully",
        });
    }
    catch (error) {
        return (0, ApiResponseHandler_1.handleError)(res, error);
    }
});
// Get user's reviews
router.get("/my-reviews", auth_1.auth, async (req, res) => {
    try {
        const userId = req.user._id;
        const user = await User_1.default.findById(userId).populate({
            path: "reviews.productId",
            select: "name media category slug"
        });
        if (!user) {
            return res.status(404).json({
                success: false,
                error: "User not found",
                message: "User not found"
            });
        }
        res.json({
            success: true,
            data: {
                reviews: user.reviews,
                totalReviews: user.reviews.length,
            },
        });
    }
    catch (error) {
        return (0, ApiResponseHandler_1.handleError)(res, error);
    }
});
// Get product reviews (public)
router.get("/product/:productId", async (req, res) => {
    try {
        const { productId } = req.params;
        const { page = 1, limit = 10 } = req.query;
        const skip = (Number(page) - 1) * Number(limit);
        const reviews = await User_1.default.aggregate([
            { $unwind: "$reviews" },
            { $match: { "reviews.productId": new mongoose_1.default.Types.ObjectId(productId) } },
            {
                $lookup: {
                    from: "users",
                    localField: "_id",
                    foreignField: "_id",
                    as: "user"
                }
            },
            { $unwind: "$user" },
            {
                $project: {
                    rating: "$reviews.rating",
                    comment: "$reviews.comment",
                    createdAt: "$reviews.createdAt",
                    userName: "$user.name",
                    userEmail: "$user.email"
                }
            },
            { $sort: { createdAt: -1 } },
            { $skip: skip },
            { $limit: Number(limit) }
        ]);
        const totalReviews = await User_1.default.aggregate([
            { $unwind: "$reviews" },
            { $match: { "reviews.productId": new mongoose_1.default.Types.ObjectId(productId) } },
            { $count: "total" }
        ]);
        res.json({
            success: true,
            data: {
                reviews,
                totalReviews: totalReviews[0]?.total || 0,
                currentPage: Number(page),
                totalPages: Math.ceil((totalReviews[0]?.total || 0) / Number(limit)),
            },
        });
    }
    catch (error) {
        return (0, ApiResponseHandler_1.handleError)(res, error);
    }
});
module.exports = router;
