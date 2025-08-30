#!/usr/bin/env node

import readline from 'readline';
import axios from 'axios';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const API_BASE_URL = 'http://localhost:4000/api/products';

// Helper function to ask questions
function askQuestion(question) {
    return new Promise((resolve) => {
        rl.question(question, (answer) => {
            resolve(answer.trim());
        });
    });
}

// Helper function to ask for array input
async function askForArray(question, itemQuestion) {
    const items = [];
    console.log(question);
    
    while (true) {
        const item = await askQuestion(itemQuestion);
        if (item.toLowerCase() === 'done' || item === '') {
            break;
        }
        items.push(item);
    }
    
    return items;
}

// Helper function to ask for object input
async function askForObject(question, fields) {
    const obj = {};
    console.log(question);
    
    for (const [key, fieldQuestion] of Object.entries(fields)) {
        obj[key] = await askQuestion(fieldQuestion);
    }
    
    return obj;
}

// Helper function to ask for color variants
async function askForColors() {
    const colors = [];
    console.log('\n=== Color Variants ===');
    
    while (true) {
        const addColor = await askQuestion('Add a color variant? (yes/no): ');
        if (addColor.toLowerCase() !== 'yes' && addColor.toLowerCase() !== 'y') {
            break;
        }
        
        const colorName = await askQuestion('Color name (e.g., White, Blue): ');
        const images = await askForArray(
            'Enter image URLs (type "done" when finished):',
            'Image URL: '
        );
        
        const sizes = await askForSizes();
        
        colors.push({
            colorName,
            images,
            sizes
        });
    }
    
    return colors;
}

// Helper function to ask for sizes
async function askForSizes() {
    const sizes = [];
    console.log('\n--- Sizes for this color ---');
    
    while (true) {
        const addSize = await askQuestion('Add a size? (yes/no): ');
        if (addSize.toLowerCase() !== 'yes' && addSize.toLowerCase() !== 'y') {
            break;
        }
        
        const sizeName = await askQuestion('Size name (e.g., S, M, L, XL): ');
        const stock = parseInt(await askQuestion('Stock quantity: ')) || 0;
        const sku = await askQuestion('SKU (optional): ');
        
        sizes.push({
            name: sizeName,
            stock,
            sku: sku || undefined
        });
    }
    
    return sizes;
}

// Main function to collect product data
async function collectProductData() {
    console.log('🛍️  A. Ali Murtaza Store - Product Creator\n');
    
    const product = {
        name: await askQuestion('Product name: '),
        price: await askForObject('=== Price Information ===', {
            current: 'Current price (in cents, e.g., 2999 for $29.99): ',
            old: 'Old price (optional, in cents): ',
            discountPercentage: 'Discount percentage (0-100): '
        }),
        category: {
            gender: await askQuestion('Gender (men/women/kids/baby): '),
            type: await askForArray(
                'Enter category types (type "done" when finished):',
                'Category type: '
            ),
            colors: await askForColors()
        },
        media: {
            thumbnail: await askQuestion('Thumbnail image URL: ')
        },
        fabricImages: await askForArray(
            'Enter fabric image URLs (type "done" when finished):',
            'Fabric image URL: '
        ),
        isFeatured: (await askQuestion('Is featured? (yes/no): ')).toLowerCase() === 'yes',
        isActive: (await askQuestion('Is active? (yes/no): ')).toLowerCase() === 'yes',
        tags: await askForArray(
            'Enter tags (type "done" when finished):',
            'Tag: '
        )
    };
    
    // Convert string values to numbers where needed
    product.price.current = parseInt(product.price.current);
    product.price.old = product.price.old ? parseInt(product.price.old) : undefined;
    product.price.discountPercentage = parseInt(product.price.discountPercentage);
    
    return product;
}

// Function to send product to API
async function createProduct(productData) {
    try {
        console.log('\n📤 Sending product to API...');
        
        const response = await axios.post(API_BASE_URL, productData, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        console.log('✅ Product created successfully!');
        console.log('📋 Product ID:', response.data.data._id);
        console.log('🔗 View at:', `${API_BASE_URL}/id/${response.data.data._id}`);
        
        return response.data;
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

// Main execution
async function main() {
    try {
        console.log('🚀 Starting product creation...\n');
        
        const productData = await collectProductData();
        
        console.log('\n📝 Product Summary:');
        console.log('Name:', productData.name);
        console.log('Price:', `$${(productData.price.current / 100).toFixed(2)}`);
        console.log('Gender:', productData.category.gender);
        console.log('Categories:', productData.category.type.join(', '));
        console.log('Colors:', productData.category.colors.length);
        console.log('Featured:', productData.isFeatured ? 'Yes' : 'No');
        
        const confirm = await askQuestion('\nCreate this product? (yes/no): ');
        if (confirm.toLowerCase() === 'yes' || confirm.toLowerCase() === 'y') {
            await createProduct(productData);
        } else {
            console.log('❌ Product creation cancelled.');
        }
    } catch (error) {
        console.error('❌ An error occurred:', error.message);
    } finally {
        rl.close();
    }
}

// Run the script
main();
