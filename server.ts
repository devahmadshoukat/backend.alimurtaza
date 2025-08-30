import express from "express";
import { connectDB } from "./src/db";
import productRoutes from "./src/routes/product";
import stockRoutes from "./src/routes/stock";
import authRoutes from "./src/routes/auth";
import bagRoutes from "./src/routes/bag";
import reviewRoutes from "./src/routes/reviews";
import arrivalRoutes from "./src/routes/arrival";
import trendingRoutes from "./src/routes/trending";
import heroRoutes from "./src/routes/hero";
import kidsRoutes from "./src/routes/kids";
import babyRoutes from "./src/routes/baby";

import cors from "cors";

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database connection middleware
app.use(async (req, res, next) => {
    try {
        await connectDB();
        next();
    } catch (error) {
        console.error("Database connection failed:", error);
        res.status(500).json({
            success: false,
            error: "Database connection failed",
            message: "Unable to connect to database"
        });
    }
});

// Request logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// API routes with /api prefix
app.use("/api/products", productRoutes);
app.use("/api/stock", stockRoutes);

// Handle singular form for better UX
app.use("/api/product", productRoutes);

// Authentication routes
app.use("/api/auth", authRoutes);

// Shopping bag routes
app.use("/api/bag", bagRoutes);

// Review routes
app.use("/api/reviews", reviewRoutes);

// Arrival routes
app.use("/api/arrival", arrivalRoutes);
app.use("/api/trending", trendingRoutes);

// Kids routes
app.use("/api/kids", kidsRoutes);
app.use("/api/baby", babyRoutes);

// Hero routes
app.use("/api/hero", heroRoutes);

// Health check endpoint
app.get("/api/health", (req: express.Request, res: express.Response) => {
    res.json({
        status: "OK",
        message: "API server is running",
        timestamp: new Date().toISOString(),
        version: "1.0.0"
    });
});

// API documentation endpoint
app.get("/api", (req: express.Request, res: express.Response) => {
    res.json({
        message: "A. Ali Murtaza Store API",
        version: "1.0.0",
        endpoints: {
            products: {
                base: "/api/products (or /api/product)",
                endpoints: [
                    "GET / - Get all products with filtering",
                    "GET /gender/:gender - Get products by gender (men/women/kids/baby)",
                    "POST / - Create new product (requires auth, handles soft-deleted conflicts)",
                    "GET /id/:id - Get product by ID",
                    "GET /slug/:slug - Get product by slug",
                    "GET /sku/:sku - Get product by SKU",
                    "PUT /:id - Update product (requires auth)",
                    "DELETE /:id - Soft delete product (requires auth)",
                    "PATCH /:id/restore - Restore soft deleted product (requires auth)",
                    "GET /deleted/all - Get all soft deleted products",
                    "PATCH /:id/stock - Update product stock (requires auth)",
                    "GET /featured/all - Get featured products",
                    "GET /search/:query - Search products",
                    "GET /analytics/overview - Get product analytics",
                    "PATCH /bulk/stock - Bulk stock update (requires auth)"
                ]
            },
            stock: {
                base: "/api/stock",
                endpoints: [
                    "PATCH /:productId - Update product stock",
                    "GET /:productId/info - Get stock information",
                    "GET /:productId/check - Check variant stock",
                    "PATCH /bulk/update - Bulk stock update",
                    "GET /low-stock - Get low stock products",
                    "GET /out-of-stock - Get out of stock products",
                    "GET /analytics/overview - Get stock analytics",
                    "POST /recalculate-all - Recalculate all stock",
                    "GET /:productId/history - Get stock history",
                    "GET /alerts - Get stock alerts"
                ]
            },
            auth: {
                base: "/api/auth",
                endpoints: [
                    "POST /signup - Register new user",
                    "POST /signin - User login",
                    "GET /profile - Get user profile (requires auth)"
                ]
            },
            bag: {
                base: "/api/bag",
                endpoints: [
                    "POST /add - Add item to shopping bag (requires auth)",
                    "GET / - Get user's shopping bag (requires auth)",
                    "PUT /update/:productId - Update item quantity (requires auth)",
                    "DELETE /remove/:productId - Remove item from bag (requires auth)",
                    "DELETE /clear - Clear shopping bag (requires auth)"
                ]
            },
            reviews: {
                base: "/api/reviews",
                endpoints: [
                    "POST /add - Add product review (requires auth)",
                    "PUT /update/:productId - Update review (requires auth)",
                    "DELETE /delete/:productId - Delete review (requires auth)",
                    "GET /my-reviews - Get user's reviews (requires auth)",
                    "GET /product/:productId - Get product reviews (public)"
                ]
            },
            arrival: {
                base: "/api/arrival",
                endpoints: [
                    "GET /newest - Get latest products (with gender filter)",
                    "GET /bestseller - Get bestseller products (with gender filter)",
                    "POST /bestseller/:productId - Add product to bestseller (requires auth)",
                    "DELETE /bestseller/:productId - Remove product from bestseller (requires auth)"
                ]
            }
        }
    });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error("Unhandled error:", err);
    res.status(500).json({
        success: false,
        error: "Internal server error",
        message: process.env.NODE_ENV === "development" ? err.message : "Something went wrong"
    });
});

// 404 handler
app.use("*", (req: express.Request, res: express.Response) => {
    res.status(404).json({
        success: false,
        error: "Endpoint not found",
        message: `The endpoint ${req.method} ${req.originalUrl} does not exist`
    });
});

// For local development
if (process.env.NODE_ENV !== "production") {
    const PORT = process.env.PORT || 4000;
    app.listen(PORT, () => {
        console.log(`🚀 API server running on http://localhost:${PORT}`);
        console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
        console.log(`📚 API Documentation: http://localhost:${PORT}/api`);
        console.log(`🛍️ Products API: http://localhost:${PORT}/api/products (or /api/product)`);
        console.log(`📦 Stock Management: http://localhost:${PORT}/api/stock`);
        console.log(`🔐 Authentication: http://localhost:${PORT}/api/auth`);
        console.log(`🛒 Shopping Bag: http://localhost:${PORT}/api/bag`);
        console.log(`⭐ Reviews: http://localhost:${PORT}/api/reviews`);
        console.log(`🆕 Arrival APIs: http://localhost:${PORT}/api/arrival`);
    });
}

export default app;
