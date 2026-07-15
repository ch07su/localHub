<template>
  <div class="activity-page">
    <Header />

    <main class="activity-container">
      <section class="activity-header">
        <div>
          <p class="eyebrow">마이 활동</p>
          <h1>{{ title }}</h1>
          <p>{{ description }}</p>
        </div>

        <button class="back-btn" @click="goBack">← 게시판으로</button>
      </section>

      <section class="activity-list">
        <div v-if="visiblePosts.length" class="table-wrapper">
          <table class="post-table">
            <thead>
              <tr>
                <th class="col-title">제목</th>
                <th class="col-writer">작성자</th>
                <th class="col-region">지역</th>
                <th class="col-date">작성일</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="post in visiblePosts" :key="post.id" @click="openPostDetail(post)">
                <td class="col-title">
                  <span class="category-chip">{{ post.category }}</span>
                  <span class="title-text">{{ post.title }}</span>
                </td>
                <td class="col-writer">{{ post.writer }}</td>
                <td class="col-region">{{ post.region || '미지정' }}</td>
                <td class="col-date">{{ post.createdAt }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-else class="empty-box">{{ emptyText }}</div>
      </section>
    </main>

    <Footer />
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import Header from '../components/Header.vue'
import Footer from '../components/Footer.vue'

const props = defineProps({
  type: {
    type: String,
    default: 'likes'
  }
})

const router = useRouter()
const STORAGE_KEY = 'localhub-posts'
const FAVORITES_KEY = 'localhub-favorites'

const posts = ref([])
const favorites = ref([])

function loadPosts() {
  const saved = localStorage.getItem(STORAGE_KEY)
  if (saved) {
    try {
      const parsed = JSON.parse(saved)
      if (Array.isArray(parsed)) {
        posts.value = parsed.map((post) => ({
          ...post,
          likes: post.likes || 0,
          likedByMe: post.likedByMe || false,
          tags: post.tags || [],
          image: post.image || '',
          comments: post.comments || []
        }))
      }
    } catch (error) {
      console.error('게시글을 불러오지 못했습니다.', error)
    }
  }
}

function loadFavorites() {
  const saved = localStorage.getItem(FAVORITES_KEY)
  if (saved) {
    try {
      const parsed = JSON.parse(saved)
      if (Array.isArray(parsed)) {
        favorites.value = parsed
      }
    } catch (error) {
      console.error('관심 게시글을 불러오지 못했습니다.', error)
    }
  }
}

const visiblePosts = computed(() => {
  if (props.type === 'favorites') {
    return posts.value.filter((post) => favorites.value.includes(post.id))
  }
  return posts.value.filter((post) => post.likedByMe)
})

const title = computed(() =>
  props.type === 'favorites' ? '내가 관심 등록한 글' : '내가 추천한 글'
)

const description = computed(() =>
  props.type === 'favorites'
    ? '관심 등록해 둔 게시글을 한눈에 확인할 수 있어요.'
    : '추천 표시한 게시글만 모아서 확인할 수 있어요.'
)

const emptyText = computed(() =>
  props.type === 'favorites'
    ? '아직 관심 등록한 글이 없습니다.'
    : '아직 추천한 글이 없습니다.'
)

function goBack() {
  router.push('/community')
}

function openPostDetail(post) {
  router.push({ name: 'PostDetail', params: { id: post.id } })
}

onMounted(() => {
  loadPosts()
  loadFavorites()
})
</script>

<style scoped>
.activity-page {
  min-height: 100vh;
  background: #fff;
}

.activity-container {
  max-width: 1100px;
  margin: 0 auto;
  padding: 32px 20px 80px;
}

.activity-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 20px;
}

.eyebrow {
  color: #ff7a3d;
  font-weight: 700;
  font-size: 13px;
  margin-bottom: 6px;
}

.activity-header h1 {
  font-size: 24px;
  margin: 0 0 6px;
  color: #222;
}

.activity-header p {
  margin: 0;
  color: #777;
}

.back-btn {
  border: none;
  background: #f5f5f5;
  color: #444;
  padding: 9px 14px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 700;
}

.table-wrapper {
  background: white;
  border: 1px solid #ebebeb;
  border-radius: 12px;
  overflow: hidden;
}

.post-table {
  width: 100%;
  border-collapse: collapse;
}

.post-table th {
  background: #fafafa;
  color: #777;
  padding: 12px 10px;
  text-align: left;
  font-size: 13px;
}

.post-table td {
  padding: 12px 10px;
  border-top: 1px solid #f1f1f1;
  font-size: 14px;
  color: #333;
}

.post-table tbody tr {
  cursor: pointer;
}

.post-table tbody tr:hover {
  background: #fafafa;
}

.col-title {
  width: 50%;
}

.col-writer,
.col-region,
.col-date {
  width: 16%;
}

.category-chip {
  display: inline-block;
  background: #eef2f7;
  color: #4b5a6b;
  font-size: 11px;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: 6px;
  margin-right: 8px;
}

.title-text {
  color: #222;
}

.empty-box {
  background: white;
  border: 1px solid #eee;
  border-radius: 12px;
  padding: 24px;
  text-align: center;
  color: #888;
  font-weight: 600;
}

@media (max-width: 640px) {
  .activity-header {
    flex-direction: column;
  }
}
</style>