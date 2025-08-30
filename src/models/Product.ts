import mongoose, { Document, Schema } from "mongoose";

// -------------------- Types --------------------
export type Gender = "men" | "women" | "kids" | "baby";

export interface Product extends Document {
    name: string;
    slug: string;
    fabricImages: string[];
    price: {
        current: number;
        old?: number;
        discountPercentage?: number;
    };
    category: {
        gender: Gender;
        type: string[];
        colors: {
            colorName: string;
            images: string[];
            sizes?: { name: string; stock: number; sku?: string }[];
        }[];
    };
    media: { thumbnail: string };
    stock: number;
    isFeatured?: boolean;
    isBestseller?: boolean;
    isNewest?: boolean;
      isTrending?: boolean;
    isActive?: boolean;
    tags?: string[];
    rating?: { average: number; count: number };
    seo?: {
        title?: string;
        description?: string;
        keywords?: string[];
        metaTitle?: string;
        metaDescription?: string;
    };
    popularity?: number;
    createdAt: Date;
    updatedAt: Date;

    // Methods for stock management
    calculateTotalStock(): number;
    updateTotalStock(): Promise<void>;
    getVariantStock(colorName: string, sizeName?: string): number;
    updateVariantStock(colorName: string, sizeName: string, quantity: number): Promise<void>;
    getAvailableVariants(): Array<{ colorName: string; sizeName?: string; stock: number; sku?: string }>;
    isInStock(colorName?: string, sizeName?: string): boolean;
}

// -------------------- Helpers --------------------
const GENDER_MAP: Record<Gender, string> = {
    men: "Men",
    women: "Women",
    kids: "Kids",
    baby: "Baby",
};

const generateMetaTitle = (name: string, gender: Gender, type: string[]): string =>
    `${GENDER_MAP[gender]} ${type.join(" ")} - ${name} | A. Ali Murtaza Store`;

const generateMetaDescription = (name: string, gender: Gender, type: string[], price: number): string =>
    `Shop premium ${GENDER_MAP[gender]} ${type.join(" ").toLowerCase()} - ${name}. High quality, stylish design. Starting at $${price}. Free shipping available.`;

const generateSlug = (name: string, gender: Gender, type: string[]): string => {
    const typeSlug = type.join("-").toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const nameSlug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
    return `${gender}-${typeSlug}-${nameSlug}`;
};

// Generate SKU for product variant: GENDER-PRODUCT-COLOR-SIZE-XXX
const generateVariantSKU = (product: Product, colorName: string, sizeName?: string): string => {
    const genderCode = product.category.gender.substring(0, 3).toUpperCase();
    const baseName = (product.slug || product.name || "").toString();
    const productCode = baseName
        .replace(/[^a-zA-Z0-9]+/g, "")
        .substring(0, 6)
        .toUpperCase() || "PRODUCT";
    const colorCode = colorName.substring(0, 3).toUpperCase();
    const sizeCode = sizeName ? sizeName.toUpperCase() : "";
    const randomNum = Math.floor(1 + Math.random() * 999);
    return `${genderCode}-${productCode}-${colorCode}-${sizeCode ? `${sizeCode}-` : ""}${String(randomNum).padStart(3, "0")}`;
};

// -------------------- Schema --------------------
const ProductSchema = new Schema<Product>(
    {
        name: { type: String, required: true, trim: true },
        slug: { type: String, unique: true, lowercase: true, trim: true },
        price: {
            current: { type: Number, required: true },
            old: Number,
            discountPercentage: Number,
        },
        category: {
            gender: { type: String, enum: Object.keys(GENDER_MAP), required: true },
            type: { type: [String], required: true },
            colors: [
                {
                    colorName: { type: String, required: true },
                    images: [{ type: String, required: true }],
                    sizes: [{ name: String, stock: Number, sku: String }],
                },
            ],
        },
        media: { thumbnail: { type: String, required: true } },
        stock: { type: Number, default: 0 },
                        isFeatured: { type: Boolean, default: false },
                isBestseller: { type: Boolean, default: false },
                isNewest: { type: Boolean, default: false },
                  isTrending: { type: Boolean, default: false },
        isActive: { type: Boolean, default: true },
        tags: [String],
        popularity: { type: Number, default: 0 },
        fabricImages: [{ type: String, required: true }],
        rating: {
            average: { type: Number, min: 0, max: 5, default: 0 },
            count: { type: Number, default: 0 },
        },
        seo: {
            title: String,
            description: String,
            keywords: [String],
            metaTitle: String,
            metaDescription: String,
        },
    },
    { timestamps: true }
);

// -------------------- Instance Methods --------------------
ProductSchema.methods.calculateTotalStock = function (): number {
    let totalStock = 0;

    for (const color of this.category.colors) {
        if (color.sizes && color.sizes.length > 0) {
            // If sizes exist, sum up all size stocks
            totalStock += color.sizes.reduce((sum: number, size: any) => sum + (size.stock || 0), 0);
        } else {
            // If no sizes, treat color as single variant
            totalStock += 1; // Default stock for color-only variant
        }
    }

    return totalStock;
};

