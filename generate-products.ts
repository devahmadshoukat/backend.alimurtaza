import mongoose from 'mongoose';
import Product from './src/models/Product.js';

// MongoDB connection
mongoose.connect('mongodb+srv://pos:pos@pos.dbt37.mongodb.net/?retryWrites=true&w=majority&appName=POS');

// Helper function to create product with correct structure
function createProduct(
    name: string,
    gender: "men" | "women" | "kids" | "baby",
    type: string[],
    colors: string[],
    sizes: string[],
    currentPrice: number,
    oldPrice: number,
    baseImageUrl: string
) {
    // Generate 4 different images for each color variant
    const generateColorImages = (color: string) => {
        // Different Unsplash images for each color to show the product in that color
        const colorImageMap: { [key: string]: string[] } = {
            'black': [
                'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&auto=format&fit=crop&q=60',
                'https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=500&auto=format&fit=crop&q=60',
                'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=500&auto=format&fit=crop&q=60',
                'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=500&auto=format&fit=crop&q=60'
            ],
            'white': [
                'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&auto=format&fit=crop&q=60',
                'https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=500&auto=format&fit=crop&q=60',
                'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=500&auto=format&fit=crop&q=60',
                'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=500&auto=format&fit=crop&q=60'
            ],
            'blue': [
                'https://images.unsplash.com/photo-1542272604-787c3835535d?w=500&auto=format&fit=crop&q=60',
                'https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=500&auto=format&fit=crop&q=60',
                'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=500&auto=format&fit=crop&q=60',
                'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=500&auto=format&fit=crop&q=60'
            ],
            'navy': [
                'https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?w=500&auto=format&fit=crop&q=60',
                'https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=500&auto=format&fit=crop&q=60',
                'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=500&auto=format&fit=crop&q=60',
                'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=500&auto=format&fit=crop&q=60'
            ],
            'gray': [
                'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=500&auto=format&fit=crop&q=60',
                'https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=500&auto=format&fit=crop&q=60',
                'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=500&auto=format&fit=crop&q=60',
                'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=500&auto=format&fit=crop&q=60'
            ],
            'brown': [
                'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=500&auto=format&fit=crop&q=60',
                'https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=500&auto=format&fit=crop&q=60',
                'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=500&auto=format&fit=crop&q=60',
                'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=500&auto=format&fit=crop&q=60'
            ],
            'pink': [
                'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=500&auto=format&fit=crop&q=60',
                'https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=500&auto=format&fit=crop&q=60',
                'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=500&auto=format&fit=crop&q=60',
                'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=500&auto=format&fit=crop&q=60'
            ],
            'yellow': [
                'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=500&auto=format&fit=crop&q=60',
                'https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=500&auto=format&fit=crop&q=60',
                'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=500&auto=format&fit=crop&q=60',
                'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=500&auto=format&fit=crop&q=60'
            ],
            'red': [
                'https://images.unsplash.com/photo-1543508282-6319a3e2621f?w=500&auto=format&fit=crop&q=60',
                'https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=500&auto=format&fit=crop&q=60',
                'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=500&auto=format&fit=crop&q=60',
                'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=500&auto=format&fit=crop&q=60'
            ],
            'green': [
                'https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=500&auto=format&fit=crop&q=60',
                'https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=500&auto=format&fit=crop&q=60',
                'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=500&auto=format&fit=crop&q=60',
                'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=500&auto=format&fit=crop&q=60'
            ],
            'tan': [
                'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=500&auto=format&fit=crop&q=60',
                'https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=500&auto=format&fit=crop&q=60',
                'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=500&auto=format&fit=crop&q=60',
                'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=500&auto=format&fit=crop&q=60'
            ],
            'beige': [
                'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=500&auto=format&fit=crop&q=60',
                'https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=500&auto=format&fit=crop&q=60',
                'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=500&auto=format&fit=crop&q=60',
                'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=500&auto=format&fit=crop&q=60'
            ],
            'purple': [
                'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=500&auto=format&fit=crop&q=60',
                'https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=500&auto=format&fit=crop&q=60',
                'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=500&auto=format&fit=crop&q=60',
                'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=500&auto=format&fit=crop&q=60'
            ]
        };
        
        // Return 4 images for the specific color, or default images if color not found
        return colorImageMap[color.toLowerCase()] || [
            baseImageUrl,
            'https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=500&auto=format&fit=crop&q=60',
            'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=500&auto=format&fit=crop&q=60',
            'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=500&auto=format&fit=crop&q=60'
        ];
    };

    const colorVariants = colors.map(color => ({
        colorName: color.charAt(0).toUpperCase() + color.slice(1),
        images: generateColorImages(color), // 4 images per color
        sizes: sizes.map(size => ({
            name: size,
            stock: Math.floor(Math.random() * 20) + 10, // Random stock between 10-30
            sku: `${gender.toUpperCase()}-${type[0].toUpperCase()}-${color.substring(0, 3).toUpperCase()}-${size}`
        }))
    }));

    return {
        name,
        slug: `${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${gender}`,
        price: { current: currentPrice, old: oldPrice },
        category: {
            gender,
            type,
            colors: colorVariants
        },
        media: { thumbnail: baseImageUrl },
        fabricImages: [baseImageUrl],
        isActive: true,
        tags: type
    };
}

