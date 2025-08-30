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
// Kids-specific limits
const KIDS_TRENDING_LIMIT = 3;
const KIDS_BESTSELLER_LIMIT = 3;
// GET /api/kids/trending - Get kids trending products (limit 3)
router.get("/trending", async (req, res) => {
    try {
        // Build filter object for kids trending
        const filter = {
            isActive: true,
            isTrending: true,
            "category.gender": "kids"
        };
        // Get kids trending products
        const products = await Product_1.default.find(filter)
            .sort({ "rating.average": -1, "rating.count": -1 })
            .limit(KIDS_TRENDING_LIMIT)
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
            gender: "kids",
            limit: KIDS_TRENDING_LIMIT,
            total: transformedProducts.length,
            availableSlots: KIDS_TRENDING_LIMIT - transformedProducts.length,
            isComplete: transformedProducts.length >= KIDS_TRENDING_LIMIT
        }, "Kids trending products retrieved successfully");
    }
    catch (error) {
        return (0, ApiResponseHandler_1.handleError)(res, error);
    }
});
// GET /api/kids/bestseller - Get kids bestseller products (limit 3)
router.get("/bestseller", async (req, res) => {
    try {
        // Build filter object for kids bestseller
        const filter = {
            isActive: true,
            isBestseller: true,
            "category.gender": "kids"
        };
        // Get kids bestseller products
        const products = await Product_1.default.find(filter)
            .sort({ "rating.average": -1, "rating.count": -1 })
            .limit(KIDS_BESTSELLER_LIMIT)
            .populate("category", "gender type colors")
            .select("name media category slug rating isBestseller");
        // Transform data for frontend
        const transformedProducts = products.map(product => ({
            title: product.name,
            src: product.media.thumbnail,
            slug: product.slug,
            id: product._id,
            rating: product.rating,
            isBestseller: product.isBestseller
        }));
        return (0, ApiResponseHandler_1.handleSuccess)(res, {
            products: transformedProducts,
            gender: "kids",
            limit: KIDS_BESTSELLER_LIMIT,
            total: transformedProducts.length,
            availableSlots: KIDS_BESTSELLER_LIMIT - transformedProducts.length,
            isComplete: transformedProducts.length >= KIDS_BESTSELLER_LIMIT
        }, "Kids bestseller products retrieved successfully");
    }
    catch (error) {
        return (0, ApiResponseHandler_1.handleError)(res, error);
    }
});
// POST /api/kids/trending/:productId - Add product to kids trending (requires auth)
router.post("/trending/:productId", auth_1.auth, async (req, res) => {
    try {
        const { productId } = req.params;
        const product = await Product_1.default.findById(productId);
        if (!product) {
            return (0, ApiResponseHandler_1.handleError)(res, { message: "Product not found" });
        }
        if (!product.isActive) {
            return (0, ApiResponseHandler_1.handleError)(res, { message: "Product is not active" });
        }
        if (product.category.gender !== "kids") {
            return (0, ApiResponseHandler_1.handleError)(res, { message: "Product must be from kids category" });
        }
        // Count existing kids trending products
        const existingCount = await Product_1.default.countDocuments({
            isTrending: true,
            "category.gender": "kids"
        });
        if (existingCount >= KIDS_TRENDING_LIMIT) {
            return (0, ApiResponseHandler_1.handleError)(res, {
                message: `Maximum ${KIDS_TRENDING_LIMIT} trending products already added for kids`
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
        }, "Product added to kids trending successfully");
    }
    catch (error) {
        return (0, ApiResponseHandler_1.handleError)(res, error);
    }
});
// DELETE /api/kids/trending/:productId - Remove product from kids trending (requires auth)
router.delete("/trending/:productId", auth_1.auth, async (req, res) => {
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
        }, "Product removed from kids trending successfully");
    }
    catch (error) {
        return (0, ApiResponseHandler_1.handleError)(res, error);
    }
});
// POST /api/kids/bestseller/:productId - Add product to kids bestseller (requires auth)
router.post("/bestseller/:productId", auth_1.auth, async (req, res) => {
    try {
        const { productId } = req.params;
        const product = await Product_1.default.findById(productId);
        if (!product) {
            return (0, ApiResponseHandler_1.handleError)(res, { message: "Product not found" });
        }
        if (!product.isActive) {
            return (0, ApiResponseHandler_1.handleError)(res, { message: "Product is not active" });
        }
        if (product.category.gender !== "kids") {
            return (0, ApiResponseHandler_1.handleError)(res, { message: "Product must be from kids category" });
        }
        // Count existing kids bestseller products
        const existingCount = await Product_1.default.countDocuments({
            isBestseller: true,
            "category.gender": "kids"
        });
        if (existingCount >= KIDS_BESTSELLER_LIMIT) {
            return (0, ApiResponseHandler_1.handleError)(res, {
                message: `Maximum ${KIDS_BESTSELLER_LIMIT} bestseller products already added for kids`
            });
        }
        // Add to bestseller
        product.isBestseller = true;
        await product.save();
        return (0, ApiResponseHandler_1.handleSuccess)(res, {
            product: {
                id: product._id,
                name: product.name,
                isBestseller: product.isBestseller
            }
        }, "Product added to kids bestseller successfully");
    }
    catch (error) {
        return (0, ApiResponseHandler_1.handleError)(res, error);
    }
});
// DELETE /api/kids/bestseller/:productId - Remove product from kids bestseller (requires auth)
router.delete("/bestseller/:productId", auth_1.auth, async (req, res) => {
    try {
        const { productId } = req.params;
        const product = await Product_1.default.findById(productId);
        if (!product) {
            return (0, ApiResponseHandler_1.handleError)(res, { message: "Product not found" });
        }
        // Remove from bestseller
        product.isBestseller = false;
        await product.save();
        return (0, ApiResponseHandler_1.handleSuccess)(res, {
            product: {
                id: product._id,
                name: product.name,
                isBestseller: product.isBestseller
            }
        }, "Product removed from kids bestseller successfully");
    }
    catch (error) {
        return (0, ApiResponseHandler_1.handleError)(res, error);
    }
});
// GET /api/kids/status - Get kids trending and bestseller status
router.get("/status", async (req, res) => {
    try {
        // Count kids trending products
        const trendingCount = await Product_1.default.countDocuments({
            isActive: true,
            isTrending: true,
            "category.gender": "kids"
        });
        // Count kids bestseller products
        const bestsellerCount = await Product_1.default.countDocuments({
            isActive: true,
            isBestseller: true,
            "category.gender": "kids"
        });
        return (0, ApiResponseHandler_1.handleSuccess)(res, {
            gender: "kids",
            trending: {
                limit: KIDS_TRENDING_LIMIT,
                current: trendingCount,
                availableSlots: KIDS_TRENDING_LIMIT - trendingCount,
                isComplete: trendingCount >= KIDS_TRENDING_LIMIT,
                percentage: Math.round((trendingCount / KIDS_TRENDING_LIMIT) * 100)
            },
            bestseller: {
                limit: KIDS_BESTSELLER_LIMIT,
                current: bestsellerCount,
                availableSlots: KIDS_BESTSELLER_LIMIT - bestsellerCount,
                isComplete: bestsellerCount >= KIDS_BESTSELLER_LIMIT,
                percentage: Math.round((bestsellerCount / KIDS_BESTSELLER_LIMIT) * 100)
            }
        }, "Kids status retrieved successfully");
    }
    catch (error) {
        return (0, ApiResponseHandler_1.handleError)(res, error);
    }
});
module.exports = router;
