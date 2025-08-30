import axios from 'axios';

const API_BASE_URL = 'http://localhost:4000/api';

// Test user credentials (you'll need to replace with actual user data)
const testUser = {
  email: 'test@example.com',
  password: 'password123'
};

let authToken = '';

async function testBagAPI() {
  try {
    console.log('🧪 Testing Bag API...\n');

    // 1. Test signin to get token
    console.log('1. Testing signin...');
    const signinResponse = await axios.post(`${API_BASE_URL}/auth/signin`, testUser);
    authToken = signinResponse.data.data.token;
    console.log('✅ Signin successful\n');

    // 2. Test get bag
    console.log('2. Testing get bag...');
    const bagResponse = await axios.get(`${API_BASE_URL}/bag`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ Get bag successful');
    console.log('Bag items:', bagResponse.data.data.shoppingBag.length);
    console.log('Total:', bagResponse.data.data.total);
    console.log('');

    // 3. Test add item to bag (if you have a product ID)
    console.log('3. Testing add to bag...');
    // You'll need to replace with an actual product ID from your database
    const productId = '68b01bdc43caa9a54197e1f0'; // Replace with actual product ID
    
    try {
      const addResponse = await axios.post(`${API_BASE_URL}/bag/add`, {
        productId,
        quantity: 1,
        selectedColor: 'Black',
        selectedSize: 'M'
      }, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      console.log('✅ Add to bag successful\n');
    } catch (error) {
      console.log('❌ Add to bag failed:', error.response?.data?.message || error.message);
    }

    // 4. Test update item quantity
    console.log('4. Testing update quantity...');
    try {
      const updateResponse = await axios.put(`${API_BASE_URL}/bag/update/${productId}`, {
        quantity: 2
      }, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      console.log('✅ Update quantity successful\n');
    } catch (error) {
      console.log('❌ Update quantity failed:', error.response?.data?.message || error.message);
    }

    // 5. Test remove item
    console.log('5. Testing remove item...');
    try {
      const removeResponse = await axios.delete(`${API_BASE_URL}/bag/remove/${productId}`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      console.log('✅ Remove item successful\n');
    } catch (error) {
      console.log('❌ Remove item failed:', error.response?.data?.message || error.message);
    }

    console.log('🎉 Bag API test completed!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data?.message || error.message);
  }
}

testBagAPI();
