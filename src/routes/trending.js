"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const ApiResponseHandler_1 = require("../utils/ApiResponseHandler");
const Product_1 = __importDefault(require("../models/Product"));
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// Get layout limits by gender
const getLayoutLimit = (gender) => {
    switch (gender) {
        case 'men': return 4; // 2x2 cards
        case 'women': return 2; // 1x2 cards  
        case 'kids': return 3; // 3 cards per row
        case 'baby': return 4; // 4 cards per row
        default: return 4;
    }
};
// GET /api/trending - Get trending products by gender
router.get("/", async (req, res) => {
    try {
        const { gender } = req.query;
        if (!gender) {
            return (0, ApiResponseHandler_1.handleError)(res, { message: "Gender parameter is required" });
        }
        // Build filter object
        const filter = {
            isActive: true,
            isTrending: true,
            "category.gender": gender
        };
        const limit = getLayoutLimit(gender);
        // Get trending products
        const products = await Product_1.default.find(filter)
            .sort({ "rating.average": -1, "rating.count": -1 })
            .limit(limit)
            .populate("category", "gender type colors")
            .select("name media category slug rating isTrending");
        // Transform data for frontend
        const transformedProducts = products.map(product => ({
            title: product.name,
            src: product.media.thumbnail,
            slug: product.slug,
            id: product._id,
            rating: product.rating,
            isTrending: product.isTrending
        }));
        return (0, ApiResponseHandler_1.handleSuccess)(res, {
            products: transformedProducts,
            gender,
            limit,
            total: transformedProducts.length,
            availableSlots: limit - transformedProducts.length,
            isComplete: transformedProducts.length >= limit
        }, "Trending products retrieved successfully");
    }
    catch (error) {
        return (0, ApiResponseHandler_1.handleError)(res, error);
    }
});
// POST /api/trending/:productId - Add product to trending (requires auth)
router.post("/:productId", auth_1.auth, async (req, res) => {
    try {
        const { productId } = req.params;
        const product = await Product_1.default.findById(productId);
        if (!product) {
            return (0, ApiResponseHandler_1.handleError)(res, { message: "Product not found" });
        }
        if (!product.isActive) {
            return (0, ApiResponseHandler_1.handleError)(res, { message: "Product is not active" });
        }
        const gender = product.category.gender;
        const limit = getLayoutLimit(gender);
        // Count existing trending products for this gender
        const existingCount = await Product_1.default.countDocuments({
            isTrending: true,
            "category.gender": gender
        });
        if (existingCount >= limit) {
            return (0, ApiResponseHandler_1.handleError)(res, {
                message: `Maximum ${limit} trending products already added for ${gender}`
            });
        }
        // Add to trending
        product.isTrending = true;
        await product.save();
        return (0, ApiResponseHandler_1.handleSuccess)(res, {
            product: {
                id: product._id,
                name: product.name,
                isTrending: product.isTrending
            }
        }, "Product added to trending successfully");
    }
    catch (error) {
        return (0, ApiResponseHandler_1.handleError)(res, error);
    }
});
// DELETE /api/trending/:productId - Remove product from trending (requires auth)
router.delete("/:productId", auth_1.auth, async (req, res) => {
    try {
        const { productId } = req.params;
        const product = await Product_1.default.findById(productId);
        if (!product) {
            return (0, ApiResponseHandler_1.handleError)(res, { message: "Product not found" });
        }
        // Remove from trending
        product.isTrending = false;
        await product.save();
        return (0, ApiResponseHandler_1.handleSuccess)(res, {
            product: {
                id: product._id,
                name: product.name,
                isTrending: product.isTrending
            }
        }, "Product removed from trending successfully");
    }
    catch (error) {
        return (0, ApiResponseHandler_1.handleError)(res, error);
    }
});
// GET /api/trending/status - Get trending status for a gender
router.get("/status", async (req, res) => {
    try {
        const { gender } = req.query;
        if (!gender) {
            return (0, ApiResponseHandler_1.handleError)(res, { message: "Gender parameter is required" });
        }
        const limit = getLayoutLimit(gender);
        // Count trending products for this gender
        const count = await Product_1.default.countDocuments({
            isActive: true,
            isTrending: true,
            "category.gender": gender
        });
        const availableSlots = limit - count;
        const isComplete = count >= limit;
        const percentage = Math.round((count / limit) * 100);
        return (0, ApiResponseHandler_1.handleSuccess)(res, {
            gender,
            limit,
            current: count,
            availableSlots,
            isComplete,
            percentage
        }, "Trending status retrieved successfully");
    }
    catch (error) {
        return (0, ApiResponseHandler_1.handleError)(res, error);
    }
});
module.exports = router;
