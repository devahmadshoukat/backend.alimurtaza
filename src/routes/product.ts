import { Router, Request, Response } from "express";
import Product, { Gender } from "../models/Product";
import { z } from "zod";
import { auth } from "../middleware/auth";

const router = Router();

// -------------------- Validation Schemas --------------------
const CreateProductSchema = z.object({
    name: z.string().min(1, "Product name is required"),
    price: z.object({
        current: z.number().positive("Price must be positive"),
        old: z.number().positive().optional(),
        discountPercentage: z.number().min(0).max(100).optional(),
    }),
    category: z.object({
        gender: z.enum(["men", "women", "kids", "baby"]),
        type: z.array(z.string()).min(1, "At least one category type is required"),
        colors: z.array(z.object({
            colorName: z.string().min(1, "Color name is required"),
            images: z.array(z.string()).min(1, "At least one image is required"),
            sizes: z.array(z.object({
                name: z.string().min(1, "Size name is required"),
                stock: z.number().min(0, "Stock cannot be negative"),
                sku: z.string().optional(),
            })).optional(),
        })).min(1, "At least one color is required"),
    }),
    media: z.object({
        thumbnail: z.string().min(1, "Thumbnail is required"),
    }),
    fabricImages: z.array(z.string()).min(1, "At least one fabric image is required"),
    isFeatured: z.boolean().optional(),
    isActive: z.boolean().optional(),
    tags: z.array(z.string()).optional(),
});

const UpdateProductSchema = CreateProductSchema.partial();

const StockUpdateSchema = z.object({
    colorName: z.string().min(1, "Color name is required"),
    sizeName: z.string().min(1, "Size name is required"),
    quantity: z.number().min(0, "Quantity cannot be negative"),
});

// -------------------- Error Handler --------------------
const handleError = (res: Response, error: any, statusCode: number = 500) => {
    console.error("API Error:", error);
    
    if (error.name === "ValidationError") {
        return res.status(400).json({
            success: false,
            error: "Validation Error",
            details: Object.values(error.errors).map((err: any) => err.message)
        });
    }
    
    if (error.name === "CastError") {
        return res.status(400).json({
            success: false,
            error: "Invalid ID format"
        });
    }
    
    if (error.code === 11000) {
        return res.status(409).json({
            success: false,
            error: "Duplicate entry - this product already exists"
        });
    }
    
    return res.status(statusCode).json({
        success: false,
        error: error.message || "Internal server error"
    });
};

// -------------------- Success Response Helper --------------------
const successResponse = (res: Response, data: any, message: string = "Success", statusCode: number = 200) => {
    return res.status(statusCode).json({
        success: true,
        message,
        data,
        timestamp: new Date().toISOString()
    });
};

// -------------------- CREATE PRODUCT -------------------
router.post("/", auth, async (req: Request, res: Response) => {
    try {
        const validatedData = CreateProductSchema.parse(req.body);
        
        // Check if a soft-deleted product with the same name exists
        const existingProduct = await Product.findOne({ 
            name: validatedData.name,
            isActive: false 
        });
        
        let product;
        
        if (existingProduct) {
            // Ask user if they want to restore the existing product or create a new one
            const { restore } = req.body;
            
            if (restore === true) {
                // Restore the existing product with new data
                Object.assign(existingProduct, validatedData);
                existingProduct.isActive = true;
                existingProduct.stock = 0; // Reset stock to be recalculated
        
        // Auto-calculate total stock
                for (const color of existingProduct.category.colors) {
            if (color.sizes && color.sizes.length > 0) {
                        existingProduct.stock += color.sizes.reduce((sum, size) => sum + (size.stock || 0), 0);
                    } else {
                        existingProduct.stock += 1; // Default stock for color-only variant
                    }
                }
                
                await existingProduct.save();
                product = existingProduct;
                
                return successResponse(res, product, "Product restored successfully", 200);
            } else {
                // Create a new product with a modified name to avoid slug conflict
                const timestamp = Date.now();
                const newName = `${validatedData.name} (${timestamp})`;
                const productData = {
                    ...validatedData,
                    name: newName,
                    stock: 0
                };
                
                // Auto-calculate total stock
                for (const color of productData.category.colors) {
                    if (color.sizes && color.sizes.length > 0) {
                        productData.stock += color.sizes.reduce((sum, size) => sum + (size.stock || 0), 0);
                    } else {
                        productData.stock += 1; // Default stock for color-only variant
                    }
                }
                
                product = await Product.create(productData);
                
                return successResponse(res, product, "Product created with modified name to avoid conflict", 201);
            }
        } else {
            // No conflict, create normally
        const productData = {
            ...validatedData,
                stock: 0
            };
            
            // Auto-calculate total stock
            for (const color of productData.category.colors) {
                if (color.sizes && color.sizes.length > 0) {
                    productData.stock += color.sizes.reduce((sum, size) => sum + (size.stock || 0), 0);
                } else {
                    productData.stock += 1; // Default stock for color-only variant
                }
            }
            
            product = await Product.create(productData);
        
        return successResponse(res, product, "Product created successfully", 201);
        }
    } catch (error) {
        return handleError(res, error);
    }
});

