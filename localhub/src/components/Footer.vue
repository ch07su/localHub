<template>
  <footer class="footer">
    <section class="quick-links-bar">
      <div class="quick-links-inner">
        <a href="#" class="quick-link-item">
          <span class="q-icon">ⓘ</span> 이용안내
        </a>
        <a href="#" class="quick-link-item">
          <span class="q-icon">❓</span> 자주 묻는 질문
        </a>
        <a href="#" class="quick-link-item">
          <span class="q-icon">📢</span> 공지사항
        </a>
        <a href="#" class="quick-link-item">
          <span class="q-icon">✉️</span> 문의하기
        </a>
      </div>
    </section>
  </footer>
</template>

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
}

.quick-link-item:hover,
.quick-link-item:focus,
.quick-link-item:active,
.quick-link-item:visited {
  color: #333;
  text-decoration: none;
}
</style>