// Product data for each gender
const productData = {
    men: [
        createProduct("Classic Cotton T-Shirt", "men", ["clothing", "t-shirt"], ["black", "white", "navy"], ["S", "M", "L", "XL"], 29.99, 39.99, "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&auto=format&fit=crop&q=60"),
        createProduct("Slim Fit Jeans", "men", ["clothing", "jeans"], ["blue", "black"], ["30", "32", "34", "36"], 59.99, 79.99, "https://images.unsplash.com/photo-1542272604-787c3835535d?w=500&auto=format&fit=crop&q=60"),
        createProduct("Casual Blazer", "men", ["clothing", "blazer"], ["gray", "navy"], ["S", "M", "L", "XL"], 89.99, 129.99, "https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?w=500&auto=format&fit=crop&q=60"),
        createProduct("Leather Sneakers", "men", ["footwear", "sneakers"], ["white", "black"], ["7", "8", "9", "10", "11"], 79.99, 99.99, "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=500&auto=format&fit=crop&q=60"),
        createProduct("Wool Sweater", "men", ["clothing", "sweater"], ["brown", "gray", "navy"], ["S", "M", "L", "XL"], 69.99, 89.99, "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=500&auto=format&fit=crop&q=60"),
        createProduct("Formal Shirt", "men", ["clothing", "shirt"], ["white", "blue", "pink"], ["S", "M", "L", "XL"], 49.99, 69.99, "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=500&auto=format&fit=crop&q=60"),
        createProduct("Denim Jacket", "men", ["clothing", "jacket"], ["blue", "black"], ["S", "M", "L", "XL"], 69.99, 89.99, "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=500&auto=format&fit=crop&q=60"),
        createProduct("Running Shoes", "men", ["footwear", "running"], ["gray", "blue", "red"], ["7", "8", "9", "10", "11"], 99.99, 129.99, "https://images.unsplash.com/photo-1543508282-6319a3e2621f?w=500&auto=format&fit=crop&q=60"),
        createProduct("Polo Shirt", "men", ["clothing", "polo"], ["white", "blue", "red", "green"], ["S", "M", "L", "XL"], 34.99, 44.99, "https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=500&auto=format&fit=crop&q=60"),
        createProduct("Winter Coat", "men", ["clothing", "coat"], ["black", "navy", "brown"], ["S", "M", "L", "XL"], 149.99, 199.99, "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500&auto=format&fit=crop&q=60")
    ],
    women: [
        createProduct("Floral Summer Dress", "women", ["clothing", "dress"], ["blue", "pink", "yellow"], ["XS", "S", "M", "L"], 59.99, 79.99, "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=500&auto=format&fit=crop&q=60"),
        createProduct("Skinny Jeans", "women", ["clothing", "jeans"], ["blue", "black", "gray"], ["24", "26", "28", "30", "32"], 49.99, 69.99, "https://images.unsplash.com/photo-1542272604-787c3835535d?w=500&auto=format&fit=crop&q=60"),
        createProduct("Blouse", "women", ["clothing", "blouse"], ["white", "blue", "pink"], ["XS", "S", "M", "L"], 39.99, 54.99, "https://images.unsplash.com/photo-1564257631407-3deb25e9c8e0?w=500&auto=format&fit=crop&q=60"),
        createProduct("Ankle Boots", "women", ["footwear", "boots"], ["black", "brown", "tan"], ["5", "6", "7", "8", "9"], 89.99, 119.99, "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=500&auto=format&fit=crop&q=60"),
        createProduct("Cardigan", "women", ["clothing", "cardigan"], ["gray", "beige", "navy"], ["XS", "S", "M", "L"], 44.99, 59.99, "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=500&auto=format&fit=crop&q=60"),
        createProduct("Maxi Dress", "women", ["clothing", "dress"], ["black", "red", "blue"], ["XS", "S", "M", "L"], 79.99, 99.99, "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=500&auto=format&fit=crop&q=60"),
        createProduct("Leather Handbag", "women", ["accessories", "bag"], ["black", "brown", "tan"], ["One Size"], 129.99, 159.99, "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=500&auto=format&fit=crop&q=60"),
        createProduct("Sneakers", "women", ["footwear", "sneakers"], ["white", "pink", "gray"], ["5", "6", "7", "8", "9"], 69.99, 89.99, "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=500&auto=format&fit=crop&q=60"),
        createProduct("Tank Top", "women", ["clothing", "tank"], ["white", "black", "gray"], ["XS", "S", "M", "L"], 19.99, 24.99, "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&auto=format&fit=crop&q=60"),
        createProduct("Winter Jacket", "women", ["clothing", "jacket"], ["black", "navy", "red"], ["XS", "S", "M", "L"], 139.99, 179.99, "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500&auto=format&fit=crop&q=60")
    ],
    kids: [
        createProduct("Cartoon T-Shirt", "kids", ["clothing", "t-shirt"], ["blue", "red", "green"], ["2T", "3T", "4T", "5T"], 14.99, 19.99, "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&auto=format&fit=crop&q=60"),
        createProduct("Denim Shorts", "kids", ["clothing", "shorts"], ["blue", "black"], ["2T", "3T", "4T", "5T"], 19.99, 24.99, "https://images.unsplash.com/photo-1542272604-787c3835535d?w=500&auto=format&fit=crop&q=60"),
        createProduct("Hoodie", "kids", ["clothing", "hoodie"], ["gray", "blue", "red"], ["2T", "3T", "4T", "5T"], 24.99, 29.99, "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=500&auto=format&fit=crop&q=60"),
        createProduct("Sneakers", "kids", ["footwear", "sneakers"], ["white", "blue", "red"], ["10", "11", "12", "13"], 29.99, 39.99, "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=500&auto=format&fit=crop&q=60"),
        createProduct("Pajama Set", "kids", ["clothing", "pajamas"], ["blue", "pink", "green"], ["2T", "3T", "4T", "5T"], 19.99, 24.99, "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&auto=format&fit=crop&q=60"),
        createProduct("Rain Jacket", "kids", ["clothing", "jacket"], ["yellow", "blue", "red"], ["2T", "3T", "4T", "5T"], 34.99, 44.99, "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500&auto=format&fit=crop&q=60"),
        createProduct("Backpack", "kids", ["accessories", "backpack"], ["black", "blue", "red"], ["Small", "Medium"], 24.99, 29.99, "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=500&auto=format&fit=crop&q=60"),
        createProduct("Swimming Trunks", "kids", ["clothing", "swimwear"], ["blue", "red", "green"], ["2T", "3T", "4T", "5T"], 14.99, 19.99, "https://images.unsplash.com/photo-1542272604-787c3835535d?w=500&auto=format&fit=crop&q=60"),
        createProduct("Winter Hat", "kids", ["accessories", "hat"], ["blue", "red", "gray"], ["One Size"], 9.99, 12.99, "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=500&auto=format&fit=crop&q=60"),
        createProduct("Dress", "kids", ["clothing", "dress"], ["pink", "blue", "purple"], ["2T", "3T", "4T", "5T"], 29.99, 39.99, "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=500&auto=format&fit=crop&q=60")
    ],
    baby: [
        createProduct("Onesie", "baby", ["clothing", "onesie"], ["white", "blue", "pink"], ["0-3M", "3-6M", "6-9M", "9-12M"], 12.99, 16.99, "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&auto=format&fit=crop&q=60"),
        createProduct("Sleeping Bag", "baby", ["clothing", "sleeping"], ["blue", "pink", "yellow"], ["0-6M", "6-12M", "12-18M"], 24.99, 29.99, "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=500&auto=format&fit=crop&q=60"),
        createProduct("Bib Set", "baby", ["accessories", "bib"], ["white", "blue", "pink"], ["One Size"], 9.99, 12.99, "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&auto=format&fit=crop&q=60"),
        createProduct("Baby Socks", "baby", ["accessories", "socks"], ["white", "blue", "pink"], ["0-6M", "6-12M"], 4.99, 6.99, "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=500&auto=format&fit=crop&q=60"),
        createProduct("Baby Hat", "baby", ["accessories", "hat"], ["white", "blue", "pink"], ["0-6M", "6-12M"], 6.99, 8.99, "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=500&auto=format&fit=crop&q=60"),
        createProduct("Baby Pants", "baby", ["clothing", "pants"], ["gray", "blue", "green"], ["0-3M", "3-6M", "6-9M", "9-12M"], 8.99, 11.99, "https://images.unsplash.com/photo-1542272604-787c3835535d?w=500&auto=format&fit=crop&q=60"),
        createProduct("Baby Blanket", "baby", ["accessories", "blanket"], ["white", "blue", "pink"], ["Small", "Medium"], 19.99, 24.99, "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=500&auto=format&fit=crop&q=60"),
        createProduct("Baby Shoes", "baby", ["footwear", "shoes"], ["white", "blue", "pink"], ["0-6M", "6-12M"], 14.99, 18.99, "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=500&auto=format&fit=crop&q=60"),
        createProduct("Baby Towel", "baby", ["accessories", "towel"], ["white", "blue", "pink"], ["Small", "Medium"], 11.99, 14.99, "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=500&auto=format&fit=crop&q=60"),
        createProduct("Baby Romper", "baby", ["clothing", "romper"], ["white", "blue", "pink"], ["0-3M", "3-6M", "6-9M", "9-12M"], 16.99, 21.99, "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&auto=format&fit=crop&q=60")
    ]
};

async function generateProducts() {
    try {
        console.log('🚀 Starting product generation...');
        
        // Clear existing products
        await Product.deleteMany({});
        console.log('✅ Cleared existing products');
        
        let totalCreated = 0;
        
        // Generate products for each gender
        for (const [gender, products] of Object.entries(productData)) {
            console.log(`\n📦 Creating ${products.length} products for ${gender}...`);
            
            for (const product of products) {
                const newProduct = new Product(product);
                await newProduct.save();
                console.log(`✅ Created: ${product.name}`);
                totalCreated++;
            }
            
            console.log(`✅ Completed ${gender}: ${products.length} products`);
        }
        
        console.log(`\n🎉 Successfully created ${totalCreated} products total!`);
        console.log('📊 Breakdown:');
        console.log(`   - Men: ${productData.men.length} products`);
        console.log(`   - Women: ${productData.women.length} products`);
        console.log(`   - Kids: ${productData.kids.length} products`);
        console.log(`   - Baby: ${productData.baby.length} products`);
        
    } catch (error) {
        console.error('❌ Error generating products:', error);
    } finally {
        mongoose.connection.close();
        console.log('🔌 Database connection closed');
    }
}

// Run the script
generateProducts();
