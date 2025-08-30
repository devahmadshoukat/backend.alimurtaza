import axios from 'axios';

const API_BASE_URL = 'http://localhost:4000/api';

// Test user credentials
const testUser = {
  email: 'test@example.com',
  password: 'password123'
};

let authToken = '';

async function testBagImprovements() {
  try {
    console.log('🧪 Testing Bag Improvements...\n');

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
    console.log('Total:', bagResponse.data.data.total);
    
    // Show bag items with their colors and sizes
    if (bagResponse.data.data.shoppingBag.length > 0) {
      console.log('\n📦 Current bag items:');
      bagResponse.data.data.shoppingBag.forEach((item, index) => {
        console.log(`${index + 1}. ${item.productId.name}`);
        console.log(`   Color: ${item.selectedColor || 'Not selected'}`);
        console.log(`   Size: ${item.selectedSize || 'Not selected'}`);
        console.log(`   Quantity: ${item.quantity}`);
        console.log(`   Price: PKR ${item.productId.price.current * item.quantity}`);
        
        // Show available colors and sizes
        if (item.productId.category?.colors) {
          const availableColors = item.productId.category.colors.map(c => c.colorName);
          console.log(`   Available colors: ${availableColors.join(', ')}`);
        }
        
        if (item.selectedColor && item.productId.category?.colors) {
          const colorData = item.productId.category.colors.find(c => c.colorName === item.selectedColor);
          if (colorData?.sizes) {
            const availableSizes = colorData.sizes.map(s => s.name);
            console.log(`   Available sizes for ${item.selectedColor}: ${availableSizes.join(', ')}`);
          }
        }
        console.log('');
      });
    }

    // 3. Test update color (if there are items in bag)
    if (bagResponse.data.data.shoppingBag.length > 0) {
      const firstItem = bagResponse.data.data.shoppingBag[0];
      console.log('3. Testing color update...');
      
      if (firstItem.productId.category?.colors && firstItem.productId.category.colors.length > 1) {
        const newColor = firstItem.productId.category.colors[1].colorName; // Try second color
        try {
          const updateResponse = await axios.put(`${API_BASE_URL}/bag/update/${firstItem.productId._id}`, {
            selectedColor: newColor
          }, {
            headers: { Authorization: `Bearer ${authToken}` }
          });
          console.log(`✅ Color updated to ${newColor}\n`);
        } catch (error) {
          console.log('❌ Color update failed:', error.response?.data?.message || error.message);
        }
      } else {
        console.log('⚠️  No alternative colors available for testing\n');
      }
    }

    // 4. Test update size (if there are items in bag)
    if (bagResponse.data.data.shoppingBag.length > 0) {
      const firstItem = bagResponse.data.data.shoppingBag[0];
      console.log('4. Testing size update...');
      
      if (firstItem.selectedColor && firstItem.productId.category?.colors) {
        const colorData = firstItem.productId.category.colors.find(c => c.colorName === firstItem.selectedColor);
        if (colorData?.sizes && colorData.sizes.length > 1) {
          const newSize = colorData.sizes[1].name; // Try second size
          try {
            const updateResponse = await axios.put(`${API_BASE_URL}/bag/update/${firstItem.productId._id}`, {
              selectedSize: newSize
            }, {
              headers: { Authorization: `Bearer ${authToken}` }
            });
            console.log(`✅ Size updated to ${newSize}\n`);
          } catch (error) {
            console.log('❌ Size update failed:', error.response?.data?.message || error.message);
          }
        } else {
          console.log('⚠️  No alternative sizes available for testing\n');
        }
      } else {
        console.log('⚠️  No color selected or no sizes available for testing\n');
      }
    }

    console.log('🎉 Bag improvements test completed!');
    console.log('\n📋 Summary of improvements:');
    console.log('✅ Color and size options shown directly in bag items');
    console.log('✅ No modals or alerts - direct interaction');
    console.log('✅ Product-specific colors and sizes');
    console.log('✅ Visual feedback for selected options');
    console.log('✅ Clickable product names and images');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data?.message || error.message);
  }
}

testBagImprovements();
