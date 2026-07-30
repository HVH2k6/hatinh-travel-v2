import axios from 'axios';

async function testAIConsult() {
  try {
    const res = await axios.post('http://localhost:3000/api/ai-consult', {
      message: 'Tôi muốn đi chơi Hà Tĩnh vào ngày mai với 500k, đi đâu ăn gì?'
    });
    console.log('AI Response:', res.data.data);
  } catch (error: any) {
    console.error('Error:', error.response?.data || error.message);
  }
}

testAIConsult();
