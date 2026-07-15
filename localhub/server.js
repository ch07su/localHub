const express = require('express');
const { OpenAI } = require('openai');
require('dotenv').config();

const app = express();
const port = 3000;

app.use(express.json());
app.use(express.static('public'));

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.post('/api/chat', async (req, res) => {
  const { message } = req.body;

  try {
    const response = await openai.chat.completions.create({
      // 1. 모델명을 gpt-5-mini 또는 최신 업그레이드 버전인 gpt-5.4-mini로 지정합니다.
      model: 'gpt-5-mini', 
      
      messages: [
        { 
          role: 'system', 
          content: '당신은 웹사이트 방문자를 돕는 친절하고 전문적인 AI 어시스턴트입니다.' 
        },
        { role: 'user', content: message }
      ],
      // (선택 사항) GPT-5 mini에서 필요시 추론 강도(reasoning_effort) 등의 옵션을 설정할 수 있습니다.
    });

    res.json({ reply: response.choices[0].message.content });
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: '서버 또는 API 통신 중 에러가 발생했습니다.' });
  }
});

app.listen(port, () => {
  console.log(`서버가 http://localhost:${port} 에서 실행 중입니다.`);
});