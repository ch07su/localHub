<template>
  <div class="detail-page">
    <Header />

    <main class="detail-container">
      <button class="back-btn" @click="goBack">← 목록으로 돌아가기</button>

      <section v-if="post" class="detail-card">
        <div class="detail-top">
          <div>
            <p class="eyebrow">상세 보기</p>
            <h1>{{ post.title }}</h1>
          </div>

          <div class="top-actions">
            <button class="like-btn" @click="toggleLike(post)">
              {{ post.likedByMe ? '추천 취소' : '추천' }} {{ post.likes }}
            </button>

            <button class="favorite-btn" @click="toggleFavorite(post)">
              {{ isFavorite(post.id) ? '관심 해제' : '관심 등록' }}
            </button>
          </div>
        </div>

        <div class="meta-row">
          <span>작성자 {{ post.writer }}</span>
          <span>{{ post.createdAt }}</span>
          <span>조회 {{ post.views }}</span>
          <span>카테고리 {{ post.category }}</span>
        </div>

        <div class="tag-list">
          <span v-for="tag in post.tags" :key="tag" class="tag-badge">{{ tag }}</span>
        </div>

        <img v-if="post.image" :src="post.image" class="detail-image" />

        <p class="detail-content">{{ post.content }}</p>

        <div class="action-bar">
          <button class="edit-btn" @click="showEditForm = !showEditForm">
            {{ showEditForm ? '수정 취소' : '수정' }}
          </button>
          <button class="delete-btn" @click="deletePost(post)">삭제</button>
        </div>

        <section v-if="showEditForm" class="edit-form">
          <h3>게시글 수정</h3>
          <input v-model="editForm.title" placeholder="제목" />
          <input v-model="editForm.password" type="password" placeholder="비밀번호" />
          <textarea v-model="editForm.content" rows="5" placeholder="내용"></textarea>
          <button class="submit-btn" @click="submitEdit">수정하기</button>
        </section>

        <section class="comment-section">
          <h3>댓글</h3>

          <div v-for="comment in post.comments" :key="comment.id" class="comment-item">
            <div class="comment-header">
              <strong>{{ comment.writer }}</strong>
              <div class="comment-actions">
                <button class="small-btn" @click="startEditComment(comment)">수정</button>
                <button class="small-btn danger" @click="deleteComment(comment)">삭제</button>
              </div>
            </div>

            <p v-if="editingCommentId !== comment.id">{{ comment.text }}</p>
            <div v-else class="comment-edit-box">
              <textarea v-model="commentDraft"></textarea>
              <button class="small-btn" @click="saveCommentEdit(comment)">저장</button>
            </div>
          </div>

          <div class="comment-form">
            <input v-model="commentWriter" placeholder="댓글 작성자" />
            <textarea v-model="commentText" rows="3" placeholder="댓글을 입력하세요."></textarea>
            <button class="submit-btn" @click="addComment">댓글 등록</button>
          </div>
        </section>
      </section>

      <div v-else class="empty-box">게시글을 찾을 수 없습니다.</div>
    </main>

    <Footer />
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Header from '../components/Header.vue'
import Footer from '../components/Footer.vue'

const STORAGE_KEY = 'localhub-posts'
const FAVORITES_KEY = 'localhub-favorites'

const route = useRoute()
const router = useRouter()

const posts = ref([])
const post = ref(null)
const favorites = ref([])
const showEditForm = ref(false)
const editForm = ref({ title: '', password: '', content: '' })
const commentWriter = ref('')
const commentText = ref('')
const editingCommentId = ref(null)
const commentDraft = ref('')

