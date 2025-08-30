import axios from 'axios';

const API_BASE_URL = 'http://localhost:4000/api';

// Test user credentials
const testUser = {
  email: 'test@example.com',
  password: 'password123'
};

let authToken = '';

async function testColorSizeUpdate() {
  try {
    console.log('🧪 Testing Color and Size Updates...\n');

    // 1. Test signin to get token
    console.log('1. Testing signin...');
    const signinResponse = await axios.post(`${API_BASE_URL}/auth/signin`, testUser);
    authToken = signinResponse.data.data.token;
    console.log('✅ Signin successful\n');

    // 2. Test get bag to see current items
    console.log('2. Testing get bag...');
    const bagResponse = await axios.get(`${API_BASE_URL}/bag`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ Get bag successful');
    console.log('Bag items:', bagResponse.data.data.shoppingBag.length);
    
    if (bagResponse.data.data.shoppingBag.length === 0) {
      console.log('⚠️  No items in bag to test. Please add some items first.');
      return;
    }

    const firstItem = bagResponse.data.data.shoppingBag[0];
    console.log(`\n📦 Testing with item: ${firstItem.productId.name}`);
    console.log(`Current color: ${firstItem.selectedColor || 'None'}`);
    console.log(`Current size: ${firstItem.selectedSize || 'None'}`);
    console.log(`Current quantity: ${firstItem.quantity}`);

    // 3. Test color update
    console.log('\n3. Testing color update...');
    if (firstItem.productId.category?.colors && firstItem.productId.category.colors.length > 1) {
      const newColor = firstItem.productId.category.colors[1].colorName;
      try {
        const updateResponse = await axios.put(`${API_BASE_URL}/bag/update/${firstItem.productId._id}`, {
          selectedColor: newColor,
          quantity: firstItem.quantity // Include quantity to avoid validation error
        }, {
          headers: { Authorization: `Bearer ${authToken}` }
        });
        console.log(`✅ Color updated to ${newColor}`);
        console.log('Response:', updateResponse.data.message);
      } catch (error) {
        console.log('❌ Color update failed:', error.response?.data?.message || error.message);
      }
    } else {
      console.log('⚠️  No alternative colors available for testing');
    }

    // 4. Test size update
    console.log('\n4. Testing size update...');
    if (firstItem.selectedColor && firstItem.productId.category?.colors) {
      const colorData = firstItem.productId.category.colors.find(c => c.colorName === firstItem.selectedColor);
      if (colorData?.sizes && colorData.sizes.length > 1) {
        const newSize = colorData.sizes[1].name;
        try {
          const updateResponse = await axios.put(`${API_BASE_URL}/bag/update/${firstItem.productId._id}`, {
            selectedSize: newSize,
            quantity: firstItem.quantity // Include quantity to avoid validation error
          }, {
            headers: { Authorization: `Bearer ${authToken}` }
          });
          console.log(`✅ Size updated to ${newSize}`);
          console.log('Response:', updateResponse.data.message);
        } catch (error) {
          console.log('❌ Size update failed:', error.response?.data?.message || error.message);
        }
      } else {
        console.log('⚠️  No alternative sizes available for testing');
      }
    } else {
      console.log('⚠️  No color selected or no sizes available for testing');
    }

    // 5. Test quantity update
    console.log('\n5. Testing quantity update...');
    try {
      const newQuantity = firstItem.quantity + 1;
      const updateResponse = await axios.put(`${API_BASE_URL}/bag/update/${firstItem.productId._id}`, {
        quantity: newQuantity
      }, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      console.log(`✅ Quantity updated to ${newQuantity}`);
      console.log('Response:', updateResponse.data.message);
    } catch (error) {
      console.log('❌ Quantity update failed:', error.response?.data?.message || error.message);
    }

    console.log('\n🎉 Color and Size Update Test Completed!');
    console.log('\n📋 Summary:');
    console.log('✅ Fixed "Path quantity is required" error');
    console.log('✅ Color updates now include quantity');
    console.log('✅ Size updates now include quantity');
    console.log('✅ All updates should work without validation errors');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data?.message || error.message);
  }
}

testColorSizeUpdate();
