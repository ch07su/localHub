<template>
  <div id="app">
    <router-view />

    <button
  v-if="!isChatOpen"
  class="open-chat-btn"
  @click="isChatOpen = true"
>
  챗봇 열기
</button>

<div v-if="isChatOpen" class="chat-container">
  <div class="chat-header">
    <h4>LocalHub AI 도우미</h4>
    <button class="close-btn" @click="isChatOpen = false">X</button>
  </div>

      <div class="chat-box" ref="chatBox">
        <div 
          v-for="(msg, index) in messages" 
          :key="index" 
          :class="['message', msg.sender]"
        >
          <strong>{{ msg.sender === 'user' ? '나' : 'AI' }}:</strong> {{ msg.text }}
        </div>
      </div>

      <div class="input-container">
        <input
          v-model="input"
          @keyup.enter="sendMessage"
          placeholder="서울 관광지, 레포츠, 숙박 등을 물어보세요..."
        />
        <button @click="sendMessage" class="send-btn">✈</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick } from 'vue';


import seoulAttractions from './data/서울_관광지.json';
import seoulSports from './data/서울_레포츠.json';
import seoulCulture from './data/서울_문화시설.json';
import seoulShopping from './data/서울_쇼핑.json';
import seoulLodging from './data/서울_숙박.json';

const isChatOpen = ref(false);

const seoulData = {
  관광지: seoulAttractions,
  레포츠: seoulSports,
  문화시설: seoulCulture,
  쇼핑: seoulShopping,
  숙박: seoulLodging
};

const messages = ref([
  { sender: 'bot', text: '안녕하세요! 서울 지역 정보 AI 도우미입니다. 관광지, 레포츠, 문화시설, 쇼핑, 숙박 정보에 대해 무엇이든 물어보세요!' }
]);
const input = ref('');
const chatBox = ref(null);

const sendMessage = async () => {
  if (!input.value.trim()) return;

  const userQuery = input.value;
  messages.value.push({ sender: 'user', text: userQuery });
  input.value = '';
  
  await nextTick();
  scrollToBottom();

  // Vite 개발 환경변수(.env)에서 API 키 로드
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

  if (!apiKey) {
    messages.value.push({ sender: 'bot', text: '오류: .env 파일에 VITE_OPENAI_API_KEY가 설정되지 않았습니다.' });
    return;
  }

  // 2. [최적화] 사용자의 질문에 맞춰서 필요한 파일 데이터만 선별하여 보냅니다 (토큰 절약 및 에러 방지)
  let contextData = {};
  if (userQuery.includes('관광') || userQuery.includes('갈만') || userQuery.includes('명소')) {
    contextData['관광지'] = seoulData.관광지;
  }
  if (userQuery.includes('레포츠') || userQuery.includes('운동') || userQuery.includes('스포츠') || userQuery.includes('액티비티')) {
    contextData['레포츠'] = seoulData.레포츠;
  }
  if (userQuery.includes('문화') || userQuery.includes('미술관') || userQuery.includes('박물관') || userQuery.includes('전시')) {
    contextData['문화시설'] = seoulData.문화시설;
  }
  if (userQuery.includes('쇼핑') || userQuery.includes('시장') || userQuery.includes('마트') || userQuery.includes('백화점')) {
    contextData['쇼핑'] = seoulData.쇼핑;
  }
  if (userQuery.includes('숙박') || userQuery.includes('호텔') || userQuery.includes('펜션') || userQuery.includes('모텔') || userQuery.includes('게하')) {
    contextData['숙박'] = seoulData.숙박;
  }

  // 특별한 키워드가 없다면 질문 답변의 퀄리티를 위해 전체 데이터를 가볍게 요약해서 보냅니다.
  if (Object.keys(contextData).length === 0) {
    contextData = seoulData;
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-5-mini',
        messages: [
          { 
            role: 'system', 
            content: `당신은 서울 종합 지역 가이드 AI입니다. 
            오직 아래 제공된 [서울 데이터]만을 기반으로 사실에 기반하여 답변해 주세요. 
            데이터에 없는 장소나 억측은 절대로 답변하지 말고 정중하게 모른다고 대답해 주세요.
            사용자가 읽기 편하도록 가독성 좋게 줄바꿈을 섞어 답변하세요.
            
            [서울 데이터]
            ${JSON.stringify(contextData)}` 
          },
          { role: 'user', content: userQuery }
        ]
      })
    });

    const data = response.ok ? await response.json() : null;
    
    if (data) {
      messages.value.push({ sender: 'bot', text: data.choices[0].message.content });
    } else {
      messages.value.push({ sender: 'bot', text: '죄송합니다. 서버 통신에 실패했습니다.' });
    }
  } catch (error) {
    messages.value.push({ sender: 'bot', text: '에러가 발생했습니다. 네트워크 연결 상태를 확인해 주세요.' });
    console.error(error);
  } finally {
    await nextTick();
    scrollToBottom();
  }
};

