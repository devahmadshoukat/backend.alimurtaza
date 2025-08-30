"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const Product_1 = __importDefault(require("../models/Product"));
const router = express_1.default.Router();
// Baby trending limit: 8 products (4x4 layout)
const BABY_TRENDING_LIMIT = 8;
// Baby collection limit: 1 product
const BABY_COLLECTION_LIMIT = 1;
// GET /api/baby/trending - Get baby trending products
router.get('/trending', async (req, res) => {
    try {
        const trendingProducts = await Product_1.default.find({
            'category.gender': 'baby',
            isTrending: true
        }).limit(BABY_TRENDING_LIMIT);
        res.json({
            success: true,
            data: {
                products: trendingProducts,
                limit: BABY_TRENDING_LIMIT,
                current: trendingProducts.length
            }
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch baby trending products'
        });
    }
});
// POST /api/baby/trending/:productId - Add product to baby trending
router.post('/trending/:productId', async (req, res) => {
    try {
        const { productId } = req.params;
        // Check if product exists and is baby gender
        const product = await Product_1.default.findById(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }
        if (product.category.gender !== 'baby') {
            return res.status(400).json({
                success: false,
                message: 'Product must be baby gender'
            });
        }
        // Check current trending count
        const currentTrending = await Product_1.default.countDocuments({
            'category.gender': 'baby',
            isTrending: true
        });
        if (currentTrending >= BABY_TRENDING_LIMIT) {
            return res.status(400).json({
                success: false,
                message: `Baby trending is full. Maximum ${BABY_TRENDING_LIMIT} products allowed.`
            });
        }
        // Add to trending
        product.isTrending = true;
        await product.save();
        res.json({
            success: true,
            message: 'Product added to baby trending successfully'
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to add product to baby trending'
        });
    }
});
// DELETE /api/baby/trending/:productId - Remove product from baby trending
router.delete('/trending/:productId', async (req, res) => {
    try {
        const { productId } = req.params;
        const product = await Product_1.default.findById(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }
        product.isTrending = false;
        await product.save();
        res.json({
            success: true,
            message: 'Product removed from baby trending successfully'
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to remove product from baby trending'
        });
    }
});
// GET /api/baby/collection - Get baby collection (1 product)
router.get('/collection', async (req, res) => {
    try {
        const collectionProduct = await Product_1.default.findOne({
            'category.gender': 'baby',
            isFeatured: true
        }).limit(BABY_COLLECTION_LIMIT);
        res.json({
            success: true,
            data: {
                product: collectionProduct,
                limit: BABY_COLLECTION_LIMIT
            }
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch baby collection'
        });
    }
});
// POST /api/baby/collection/:productId - Add product to baby collection
router.post('/collection/:productId', async (req, res) => {
    try {
        const { productId } = req.params;
        // Check if product exists and is baby gender
        const product = await Product_1.default.findById(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }
        if (product.category.gender !== 'baby') {
            return res.status(400).json({
                success: false,
                message: 'Product must be baby gender'
            });
        }
        // Remove any existing collection product
        await Product_1.default.updateMany({ 'category.gender': 'baby', isFeatured: true }, { $set: { isFeatured: false } });
        // Add new product to collection
        product.isFeatured = true;
        await product.save();
        res.json({
            success: true,
            message: 'Product added to baby collection successfully'
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to add product to baby collection'
        });
    }
});
// DELETE /api/baby/collection/:productId - Remove product from baby collection
router.delete('/collection/:productId', async (req, res) => {
    try {
        const { productId } = req.params;
        const product = await Product_1.default.findById(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }
        product.isFeatured = false;
        await product.save();
        res.json({
            success: true,
            message: 'Product removed from baby collection successfully'
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to remove product from baby collection'
        });
    }
});
// GET /api/baby/status - Get baby trending and collection status
router.get('/status', async (req, res) => {
    try {
        const trendingCount = await Product_1.default.countDocuments({
            'category.gender': 'baby',
            isTrending: true
        });
        const collectionCount = await Product_1.default.countDocuments({
            'category.gender': 'baby',
            isFeatured: true
        });
        const trendingStatus = {
            current: trendingCount,
            limit: BABY_TRENDING_LIMIT,
            availableSlots: Math.max(0, BABY_TRENDING_LIMIT - trendingCount),
            isComplete: trendingCount >= BABY_TRENDING_LIMIT,
            percentage: Math.round((trendingCount / BABY_TRENDING_LIMIT) * 100)
        };
        const collectionStatus = {
            current: collectionCount,
            limit: BABY_COLLECTION_LIMIT,
            availableSlots: Math.max(0, BABY_COLLECTION_LIMIT - collectionCount),
            isComplete: collectionCount >= BABY_COLLECTION_LIMIT,
            percentage: Math.round((collectionCount / BABY_COLLECTION_LIMIT) * 100)
        };
        res.json({
            success: true,
            data: {
                trending: trendingStatus,
                collection: collectionStatus
            }
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch baby status'
        });
    }
});
module.exports = router;
