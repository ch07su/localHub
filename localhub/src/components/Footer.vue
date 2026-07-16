<template>
  <footer class="footer">
    <section class="quick-links-bar">
      <div class="quick-links-inner">
        <button class="quick-link-item" @click="showGuide = true" type="button">
          <span class="q-icon">ⓘ</span> 이용안내
        </button>
        <router-link :to="{ name: 'Board', query: { tab: 'qa' } }" class="quick-link-item">
          <span class="q-icon">❓</span> 자주 묻는 질문
        </router-link>
        <router-link
          :to="{ name: 'Board', query: { tab: 'notice' } }"
          class="quick-link-item"
        >
          <span class="q-icon">📢</span> 공지사항
        </router-link>
        <button type="button" class="quick-link-item" @click="copyEmail">
          <span class="q-icon">✉️</span> 문의하기
        </button>
      </div>
    </section>

    <Modal v-if="showGuide" @close="showGuide = false">
      <Guide />
    </Modal>
  </footer>
</template>

<script setup>
import { ref } from 'vue'
import Modal from './Modal.vue'
import Guide from '../pages/Guide.vue'

const supportEmail = 'seoul@seoul.com'
const copied = ref(false)

async function copyEmail() {
  try {
    await navigator.clipboard.writeText(supportEmail)
    copied.value = true
    alert('이메일이 복사되었습니다: ' + supportEmail)
    setTimeout(() => (copied.value = false), 2000)
  } catch (e) {
    // fallback for older browsers
    const ta = document.createElement('textarea')
    ta.value = supportEmail
    document.body.appendChild(ta)
    ta.select()
    document.execCommand('copy')
    document.body.removeChild(ta)
    alert('이메일이 복사되었습니다: ' + supportEmail)
  }
}

const showGuide = ref(false)
</script>

<style scoped>
.footer {
  margin-top: 60px;
  background: #fff;
  color: #333;
  text-align: center;
  padding: 24px 20px 28px;
  border-top: 1px solid #eee;
}

.quick-links-bar {
  margin-bottom: 16px;
}

.quick-links-inner {
  display: flex;
  justify-content: center;
  gap: 20px;
  flex-wrap: wrap;
}

.quick-link-item {
  color: #333;
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  background: none;
  border: none;
  cursor: pointer;
  padding: 6px 10px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.quick-link-item:hover,
.quick-link-item:focus,
.quick-link-item:active,
.quick-link-item:visited {
  color: #333;
  text-decoration: none;
}
</style>