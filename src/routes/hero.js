"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const ApiResponseHandler_1 = require("../utils/ApiResponseHandler");
const Hero_1 = __importDefault(require("../models/Hero"));
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// GET /api/hero - Get all active hero sections
router.get("/", async (req, res) => {
    try {
        const { gender } = req.query;
        let query = { isActive: true };
        if (gender && ["men", "women", "kids", "baby"].includes(gender)) {
            query = { ...query, gender: gender };
        }
        // Get all active hero sections (filtered by gender if provided)
        const heroes = await Hero_1.default.find(query)
            .sort({ createdAt: -1 })
            .select("media");
        return (0, ApiResponseHandler_1.handleSuccess)(res, {
            heroes,
            total: heroes.length
        }, "Hero sections retrieved successfully");
    }
    catch (error) {
        return (0, ApiResponseHandler_1.handleError)(res, error);
    }
});
// POST /api/hero - Create new hero section (requires auth)
router.post("/", auth_1.auth, async (req, res) => {
    try {
        const { media, gender } = req.body;
        // Validate required fields
        if (!media || !media.type || !media.src) {
            return (0, ApiResponseHandler_1.handleError)(res, {
                message: "Media (type, src) is required"
            });
        }
        if (!gender || !["men", "women", "kids", "baby"].includes(gender)) {
            return (0, ApiResponseHandler_1.handleError)(res, {
                message: "Gender is required and must be 'men', 'women', 'kids', or 'baby'"
            });
        }
        // Validate media type
        if (!["image", "video"].includes(media.type)) {
            return (0, ApiResponseHandler_1.handleError)(res, {
                message: "Media type must be 'image' or 'video'"
            });
        }
        // Create new hero section
        const hero = new Hero_1.default({
            media,
            gender,
            isActive: true
        });
        await hero.save();
        return (0, ApiResponseHandler_1.handleSuccess)(res, {
            hero: {
                id: hero._id,
                media: hero.media,
                isActive: hero.isActive
            }
        }, "Hero section created successfully");
    }
    catch (error) {
        return (0, ApiResponseHandler_1.handleError)(res, error);
    }
});
// PUT /api/hero/:id - Update hero section (requires auth)
router.put("/:id", auth_1.auth, async (req, res) => {
    try {
        const { id } = req.params;
        const { media, gender, isActive } = req.body;
        const hero = await Hero_1.default.findById(id);
        if (!hero) {
            return (0, ApiResponseHandler_1.handleError)(res, { message: "Hero section not found" });
        }
        // Update fields if provided
        if (media !== undefined) {
            if (media.type && !["image", "video"].includes(media.type)) {
                return (0, ApiResponseHandler_1.handleError)(res, {
                    message: "Media type must be 'image' or 'video'"
                });
            }
            hero.media = media;
        }
        if (gender !== undefined) {
            if (!["men", "women", "kids", "baby"].includes(gender)) {
                return (0, ApiResponseHandler_1.handleError)(res, {
                    message: "Gender must be 'men', 'women', 'kids', or 'baby'"
                });
            }
            hero.gender = gender;
        }
        if (isActive !== undefined)
            hero.isActive = Boolean(isActive);
        await hero.save();
        return (0, ApiResponseHandler_1.handleSuccess)(res, {
            hero: {
                id: hero._id,
                media: hero.media,
                isActive: hero.isActive
            }
        }, "Hero section updated successfully");
    }
    catch (error) {
        return (0, ApiResponseHandler_1.handleError)(res, error);
    }
});
// DELETE /api/hero/:id - Delete hero section (requires auth)
router.delete("/:id", auth_1.auth, async (req, res) => {
    try {
        const { id } = req.params;
        const hero = await Hero_1.default.findById(id);
        if (!hero) {
            return (0, ApiResponseHandler_1.handleError)(res, { message: "Hero section not found" });
        }
        await Hero_1.default.findByIdAndDelete(id);
        return (0, ApiResponseHandler_1.handleSuccess)(res, {
            message: "Hero section deleted successfully"
        }, "Hero section deleted successfully");
    }
    catch (error) {
        return (0, ApiResponseHandler_1.handleError)(res, error);
    }
});
// GET /api/hero/all - Get all hero sections for admin (requires auth)
router.get("/all", auth_1.auth, async (req, res) => {
    try {
        const { page = 1, limit = 20, gender } = req.query;
        const skip = (Number(page) - 1) * Number(limit);
        // Build query
        let query = {};
        if (gender && ["men", "women", "kids", "baby"].includes(gender)) {
            query.gender = gender;
        }
        // Get hero sections with pagination
        const heroes = await Hero_1.default.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(Number(limit))
            .select("media gender isActive createdAt");
        // Get total count
        const total = await Hero_1.default.countDocuments(query);
        return (0, ApiResponseHandler_1.handleSuccess)(res, {
            heroes,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                pages: Math.ceil(total / Number(limit))
            }
        }, "All hero sections retrieved successfully");
    }
    catch (error) {
        return (0, ApiResponseHandler_1.handleError)(res, error);
    }
});
module.exports = router;
