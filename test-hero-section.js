const API_BASE_URL = 'http://localhost:4000/api';

// Test data
const testHeroData = {
  media: {
    type: 'image',
    src: 'https://images.pexels.com/photos/414612/pexels-photo-414612.jpeg'
  }
};

const testVideoData = {
  media: {
    type: 'video',
    src: 'https://videos.pexels.com/video-files/7764692/7764692-uhd_2732_1440_25fps.mp4'
  }
};

// Admin credentials
const adminCredentials = {
  email: 'admin@example.com',
  password: 'admin123'
};

let authToken = null;

// Helper function to make API calls
async function apiCall(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }
    
    return data;
  } catch (error) {
    console.error('API Error:', error);
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

// Test functions
async function testGetHeroSections() {
  console.log('\n🔍 Testing GET /api/hero - Get hero sections');
  try {
    const response = await apiCall('/hero');
    console.log('✅ Success:', response);
    return response.data.heroes;
  } catch (error) {
    console.log('❌ Error:', error.message);
    return [];
  }
}

async function testCreateHeroSection(heroData) {
  console.log('\n➕ Testing POST /api/hero - Create hero section');
  try {
    const response = await apiCall('/hero', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`,
      },
      body: JSON.stringify(heroData),
    });
    console.log('✅ Success:', response);
    return response.data.hero;
  } catch (error) {
    console.log('❌ Error:', error.message);
    return null;
  }
}

async function testUpdateHeroSection(id, updateData) {
  console.log(`\n✏️ Testing PUT /api/hero/${id} - Update hero section`);
  try {
    const response = await apiCall(`/hero/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${authToken}`,
      },
      body: JSON.stringify(updateData),
    });
    console.log('✅ Success:', response);
    return response.data.hero;
  } catch (error) {
    console.log('❌ Error:', error.message);
    return null;
  }
}

async function testDeleteHeroSection(id) {
  console.log(`\n🗑️ Testing DELETE /api/hero/${id} - Delete hero section`);
  try {
    const response = await apiCall(`/hero/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${authToken}`,
      },
    });
    console.log('✅ Success:', response);
    return true;
  } catch (error) {
    console.log('❌ Error:', error.message);
    return false;
  }
}

async function testGetAllHeroSections() {
  console.log('\n📋 Testing GET /api/hero/all - Get all hero sections (admin)');
  try {
    const response = await apiCall('/hero/all', {
      headers: {
        'Authorization': `Bearer ${authToken}`,
      },
    });
    console.log('✅ Success:', response);
    return response.data.heroes;
  } catch (error) {
    console.log('❌ Error:', error.message);
    return [];
  }
}

// Main test function
async function runTests() {
  console.log('🚀 Starting Hero Section API Tests\n');

  // Authenticate first
  const isAuthenticated = await authenticate();
  if (!isAuthenticated) {
    console.log('❌ Cannot proceed without authentication');
    return;
  }

  // Test 1: Get hero sections (should be empty initially)
  const initialHeroes = await testGetHeroSections();

  // Test 2: Create image hero section
  const imageHero = await testCreateHeroSection(testHeroData);
  
  // Test 3: Create video hero section
  const videoHero = await testCreateHeroSection(testVideoData);

  // Test 4: Get all hero sections (admin)
  const allHeroes = await testGetAllHeroSections();

  // Test 5: Update hero section
  if (imageHero) {
    await testUpdateHeroSection(imageHero.id, {
      media: {
        type: 'image',
        src: 'https://images.pexels.com/photos/123456/pexels-photo-123456.jpeg'
      },
      isActive: false
    });
  }

  // Test 6: Get hero sections again (should show only active ones)
  const finalHeroes = await testGetHeroSections();

  // Test 7: Delete hero sections
  if (imageHero) {
    await testDeleteHeroSection(imageHero.id);
  }
  if (videoHero) {
    await testDeleteHeroSection(videoHero.id);
  }

  // Test 8: Final check
  const finalCheck = await testGetHeroSections();

  console.log('\n📊 Test Summary:');
  console.log(`- Initial heroes: ${initialHeroes.length}`);
  console.log(`- Created heroes: ${imageHero ? 1 : 0} image, ${videoHero ? 1 : 0} video`);
  console.log(`- All heroes (admin): ${allHeroes.length}`);
  console.log(`- Final heroes: ${finalCheck.length}`);
  
  console.log('\n✅ Hero Section API Tests Completed!');
}

// Run tests
runTests().catch(console.error);
