import axios from 'axios';

const API_BASE_URL = 'http://localhost:4000/api';

const testProduct = {
    name: "Premium Cotton T-Shirt",
    price: {
        current: 2999,
        old: 3999,
        discountPercentage: 25
    },
    category: {
        gender: "men",
        type: ["shirts", "casual"],
        colors: [
            {
                colorName: "White",
                images: [
                    "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&auto=format&fit=crop&q=60",
                    "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&auto=format&fit=crop&q=60"
                ],
                sizes: [
                    {
                        name: "S",
                        stock: 15,
                        sku: "MS-WH-S"
                    },
                    {
                        name: "M",
                        stock: 20,
                        sku: "MS-WH-M"
                    },
                    {
                        name: "L",
                        stock: 18,
                        sku: "MS-WH-L"
                    },
                    {
                        name: "XL",
                        stock: 12,
                        sku: "MS-WH-XL"
                    }
                ]
            },
            {
                colorName: "Blue",
                images: [
                    "http://admin-creativelabs.vercel.app/upload/image/e419910a-05e6-4d60-b381-87109d06d6de",
                    "http://admin-creativelabs.vercel.app/upload/image/e419910a-05e6-4d60-b381-87109d06d6de"
                ],
                sizes: [
                    {
                        name: "S",
                        stock: 10,
                        sku: "MS-BL-S"
                    },
                    {
                        name: "M",
                        stock: 15,
                        sku: "MS-BL-M"
                    },
                    {
                        name: "L",
                        stock: 12,
                        sku: "MS-BL-L"
                    },
                    {
                        name: "XL",
                        stock: 8,
                        sku: "MS-BL-XL"
                    }
                ]
            }
        ]
    },
    media: {
        thumbnail: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&auto=format&fit=crop&q=60"
    },
    fabricImages: [
        "http://admin-creativelabs.vercel.app/upload/image/40927b5f-8e70-4efd-bad2-cf042fee5a9b",
        "http://admin-creativelabs.vercel.app/upload/image/40927b5f-8e70-4efd-bad2-cf042fee5a9b"
    ],
    isFeatured: true,
    isActive: true,
    tags: ["premium", "cotton", "casual"]
};

async function createTestProduct() {
    try {
        console.log('🚀 Creating test product...');
        
        const response = await axios.post(`${API_BASE_URL}/products`, testProduct, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        console.log('✅ Product created successfully!');
        console.log('📋 Product ID:', response.data.data._id);
        console.log('🔗 Slug:', response.data.data.slug);
        console.log('🌐 View at:', `${API_BASE_URL}/products/slug/${response.data.data.slug}`);
        
        return response.data.data;
    } catch (error) {
        console.error('❌ Error creating product:');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Error:', error.response.data);
        } else {
            console.error('Network error:', error.message);
        }
        throw error;
    }
}

// Run the test
createTestProduct();
