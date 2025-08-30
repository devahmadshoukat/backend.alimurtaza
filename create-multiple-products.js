import axios from 'axios';

const API_BASE_URL = 'http://localhost:4000/api';

const testProducts = [
    {
        name: "Classic Fit Denim Jacket",
        price: {
            current: 4999,
            old: 6999,
            discountPercentage: 29
        },
        category: {
            gender: "men",
            type: ["jackets", "denim"],
            colors: [
                {
                    colorName: "Blue",
                    images: [
                        "http://admin-creativelabs.vercel.app/upload/image/e419910a-05e6-4d60-b381-87109d06d6de",
                        "http://admin-creativelabs.vercel.app/upload/image/e419910a-05e6-4d60-b381-87109d06d6de"
                    ],
                    sizes: [
                        { name: "S", stock: 8, sku: "MJ-BL-S" },
                        { name: "M", stock: 12, sku: "MJ-BL-M" },
                        { name: "L", stock: 10, sku: "MJ-BL-L" },
                        { name: "XL", stock: 6, sku: "MJ-BL-XL" }
                    ]
                }
            ]
        },
        media: {
            thumbnail: "http://admin-creativelabs.vercel.app/upload/image/e419910a-05e6-4d60-b381-87109d06d6de"
        },
        fabricImages: [
            "http://admin-creativelabs.vercel.app/upload/image/40927b5f-8e70-4efd-bad2-cf042fee5a9b"
        ],
        isFeatured: true,
        isActive: true,
        tags: ["denim", "jacket", "casual"]
    },
    {
        name: "Slim Fit Chino Pants",
        price: {
            current: 2999,
            old: 3999,
            discountPercentage: 25
        },
        category: {
            gender: "men",
            type: ["pants", "chino"],
            colors: [
                {
                    colorName: "Khaki",
                    images: [
                        "http://admin-creativelabs.vercel.app/upload/image/e419910a-05e6-4d60-b381-87109d06d6de",
                        "http://admin-creativelabs.vercel.app/upload/image/e419910a-05e6-4d60-b381-87109d06d6de"
                    ],
                    sizes: [
                        { name: "30", stock: 5, sku: "MP-KH-30" },
                        { name: "32", stock: 8, sku: "MP-KH-32" },
                        { name: "34", stock: 10, sku: "MP-KH-34" },
                        { name: "36", stock: 6, sku: "MP-KH-36" }
                    ]
                }
            ]
        },
        media: {
            thumbnail: "http://admin-creativelabs.vercel.app/upload/image/e419910a-05e6-4d60-b381-87109d06d6de"
        },
        fabricImages: [
            "http://admin-creativelabs.vercel.app/upload/image/40927b5f-8e70-4efd-bad2-cf042fee5a9b"
        ],
        isFeatured: true,
        isActive: true,
        tags: ["chino", "pants", "casual"]
    },
    {
        name: "AIRism Cotton Oversized T-Shirt",
        price: {
            current: 1999,
            old: 2999,
            discountPercentage: 33
        },
        category: {
            gender: "men",
            type: ["shirts", "t-shirt"],
            colors: [
                {
                    colorName: "Black",
                    images: [
                        "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&auto=format&fit=crop&q=60",
                        "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&auto=format&fit=crop&q=60"
                    ],
                    sizes: [
                        { name: "S", stock: 20, sku: "MS-BK-S" },
                        { name: "M", stock: 25, sku: "MS-BK-M" },
                        { name: "L", stock: 22, sku: "MS-BK-L" },
                        { name: "XL", stock: 18, sku: "MS-BK-XL" }
                    ]
                }
            ]
        },
        media: {
            thumbnail: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&auto=format&fit=crop&q=60"
        },
        fabricImages: [
            "http://admin-creativelabs.vercel.app/upload/image/40927b5f-8e70-4efd-bad2-cf042fee5a9b"
        ],
        isFeatured: true,
        isActive: true,
        tags: ["cotton", "oversized", "casual"]
    }
];

async function createMultipleProducts() {
    console.log('🚀 Creating multiple test products...\n');
    
    for (let i = 0; i < testProducts.length; i++) {
        const product = testProducts[i];
        try {
            console.log(`📦 Creating product ${i + 1}/${testProducts.length}: ${product.name}`);
            
            const response = await axios.post(`${API_BASE_URL}/products`, product, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            console.log(`✅ Created: ${product.name}`);
            console.log(`🔗 Slug: ${response.data.data.slug}`);
            console.log(`🌐 View at: ${API_BASE_URL}/products/slug/${response.data.data.slug}\n`);
            
        } catch (error) {
            console.error(`❌ Error creating ${product.name}:`);
            if (error.response) {
                console.error('Status:', error.response.status);
                console.error('Error:', error.response.data);
            } else {
                console.error('Network error:', error.message);
            }
        }
    }
    
    console.log('🎉 Finished creating products!');
    console.log('📱 Now you can test the Men page and click on products to go to detail pages.');
}

// Run the script
createMultipleProducts();
