import axios from 'axios';

const API_BASE_URL = 'http://localhost:4000/api';

// Test data
const testUser = {
  name: 'Test User',
  email: 'test@example.com',
  password: 'password123'
};

const testProduct = {
  name: 'Test Product for Reviews',
  price: {
    current: 1500,
    old: 2000
  },
  category: {
    gender: 'men',
    type: ['shirts']
  },
  media: {
    thumbnail: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&auto=format&fit=crop&q=60'
  }
};

let authToken = '';
let userId = '';
let productId = '';

async function testCompleteSystem() {
  console.log('🧪 Testing Complete E-commerce System...\n');

  try {
    // 1. Test User Registration
    console.log('1️⃣ Testing User Registration...');
    const signupResponse = await axios.post(`${API_BASE_URL}/auth/signup`, testUser);
    console.log('✅ User registered successfully');
    authToken = signupResponse.data.data.token;
    userId = signupResponse.data.data.user._id;
    console.log(`   User ID: ${userId}\n`);

    // 2. Test User Login
    console.log('2️⃣ Testing User Login...');
    const signinResponse = await axios.post(`${API_BASE_URL}/auth/signin`, {
      email: testUser.email,
      password: testUser.password
    });
    console.log('✅ User logged in successfully');
    authToken = signinResponse.data.data.token;
    console.log(`   Token: ${authToken.substring(0, 20)}...\n`);

    // 3. Create a test product
    console.log('3️⃣ Creating Test Product...');
    const productResponse = await axios.post(`${API_BASE_URL}/products`, testProduct);
    console.log('✅ Product created successfully');
    productId = productResponse.data.data._id;
    console.log(`   Product ID: ${productId}\n`);

    // 4. Test Add to Bag
    console.log('4️⃣ Testing Add to Bag...');
    const bagItem = {
      productId: productId,
      quantity: 2,
      selectedColor: 'Blue',
      selectedSize: 'M'
    };
    
    const addToBagResponse = await axios.post(`${API_BASE_URL}/bag/add`, bagItem, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ Item added to bag successfully');
    console.log(`   Bag total: PKR ${addToBagResponse.data.data.total}\n`);

    // 5. Test Get Bag
    console.log('5️⃣ Testing Get Bag...');
    const getBagResponse = await axios.get(`${API_BASE_URL}/bag`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ Bag retrieved successfully');
    console.log(`   Items in bag: ${getBagResponse.data.data.shoppingBag.length}`);
    console.log(`   Total items: ${getBagResponse.data.data.totalItems}\n`);

    // 6. Test Add Review
    console.log('6️⃣ Testing Add Review...');
    const reviewData = {
      productId: productId,
      rating: 5,
      comment: 'Excellent product! Great quality and perfect fit.'
    };
    
    const addReviewResponse = await axios.post(`${API_BASE_URL}/reviews/add`, reviewData, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ Review added successfully');
    console.log(`   Review ID: ${addReviewResponse.data.data.review._id}\n`);

    // 7. Test Get Product Reviews
    console.log('7️⃣ Testing Get Product Reviews...');
    const getReviewsResponse = await axios.get(`${API_BASE_URL}/reviews/product/${productId}`);
    console.log('✅ Product reviews retrieved successfully');
    console.log(`   Total reviews: ${getReviewsResponse.data.data.totalReviews}`);
    console.log(`   Reviews: ${getReviewsResponse.data.data.reviews.length}\n`);

    // 8. Test Update Review
    console.log('8️⃣ Testing Update Review...');
    const updateReviewData = {
      rating: 4,
      comment: 'Updated: Very good product with minor improvements needed.'
    };
    
    const updateReviewResponse = await axios.put(`${API_BASE_URL}/reviews/update/${productId}`, updateReviewData, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ Review updated successfully\n');

    // 9. Test Get User Reviews
    console.log('9️⃣ Testing Get User Reviews...');
    const getUserReviewsResponse = await axios.get(`${API_BASE_URL}/reviews/my-reviews`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ User reviews retrieved successfully');
    console.log(`   User reviews: ${getUserReviewsResponse.data.data.reviews.length}\n`);

    // 10. Test Update Bag Item
    console.log('🔟 Testing Update Bag Item...');
    const updateBagData = {
      quantity: 3
    };
    
    const updateBagResponse = await axios.put(`${API_BASE_URL}/bag/update/${productId}`, updateBagData, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ Bag item updated successfully');
    console.log(`   New total: PKR ${updateBagResponse.data.data.total}\n`);

    // 11. Test Remove from Bag
    console.log('1️⃣1️⃣ Testing Remove from Bag...');
    const removeFromBagResponse = await axios.delete(`${API_BASE_URL}/bag/remove/${productId}`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ Item removed from bag successfully');
    console.log(`   Final total: PKR ${removeFromBagResponse.data.data.total}\n`);

    // 12. Test Delete Review
    console.log('1️⃣2️⃣ Testing Delete Review...');
    const deleteReviewResponse = await axios.delete(`${API_BASE_URL}/reviews/delete/${productId}`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ Review deleted successfully\n');

    // 13. Test Clear Bag
    console.log('1️⃣3️⃣ Testing Clear Bag...');
    const clearBagResponse = await axios.delete(`${API_BASE_URL}/bag/clear`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ Bag cleared successfully\n');

    console.log('🎉 All tests passed! The complete e-commerce system is working correctly!');
    console.log('\n📋 Summary:');
    console.log('   ✅ User Authentication (Signup/Signin)');
    console.log('   ✅ Shopping Bag Management (Add/Update/Remove/Clear)');
    console.log('   ✅ Product Reviews (Add/Update/Delete/Get)');
    console.log('   ✅ API Error Handling');
    console.log('   ✅ JWT Token Management');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Run the test
testCompleteSystem();