// -------------------- GET ALL PRODUCTS WITH ADVANCED FILTERING -------------------
router.get("/", async (req: Request, res: Response) => {
    try {
        const {
            gender,
            category,
            minPrice,
            maxPrice,
            inStock,
            featured,
            page = 1,
            limit = 20,
            sort = "createdAt",
            order = "desc",
            search
        } = req.query;

        // Build filter
        const filter: any = { isActive: true };
        
        if (gender && ["men", "women", "kids", "baby"].includes(gender as string)) {
            filter["category.gender"] = gender;
        }
        
        if (category) {
            filter["category.type"] = { $in: Array.isArray(category) ? category : [category] };
        }
        
        if (minPrice || maxPrice) {
            filter["price.current"] = {};
            if (minPrice) filter["price.current"].$gte = Number(minPrice);
            if (maxPrice) filter["price.current"].$lte = Number(maxPrice);
        }
        
        if (inStock === "true") {
            filter.stock = { $gt: 0 };
        }
        
        if (featured === "true") {
            filter.isFeatured = true;
        }
        
        if (search) {
            filter.$text = { $search: search as string };
        }

        // Pagination
        const skip = (Number(page) - 1) * Number(limit);
        const sortOrder = order === "asc" ? 1 : -1;

        // Build sort object
        let sortObject: any = {};
        if (sort === "price") {
            sortObject["price.current"] = sortOrder;
        } else {
            sortObject[sort as string] = sortOrder;
        }

        // Execute query
        const products = await Product.find(filter)
            .sort(sortObject)
            .skip(skip)
            .limit(Number(limit))
            .select("name slug price category media seo rating isFeatured isBestseller isNewest isTrending trendingLayout stock fabricImages");

        const total = await Product.countDocuments(filter);

        // Calculate stock summary
        const stockSummary = {
            totalProducts: total,
            inStock: await Product.countDocuments({ ...filter, stock: { $gt: 0 } }),
            outOfStock: await Product.countDocuments({ ...filter, stock: 0 }),
            lowStock: await Product.countDocuments({ ...filter, stock: { $gt: 0, $lte: 10 } })
        };

        return successResponse(res, {
            products,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                pages: Math.ceil(total / Number(limit)),
                hasNext: skip + products.length < total,
                hasPrev: Number(page) > 1
            },
            filters: {
                gender,
                category,
                minPrice,
                maxPrice,
                inStock,
                featured,
                search
            },
            stockSummary
        });
    } catch (error) {
        return handleError(res, error);
    }
});

