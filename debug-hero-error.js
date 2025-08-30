const API_BASE_URL = 'http://localhost:4000/api';

// Admin credentials
const adminCredentials = {
  email: 'admin@example.com',
  password: 'admin123'
};

let authToken = null;

// Helper function to make API calls with detailed error logging
async function apiCall(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  console.log(`\n🔍 Making request to: ${url}`);
  console.log('📤 Request options:', JSON.stringify(options, null, 2));
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    console.log(`📥 Response status: ${response.status}`);
    
    const data = await response.json();
    console.log('📥 Response data:', JSON.stringify(data, null, 2));
    
    if (!response.ok) {
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }
    
    return data;
  } catch (error) {
    console.error('❌ API Error:', error);
    throw error;
  }
}

// Authentication function
async function authenticate() {
  console.log('\n🔐 Authenticating as admin...');
  try {
    const response = await apiCall('/auth/signin', {
      method: 'POST',
      body: JSON.stringify(adminCredentials),
    });
    authToken = response.data.token;
    console.log('✅ Authentication successful');
    return true;
  } catch (error) {
    console.log('❌ Authentication failed:', error.message);
    return false;
  }
}

// Test hero creation with detailed logging
async function testCreateHeroWithDebug() {
  console.log('\n➕ Testing POST /api/hero - Create hero section with debug');
  
  const testData = {
    media: {
      type: 'image',
      src: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&auto=format&fit=crop&q=60'
    }
  };
  
  console.log('📤 Sending data:', JSON.stringify(testData, null, 2));
  
  try {
    const response = await apiCall('/hero', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`,
      },
      body: JSON.stringify(testData),
    });
    console.log('✅ Success:', response);
    return response.data.hero;
  } catch (error) {
    console.log('❌ Error:', error.message);
    return null;
  }
}

// Main test function
async function runDebugTest() {
  console.log('🚀 Starting Hero Section Debug Test\n');

  // Authenticate first
  const isAuthenticated = await authenticate();
  if (!isAuthenticated) {
    console.log('❌ Cannot proceed without authentication');
    return;
  }

  // Test hero creation
  await testCreateHeroWithDebug();
  
  console.log('\n✅ Debug Test Completed!');
}

// Run tests
runDebugTest().catch(console.error);