ProductSchema.methods.updateTotalStock = async function (): Promise<void> {
    this.stock = this.calculateTotalStock();
    await this.save();
};

ProductSchema.methods.getVariantStock = function (colorName: string, sizeName?: string): number {
    const color = this.category.colors.find((c: any) => c.colorName === colorName);
    if (!color) return 0;

    if (sizeName) {
        const size = color.sizes?.find((s: any) => s.name === sizeName);
        return size?.stock || 0;
    } else {
        // Return total stock for this color across all sizes
        return color.sizes?.reduce((sum: number, size: any) => sum + (size.stock || 0), 0) || 0;
    }
};

ProductSchema.methods.updateVariantStock = async function (colorName: string, sizeName: string, quantity: number): Promise<void> {
    const color = this.category.colors.find((c: any) => c.colorName === colorName);
    if (!color) throw new Error(`Color ${colorName} not found`);

    const size = color.sizes?.find((s: any) => s.name === sizeName);
    if (!size) throw new Error(`Size ${sizeName} not found for color ${colorName}`);

    size.stock = Math.max(0, quantity); // Ensure stock doesn't go negative
    await this.updateTotalStock();
};

ProductSchema.methods.getAvailableVariants = function (): Array<{ colorName: string; sizeName?: string; stock: number; sku?: string }> {
    const variants: Array<{ colorName: string; sizeName?: string; stock: number; sku?: string }> = [];

    for (const color of this.category.colors) {
        if (color.sizes && color.sizes.length > 0) {
            // Add each size variant
            for (const size of color.sizes) {
                variants.push({
                    colorName: color.colorName,
                    sizeName: size.name,
                    stock: size.stock || 0,
                    sku: size.sku
                });
            }
        } else {
            // Add color-only variant
            variants.push({
                colorName: color.colorName,
                stock: 1, // Default stock for color-only variant
                sku: generateVariantSKU(this as unknown as Product, color.colorName)
            });
        }
    }

    return variants;
};

ProductSchema.methods.isInStock = function (colorName?: string, sizeName?: string): boolean {
    if (colorName && sizeName) {
        return this.getVariantStock(colorName, sizeName) > 0;
    } else if (colorName) {
        return this.getVariantStock(colorName) > 0;
    } else {
        return this.stock > 0;
    }
};

// -------------------- Static Methods --------------------
ProductSchema.statics.findByVariant = function (sku: string) {
    return this.findOne({ "category.colors.sizes.sku": sku });
};

ProductSchema.statics.findInStock = function () {
    return this.find({ stock: { $gt: 0 }, isActive: true });
};

ProductSchema.statics.findByCategory = function (gender: Gender, type?: string[]) {
    const filter: any = { "category.gender": gender, isActive: true };
    if (type) filter["category.type"] = { $in: type };
    return this.find(filter);
};

// -------------------- Middleware --------------------
ProductSchema.pre("save", async function (this: Product, next) {
    // Slug & SEO
    if (this.isModified("name") || this.isModified("category") || !this.slug) {
        this.slug = generateSlug(this.name, this.category.gender, this.category.type);
        this.seo = this.seo || {};
        this.seo.metaTitle ??= generateMetaTitle(this.name, this.category.gender, this.category.type);
        this.seo.metaDescription ??= generateMetaDescription(this.name, this.category.gender, this.category.type, this.price.current);
        this.seo.title ??= `${this.name} - ${GENDER_MAP[this.category.gender]} ${this.category.type.join(" ")}`;
        this.seo.description ??= `Premium ${this.category.gender} ${this.category.type.join(" ").toLowerCase()} - ${this.name}. High quality fashion at $${this.price.current}.`;
        this.seo.keywords ||= [this.name, this.category.gender, ...this.category.type, "fashion", "clothing", "style"];
    }

    // Generate SKU for variants
    for (const color of this.category.colors) {
        if (!color.sizes) continue;
        for (const size of color.sizes) {
            if (!size.sku) {
                let candidateSKU = generateVariantSKU(this, color.colorName, size.name);
                let attempts = 0;
                while (attempts < 5) {
                    const existing = await mongoose.models.Product.findOne({ "category.colors.sizes.sku": candidateSKU }).lean();
                    if (!existing) break;
                    candidateSKU = generateVariantSKU(this, color.colorName, size.name);
                    attempts += 1;
                }
                size.sku = candidateSKU;
            }
        }
    }

    // Auto-calculate total stock when colors/sizes are modified
    if (this.isModified("category.colors")) {
        this.stock = this.calculateTotalStock();
    }

    next();
});

// -------------------- Indexes --------------------
ProductSchema.index({
    name: "text",
    slug: "text",
    "category.type": "text",
    "category.gender": "text",
    tags: "text",
    "seo.title": "text",
    "seo.description": "text",
    "seo.keywords": "text",
    "seo.metaTitle": "text",
    "seo.metaDescription": "text",
});
ProductSchema.index({ "category.gender": 1, "category.type": 1 });
ProductSchema.index({ slug: 1 });
ProductSchema.index({ stock: 1 });
ProductSchema.index({ "category.colors.sizes.sku": 1 });

export default mongoose.model<Product>("Product", ProductSchema);