// -------------------- GET PRODUCTS BY GENDER -------------------
router.get("/gender/:gender", async (req: Request, res: Response) => {
    try {
        const { gender } = req.params;
        const {
            category,
            minPrice,
            maxPrice,
            inStock,
            featured,
            page = 1,
            limit = 20,
            sort = "createdAt",
            order = "desc",
            search
        } = req.query;

        // Validate gender
        if (!["men", "women", "kids", "baby"].includes(gender)) {
            return res.status(400).json({
                success: false,
                error: "Invalid gender",
                message: "Gender must be one of: men, women, kids, baby"
            });
        }

        // Build filter
        const filter: any = { 
            isActive: true,
            "category.gender": gender 
        };
        
        if (category) {
            filter["category.type"] = { $in: Array.isArray(category) ? category : [category] };
        }
        
        if (minPrice || maxPrice) {
            filter["price.current"] = {};
            if (minPrice) filter["price.current"].$gte = Number(minPrice);
            if (maxPrice) filter["price.current"].$lte = Number(maxPrice);
        }
        
        if (inStock === "true") {
            filter.stock = { $gt: 0 };
        }
        
        if (featured === "true") {
            filter.isFeatured = true;
        }
        
        if (search) {
            filter.$text = { $search: search as string };
        }

        // Pagination
        const skip = (Number(page) - 1) * Number(limit);
        const sortOrder = order === "asc" ? 1 : -1;

        // Build sort object
        let sortObject: any = {};
        if (sort === "price") {
            sortObject["price.current"] = sortOrder;
        } else {
            sortObject[sort as string] = sortOrder;
        }

        // Execute query
        const products = await Product.find(filter)
            .sort(sortObject)
            .skip(skip)
            .limit(Number(limit))
            .select("name slug price category media seo rating isFeatured isBestseller isNewest isTrending trendingLayout stock fabricImages");

        const total = await Product.countDocuments(filter);

        // Calculate stock summary
        const stockSummary = {
            totalProducts: total,
            inStock: await Product.countDocuments({ ...filter, stock: { $gt: 0 } }),
            outOfStock: await Product.countDocuments({ ...filter, stock: 0 }),
            lowStock: await Product.countDocuments({ ...filter, stock: { $gt: 0, $lte: 10 } })
        };

        return successResponse(res, {
            products,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                pages: Math.ceil(total / Number(limit)),
                hasNext: skip + products.length < total,
                hasPrev: Number(page) > 1
            },
            filters: {
                gender,
                category,
                minPrice,
                maxPrice,
                inStock,
                featured,
                search
            },
            stockSummary,
            gender
        }, `${gender.charAt(0).toUpperCase() + gender.slice(1)}'s products retrieved successfully`);
    } catch (error) {
        return handleError(res, error);
    }
});

// -------------------- GET PRODUCT BY ID -------------------
router.get("/id/:id", async (req: Request, res: Response) => {
    try {
        const product = await Product.findOne({ _id: req.params.id, isActive: true });
        
        if (!product) {
            return res.status(404).json({
                success: false,
                error: "Product not found"
            });
        }

        // Get available variants
        const variants = product.getAvailableVariants();
        
        return successResponse(res, {
            product,
            variants,
            stockInfo: {
                totalStock: product.stock,
                inStock: product.isInStock(),
                availableVariants: variants.filter(v => v.stock > 0).length,
                totalVariants: variants.length
            }
        });
    } catch (error) {
        return handleError(res, error);
    }
});

// -------------------- GET PRODUCT BY SLUG -------------------
router.get("/slug/:slug", async (req: Request, res: Response) => {
    try {
        const product = await Product.findOne({ slug: req.params.slug, isActive: true });
        
        if (!product) {
            return res.status(404).json({
                success: false,
                error: "Product not found"
            });
        }

        // Get related products
        const relatedProducts = await Product.find({
            "category.gender": product.category.gender,
            "category.type": { $in: product.category.type },
            _id: { $ne: product._id },
            isActive: true
        })
        .limit(6)
        .select("name slug price category media seo rating isBestseller isNewest stock fabricImages");

        // Get available variants
        const variants = product.getAvailableVariants();

        return successResponse(res, {
            product,
            variants,
            relatedProducts,
            stockInfo: {
                totalStock: product.stock,
                inStock: product.isInStock(),
                availableVariants: variants.filter(v => v.stock > 0).length,
                totalVariants: variants.length
            },
            seo: {
                title: product.seo?.metaTitle || product.seo?.title,
                description: product.seo?.metaDescription || product.seo?.description,
                keywords: product.seo?.keywords,
                canonical: `/product/${product.slug}`
            }
        });
    } catch (error) {
        return handleError(res, error);
    }
});

