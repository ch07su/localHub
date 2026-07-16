<template>
  <header class="header">
    <RouterLink to="/" class="logo">LocalHub</RouterLink>

    <nav>
      <RouterLink to="/community">게시판</RouterLink>
      <RouterLink to="/map">지도</RouterLink>
      <RouterLink to="/route">일정짜기</RouterLink>
    </nav>

    <div class="actions">
      <button>검색? 챗봇?</button>
    </div>
  </header>
</template>

<script setup>
</script>

<style scoped>
.logo {
  font-size: 24px;
  font-weight: 800;
  color: #ff5a22;
  letter-spacing: -0.5px;
  text-decoration: none;
}

.logo:hover {
  text-decoration: none;
}

.header {
  font-family: 'Pretendard', -apple-system, sans-serif;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 80px;
  padding: 0 60px;
  background: white;
  border-bottom: 1px solid #eee;
  position: sticky;
  top: 0;
  z-index: 100;
}

nav {
  display: flex;
  gap: 40px;
  align-items: center;
}

nav a {
  text-decoration: none;
  color: #555;
  font-size: 16px;
  font-weight: 600;
  transition: 0.3s;
}

nav a:hover {
  color: #ff7a00;
}

.actions {
  display: flex;
  align-items: center;
  gap: 15px;
}

.actions button {
  border: none;
  background: none;
  font-size: 18px;
  cursor: pointer;
}
</style>