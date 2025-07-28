// Quick script to seed questions via API
// Run this after starting your server

const axios = require('axios');

async function seedQuestions() {
  try {
    console.log('🌱 Seeding database with sample questions...');
    
    const response = await axios.post('http://localhost:5000/api/questions/seed');
    
    console.log('✅ Success!');
    console.log(`📝 Added ${response.data.questions.length} questions:`);
    
    response.data.questions.forEach((q, index) => {
      console.log(`${index + 1}. ${q.title} (ID: ${q.id})`);
    });
    
    console.log('\n🚀 You can now visit localhost:5173/questions to see the problems!');
    
  } catch (error) {
    console.error('❌ Error seeding questions:', error.response?.data || error.message);
  }
}

seedQuestions();
