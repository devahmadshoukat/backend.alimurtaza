"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const stockService_1 = require("../services/stockService");
const apiResponse_1 = require("../utils/apiResponse");
const router = (0, express_1.Router)();
// -------------------- Validation Schemas --------------------
const StockUpdateSchema = zod_1.z.object({
    colorName: zod_1.z.string().min(1, "Color name is required"),
    sizeName: zod_1.z.string().min(1, "Size name is required"),
    quantity: zod_1.z.number().min(0, "Quantity cannot be negative"),
});
const BulkStockUpdateSchema = zod_1.z.object({
    updates: zod_1.z.array(zod_1.z.object({
        productId: zod_1.z.string().min(1, "Product ID is required"),
        colorName: zod_1.z.string().min(1, "Color name is required"),
        sizeName: zod_1.z.string().min(1, "Size name is required"),
        quantity: zod_1.z.number().min(0, "Quantity cannot be negative"),
    })).min(1, "At least one update is required"),
});
const StockCheckSchema = zod_1.z.object({
    colorName: zod_1.z.string().min(1, "Color name is required"),
    sizeName: zod_1.z.string().optional(),
});
// -------------------- BULK STOCK UPDATE -------------------
router.patch("/bulk/update", async (req, res) => {
    try {
        const validatedData = BulkStockUpdateSchema.parse(req.body);
        const result = await stockService_1.StockService.bulkUpdateStock(validatedData.updates);
        return apiResponse_1.ApiResponseHandler.success(res, result, `Bulk update completed. ${result.updated} updated, ${result.failed} failed`);
    }
    catch (error) {
        return apiResponse_1.ApiResponseHandler.error(res, error instanceof Error ? error : "Unknown error");
    }
});
// -------------------- GET STOCK ANALYTICS -------------------
router.get("/analytics/overview", async (req, res) => {
    try {
        const analytics = await stockService_1.StockService.getStockAnalytics();
        return apiResponse_1.ApiResponseHandler.success(res, analytics, "Stock analytics retrieved successfully");
    }
    catch (error) {
        return apiResponse_1.ApiResponseHandler.error(res, error instanceof Error ? error : "Unknown error");
    }
});
// -------------------- RECALCULATE ALL STOCK -------------------
router.post("/recalculate-all", async (req, res) => {
    try {
        const result = await stockService_1.StockService.recalculateAllStock();
        return apiResponse_1.ApiResponseHandler.success(res, result, `Stock recalculation completed. ${result.updated} updated, ${result.failed} failed`);
    }
    catch (error) {
        return apiResponse_1.ApiResponseHandler.error(res, error instanceof Error ? error : "Unknown error");
    }
});
// -------------------- GET LOW STOCK PRODUCTS -------------------
router.get("/low-stock", async (req, res) => {
    try {
        const { limit = 50 } = req.query;
        const products = await stockService_1.StockService.getLowStockProducts(Number(limit));
        return apiResponse_1.ApiResponseHandler.success(res, {
            products,
            count: products.length,
            threshold: "≤ 10 units"
        }, "Low stock products retrieved successfully");
    }
    catch (error) {
        return apiResponse_1.ApiResponseHandler.error(res, error instanceof Error ? error : "Unknown error");
    }
});
// -------------------- GET OUT OF STOCK PRODUCTS -------------------
router.get("/out-of-stock", async (req, res) => {
    try {
        const { limit = 50 } = req.query;
        const products = await stockService_1.StockService.getOutOfStockProducts(Number(limit));
        return apiResponse_1.ApiResponseHandler.success(res, {
            products,
            count: products.length
        }, "Out of stock products retrieved successfully");
    }
    catch (error) {
        return apiResponse_1.ApiResponseHandler.error(res, error instanceof Error ? error : "Unknown error");
    }
});
// -------------------- STOCK ALERTS -------------------
router.get("/alerts", async (req, res) => {
    try {
        const [lowStockProducts, outOfStockProducts] = await Promise.all([
            stockService_1.StockService.getLowStockProducts(20),
            stockService_1.StockService.getOutOfStockProducts(20)
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
        return apiResponse_1.ApiResponseHandler.success(res, alerts, "Stock alerts retrieved successfully");
    }
    catch (error) {
        return apiResponse_1.ApiResponseHandler.error(res, error instanceof Error ? error : "Unknown error");
    }
});
// -------------------- UPDATE PRODUCT STOCK -------------------
router.patch("/:productId", async (req, res) => {
    try {
        const { productId } = req.params;
        const validatedData = StockUpdateSchema.parse(req.body);
        const { colorName, sizeName, quantity } = validatedData;
        const result = await stockService_1.StockService.updateVariantStock(productId, colorName, sizeName, quantity);
        return apiResponse_1.ApiResponseHandler.success(res, {
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
    }
    catch (error) {
        return apiResponse_1.ApiResponseHandler.error(res, error instanceof Error ? error : "Unknown error");
    }
});
// -------------------- GET STOCK INFO -------------------
router.get("/:productId/info", async (req, res) => {
    try {
        const { productId } = req.params;
        const stockInfo = await stockService_1.StockService.getStockInfo(productId);
        return apiResponse_1.ApiResponseHandler.success(res, stockInfo, "Stock information retrieved successfully");
    }
    catch (error) {
        return apiResponse_1.ApiResponseHandler.error(res, error instanceof Error ? error : "Unknown error");
    }
});
// -------------------- CHECK VARIANT STOCK -------------------
router.get("/:productId/check", async (req, res) => {
    try {
        const { productId } = req.params;
        const validatedData = StockCheckSchema.parse(req.query);
        const { colorName, sizeName } = validatedData;
        const stockCheck = await stockService_1.StockService.checkVariantStock(productId, colorName, sizeName);
        return apiResponse_1.ApiResponseHandler.success(res, {
            productId,
            colorName,
            sizeName,
            ...stockCheck
        }, "Stock check completed");
    }
    catch (error) {
        return apiResponse_1.ApiResponseHandler.error(res, error instanceof Error ? error : "Unknown error");
    }
});
// -------------------- GET STOCK HISTORY -------------------
router.get("/:productId/history", async (req, res) => {
    try {
        const { productId } = req.params;
        const { days = 30 } = req.query;
        const history = await stockService_1.StockService.getStockHistory(productId, Number(days));
        return apiResponse_1.ApiResponseHandler.success(res, {
            productId,
            history,
            days: Number(days)
        }, "Stock history retrieved successfully");
    }
    catch (error) {
        return apiResponse_1.ApiResponseHandler.error(res, error instanceof Error ? error : "Unknown error");
    }
});
module.exports = router;