function loadPosts() {
  const saved = localStorage.getItem(STORAGE_KEY)
  if (saved) {
    try {
      const parsed = JSON.parse(saved)
      if (Array.isArray(parsed)) {
        posts.value = parsed.map((item) => ({
          ...item,
          likes: item.likes || 0,
          likedByMe: item.likedByMe || false,
          tags: item.tags || [],
          image: item.image || '',
          comments: item.comments || [],
          views: item.views || 0
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

function savePosts() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(posts.value))
}

function saveFavorites() {
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites.value))
}

function refreshPost() {
  const id = Number(route.params.id)
  const found = posts.value.find((item) => item.id === id)

  if (!found) {
    post.value = null
    return
  }

  posts.value = posts.value.map((item) =>
    item.id === id ? { ...item, views: (item.views || 0) + 1 } : item
  )

  post.value = posts.value.find((item) => item.id === id) || null
  savePosts()
}

function goBack() {
  router.push('/community')
}

function toggleLike(target) {
  posts.value = posts.value.map((item) => {
    if (item.id !== target.id) return item

    return {
      ...item,
      likedByMe: !item.likedByMe,
      likes: Math.max(0, item.likes + (item.likedByMe ? -1 : 1))
    }
  })

  post.value = posts.value.find((item) => item.id === target.id) || null
  savePosts()
}

function isFavorite(postId) {
  return favorites.value.includes(postId)
}

function toggleFavorite(target) {
  if (favorites.value.includes(target.id)) {
    favorites.value = favorites.value.filter((id) => id !== target.id)
  } else {
    favorites.value.push(target.id)
  }

  saveFavorites()
}

function deletePost(target) {
  const inputPassword = window.prompt('삭제하려면 비밀번호를 입력하세요.')
  if (!inputPassword) return

  if (inputPassword !== target.password) {
    alert('비밀번호가 일치하지 않습니다.')
    return
  }

  posts.value = posts.value.filter((item) => item.id !== target.id)
  savePosts()
  router.push('/community')
}

function submitEdit() {
  if (!editForm.value.title || !editForm.value.password || !editForm.value.content) {
    alert('제목, 비밀번호, 내용을 모두 입력해주세요.')
    return
  }

  if (!post.value || editForm.value.password !== post.value.password) {
    alert('비밀번호가 일치하지 않습니다.')
    return
  }

  posts.value = posts.value.map((item) =>
    item.id === post.value.id
      ? {
          ...item,
          title: editForm.value.title,
          content: editForm.value.content
        }
      : item
  )

  post.value = posts.value.find((item) => item.id === post.value.id) || null
  savePosts()
  showEditForm.value = false
  editForm.value = { title: '', password: '', content: '' }
  alert('게시글이 수정되었습니다.')
}

function addComment() {
  if (!post.value) return
  if (!commentWriter.value.trim() || !commentText.value.trim()) return

  posts.value = posts.value.map((item) =>
    item.id === post.value.id
      ? {
          ...item,
          comments: [
            ...(item.comments || []),
            {
              id: Date.now(),
              writer: commentWriter.value.trim(),
              text: commentText.value.trim()
            }
          ]
        }
      : item
  )

  post.value = posts.value.find((item) => item.id === post.value.id) || null
  commentWriter.value = ''
  commentText.value = ''
  savePosts()
}

function startEditComment(comment) {
  editingCommentId.value = comment.id
  commentDraft.value = comment.text
}

function saveCommentEdit(comment) {
  posts.value = posts.value.map((item) =>
    item.id === post.value.id
      ? {
          ...item,
          comments: (item.comments || []).map((c) =>
            c.id === comment.id ? { ...c, text: commentDraft.value } : c
          )
        }
      : item
  )

  post.value = posts.value.find((item) => item.id === post.value.id) || null
  editingCommentId.value = null
  commentDraft.value = ''
  savePosts()
}

function deleteComment(comment) {
  posts.value = posts.value.map((item) =>
    item.id === post.value.id
      ? {
          ...item,
          comments: (item.comments || []).filter((c) => c.id !== comment.id)
        }
      : item
  )

  post.value = posts.value.find((item) => item.id === post.value.id) || null
  savePosts()
}

onMounted(() => {
  loadPosts()
  loadFavorites()
  refreshPost()
})

watch(() => route.params.id, () => {
  refreshPost()
})
</script>

<style scoped>
.detail-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f8fbff 0%, #eef6ff 45%, #f5f7ff 100%);
}

.detail-container {
  max-width: 1100px;
  margin: 0 auto;
  padding: 40px 20px 80px;
}

.back-btn {
  border: none;
  background: white;
  padding: 10px 14px;
  border-radius: 999px;
  margin-bottom: 20px;
  cursor: pointer;
  box-shadow: 0 10px 20px rgba(15, 23, 42, 0.06);
}

.detail-card {
  background: white;
  border-radius: 24px;
  padding: 28px;
  box-shadow: 0 20px 45px rgba(15, 23, 42, 0.08);
}

.detail-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
}

.eyebrow {
  color: #1d4ed8;
  font-weight: 800;
  margin-bottom: 8px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.meta-row {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  color: #64748b;
  margin: 12px 0;
}

.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin: 10px 0;
}

.tag-badge {
  background: #eff6ff;
  color: #2563eb;
  padding: 4px 8px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: bold;
}

.detail-image {
  width: 100%;
  max-height: 260px;
  object-fit: cover;
  border-radius: 18px;
  margin: 12px 0;
}

.detail-content {
  line-height: 1.7;
  color: #475569;
}

.action-bar,
.top-actions,
.comment-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.like-btn,
.favorite-btn,
.edit-btn,
.delete-btn,
.submit-btn,
.small-btn {
  border: none;
  padding: 8px 12px;
  border-radius: 999px;
  cursor: pointer;
  font-weight: 700;
}

.like-btn {
  background: linear-gradient(135deg, #f59e0b, #fbbf24);
  color: white;
}

.favorite-btn {
  background: linear-gradient(135deg, #0f766e, #14b8a6);
  color: white;
}

.edit-btn,
.submit-btn,
.small-btn {
  background: linear-gradient(135deg, #2563eb, #3b82f6);
  color: white;
}

.delete-btn,
.small-btn.danger {
  background: linear-gradient(135deg, #dc2626, #ef4444);
  color: white;
}

.edit-form,
.comment-form {
  margin-top: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

input,
textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #dbe4f0;
  border-radius: 12px;
}

.comment-section {
  margin-top: 24px;
}

.comment-item {
  background: #f8fafc;
  border-radius: 14px;
  padding: 12px;
  margin-bottom: 10px;
}

.comment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.comment-edit-box {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.empty-box {
  background: white;
  padding: 24px;
  text-align: center;
  border-radius: 14px;
}

@media (max-width: 700px) {
  .detail-top {
    flex-direction: column;
  }
}
</style>