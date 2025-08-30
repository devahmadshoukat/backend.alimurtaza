import mongoose from "mongoose";
import Hero from "./src/models/Hero.js";

// Connect to database
async function connectDB() {
  try {
    await mongoose.connect('mongodb://localhost:27017/ecommerce');
    console.log('✅ Database connected successfully');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }
}

// Test Hero model
async function testHeroModel() {
  console.log('🧪 Testing Hero model...');
  
  try {
    // Test creating a hero
    const testHero = new Hero({
      media: {
        type: 'image',
        src: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&auto=format&fit=crop&q=60'
      },
      isActive: true
    });
    
    console.log('📝 Created hero instance:', testHero);
    
    // Test saving to database
    const savedHero = await testHero.save();
    console.log('✅ Hero saved successfully:', savedHero);
    
    // Test finding heroes
    const heroes = await Hero.find({});
    console.log('🔍 Found heroes:', heroes);
    
    // Clean up
    await Hero.findByIdAndDelete(savedHero._id);
    console.log('🧹 Cleaned up test data');
    
    console.log('✅ Hero model test completed successfully!');
  } catch (error) {
    console.error('❌ Hero model test failed:', error);
  }
}

// Run test
async function runTest() {
  await connectDB();
  await testHeroModel();
  await mongoose.disconnect();
  console.log('👋 Disconnected from database');
}

runTest().catch(console.error);
