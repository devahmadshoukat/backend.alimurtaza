import Product from "../models/Product";

export interface StockUpdate {
    productId: string;
    colorName: string;
    sizeName: string;
    quantity: number;
}

export interface StockInfo {
    totalStock: number;
    inStock: boolean;
    availableVariants: number;
    totalVariants: number;
    lowStockVariants: number;
}

export interface BulkStockResult {
    updated: number;
    failed: number;
    results: Array<{ productId: string; success: boolean; newStock?: number; error?: string }>;
}

export class StockService {
    /**
     * Update stock for a specific product variant
     */
    static async updateVariantStock(
        productId: string,
        colorName: string,
        sizeName: string,
        quantity: number
    ): Promise<{ product: any; variantStock: number; totalStock: number }> {
        const product = await Product.findById(productId);
        
        if (!product) {
            throw new Error("Product not found");
        }

        await product.updateVariantStock(colorName, sizeName, quantity);
        
        return {
            product,
            variantStock: product.getVariantStock(colorName, sizeName),
            totalStock: product.stock
        };
    }

    /**
     * Get stock information for a product
     */
    static async getStockInfo(productId: string): Promise<StockInfo> {
        const product = await Product.findById(productId);
        
        if (!product) {
            throw new Error("Product not found");
        }

        const variants = product.getAvailableVariants();
        const lowStockVariants = variants.filter(v => v.stock > 0 && v.stock <= 10).length;

        return {
            totalStock: product.stock,
            inStock: product.isInStock(),
            availableVariants: variants.filter(v => v.stock > 0).length,
            totalVariants: variants.length,
            lowStockVariants
        };
    }

    /**
     * Bulk update stock for multiple products
     */
    static async bulkUpdateStock(updates: StockUpdate[]): Promise<BulkStockResult> {
        const results: Array<{ productId: string; success: boolean; newStock?: number; error?: string }> = [];
        let updated = 0;
        let failed = 0;

        for (const update of updates) {
            try {
                const result = await this.updateVariantStock(
                    update.productId,
                    update.colorName,
                    update.sizeName,
                    update.quantity
                );
                
                results.push({
                    productId: update.productId,
                    success: true,
                    newStock: result.variantStock
                });
                updated++;
            } catch (error) {
                results.push({
                    productId: update.productId,
                    success: false,
                    error: error instanceof Error ? error.message : "Unknown error"
                });
                failed++;
            }
        }

        return { updated, failed, results };
    }

    /**
     * Get low stock products (stock <= 10)
     */
    static async getLowStockProducts(limit: number = 50): Promise<any[]> {
        return await Product.find({
            stock: { $gt: 0, $lte: 10 },
            isActive: true
        })
        .limit(limit)
        .select("name slug price category stock fabricImages")
        .sort({ stock: 1 });
    }

    /**
     * Get out of stock products
     */
    static async getOutOfStockProducts(limit: number = 50): Promise<any[]> {
        return await Product.find({
            stock: 0,
            isActive: true
        })
        .limit(limit)
        .select("name slug price category stock fabricImages")
        .sort({ updatedAt: -1 });
    }

    /**
     * Get stock analytics
     */
    static async getStockAnalytics() {
        const [
            totalProducts,
            inStockProducts,
            outOfStockProducts,
            lowStockProducts,
            stockByGender
        ] = await Promise.all([
            Product.countDocuments({ isActive: true }),
            Product.countDocuments({ stock: { $gt: 0 }, isActive: true }),
            Product.countDocuments({ stock: 0, isActive: true }),
            Product.countDocuments({ stock: { $gt: 0, $lte: 10 }, isActive: true }),
            Product.aggregate([
                { $match: { isActive: true } },
                {
                    $group: {
                        _id: "$category.gender",
                        totalStock: { $sum: "$stock" },
                        productCount: { $sum: 1 },
                        avgStock: { $avg: "$stock" }
                    }
                }
            ])
        ]);

        return {
            overview: {
                totalProducts,
                inStockProducts,
                outOfStockProducts,
                lowStockProducts
            },
            stockByGender,
            utilization: {
                inStockPercentage: Math.round((inStockProducts / totalProducts) * 100),
                lowStockPercentage: Math.round((lowStockProducts / totalProducts) * 100)
            }
        };
    }

    /**
     * Auto-recalculate stock for all products
     */
    static async recalculateAllStock(): Promise<{ updated: number; failed: number }> {
        const products = await Product.find({ isActive: true });
        let updated = 0;
        let failed = 0;

        for (const product of products) {
            try {
                await product.updateTotalStock();
                updated++;
            } catch (error) {
                console.error(`Failed to update stock for product ${product._id}:`, error);
                failed++;
            }
        }

        return { updated, failed };
    }

    /**
     * Get stock history (placeholder for future implementation)
     */
    static async getStockHistory(productId: string, days: number = 30): Promise<any[]> {
        // This would typically query a stock history collection
        // For now, return empty array as placeholder
        return [];
    }

    /**
     * Check if product variant is in stock
     */
    static async checkVariantStock(
        productId: string,
        colorName: string,
        sizeName?: string
    ): Promise<{ inStock: boolean; availableQuantity: number }> {
        const product = await Product.findById(productId);
        
        if (!product) {
            throw new Error("Product not found");
        }

        const availableQuantity = product.getVariantStock(colorName, sizeName);
        
        return {
            inStock: availableQuantity > 0,
            availableQuantity
        };
    }
}
