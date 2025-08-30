import axios from 'axios';

const API_BASE_URL = 'http://localhost:4000/api';

// Test data
const testUser = {
  email: 'test@example.com',
  password: 'password123'
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
  console.log('\n🔐 Testing signin...');
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/signin`, testUser);
    authToken = response.data.data.token;
    console.log('✅ Signin successful, token received');
    return true;
  } catch (error) {
    console.log('❌ Signin failed, trying signup...');
    try {
      await axios.post(`${API_BASE_URL}/auth/signup`, testUser);
      const signinResponse = await axios.post(`${API_BASE_URL}/auth/signin`, testUser);
      authToken = signinResponse.data.data.token;
      console.log('✅ Signup and signin successful');
      return true;
    } catch (signupError) {
      console.error('❌ Signup also failed:', signupError.response?.data || signupError.message);
      return false;
    }
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
  console.log('🚀 Starting Arrival APIs Test Suite...\n');
  
  // Test authentication
  const authSuccess = await testSignin();
  if (!authSuccess) {
    console.log('❌ Authentication failed, stopping tests');
    return;
  }
  
  // Test newest products
  const newestProducts = await testNewestProducts();
  
  // Test bestseller products
  const bestsellerProducts = await testBestsellerProducts();
  
  // Test adding products to bestseller (if we have products)
  if (newestProducts.length > 0) {
    const firstProduct = newestProducts[0];
    await testAddToBestseller(firstProduct.id);
    
    // Test removing from bestseller
    await testRemoveFromBestseller(firstProduct.id);
  }
  
  // Test gender filtering
  await testGenderFiltering();
  
  console.log('\n🎉 All tests completed!');
};

// Run the tests
runTests().catch(console.error);