// -------------------- GET PRODUCT BY SKU -------------------
router.get("/sku/:sku", async (req: Request, res: Response) => {
    try {
        const product = await Product.findOne({ "category.colors.sizes.sku": req.params.sku, isActive: true });
        
        if (!product) {
            return res.status(404).json({
                success: false,
                error: "Product variant not found"
            });
        }

        // Find the specific variant
        let variant = null;
        for (const color of product.category.colors) {
            if (color.sizes) {
                const size = color.sizes.find(s => s.sku === req.params.sku);
                if (size) {
                    variant = {
                        colorName: color.colorName,
                        sizeName: size.name,
                        stock: size.stock,
                        sku: size.sku
                    };
                    break;
                }
            }
        }

        return successResponse(res, {
            product,
            variant,
            stockInfo: {
                variantStock: variant?.stock || 0,
                inStock: variant ? variant.stock > 0 : false
            }
        });
    } catch (error) {
        return handleError(res, error);
    }
});

// -------------------- UPDATE PRODUCT STOCK -------------------
router.patch("/:id/stock", auth, async (req: Request, res: Response) => {
    try {
        const validatedData = StockUpdateSchema.parse(req.body);
        const { colorName, sizeName, quantity } = validatedData;

        const product = await Product.findById(req.params.id);
        
        if (!product) {
            return res.status(404).json({
                success: false,
                error: "Product not found"
            });
        }

        await product.updateVariantStock(colorName, sizeName, quantity);

        return successResponse(res, {
            product,
            updatedVariant: {
                colorName,
                sizeName,
                stock: quantity
            },
            stockInfo: {
                totalStock: product.stock,
                variantStock: product.getVariantStock(colorName, sizeName)
            }
        }, "Stock updated successfully");
    } catch (error) {
        return handleError(res, error);
    }
});

// -------------------- UPDATE PRODUCT -------------------
router.put("/:id", auth, async (req: Request, res: Response) => {
    try {
        const validatedData = UpdateProductSchema.parse(req.body);
        
        const product = await Product.findByIdAndUpdate(
            req.params.id,
            validatedData,
            { new: true, runValidators: true }
        );
        
        if (!product) {
            return res.status(404).json({
                success: false,
                error: "Product not found"
            });
        }

        return successResponse(res, product, "Product updated successfully");
    } catch (error) {
        return handleError(res, error);
    }
});

// -------------------- SOFT DELETE PRODUCT -------------------
router.delete("/:id", auth, async (req: Request, res: Response) => {
    try {
        const product = await Product.findByIdAndUpdate(
            req.params.id,
            { isActive: false },
            { new: true }
        );
        
        if (!product) {
            return res.status(404).json({
                success: false,
                error: "Product not found"
            });
        }

        return successResponse(res, null, "Product deactivated successfully");
    } catch (error) {
        return handleError(res, error);
    }
});

// -------------------- RESTORE SOFT DELETED PRODUCT -------------------
router.patch("/:id/restore", auth, async (req: Request, res: Response) => {
    try {
        const product = await Product.findByIdAndUpdate(
            req.params.id,
            { isActive: true },
            { new: true }
        );
        
        if (!product) {
            return res.status(404).json({
                success: false,
                error: "Product not found"
            });
        }

        return successResponse(res, product, "Product restored successfully");
    } catch (error) {
        return handleError(res, error);
    }
});

// -------------------- GET SOFT DELETED PRODUCTS -------------------
router.get("/deleted/all", async (req: Request, res: Response) => {
    try {
        const { page = 1, limit = 20 } = req.query;
        const skip = (Number(page) - 1) * Number(limit);

        const deletedProducts = await Product.find({ isActive: false })
            .sort({ updatedAt: -1 })
            .skip(skip)
            .limit(Number(limit))
            .select("name slug price category media isBestseller isNewest createdAt updatedAt");

        const total = await Product.countDocuments({ isActive: false });

        return successResponse(res, {
            products: deletedProducts,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                pages: Math.ceil(total / Number(limit))
            }
        }, "Soft deleted products retrieved successfully");
    } catch (error) {
        return handleError(res, error);
    }
});

// -------------------- FEATURED PRODUCTS -------------------
router.get("/featured/all", async (req: Request, res: Response) => {
    try {
        const { limit = 8 } = req.query;
        
        const products = await Product.find({ isFeatured: true, isActive: true })
            .limit(Number(limit))
            .select("name slug price category media seo rating isBestseller isNewest stock fabricImages");

        return successResponse(res, {
            products,
            meta: {
                title: "Featured Products | A. Ali Murtaza Store",
                description: "Discover our handpicked featured products. Premium quality, trending styles.",
                total: products.length
            }
        });
    } catch (error) {
        return handleError(res, error);
    }
});

