"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
// -------------------- Helpers --------------------
const GENDER_MAP = {
    men: "Men",
    women: "Women",
    kids: "Kids",
    baby: "Baby",
};
const generateMetaTitle = (name, gender, type) => `${GENDER_MAP[gender]} ${type.join(" ")} - ${name} | A. Ali Murtaza Store`;
const generateMetaDescription = (name, gender, type, price) => `Shop premium ${GENDER_MAP[gender]} ${type.join(" ").toLowerCase()} - ${name}. High quality, stylish design. Starting at $${price}. Free shipping available.`;
const generateSlug = (name, gender, type) => {
    const typeSlug = type.join("-").toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const nameSlug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
    return `${gender}-${typeSlug}-${nameSlug}`;
};
// Generate SKU for product variant: GENDER-PRODUCT-COLOR-SIZE-XXX
const generateVariantSKU = (product, colorName, sizeName) => {
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
const ProductSchema = new mongoose_1.Schema({
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
}, { timestamps: true });
// -------------------- Instance Methods --------------------
ProductSchema.methods.calculateTotalStock = function () {
    let totalStock = 0;
    for (const color of this.category.colors) {
        if (color.sizes && color.sizes.length > 0) {
            // If sizes exist, sum up all size stocks
            totalStock += color.sizes.reduce((sum, size) => sum + (size.stock || 0), 0);
        }
        else {
            // If no sizes, treat color as single variant
            totalStock += 1; // Default stock for color-only variant
        }
    }
    return totalStock;
};
ProductSchema.methods.updateTotalStock = async function () {
    this.stock = this.calculateTotalStock();
    await this.save();
};
ProductSchema.methods.getVariantStock = function (colorName, sizeName) {
    const color = this.category.colors.find((c) => c.colorName === colorName);
    if (!color)
        return 0;
    if (sizeName) {
        const size = color.sizes?.find((s) => s.name === sizeName);
        return size?.stock || 0;
    }
    else {
        // Return total stock for this color across all sizes
        return color.sizes?.reduce((sum, size) => sum + (size.stock || 0), 0) || 0;
    }
};
ProductSchema.methods.updateVariantStock = async function (colorName, sizeName, quantity) {
    const color = this.category.colors.find((c) => c.colorName === colorName);
    if (!color)
        throw new Error(`Color ${colorName} not found`);
    const size = color.sizes?.find((s) => s.name === sizeName);
    if (!size)
        throw new Error(`Size ${sizeName} not found for color ${colorName}`);
    size.stock = Math.max(0, quantity); // Ensure stock doesn't go negative
    await this.updateTotalStock();
};
ProductSchema.methods.getAvailableVariants = function () {
    const variants = [];
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
        }
        else {
            // Add color-only variant
            variants.push({
                colorName: color.colorName,
                stock: 1, // Default stock for color-only variant
                sku: generateVariantSKU(this, color.colorName)
            });
        }
    }
    return variants;
};
ProductSchema.methods.isInStock = function (colorName, sizeName) {
    if (colorName && sizeName) {
        return this.getVariantStock(colorName, sizeName) > 0;
    }
    else if (colorName) {
        return this.getVariantStock(colorName) > 0;
    }
    else {
        return this.stock > 0;
    }
};
// -------------------- Static Methods --------------------
ProductSchema.statics.findByVariant = function (sku) {
    return this.findOne({ "category.colors.sizes.sku": sku });
};
ProductSchema.statics.findInStock = function () {
    return this.find({ stock: { $gt: 0 }, isActive: true });
};
ProductSchema.statics.findByCategory = function (gender, type) {
    const filter = { "category.gender": gender, isActive: true };
    if (type)
        filter["category.type"] = { $in: type };
    return this.find(filter);
};
// -------------------- Middleware --------------------
ProductSchema.pre("save", async function (next) {
    var _a, _b, _c, _d, _e;
    // Slug & SEO
    if (this.isModified("name") || this.isModified("category") || !this.slug) {
        this.slug = generateSlug(this.name, this.category.gender, this.category.type);
        this.seo = this.seo || {};
        (_a = this.seo).metaTitle ?? (_a.metaTitle = generateMetaTitle(this.name, this.category.gender, this.category.type));
        (_b = this.seo).metaDescription ?? (_b.metaDescription = generateMetaDescription(this.name, this.category.gender, this.category.type, this.price.current));
        (_c = this.seo).title ?? (_c.title = `${this.name} - ${GENDER_MAP[this.category.gender]} ${this.category.type.join(" ")}`);
        (_d = this.seo).description ?? (_d.description = `Premium ${this.category.gender} ${this.category.type.join(" ").toLowerCase()} - ${this.name}. High quality fashion at $${this.price.current}.`);
        (_e = this.seo).keywords || (_e.keywords = [this.name, this.category.gender, ...this.category.type, "fashion", "clothing", "style"]);
    }
    // Generate SKU for variants
    for (const color of this.category.colors) {
        if (!color.sizes)
            continue;
        for (const size of color.sizes) {
            if (!size.sku) {
                let candidateSKU = generateVariantSKU(this, color.colorName, size.name);
                let attempts = 0;
                while (attempts < 5) {
                    const existing = await mongoose_1.default.models.Product.findOne({ "category.colors.sizes.sku": candidateSKU }).lean();
                    if (!existing)
                        break;
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
exports.default = mongoose_1.default.model("Product", ProductSchema);
