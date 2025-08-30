import axios from 'axios';

const API_BASE_URL = 'http://localhost:4000/api';

// Test user data
const testUser = {
  name: 'Test User',
  email: 'test@example.com',
  password: 'password123',
  phone: '+1234567890'
};

let authToken = '';
let productId = '';

// Test Authentication APIs
async function testAuth() {
  console.log('🔐 Testing Authentication APIs...\n');

  try {
    // Test signup
    console.log('1. Testing User Signup...');
    const signupResponse = await axios.post(`${API_BASE_URL}/auth/signup`, testUser);
    console.log('✅ Signup successful:', signupResponse.data.message);
    authToken = signupResponse.data.data.token;
    console.log('Token received:', authToken.substring(0, 20) + '...\n');

    // Test signin
    console.log('2. Testing User Signin...');
    const signinResponse = await axios.post(`${API_BASE_URL}/auth/signin`, {
      email: testUser.email,
      password: testUser.password
    });
    console.log('✅ Signin successful:', signinResponse.data.message);
    authToken = signinResponse.data.data.token;
    console.log('Token received:', authToken.substring(0, 20) + '...\n');

    // Test get profile
    console.log('3. Testing Get Profile...');
    const profileResponse = await axios.get(`${API_BASE_URL}/auth/profile`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ Profile retrieved:', profileResponse.data.data.user.name);
    console.log('Email:', profileResponse.data.data.user.email, '\n');

  } catch (error) {
    console.error('❌ Auth test failed:', error.response?.data || error.message);
  }
}

// Test Shopping Bag APIs
async function testShoppingBag() {
  console.log('🛒 Testing Shopping Bag APIs...\n');

  try {
    // First, get a product to add to bag
    console.log('1. Getting a product to add to bag...');
    const productsResponse = await axios.get(`${API_BASE_URL}/products?limit=1`);
    if (productsResponse.data.data.products.length > 0) {
      productId = productsResponse.data.data.products[0]._id;
      console.log('✅ Product found:', productsResponse.data.data.products[0].name);
    } else {
      console.log('❌ No products found');
      return;
    }

    // Test add to bag
    console.log('\n2. Testing Add to Bag...');
    const addToBagResponse = await axios.post(`${API_BASE_URL}/bag/add`, {
      productId,
      quantity: 2,
      selectedColor: 'Blue',
      selectedSize: 'M'
    }, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ Item added to bag:', addToBagResponse.data.message);
    console.log('Total items in bag:', addToBagResponse.data.data.totalItems, '\n');

    // Test get bag
    console.log('3. Testing Get Shopping Bag...');
    const getBagResponse = await axios.get(`${API_BASE_URL}/bag`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ Bag retrieved successfully');
    console.log('Items in bag:', getBagResponse.data.data.totalItems);
    console.log('Total value:', getBagResponse.data.data.total, '\n');

    // Test update item
    console.log('4. Testing Update Item Quantity...');
    const updateResponse = await axios.put(`${API_BASE_URL}/bag/update/${productId}`, {
      quantity: 3,
      selectedColor: 'Red'
    }, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ Item updated:', updateResponse.data.message, '\n');

    // Test remove item
    console.log('5. Testing Remove Item...');
    const removeResponse = await axios.delete(`${API_BASE_URL}/bag/remove/${productId}`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ Item removed:', removeResponse.data.message);
    console.log('Remaining items:', removeResponse.data.data.totalItems, '\n');

  } catch (error) {
    console.error('❌ Shopping bag test failed:', error.response?.data || error.message);
  }
}

// Test Review APIs
async function testReviews() {
  console.log('⭐ Testing Review APIs...\n');

  try {
    // Test add review
    console.log('1. Testing Add Review...');
    const addReviewResponse = await axios.post(`${API_BASE_URL}/reviews/add`, {
      productId,
      rating: 5,
      comment: 'Excellent product! Great quality and fast delivery.'
    }, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ Review added:', addReviewResponse.data.message, '\n');

    // Test get product reviews (public)
    console.log('2. Testing Get Product Reviews...');
    const getReviewsResponse = await axios.get(`${API_BASE_URL}/reviews/product/${productId}`);
    console.log('✅ Product reviews retrieved');
    console.log('Total reviews:', getReviewsResponse.data.data.totalReviews);
    console.log('Reviews:', getReviewsResponse.data.data.reviews.length, '\n');

    // Test get user's reviews
    console.log('3. Testing Get User Reviews...');
    const getUserReviewsResponse = await axios.get(`${API_BASE_URL}/reviews/my-reviews`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ User reviews retrieved');
    console.log('User reviews:', getUserReviewsResponse.data.data.totalReviews, '\n');

    // Test update review
    console.log('4. Testing Update Review...');
    const updateReviewResponse = await axios.put(`${API_BASE_URL}/reviews/update/${productId}`, {
      rating: 4,
      comment: 'Very good product, but could be better.'
    }, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ Review updated:', updateReviewResponse.data.message, '\n');

    // Test delete review
    console.log('5. Testing Delete Review...');
    const deleteReviewResponse = await axios.delete(`${API_BASE_URL}/reviews/delete/${productId}`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ Review deleted:', deleteReviewResponse.data.message, '\n');

  } catch (error) {
    console.error('❌ Review test failed:', error.response?.data || error.message);
  }
}

// Run all tests
async function runAllTests() {
  console.log('🚀 Starting User API Tests...\n');
  
  await testAuth();
  await testShoppingBag();
  await testReviews();
  
  console.log('✅ All tests completed!');
}

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runAllTests().catch(console.error);
}

export { testAuth, testShoppingBag, testReviews };
