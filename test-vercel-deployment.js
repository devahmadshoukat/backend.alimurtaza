const axios = require('axios');

// Test the health endpoint
async function testHealthEndpoint() {
    try {
        console.log('Testing health endpoint...');
        const response = await axios.get('https://your-vercel-app.vercel.app/api/health');
        console.log('✅ Health endpoint working:', response.data);
    } catch (error) {
        console.error('❌ Health endpoint failed:', error.response?.data || error.message);
    }
}

// Test the API documentation endpoint
async function testApiDocs() {
    try {
        console.log('Testing API docs endpoint...');
        const response = await axios.get('https://your-vercel-app.vercel.app/api');
        console.log('✅ API docs endpoint working:', response.data.message);
    } catch (error) {
        console.error('❌ API docs endpoint failed:', error.response?.data || error.message);
    }
}

// Test products endpoint
async function testProductsEndpoint() {
    try {
        console.log('Testing products endpoint...');
        const response = await axios.get('https://your-vercel-app.vercel.app/api/products');
        console.log('✅ Products endpoint working:', response.data);
    } catch (error) {
        console.error('❌ Products endpoint failed:', error.response?.data || error.message);
    }
}

async function runTests() {
    console.log('🚀 Testing Vercel deployment...\n');
    
    await testHealthEndpoint();
    console.log('');
    
    await testApiDocs();
    console.log('');
    
    await testProductsEndpoint();
    console.log('');
    
    console.log('✨ Test completed!');
}

runTests().catch(console.error);
