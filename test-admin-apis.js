import axios from 'axios';

const API_BASE_URL = 'http://localhost:4000/api';

// Test data
const testUser = {
  name: 'Admin User',
  email: 'admin@example.com',
  password: 'admin123'
};

let authToken = '';

// Helper function to make authenticated requests
const makeAuthRequest = async (method, endpoint, data = null) => {
  const config = {
    method,
    url: `${API_BASE_URL}${endpoint}`,
    headers: {
      'Content-Type': 'application/json',
      ...(authToken && { Authorization: `Bearer ${authToken}` })
    },
    ...(data && { data })
  };
  
  try {
    const response = await axios(config);
    return response.data;
  } catch (error) {
    console.error(`Error in ${method} ${endpoint}:`, error.response?.data || error.message);
    throw error;
  }
};

// Test functions
const testSignin = async () => {
  console.log('\n🔐 Testing admin signin...');
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/signin`, testUser);
    authToken = response.data.data.token;
    console.log('✅ Admin signin successful, token received');
    return true;
  } catch (error) {
    console.log('❌ Admin signin failed, trying signup...');
    try {
      await axios.post(`${API_BASE_URL}/auth/signup`, testUser);
      const signinResponse = await axios.post(`${API_BASE_URL}/auth/signin`, testUser);
      authToken = signinResponse.data.data.token;
      console.log('✅ Admin signup and signin successful');
      return true;
    } catch (signupError) {
      console.error('❌ Admin signup also failed:', signupError.response?.data || signupError.message);
      return false;
    }
  }
};

const testGetAllProducts = async () => {
  console.log('\n📦 Testing get all products...');
  try {
    const response = await axios.get(`${API_BASE_URL}/products/gender/men?limit=10`);
    console.log('✅ All products retrieved successfully');
    console.log(`📊 Found ${response.data.data.products.length} products`);
    return response.data.data.products;
  } catch (error) {
    console.error('❌ Failed to get all products:', error.response?.data || error.message);
    return [];
  }
};

const testNewestProducts = async () => {
  console.log('\n🆕 Testing newest products API...');
  try {
    const response = await axios.get(`${API_BASE_URL}/arrival/newest?gender=men&limit=5`);
    console.log('✅ Newest products retrieved successfully');
    console.log(`📊 Found ${response.data.data.products.length} newest products`);
    response.data.data.products.forEach((product, index) => {
      console.log(`  ${index + 1}. ${product.title} - ${product.price}`);
    });
    return response.data.data.products;
  } catch (error) {
    console.error('❌ Failed to get newest products:', error.response?.data || error.message);
    return [];
  }
};

const testBestsellerProducts = async () => {
  console.log('\n⭐ Testing bestseller products API...');
  try {
    const response = await axios.get(`${API_BASE_URL}/arrival/bestseller?gender=men&limit=5`);
    console.log('✅ Bestseller products retrieved successfully');
    console.log(`📊 Found ${response.data.data.products.length} bestseller products`);
    response.data.data.products.forEach((product, index) => {
      console.log(`  ${index + 1}. ${product.title} - ${product.price}`);
    });
    return response.data.data.products;
  } catch (error) {
    console.error('❌ Failed to get bestseller products:', error.response?.data || error.message);
    return [];
  }
};

const testAddToBestseller = async (productId) => {
  console.log(`\n➕ Adding product ${productId} to bestseller...`);
  try {
    const response = await makeAuthRequest('POST', `/arrival/bestseller/${productId}`);
    console.log('✅ Product added to bestseller successfully');
    console.log(`📝 Product: ${response.data.product.name}`);
    return true;
  } catch (error) {
    console.error('❌ Failed to add product to bestseller:', error.response?.data || error.message);
    return false;
  }
};

const testRemoveFromBestseller = async (productId) => {
  console.log(`\n➖ Removing product ${productId} from bestseller...`);
  try {
    const response = await makeAuthRequest('DELETE', `/arrival/bestseller/${productId}`);
    console.log('✅ Product removed from bestseller successfully');
    console.log(`📝 Product: ${response.data.product.name}`);
    return true;
  } catch (error) {
    console.error('❌ Failed to remove product from bestseller:', error.response?.data || error.message);
    return false;
  }
};

const testGenderFiltering = async () => {
  console.log('\n👥 Testing gender filtering...');
  
  const genders = ['men', 'women', 'kids', 'baby'];
  
  for (const gender of genders) {
    try {
      console.log(`\n🔍 Testing ${gender} products...`);
      const newestResponse = await axios.get(`${API_BASE_URL}/arrival/newest?gender=${gender}&limit=3`);
      const bestsellerResponse = await axios.get(`${API_BASE_URL}/arrival/bestseller?gender=${gender}&limit=3`);
      
      console.log(`✅ ${gender} newest: ${newestResponse.data.data.products.length} products`);
      console.log(`✅ ${gender} bestseller: ${bestsellerResponse.data.data.products.length} products`);
    } catch (error) {
      console.error(`❌ Failed to get ${gender} products:`, error.response?.data || error.message);
    }
  }
};

// Main test function
const runTests = async () => {
  console.log('🚀 Starting Admin Panel Test Suite...\n');
  
  // Test authentication
  const authSuccess = await testSignin();
  if (!authSuccess) {
    console.log('❌ Authentication failed, stopping tests');
    return;
  }
  
  // Test get all products
  const allProducts = await testGetAllProducts();
  
  // Test newest products
  const newestProducts = await testNewestProducts();
  
  // Test bestseller products
  const bestsellerProducts = await testBestsellerProducts();
  
  // Test adding products to bestseller (if we have products)
  if (allProducts.length > 0) {
    console.log('\n🎯 Testing bestseller management...');
    
    // Add first product to bestseller
    const firstProduct = allProducts[0];
    await testAddToBestseller(firstProduct._id);
    
    // Add second product to bestseller
    if (allProducts.length > 1) {
      const secondProduct = allProducts[1];
      await testAddToBestseller(secondProduct._id);
    }
    
    // Check updated bestseller list
    console.log('\n📋 Checking updated bestseller list...');
    await testBestsellerProducts();
    
    // Remove first product from bestseller
    await testRemoveFromBestseller(firstProduct._id);
    
    // Check final bestseller list
    console.log('\n📋 Checking final bestseller list...');
    await testBestsellerProducts();
  }
  
  // Test gender filtering
  await testGenderFiltering();
  
  console.log('\n🎉 All admin tests completed!');
  console.log('\n📝 Next steps:');
  console.log('1. Visit http://localhost:3000/admin to use the admin panel');
  console.log('2. Use the tabs to switch between All Products, Newest Arrivals, and Bestsellers');
  console.log('3. Use the gender filter to manage products for different categories');
  console.log('4. Click "Add to Bestseller" or "Remove from Bestseller" buttons to manage bestsellers');
};

// Run the tests
runTests().catch(console.error);
