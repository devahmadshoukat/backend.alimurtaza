import express from "express";
import { handleSuccess, handleError } from "../utils/ApiResponseHandler";
import Hero from "../models/Hero";
import { auth } from "../middleware/auth";

const router = express.Router();





// GET /api/hero - Get all active hero sections
router.get("/", async (req, res) => {
  try {
    const { gender } = req.query;
    
    let query: any = { isActive: true };
    if (gender && ["men", "women", "kids", "baby"].includes(gender as string)) {
      query = { ...query, gender: gender as string };
    }
    
    // Get all active hero sections (filtered by gender if provided)
    const heroes = await Hero.find(query)
      .sort({ createdAt: -1 })
      .select("media");

    return handleSuccess(res, {
      heroes,
      total: heroes.length
    }, "Hero sections retrieved successfully");

  } catch (error: any) {
    return handleError(res, error);
  }
});

// POST /api/hero - Create new hero section (requires auth)
router.post("/", auth, async (req: any, res) => {
  try {
    const { media, gender } = req.body;

    // Validate required fields
    if (!media || !media.type || !media.src) {
      return handleError(res, { 
        message: "Media (type, src) is required" 
      });
    }

    if (!gender || !["men", "women", "kids", "baby"].includes(gender)) {
      return handleError(res, { 
        message: "Gender is required and must be 'men', 'women', 'kids', or 'baby'" 
      });
    }

    // Validate media type
    if (!["image", "video"].includes(media.type)) {
      return handleError(res, { 
        message: "Media type must be 'image' or 'video'" 
      });
    }

    // Create new hero section
    const hero = new Hero({
      media,
      gender,
      isActive: true
    });

    await hero.save();

    return handleSuccess(res, {
      hero: {
        id: hero._id,
        media: hero.media,
        isActive: hero.isActive
      }
    }, "Hero section created successfully");

  } catch (error: any) {
    return handleError(res, error);
  }
});

// PUT /api/hero/:id - Update hero section (requires auth)
router.put("/:id", auth, async (req: any, res) => {
  try {
    const { id } = req.params;
    const { media, gender, isActive } = req.body;

    const hero = await Hero.findById(id);
    if (!hero) {
      return handleError(res, { message: "Hero section not found" });
    }

    // Update fields if provided
    if (media !== undefined) {
      if (media.type && !["image", "video"].includes(media.type)) {
        return handleError(res, { 
          message: "Media type must be 'image' or 'video'" 
        });
      }
      hero.media = media;
    }
    if (gender !== undefined) {
      if (!["men", "women", "kids", "baby"].includes(gender)) {
        return handleError(res, { 
          message: "Gender must be 'men', 'women', 'kids', or 'baby'" 
        });
      }
      hero.gender = gender;
    }
    if (isActive !== undefined) hero.isActive = Boolean(isActive);

    await hero.save();

    return handleSuccess(res, {
      hero: {
        id: hero._id,
        media: hero.media,
        isActive: hero.isActive
      }
    }, "Hero section updated successfully");

  } catch (error: any) {
    return handleError(res, error);
  }
});

// DELETE /api/hero/:id - Delete hero section (requires auth)
router.delete("/:id", auth, async (req: any, res) => {
  try {
    const { id } = req.params;

    const hero = await Hero.findById(id);
    if (!hero) {
      return handleError(res, { message: "Hero section not found" });
    }

    await Hero.findByIdAndDelete(id);

    return handleSuccess(res, {
      message: "Hero section deleted successfully"
    }, "Hero section deleted successfully");

  } catch (error: any) {
    return handleError(res, error);
  }
});

// GET /api/hero/all - Get all hero sections for admin (requires auth)
router.get("/all", auth, async (req: any, res) => {
  try {
    const { page = 1, limit = 20, gender } = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    // Build query
    let query: any = {};
    if (gender && ["men", "women", "kids", "baby"].includes(gender as string)) {
      query.gender = gender;
    }

    // Get hero sections with pagination
    const heroes = await Hero.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .select("media gender isActive createdAt");

    // Get total count
    const total = await Hero.countDocuments(query);

    return handleSuccess(res, {
      heroes,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    }, "All hero sections retrieved successfully");

  } catch (error: any) {
    return handleError(res, error);
  }
});

export default router;
