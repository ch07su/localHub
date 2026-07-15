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
      <div class="category-buttons">
        <button
          v-for="category in ['전체', '관광지', '레포츠', '문화시설', '쇼핑', '숙박']"
          :key="category"
          :class="[
            'category-btn',
            selectedCategory === (category === '전체' ? 'all' : category)
              ? 'active'
              : ''
          ]"
          @click="
            selectedCategory = category === '전체' ? 'all' : category
          "
        >
          {{ category }}
        </button>
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

const selectedCategory = ref('all')

const isChatOpen = ref(false);

const seoulData = {
  관광지: seoulAttractions,
  레포츠: seoulSports,
  문화시설: seoulCulture,
  쇼핑: seoulShopping,
  숙박: seoulLodging
};

const messages = ref([
  { sender: 'bot', text: '안녕하세요! 서울 지역 정보 AI 도우미입니다. 위 카테고리를 먼저 선택하시면 더 빠르고 정확한 답변을 받을 수 있어요!' }
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
  const query = userQuery.trim().toLowerCase()

  const getItemsForCategory = (category) => {
    return seoulData[category]?.items || []
  }

  const matchedItems = []
  if (selectedCategory.value === 'all') {
    Object.keys(seoulData).forEach((category) => {
      matchedItems.push(
        ...getItemsForCategory(category).filter((item) => {
          const title = (item.title || '').toLowerCase()
          const addr = (item.addr1 || '').toLowerCase()
          const tel = (item.tel || '').toLowerCase()
          return query && (title.includes(query) || addr.includes(query) || tel.includes(query))
        })
      )
    })
  } else {
    matchedItems.push(
      ...getItemsForCategory(selectedCategory.value).filter((item) => {
        const title = (item.title || '').toLowerCase()
        const addr = (item.addr1 || '').toLowerCase()
        const tel = (item.tel || '').toLowerCase()
        return query && (title.includes(query) || addr.includes(query) || tel.includes(query))
      })
    )
  }

  let contextData = {}

  if (matchedItems.length > 0) {
    if (selectedCategory.value === 'all') {
      contextData = {
        관광지: { ...seoulData.관광지, items: matchedItems.slice(0, 20) },
        레포츠: { ...seoulData.레포츠, items: [] },
        문화시설: { ...seoulData.문화시설, items: [] },
        쇼핑: { ...seoulData.쇼핑, items: [] },
        숙박: { ...seoulData.숙박, items: [] }
      }
    } else {
      contextData[selectedCategory.value] = {
        ...seoulData[selectedCategory.value],
        items: matchedItems.slice(0, 20)
      }
    }
  } else {
    contextData =
      selectedCategory.value === 'all'
        ? seoulData
        : { [selectedCategory.value]: seoulData[selectedCategory.value] }
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
            content: `[역할 정의]
              당신은 제공된 [서울 데이터]만을 기반으로 서울 지역의 장소를 안내하는 전문 AI 어시스턴트입니다. 항상 존댓말로 정중하고 친절하게 답변하세요.

              [핵심 작동 규칙 (우선순위 순)]

              1. 상세 정보 즉시 제공 규칙 (최우선):
                - 사용자가 목록에 있는 특정 장소 이름을 언급하며 정보를 요청하는 경우(예: "~에 대해 알려줘", "거기 주소가 어떻게 돼?", "신촌문화발전소")에는 "원하시면 알려주겠다" 같은 되묻기 단계를 절대 거치지 말고, 즉시 해당 장소의 [상세 정보(주소, 전화번호, 설명 등)]를 제공하세요.
                - "응", "그래", "알려줘"와 같이 이전 대화 맥락에서 상세 정보를 요구하는 짧은 답변을 했을 때도 이전 언급된 장소를 파악하여 상세 정보를 바로 제공해야 합니다.

              2. 장소 추천 및 목록 제시 규칙:
                - 질문이 특정 장소 검색이나 카테고리 추천(예: "서대문구 문화시설")인 경우, 상세 정보를 먼저 노출하지 마세요.
                - 오직 장소의 이름들만 목록으로 나열하되, 각 이름은 반드시 '쉼표(,)'로 구분하여 작성하세요.
                - 예시: "다음은 서대문구에 있는 문화시설입니다: 금호아트홀 연세, 서대문자연사박물관, 신촌문화발전소"

              3. 데이터 제한 및 모르는 정보 처리 규칙:
                - 오직 제공된 [서울 데이터]에 명시된 장소만 답변할 수 있습니다. 
                - 데이터에 없는 장소를 묻거나 추측해야 하는 질문에는 지셔내지 말고 정중하게 "죄송합니다만, 해당 장소는 보유하고 있는 데이터에 없어 안내가 어렵습니다."라고 답변하세요.

              4. 예외 처리 (범위 외 질문):
                - 장소 검색/추천 및 상세 정보 요청과 전혀 무관한 일상 대화나 다른 지역 질문인 경우에만 아래 문구로 통일하여 답변하세요:
                  "죄송하지만, 서울 지역 장소 이름 검색 및 관련 정보 문의에 대해서만 답변이 가능합니다."

              [대화 예시 흐름 (Few-Shot)]
              User: "서대문구 문화시설 추천해줘"
              AI: "서대문구의 문화시설 목록입니다: 금호아트홀 연세, 서대문자연사박물관, 신촌문화발전소"

              User: "신촌문화발전소에 대해 알고 싶어" (혹은 "신촌문화발전소")
              AI: "신촌문화발전소의 상세 정보입니다.\n- 주소: 서울 서대문구 연세로2다길 43\n- 전화번호: 02-330-8898\n- 설명: 청년 문화예술인의 기획 창작 활동을 지원하는 문화 공간입니다."

              User: "오늘 날씨 어때?"
              AI: "죄송하지만, 서울 지역 장소 이름 검색 및 관련 정보 문의에 대해서만 답변이 가능합니다."
            
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

.category-buttons {
  display: flex;
  flex-wrap: nowrap;        
  overflow-x: auto;         
  gap: 8px;
  padding: 10px;
  background: #fff;
  border-bottom: 1px solid #eee;
  

  -webkit-overflow-scrolling: touch; 
}

.category-btn {
  flex-shrink: 0;            /* 중요: 가로 공간이 부족해도 버튼 크기가 줄어들지 않음 */
  padding: 8px 14px;
  border: 1px solid #ff5a22;
  border-radius: 20px;
  background: white;
  color: #ff5a22;
  cursor: pointer;
  font-size: 13px;
  transition: 0.2s;
}

.category-btn:hover {
  background: #fff3ee;
}

.category-btn.active {
  background: #ff5a22;
  color: white;
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