<template>
  <header class="header">
    <RouterLink to="/" class="logo">
  LocalHub
</RouterLink>

    <nav>
      <RouterLink to="/community">
        게시판
      </RouterLink>

      <RouterLink to="/map">
        지도
      </RouterLink>

      <RouterLink to="/recommend">
        추천
      </RouterLink>
    </nav>

    <div class="actions">
      <button>
        임시 검색 위치
      </button>
    </div>
  </header>
</template>

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
}.header {
  font-family: 'Pretendard', -apple-system, sans-serif;
}

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

.logo {
  font-size: 24px;
  font-weight: 800;
  color: #ff5a22; 
  letter-spacing: -0.5px;
}

.pin {
  font-size: 25px;
}

nav {
  display: flex;
  gap: 40px;
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