// -------------------- PRODUCT ANALYTICS -------------------
router.get("/analytics/overview", async (req: Request, res: Response) => {
    try {
        const [
            totalProducts,
            activeProducts,
            featuredProducts,
            inStockProducts,
            outOfStockProducts,
            lowStockProducts
        ] = await Promise.all([
            Product.countDocuments(),
            Product.countDocuments({ isActive: true }),
            Product.countDocuments({ isFeatured: true, isActive: true }),
            Product.countDocuments({ stock: { $gt: 0 }, isActive: true }),
            Product.countDocuments({ stock: 0, isActive: true }),
            Product.countDocuments({ stock: { $gt: 0, $lte: 10 }, isActive: true })
        ]);

        // Stock distribution by gender
        const stockByGender = await Product.aggregate([
            { $match: { isActive: true } },
            {
                $group: {
                    _id: "$category.gender",
                    totalStock: { $sum: "$stock" },
                    productCount: { $sum: 1 },
                    avgStock: { $avg: "$stock" }
                }
            }
        ]);

        return successResponse(res, {
            overview: {
                totalProducts,
                activeProducts,
                featuredProducts,
                inStockProducts,
                outOfStockProducts,
                lowStockProducts
            },
            stockByGender,
            stockUtilization: {
                inStockPercentage: Math.round((inStockProducts / activeProducts) * 100),
                lowStockPercentage: Math.round((lowStockProducts / activeProducts) * 100)
            }
        });
    } catch (error) {
        return handleError(res, error);
    }
});

// -------------------- BULK STOCK UPDATE -------------------
router.patch("/bulk/stock", auth, async (req: Request, res: Response) => {
    try {
        const { updates } = req.body;
        
        if (!Array.isArray(updates)) {
            return res.status(400).json({
                success: false,
                error: "Updates must be an array"
            });
        }

        const results = [];
        const errors = [];

        for (const update of updates) {
            try {
                const { productId, colorName, sizeName, quantity } = update;
                
                if (!productId || !colorName || !sizeName || quantity === undefined) {
                    errors.push({ productId, error: "Missing required fields" });
                    continue;
                }

                const product = await Product.findById(productId);
                if (!product) {
                    errors.push({ productId, error: "Product not found" });
                    continue;
                }

                await product.updateVariantStock(colorName, sizeName, quantity);
                results.push({ productId, success: true, newStock: quantity });
            } catch (error: any) {
                errors.push({ productId: update.productId, error: error.message });
            }
        }

        return successResponse(res, {
            updated: results.length,
            failed: errors.length,
            results,
            errors
        }, `Bulk update completed. ${results.length} updated, ${errors.length} failed`);
    } catch (error) {
        return handleError(res, error);
    }
});

// -------------------- SEARCH PRODUCTS -------------------
router.get("/search/:query", async (req: Request, res: Response) => {
    try {
        const { query } = req.params;
        const { page = 1, limit = 20, gender, category, minPrice, maxPrice } = req.query;
        
        const skip = (Number(page) - 1) * Number(limit);

        let searchFilter: any = { isActive: true, $text: { $search: query } };
        
        if (gender && ["men", "women", "kids", "baby"].includes(gender as string)) {
            searchFilter["category.gender"] = gender;
        }
        
        if (category) {
            searchFilter["category.type"] = { $in: Array.isArray(category) ? category : [category] };
        }
        
        if (minPrice || maxPrice) {
            searchFilter["price.current"] = {};
            if (minPrice) searchFilter["price.current"].$gte = Number(minPrice);
            if (maxPrice) searchFilter["price.current"].$lte = Number(maxPrice);
        }

        const products = await Product.find(searchFilter)
            .sort({ score: { $meta: "textScore" } })
            .skip(skip)
            .limit(Number(limit))
            .select("name slug price category media seo rating isFeatured isBestseller isNewest isTrending trendingLayout stock fabricImages");

        const total = await Product.countDocuments(searchFilter);

        return successResponse(res, {
            products,
            search: {
                query,
                totalResults: total,
                metaTitle: `Search Results for "${query}" | A. Ali Murtaza Store`,
                metaDescription: `Find the best ${query} products. ${total} results found.`
            },
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                pages: Math.ceil(total / Number(limit))
            }
        });
    } catch (error) {
        return handleError(res, error);
    }
});

export default router;