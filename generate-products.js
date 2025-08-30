import mongoose from 'mongoose';
import Product from './src/models/Product.js';

// MongoDB connection
mongoose.connect('mongodb+srv://pos:pos@pos.dbt37.mongodb.net/?retryWrites=true&w=majority&appName=POS', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

// Product data for each gender
const productData = {
    men: [
        {
            name: "Classic Cotton T-Shirt",
            slug: "classic-cotton-tshirt-men",
            description: "Premium cotton t-shirt with comfortable fit and breathable fabric. Perfect for everyday wear.",
            category: { type: ["clothing"], colors: ["black", "white", "navy"], sizes: ["S", "M", "L", "XL"], gender: "men" },
            price: { current: 29.99, old: 39.99 },
            images: ["https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&auto=format&fit=crop&q=60"],
            isActive: true
        },
        {
            name: "Slim Fit Jeans",
            slug: "slim-fit-jeans-men",
            description: "Modern slim fit jeans with stretch denim for maximum comfort and style.",
            category: { type: ["clothing"], colors: ["blue", "black"], sizes: ["30", "32", "34", "36"], gender: "men" },
            price: { current: 59.99, old: 79.99 },
            images: ["https://images.unsplash.com/photo-1542272604-787c3835535d?w=500&auto=format&fit=crop&q=60"],
            isActive: true
        },
        {
            name: "Casual Blazer",
            slug: "casual-blazer-men",
            description: "Versatile casual blazer perfect for both office and evening events.",
            category: { type: ["clothing"], colors: ["gray", "navy"], sizes: ["S", "M", "L", "XL"], gender: "men" },
            price: { current: 89.99, old: 129.99 },
            images: ["https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?w=500&auto=format&fit=crop&q=60"],
            isActive: true
        },
        {
            name: "Leather Sneakers",
            slug: "leather-sneakers-men",
            description: "Premium leather sneakers with cushioned sole for all-day comfort.",
            category: { type: ["footwear"], colors: ["white", "black"], sizes: ["7", "8", "9", "10", "11"], gender: "men" },
            price: { current: 79.99, old: 99.99 },
            images: ["https://images.unsplash.com/photo-1549298916-b41d501d3772?w=500&auto=format&fit=crop&q=60"],
            isActive: true
        },
        {
            name: "Wool Sweater",
            slug: "wool-sweater-men",
            description: "Soft wool sweater perfect for cold weather with classic design.",
            category: { type: ["clothing"], colors: ["brown", "gray", "navy"], sizes: ["S", "M", "L", "XL"], gender: "men" },
            price: { current: 69.99, old: 89.99 },
            images: ["https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=500&auto=format&fit=crop&q=60"],
            isActive: true
        },
        {
            name: "Formal Shirt",
            slug: "formal-shirt-men",
            description: "Crisp formal shirt suitable for business meetings and formal occasions.",
            category: { type: ["clothing"], colors: ["white", "blue", "pink"], sizes: ["S", "M", "L", "XL"], gender: "men" },
            price: { current: 49.99, old: 69.99 },
            images: ["https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=500&auto=format&fit=crop&q=60"],
            isActive: true
        },
        {
            name: "Denim Jacket",
            slug: "denim-jacket-men",
            description: "Classic denim jacket with modern styling and comfortable fit.",
            category: { type: ["clothing"], colors: ["blue", "black"], sizes: ["S", "M", "L", "XL"], gender: "men" },
            price: { current: 69.99, old: 89.99 },
            images: ["https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=500&auto=format&fit=crop&q=60"],
            isActive: true
        },
        {
            name: "Running Shoes",
            slug: "running-shoes-men",
            description: "High-performance running shoes with advanced cushioning technology.",
            category: { type: ["footwear"], colors: ["gray", "blue", "red"], sizes: ["7", "8", "9", "10", "11"], gender: "men" },
            price: { current: 99.99, old: 129.99 },
            images: ["https://images.unsplash.com/photo-1543508282-6319a3e2621f?w=500&auto=format&fit=crop&q=60"],
            isActive: true
        },
        {
            name: "Polo Shirt",
            slug: "polo-shirt-men",
            description: "Classic polo shirt with breathable fabric and comfortable collar.",
            category: { type: ["clothing"], colors: ["white", "blue", "red", "green"], sizes: ["S", "M", "L", "XL"], gender: "men" },
            price: { current: 34.99, old: 44.99 },
            images: ["https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=500&auto=format&fit=crop&q=60"],
            isActive: true
        },
        {
            name: "Winter Coat",
            slug: "winter-coat-men",
            description: "Warm winter coat with insulation and water-resistant exterior.",
            category: { type: ["clothing"], colors: ["black", "navy", "brown"], sizes: ["S", "M", "L", "XL"], gender: "men" },
            price: { current: 149.99, old: 199.99 },
            images: ["https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500&auto=format&fit=crop&q=60"],
            isActive: true
        }
    ],
    women: [
        {
            name: "Floral Summer Dress",
            slug: "floral-summer-dress-women",
            description: "Beautiful floral print summer dress perfect for warm weather and outdoor events.",
            category: { type: ["clothing"], colors: ["blue", "pink", "yellow"], sizes: ["XS", "S", "M", "L"], gender: "women" },
            price: { current: 59.99, old: 79.99 },
            images: ["https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=500&auto=format&fit=crop&q=60"],
            isActive: true
        },
        {
            name: "Skinny Jeans",
            slug: "skinny-jeans-women",
            description: "Comfortable skinny jeans with stretch denim for a perfect fit.",
            category: { type: ["clothing"], colors: ["blue", "black", "gray"], sizes: ["24", "26", "28", "30", "32"], gender: "women" },
            price: { current: 49.99, old: 69.99 },
            images: ["https://images.unsplash.com/photo-1542272604-787c3835535d?w=500&auto=format&fit=crop&q=60"],
            isActive: true
        },
        {
            name: "Blouse",
            slug: "blouse-women",
            description: "Elegant blouse suitable for office wear and casual outings.",
            category: { type: ["clothing"], colors: ["white", "blue", "pink"], sizes: ["XS", "S", "M", "L"], gender: "women" },
            price: { current: 39.99, old: 54.99 },
            images: ["https://images.unsplash.com/photo-1564257631407-3deb25e9c8e0?w=500&auto=format&fit=crop&q=60"],
            isActive: true
        },
        {
            name: "Ankle Boots",
            slug: "ankle-boots-women",
            description: "Stylish ankle boots with comfortable heel and durable construction.",
            category: { type: ["footwear"], colors: ["black", "brown", "tan"], sizes: ["5", "6", "7", "8", "9"], gender: "women" },
            price: { current: 89.99, old: 119.99 },
            images: ["https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=500&auto=format&fit=crop&q=60"],
            isActive: true
        },
        {
            name: "Cardigan",
            slug: "cardigan-women",
            description: "Soft knit cardigan perfect for layering in any season.",
            category: { type: ["clothing"], colors: ["gray", "beige", "navy"], sizes: ["XS", "S", "M", "L"], gender: "women" },
            price: { current: 44.99, old: 59.99 },
            images: ["https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=500&auto=format&fit=crop&q=60"],
            isActive: true
        },
        {
            name: "Maxi Dress",
            slug: "maxi-dress-women",
            description: "Elegant maxi dress perfect for special occasions and evening events.",
            category: { type: ["clothing"], colors: ["black", "red", "blue"], sizes: ["XS", "S", "M", "L"], gender: "women" },
            price: { current: 79.99, old: 99.99 },
            images: ["https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=500&auto=format&fit=crop&q=60"],
            isActive: true
        },
        {
            name: "Leather Handbag",
            slug: "leather-handbag-women",
            description: "Premium leather handbag with multiple compartments and elegant design.",
            category: { type: ["accessories"], colors: ["black", "brown", "tan"], sizes: ["One Size"], gender: "women" },
            price: { current: 129.99, old: 159.99 },
            images: ["https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=500&auto=format&fit=crop&q=60"],
            isActive: true
        },
        {
            name: "Sneakers",
            slug: "sneakers-women",
            description: "Comfortable sneakers with stylish design for everyday wear.",
            category: { type: ["footwear"], colors: ["white", "pink", "gray"], sizes: ["5", "6", "7", "8", "9"], gender: "women" },
            price: { current: 69.99, old: 89.99 },
            images: ["https://images.unsplash.com/photo-1549298916-b41d501d3772?w=500&auto=format&fit=crop&q=60"],
            isActive: true
        },
        {
            name: "Tank Top",
            slug: "tank-top-women",
            description: "Comfortable tank top perfect for summer and layering.",
            category: { type: ["clothing"], colors: ["white", "black", "gray"], sizes: ["XS", "S", "M", "L"], gender: "women" },
            price: { current: 19.99, old: 24.99 },
            images: ["https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&auto=format&fit=crop&q=60"],
            isActive: true
        },
        {
            name: "Winter Jacket",
            slug: "winter-jacket-women",
            description: "Warm and stylish winter jacket with insulation and water resistance.",
            category: { type: ["clothing"], colors: ["black", "navy", "red"], sizes: ["XS", "S", "M", "L"], gender: "women" },
            price: { current: 139.99, old: 179.99 },
            images: ["https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500&auto=format&fit=crop&q=60"],
            isActive: true
        }
    ],
    kids: [
        {
            name: "Cartoon T-Shirt",
            slug: "cartoon-tshirt-kids",
            description: "Fun cartoon print t-shirt perfect for kids with comfortable cotton fabric.",
            category: { type: ["clothing"], colors: ["blue", "red", "green"], sizes: ["2T", "3T", "4T", "5T"], gender: "kids" },
            price: { current: 14.99, old: 19.99 },
            images: ["https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&auto=format&fit=crop&q=60"],
            isActive: true
        },
        {
            name: "Denim Shorts",
            slug: "denim-shorts-kids",
            description: "Comfortable denim shorts perfect for active kids during summer.",
            category: { type: ["clothing"], colors: ["blue", "black"], sizes: ["2T", "3T", "4T", "5T"], gender: "kids" },
            price: { current: 19.99, old: 24.99 },
            images: ["https://images.unsplash.com/photo-1542272604-787c3835535d?w=500&auto=format&fit=crop&q=60"],
            isActive: true
        },
        {
            name: "Hoodie",
            slug: "hoodie-kids",
            description: "Warm and cozy hoodie perfect for cool weather and outdoor activities.",
            category: { type: ["clothing"], colors: ["gray", "blue", "red"], sizes: ["2T", "3T", "4T", "5T"], gender: "kids" },
            price: { current: 24.99, old: 29.99 },
            images: ["https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=500&auto=format&fit=crop&q=60"],
            isActive: true
        },
        {
            name: "Sneakers",
            slug: "sneakers-kids",
            description: "Comfortable sneakers with velcro closure perfect for active kids.",
            category: { type: ["footwear"], colors: ["white", "blue", "red"], sizes: ["10", "11", "12", "13"], gender: "kids" },
            price: { current: 29.99, old: 39.99 },
            images: ["https://images.unsplash.com/photo-1549298916-b41d501d3772?w=500&auto=format&fit=crop&q=60"],
            isActive: true
        },
        {
            name: "Pajama Set",
            slug: "pajama-set-kids",
            description: "Comfortable pajama set with fun prints perfect for bedtime.",
            category: { type: ["clothing"], colors: ["blue", "pink", "green"], sizes: ["2T", "3T", "4T", "5T"], gender: "kids" },
            price: { current: 19.99, old: 24.99 },
            images: ["https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&auto=format&fit=crop&q=60"],
            isActive: true
        },
        {
            name: "Rain Jacket",
            slug: "rain-jacket-kids",
            description: "Waterproof rain jacket perfect for rainy days and outdoor adventures.",
            category: { type: ["clothing"], colors: ["yellow", "blue", "red"], sizes: ["2T", "3T", "4T", "5T"], gender: "kids" },
            price: { current: 34.99, old: 44.99 },
            images: ["https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500&auto=format&fit=crop&q=60"],
            isActive: true
        },
        {
            name: "Backpack",
            slug: "backpack-kids",
            description: "Durable backpack with multiple compartments perfect for school and travel.",
            category: { type: ["accessories"], colors: ["black", "blue", "red"], sizes: ["Small", "Medium"], gender: "kids" },
            price: { current: 24.99, old: 29.99 },
            images: ["https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=500&auto=format&fit=crop&q=60"],
            isActive: true
        },
        {
            name: "Swimming Trunks",
            slug: "swimming-trunks-kids",
            description: "Comfortable swimming trunks perfect for pool and beach activities.",
            category: { type: ["clothing"], colors: ["blue", "red", "green"], sizes: ["2T", "3T", "4T", "5T"], gender: "kids" },
            price: { current: 14.99, old: 19.99 },
            images: ["https://images.unsplash.com/photo-1542272604-787c3835535d?w=500&auto=format&fit=crop&q=60"],
            isActive: true
        },
        {
            name: "Winter Hat",
            slug: "winter-hat-kids",
            description: "Warm winter hat perfect for cold weather protection.",
            category: { type: ["accessories"], colors: ["blue", "red", "gray"], sizes: ["One Size"], gender: "kids" },
            price: { current: 9.99, old: 12.99 },
            images: ["https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=500&auto=format&fit=crop&q=60"],
            isActive: true
        },
        {
            name: "Dress",
            slug: "dress-kids",
            description: "Beautiful dress perfect for special occasions and parties.",
            category: { type: ["clothing"], colors: ["pink", "blue", "purple"], sizes: ["2T", "3T", "4T", "5T"], gender: "kids" },
            price: { current: 29.99, old: 39.99 },
            images: ["https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=500&auto=format&fit=crop&q=60"],
            isActive: true
        }
    ],
    baby: [
        {
            name: "Onesie",
            slug: "onesie-baby",
            description: "Soft cotton onesie perfect for newborns and infants with snap closure.",
            category: { type: ["clothing"], colors: ["white", "blue", "pink"], sizes: ["0-3M", "3-6M", "6-9M", "9-12M"], gender: "baby" },
            price: { current: 12.99, old: 16.99 },
            images: ["https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&auto=format&fit=crop&q=60"],
            isActive: true
        },
        {
            name: "Sleeping Bag",
            slug: "sleeping-bag-baby",
            description: "Cozy sleeping bag perfect for safe and comfortable sleep.",
            category: { type: ["clothing"], colors: ["blue", "pink", "yellow"], sizes: ["0-6M", "6-12M", "12-18M"], gender: "baby" },
            price: { current: 24.99, old: 29.99 },
            images: ["https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=500&auto=format&fit=crop&q=60"],
            isActive: true
        },
        {
            name: "Bib Set",
            slug: "bib-set-baby",
            description: "Soft bib set perfect for feeding time and keeping clothes clean.",
            category: { type: ["accessories"], colors: ["white", "blue", "pink"], sizes: ["One Size"], gender: "baby" },
            price: { current: 9.99, old: 12.99 },
            images: ["https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&auto=format&fit=crop&q=60"],
            isActive: true
        },
        {
            name: "Baby Socks",
            slug: "baby-socks-baby",
            description: "Soft cotton socks perfect for keeping baby's feet warm and comfortable.",
            category: { type: ["accessories"], colors: ["white", "blue", "pink"], sizes: ["0-6M", "6-12M"], gender: "baby" },
            price: { current: 4.99, old: 6.99 },
            images: ["https://images.unsplash.com/photo-1549298916-b41d501d3772?w=500&auto=format&fit=crop&q=60"],
            isActive: true
        },
        {
            name: "Baby Hat",
            slug: "baby-hat-baby",
            description: "Soft cotton hat perfect for protecting baby's head from sun and cold.",
            category: { type: ["accessories"], colors: ["white", "blue", "pink"], sizes: ["0-6M", "6-12M"], gender: "baby" },
            price: { current: 6.99, old: 8.99 },
            images: ["https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=500&auto=format&fit=crop&q=60"],
            isActive: true
        },
        {
            name: "Baby Pants",
            slug: "baby-pants-baby",
            description: "Comfortable baby pants with elastic waist perfect for everyday wear.",
            category: { type: ["clothing"], colors: ["gray", "blue", "green"], sizes: ["0-3M", "3-6M", "6-9M", "9-12M"], gender: "baby" },
            price: { current: 8.99, old: 11.99 },
            images: ["https://images.unsplash.com/photo-1542272604-787c3835535d?w=500&auto=format&fit=crop&q=60"],
            isActive: true
        },
        {
            name: "Baby Blanket",
            slug: "baby-blanket-baby",
            description: "Soft and warm baby blanket perfect for swaddling and comfort.",
            category: { type: ["accessories"], colors: ["white", "blue", "pink"], sizes: ["Small", "Medium"], gender: "baby" },
            price: { current: 19.99, old: 24.99 },
            images: ["https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=500&auto=format&fit=crop&q=60"],
            isActive: true
        },
        {
            name: "Baby Shoes",
            slug: "baby-shoes-baby",
            description: "Soft baby shoes perfect for protecting little feet during early walking.",
            category: { type: ["footwear"], colors: ["white", "blue", "pink"], sizes: ["0-6M", "6-12M"], gender: "baby" },
            price: { current: 14.99, old: 18.99 },
            images: ["https://images.unsplash.com/photo-1549298916-b41d501d3772?w=500&auto=format&fit=crop&q=60"],
            isActive: true
        },
        {
            name: "Baby Towel",
            slug: "baby-towel-baby",
            description: "Soft and absorbent baby towel perfect for bath time.",
            category: { type: ["accessories"], colors: ["white", "blue", "pink"], sizes: ["Small", "Medium"], gender: "baby" },
            price: { current: 11.99, old: 14.99 },
            images: ["https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=500&auto=format&fit=crop&q=60"],
            isActive: true
        },
        {
            name: "Baby Romper",
            slug: "baby-romper-baby",
            description: "Adorable baby romper perfect for special occasions and photos.",
            category: { type: ["clothing"], colors: ["white", "blue", "pink"], sizes: ["0-3M", "3-6M", "6-9M", "9-12M"], gender: "baby" },
            price: { current: 16.99, old: 21.99 },
            images: ["https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&auto=format&fit=crop&q=60"],
            isActive: true
        }
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