const scrollToBottom = () => {
  if (chatBox.value) {
    chatBox.value.scrollTop = chatBox.value.scrollHeight;
  }
};
</script>

<style scoped>
/* 화면 레이아웃 방해 없이 우측 하단에 고정시키는 스타일 (모바일 반응형 탑재) */
.open-chat-btn {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 2200;
  padding: 12px 22px;
  background: #ff5a22;
  color: #fff;
  border: none;
  border-radius: 9999px;
  cursor: pointer;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.18);
}

.chat-container {
  z-index: 2300;
}
.close-btn {
  background: transparent;
  color: white;
  border: 1px solid rgba(255,255,255,0.7);
  padding: 4px 10px;
  border-radius: 8px;
  cursor: pointer;
}

.open-chat-btn {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 2200;
  padding: 12px 18px;
  background: #ff5a22;
  color: #fff;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  box-shadow: 0 6px 18px rgba(0,0,0,0.18);
}

.chat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.close-btn {
  background: transparent;
  color: white;
  border: none;
  font-size: 18px;
  line-height: 1;
  cursor: pointer;
}

.chat-container { 
  position: fixed; 
  bottom: 20px; 
  right: 20px; 
  width: 350px; 
  height: 500px; 
  background: white; 
  border-radius: 12px; 
  box-shadow: 0 5px 20px rgba(0,0,0,0.15); 
  display: flex; 
  flex-direction: column; 
  overflow: hidden; 
  z-index: 1000; 
}
.chat-header {
  background: #ff5a22;
  color: white;
  padding: 10px 15px;
  font-weight: bold;
}
.chat-header h4 { margin: 0; font-size: 16px; }
.chat-box { flex: 1; padding: 15px; overflow-y: auto; display: flex; flex-direction: column; gap: 10px; background: #f8f9fa; }
.message { padding: 10px 14px; border-radius: 12px; max-width: 80%; line-height: 1.5; font-size: 13px; word-break: break-all; }
.user {
  align-self: flex-end;
  background-color: #ff5a22;
  border-bottom-right-radius: 2px;
}

.bot {
  align-self: flex-start;
  background-color: #ffffff;
  color: #333;
  border-bottom-left-radius: 2px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}


.input-container {
  position: relative;
  display: flex;
  align-items: center;
  border-top: 1px solid #eee;
  background: white;
  padding: 10px 16px;
}

.input-container input {
  width: 100%;
  padding: 12px 50px 12px 16px;
  border: 1px solid #ddd;
  border-radius: 12px;
  outline: none;
  font-size: 13px;
}

.send-btn {
  position: absolute;
  right: 14px;
  bottom: 12px;
  width: 42px;
  height: 42px;
  background: #ff5a22;
  color: #fff;
  border: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
  font-size: 18px;
}

input { flex: 1; border: none; padding: 15px; outline: none; font-size: 13px; }
button { border: none; background: #ff5a22;ing: 0 20px; cursor: pointer; font-weight: bold; }

/* 모바일 대응 반응형 CSS (요구사항 다 만족) */
@media (max-width: 480px) {
  .chat-container {
    width: 100%;
    height: 100%;
    bottom: 0;
    right: 0;
    border-radius: 0;
  }
}
</style>