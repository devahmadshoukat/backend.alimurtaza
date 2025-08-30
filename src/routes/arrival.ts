import express from "express";
import { handleSuccess, handleError } from "../utils/ApiResponseHandler";
import Product from "../models/Product";
import { auth } from "../middleware/auth";

const router = express.Router();

// GET /api/arrival/newest - Get newest arrivals (curated list)
router.get("/newest", async (req, res) => {
  try {
    const { gender, limit = 10, page = 1 } = req.query;
    
    // Build filter object - get products marked as newest
    const filter: any = { isActive: true, isNewest: true };
    if (gender) {
      filter["category.gender"] = gender;
    }

    // Get newest products sorted by creation date
    const products = await Product.find(filter)
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .populate("category", "gender type colors")
      .select("name price media category slug rating isFeatured isNewest createdAt");

    // Transform data for frontend
    const transformedProducts = products.map(product => ({
      title: product.name,
      src: product.media.thumbnail,
      price: `PKR ${product.price.current}`,
      oldPrice: product.price.old ? `PKR ${product.price.old}` : null,
      slug: product.slug,
      id: product._id,
      rating: product.rating,
      isFeatured: product.isFeatured,
      isNewest: product.isNewest,
      createdAt: product.createdAt
    }));

    const total = await Product.countDocuments(filter);

    return handleSuccess(res, {
      products: transformedProducts,
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / Number(limit))
    }, "Newest arrivals retrieved successfully");

  } catch (error: any) {
    return handleError(res, error);
  }
});

// GET /api/arrival/bestseller - Get bestseller products
router.get("/bestseller", async (req, res) => {
  try {
    const { gender, limit = 10, page = 1 } = req.query;
    
    // Build filter object
    const filter: any = { isActive: true, isBestseller: true };
    if (gender) {
      filter["category.gender"] = gender;
    }

    // Get bestseller products sorted by rating and sales
    const products = await Product.find(filter)
      .sort({ "rating.average": -1, "rating.count": -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .populate("category", "gender type colors")
      .select("name price media category slug rating isFeatured isBestseller");

    // Transform data for frontend
    const transformedProducts = products.map(product => ({
      title: product.name,
      src: product.media.thumbnail,
      price: `PKR ${product.price.current}`,
      oldPrice: product.price.old ? `PKR ${product.price.old}` : null,
      slug: product.slug,
      id: product._id,
      rating: product.rating,
      isFeatured: product.isFeatured,
      isBestseller: product.isBestseller
    }));

    const total = await Product.countDocuments(filter);

    return handleSuccess(res, {
      products: transformedProducts,
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / Number(limit))
    }, "Bestseller products retrieved successfully");

  } catch (error: any) {
    return handleError(res, error);
  }
});

// POST /api/arrival/bestseller/:productId - Add product to bestseller (requires auth)
router.post("/bestseller/:productId", auth, async (req, res) => {
  try {
    const { productId } = req.params;

    const product = await Product.findById(productId);
    if (!product) {
      return handleError(res, { message: "Product not found" });
    }

    if (!product.isActive) {
      return handleError(res, { message: "Product is not active" });
    }

    // Add to bestseller
    product.isBestseller = true;
    await product.save();

    return handleSuccess(res, {
      product: {
        id: product._id,
        name: product.name,
        isBestseller: product.isBestseller
      }
    }, "Product added to bestseller successfully");

  } catch (error: any) {
    return handleError(res, error);
  }
});

// DELETE /api/arrival/bestseller/:productId - Remove product from bestseller (requires auth)
router.delete("/bestseller/:productId", auth, async (req, res) => {
  try {
    const { productId } = req.params;

    const product = await Product.findById(productId);
    if (!product) {
      return handleError(res, { message: "Product not found" });
    }

    // Remove from bestseller
    product.isBestseller = false;
    await product.save();

    return handleSuccess(res, {
      product: {
        id: product._id,
        name: product.name,
        isBestseller: product.isBestseller
      }
    }, "Product removed from bestseller successfully");

  } catch (error: any) {
    return handleError(res, error);
  }
});

// POST /api/arrival/newest/:productId - Add product to newest arrivals (requires auth)
router.post("/newest/:productId", auth, async (req, res) => {
  try {
    const { productId } = req.params;

    const product = await Product.findById(productId);
    if (!product) {
      return handleError(res, { message: "Product not found" });
    }

    if (!product.isActive) {
      return handleError(res, { message: "Product is not active" });
    }

    // Add to newest arrivals
    product.isNewest = true;
    await product.save();

    return handleSuccess(res, {
      product: {
        id: product._id,
        name: product.name,
        isNewest: product.isNewest
      }
    }, "Product added to newest arrivals successfully");

  } catch (error: any) {
    return handleError(res, error);
  }
});

// DELETE /api/arrival/newest/:productId - Remove product from newest arrivals (requires auth)
router.delete("/newest/:productId", auth, async (req, res) => {
  try {
    const { productId } = req.params;

    const product = await Product.findById(productId);
    if (!product) {
      return handleError(res, { message: "Product not found" });
    }

    // Remove from newest arrivals
    product.isNewest = false;
    await product.save();

    return handleSuccess(res, {
      product: {
        id: product._id,
        name: product.name,
        isNewest: product.isNewest
      }
    }, "Product removed from newest arrivals successfully");

  } catch (error: any) {
    return handleError(res, error);
  }
});

export default router;
