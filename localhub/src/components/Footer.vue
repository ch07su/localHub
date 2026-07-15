<template>
  <footer class="footer">
    <!-- [추가] 5. 이용안내 퀵 바 (푸터 바로 위의 링크모음) -->
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
</template><style scoped>
.footer {
  margin-top: 60px;
  background: #fff;
  color: #333;
  text-align: center;
  padding: 20px;
}

.quick-links-bar {
  margin-top: 12px;
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

<style scoped>
.footer{
  margin-top:60px;
  background:#white  .quick-link-item {
    color: #333;
    text-decoration: none;
  }
  
  .quick-link-item:hover {
    text-decoration: none;
    color: #333;
  };
  color:white;
  text-align:center;
  padding:20px;
}
</style>

