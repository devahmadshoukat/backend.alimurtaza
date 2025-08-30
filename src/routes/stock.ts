import { Router, Request, Response } from "express";
import { z } from "zod";
import { StockService } from "../services/stockService";
import { ApiResponseHandler } from "../utils/apiResponse";

const router = Router();

// -------------------- Validation Schemas --------------------
const StockUpdateSchema = z.object({
    colorName: z.string().min(1, "Color name is required"),
    sizeName: z.string().min(1, "Size name is required"),
    quantity: z.number().min(0, "Quantity cannot be negative"),
});

const BulkStockUpdateSchema = z.object({
    updates: z.array(z.object({
        productId: z.string().min(1, "Product ID is required"),
        colorName: z.string().min(1, "Color name is required"),
        sizeName: z.string().min(1, "Size name is required"),
        quantity: z.number().min(0, "Quantity cannot be negative"),
    })).min(1, "At least one update is required"),
});

const StockCheckSchema = z.object({
    colorName: z.string().min(1, "Color name is required"),
    sizeName: z.string().optional(),
});

// -------------------- BULK STOCK UPDATE -------------------
router.patch("/bulk/update", async (req: Request, res: Response) => {
    try {
        const validatedData = BulkStockUpdateSchema.parse(req.body);
        const result = await StockService.bulkUpdateStock(validatedData.updates);

        return ApiResponseHandler.success(res, result, 
            `Bulk update completed. ${result.updated} updated, ${result.failed} failed`);
    } catch (error) {
        return ApiResponseHandler.error(res, error instanceof Error ? error : "Unknown error");
    }
});

// -------------------- GET STOCK ANALYTICS -------------------
router.get("/analytics/overview", async (req: Request, res: Response) => {
    try {
        const analytics = await StockService.getStockAnalytics();

        return ApiResponseHandler.success(res, analytics, "Stock analytics retrieved successfully");
    } catch (error) {
        return ApiResponseHandler.error(res, error instanceof Error ? error : "Unknown error");
    }
});

// -------------------- RECALCULATE ALL STOCK -------------------
router.post("/recalculate-all", async (req: Request, res: Response) => {
    try {
        const result = await StockService.recalculateAllStock();

        return ApiResponseHandler.success(res, result, 
            `Stock recalculation completed. ${result.updated} updated, ${result.failed} failed`);
    } catch (error) {
        return ApiResponseHandler.error(res, error instanceof Error ? error : "Unknown error");
    }
});

// -------------------- GET LOW STOCK PRODUCTS -------------------
router.get("/low-stock", async (req: Request, res: Response) => {
    try {
        const { limit = 50 } = req.query;
        const products = await StockService.getLowStockProducts(Number(limit));

        return ApiResponseHandler.success(res, {
            products,
            count: products.length,
            threshold: "≤ 10 units"
        }, "Low stock products retrieved successfully");
    } catch (error) {
        return ApiResponseHandler.error(res, error instanceof Error ? error : "Unknown error");
    }
});

// -------------------- GET OUT OF STOCK PRODUCTS -------------------
router.get("/out-of-stock", async (req: Request, res: Response) => {
    try {
        const { limit = 50 } = req.query;
        const products = await StockService.getOutOfStockProducts(Number(limit));

        return ApiResponseHandler.success(res, {
            products,
            count: products.length
        }, "Out of stock products retrieved successfully");
    } catch (error) {
        return ApiResponseHandler.error(res, error instanceof Error ? error : "Unknown error");
    }
});

// -------------------- STOCK ALERTS -------------------
router.get("/alerts", async (req: Request, res: Response) => {
    try {
        const [lowStockProducts, outOfStockProducts] = await Promise.all([
            StockService.getLowStockProducts(20),
            StockService.getOutOfStockProducts(20)
        ]);

        const alerts = {
            lowStock: {
                count: lowStockProducts.length,
                products: lowStockProducts.slice(0, 5) // Show first 5
            },
            outOfStock: {
                count: outOfStockProducts.length,
                products: outOfStockProducts.slice(0, 5) // Show first 5
            },
            totalAlerts: lowStockProducts.length + outOfStockProducts.length
        };

        return ApiResponseHandler.success(res, alerts, "Stock alerts retrieved successfully");
    } catch (error) {
        return ApiResponseHandler.error(res, error instanceof Error ? error : "Unknown error");
    }
});

// -------------------- UPDATE PRODUCT STOCK -------------------
router.patch("/:productId", async (req: Request, res: Response) => {
    try {
        const { productId } = req.params;
        const validatedData = StockUpdateSchema.parse(req.body);
        const { colorName, sizeName, quantity } = validatedData;

        const result = await StockService.updateVariantStock(
            productId,
            colorName,
            sizeName,
            quantity
        );

        return ApiResponseHandler.success(res, {
            product: result.product,
            updatedVariant: {
                colorName,
                sizeName,
                stock: result.variantStock
            },
            stockInfo: {
                totalStock: result.totalStock,
                variantStock: result.variantStock
            }
        }, "Stock updated successfully");
    } catch (error) {
        return ApiResponseHandler.error(res, error instanceof Error ? error : "Unknown error");
    }
});

// -------------------- GET STOCK INFO -------------------
router.get("/:productId/info", async (req: Request, res: Response) => {
    try {
        const { productId } = req.params;
        const stockInfo = await StockService.getStockInfo(productId);

        return ApiResponseHandler.success(res, stockInfo, "Stock information retrieved successfully");
    } catch (error) {
        return ApiResponseHandler.error(res, error instanceof Error ? error : "Unknown error");
    }
});

// -------------------- CHECK VARIANT STOCK -------------------
router.get("/:productId/check", async (req: Request, res: Response) => {
    try {
        const { productId } = req.params;
        const validatedData = StockCheckSchema.parse(req.query);
        const { colorName, sizeName } = validatedData;

        const stockCheck = await StockService.checkVariantStock(productId, colorName, sizeName);

        return ApiResponseHandler.success(res, {
            productId,
            colorName,
            sizeName,
            ...stockCheck
        }, "Stock check completed");
    } catch (error) {
        return ApiResponseHandler.error(res, error instanceof Error ? error : "Unknown error");
    }
});

// -------------------- GET STOCK HISTORY -------------------
router.get("/:productId/history", async (req: Request, res: Response) => {
    try {
        const { productId } = req.params;
        const { days = 30 } = req.query;
        
        const history = await StockService.getStockHistory(productId, Number(days));

        return ApiResponseHandler.success(res, {
            productId,
            history,
            days: Number(days)
        }, "Stock history retrieved successfully");
    } catch (error) {
        return ApiResponseHandler.error(res, error instanceof Error ? error : "Unknown error");
    }
});

export default router;
