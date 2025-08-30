// Test hero form validation
const testHeroFormValidation = () => {
  console.log('🧪 Testing hero form validation...');
  
  // Test case 1: Empty form data
  const emptyFormData = {
    media: { type: 'image', src: '' },
    isActive: true
  };
  
  console.log('📋 Test 1 - Empty form data:', emptyFormData);
  console.log('❌ Should fail validation:', !emptyFormData.media.src || !emptyFormData.media.type);
  
  // Test case 2: Valid form data
  const validFormData = {
    media: { 
      type: 'image', 
      src: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&auto=format&fit=crop&q=60' 
    },
    isActive: true
  };
  
  console.log('📋 Test 2 - Valid form data:', validFormData);
  console.log('✅ Should pass validation:', !(!validFormData.media.src || !validFormData.media.type));
  
  // Test case 3: Empty src with spaces
  const emptySrcFormData = {
    media: { type: 'image', src: '   ' },
    isActive: true
  };
  
  console.log('📋 Test 3 - Empty src with spaces:', emptySrcFormData);
  console.log('❌ Should fail validation:', emptySrcFormData.media.src.trim() === '');
  
  console.log('✅ Hero form validation test completed!');
};

testHeroFormValidation();
