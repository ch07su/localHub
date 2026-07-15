<template>
  <div class="board-page">
    <Header />

    <main class="board-container">
      <section class="board-header">
        <div>
          <p class="eyebrow">커뮤니티</p>
          <h1>지역 정보 게시판</h1>
          <p>추천 장소, 맛집, 축제 정보와 경험을 나누세요.</p>
        </div>

        <button class="write-btn" @click="startCreate">
          {{ isEditing ? '수정 중' : '글쓰기' }}
        </button>
      </section>

      <section class="toolbar">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="제목, 작성자, 내용, 태그로 검색하세요."
        />

        <div class="filter-group">
          <select v-model="selectedCategory">
            <option value="전체">전체 카테고리</option>
            <option value="맛집">맛집</option>
            <option value="관광">관광</option>
            <option value="축제">축제</option>
          </select>

          <button
            v-for="tag in availableTags"
            :key="tag"
            class="tag-btn"
            :class="{ active: selectedTag === tag }"
            @click="selectedTag = tag"
          >
            {{ tag }}
          </button>
        </div>
      </section>

      <section v-if="showForm" class="write-form">
        <h2>{{ isEditing ? '게시글 수정' : '새 글 작성' }}</h2>

        <div class="form-row">
          <input v-model="form.title" placeholder="제목" />
          <input v-model="form.writer" placeholder="작성자" />
        </div>

        <div class="form-row">
          <input v-model="form.password" type="password" placeholder="비밀번호" />
          <select v-model="form.category">
            <option value="맛집">맛집</option>
            <option value="관광">관광</option>
            <option value="축제">축제</option>
          </select>
        </div>

        <input
          v-model="form.tagInput"
          class="tag-input"
          placeholder="태그를 쉼표로 입력하세요. 예: 서울, 밤산책"
        />

        <textarea v-model="form.content" rows="6" placeholder="내용을 입력하세요."></textarea>

        <input type="file" accept="image/*" @change="handleImageUpload" />

        <img v-if="form.image" :src="form.image" class="preview-image" />

        <div class="form-actions">
          <button class="submit-btn" @click="submitPost">
            {{ isEditing ? '수정하기' : '등록하기' }}
          </button>
          <button class="cancel-btn" @click="cancelForm">취소</button>
        </div>
      </section>

      <section class="content-grid">
        <div class="post-list">
          <article
            v-for="post in filteredPosts"
            :key="post.id"
            class="post-card"
            :class="{ active: selectedPost?.id === post.id }"
            @click="openPostDetail(post)"
          >
            <div class="post-meta">
              <span class="category-badge">{{ post.category }}</span>
              <span>{{ post.createdAt }}</span>
            </div>

            <img v-if="post.image" :src="post.image" class="post-image" />

            <h3>{{ post.title }}</h3>
            <p>{{ post.content }}</p>

            <div class="tag-list">
              <span v-for="tag in post.tags" :key="tag" class="tag-badge">{{ tag }}</span>
            </div>

            <div class="post-footer">
              <span>작성자 {{ post.writer }}</span>
              <span>조회 {{ post.views }}</span>
              <span>추천 {{ post.likes }}</span>
            </div>

            <div class="card-actions">
              <button class="detail-link" @click.stop="openPostDetail(post)">상세 보기</button>
            </div>
          </article>

          <div v-if="filteredPosts.length === 0" class="empty-box">
            검색 결과가 없습니다.
          </div>
        </div>

        <aside class="detail-panel">
          <div v-if="selectedPost" class="detail-box">
            <div class="detail-top">
              <div>
                <p class="detail-label">선택된 게시글</p>
                <h2>{{ selectedPost.title }}</h2>
              </div>

              <button class="like-btn" @click="toggleLike(selectedPost)">
                {{ selectedPost.likedByMe ? '추천 취소' : '추천' }} {{ selectedPost.likes }}
              </button>
            </div>

            <div class="detail-meta">
              <span>{{ selectedPost.writer }}</span>
              <span>{{ selectedPost.createdAt }}</span>
              <span>조회 {{ selectedPost.views }}</span>
            </div>

            <div class="tag-list">
              <span v-for="tag in selectedPost.tags" :key="tag" class="tag-badge">{{ tag }}</span>
            </div>

            <img v-if="selectedPost.image" :src="selectedPost.image" class="detail-image" />

            <p class="detail-content">{{ selectedPost.content }}</p>

            <div class="detail-actions">
              <button class="favorite-btn" @click="toggleFavorite(selectedPost)">
                {{ isFavorite(selectedPost.id) ? '관심 해제' : '관심 등록' }}
              </button>
              <button class="edit-btn" @click="startEdit(selectedPost)">수정</button>
              <button class="delete-btn" @click="deletePost(selectedPost)">삭제</button>
              <button class="detail-link" @click="openPostDetail(selectedPost)">상세 페이지</button>
            </div>

            <div class="favorite-section">
              <h3>관심 게시글</h3>
              <ul>
                <li
                  v-for="favoritePost in favoritePosts"
                  :key="favoritePost.id"
                  @click="selectPost(favoritePost)"
                >
                  {{ favoritePost.title }}
                </li>
              </ul>
            </div>

            <div class="comment-section">
              <h3>댓글</h3>

              <div v-for="comment in selectedPost.comments" :key="comment.id" class="comment-item">
                <strong>{{ comment.writer }}</strong>
                <p>{{ comment.text }}</p>
              </div>

              <div class="comment-form">
                <input v-model="commentWriter" placeholder="댓글 작성자" />
                <textarea v-model="commentText" rows="3" placeholder="댓글을 입력하세요."></textarea>
                <button class="submit-btn" @click="addComment">댓글 등록</button>
              </div>
            </div>
          </div>

          <div v-else class="empty-box">
            게시글을 선택해 주세요.
          </div>
        </aside>
      </section>
    </main>

    <Footer />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import Header from '../components/Header.vue'
import Footer from '../components/Footer.vue'

const STORAGE_KEY = 'localhub-posts'
const FAVORITES_KEY = 'localhub-favorites'
const router = useRouter()

const defaultPosts = [
  {
    id: 1,
    title: '성수동 맛집 추천합니다.',
    writer: '익명',
    password: '1234',
    category: '맛집',
    content: '성수동에서 가볼 만한 맛집을 소개합니다.',
    createdAt: '2026-07-14',
    views: 12,
    likes: 3,
    likedByMe: false,
    tags: ['성수', '맛집', '서울'],
    image: '',
    comments: [{ id: 1, writer: '민수', text: '저도 가보고 싶어요.' }]
  },
  {
    id: 2,
    title: '한강 피크닉 장소 추천',
    writer: '홍길동',
    password: '1111',
    category: '관광',
    content: '여의도 한강공원에서 피크닉하기 좋아요.',
    createdAt: '2026-07-13',
    views: 8,
    likes: 2,
    likedByMe: false,
    tags: ['한강', '피크닉', '여의도'],
    image: '',
    comments: []
  },
  {
    id: 3,
    title: '이번 주 축제 일정',
    writer: '김철수',
    password: '2222',
    category: '축제',
    content: '이번 주 진행되는 지역 축제 정보를 정리했습니다.',
    createdAt: '2026-07-12',
    views: 15,
    likes: 5,
    likedByMe: false,
    tags: ['축제', '주말', '지역행사'],
    image: '',
    comments: []
  }
]

const posts = ref([])
const favorites = ref([])
const searchQuery = ref('')
const selectedCategory = ref('전체')
const selectedTag = ref('전체')
const showForm = ref(false)
const isEditing = ref(false)
const selectedPost = ref(null)

const form = ref({
  title: '',
  writer: '',
  password: '',
  category: '맛집',
  content: '',
  image: '',
  tagInput: ''
})

const commentWriter = ref('')
const commentText = ref('')

const availableTags = computed(() => {
  const tags = new Set()
  posts.value.forEach((post) => {
    ;(post.tags || []).forEach((tag) => tags.add(tag))
  })
  return ['전체', ...Array.from(tags).sort()]
})

const filteredPosts = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()

  return posts.value.filter((post) => {
    const matchCategory =
      selectedCategory.value === '전체' || post.category === selectedCategory.value

    const matchTag =
      selectedTag.value === '전체' || (post.tags || []).includes(selectedTag.value)

    const matchQuery =
      !query ||
      post.title.toLowerCase().includes(query) ||
      post.writer.toLowerCase().includes(query) ||
      post.content.toLowerCase().includes(query) ||
      (post.tags || []).join(' ').toLowerCase().includes(query)

    return matchCategory && matchTag && matchQuery
  })
})

const favoritePosts = computed(() =>
  posts.value.filter((post) => favorites.value.includes(post.id))
)

function savePosts() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(posts.value))
}

function saveFavorites() {
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites.value))
}

function loadPosts() {
  const saved = localStorage.getItem(STORAGE_KEY)
  if (saved) {
    try {
      const parsed = JSON.parse(saved)
      if (Array.isArray(parsed) && parsed.length > 0) {
        posts.value = parsed.map((post) => ({
          ...post,
          likes: post.likes || 0,
          likedByMe: post.likedByMe || false,
          tags: post.tags || [],
          image: post.image || '',
          comments: post.comments || [],
          views: post.views || 0
        }))
        selectedPost.value = posts.value[0] || null
        return
      }
    } catch (error) {
      console.error('저장된 게시글을 불러오지 못했습니다.', error)
    }
  }

  posts.value = defaultPosts.map((post) => ({ ...post }))
  selectedPost.value = posts.value[0] || null
  savePosts()
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

function resetForm() {
  form.value = {
    title: '',
    writer: '',
    password: '',
    category: '맛집',
    content: '',
    image: '',
    tagInput: ''
  }
  isEditing.value = false
}

function startCreate() {
  resetForm()
  showForm.value = true
}

function startEdit(post) {
  form.value = {
    title: post.title,
    writer: post.writer,
    password: '',
    category: post.category,
    content: post.content,
    image: post.image || '',
    tagInput: (post.tags || []).join(', ')
  }
  isEditing.value = true
  showForm.value = true
  selectedPost.value = post
}

function cancelForm() {
  showForm.value = false
  resetForm()
}

function handleImageUpload(event) {
  const file = event.target.files[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = () => {
    form.value.image = reader.result
  }
  reader.readAsDataURL(file)
}

function submitPost() {
  if (!form.value.title || !form.value.writer || !form.value.password || !form.value.content) {
    alert('제목, 작성자, 비밀번호, 내용을 모두 입력해주세요.')
    return
  }

  const tags = form.value.tagInput
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean)

  if (isEditing.value && selectedPost.value) {
    if (form.value.password !== selectedPost.value.password) {
      alert('비밀번호가 일치하지 않습니다.')
      return
    }

    posts.value = posts.value.map((post) =>
      post.id === selectedPost.value.id
        ? {
            ...post,
            title: form.value.title,
            writer: form.value.writer,
            category: form.value.category,
            content: form.value.content,
            tags,
            image: form.value.image
          }
        : post
    )
  } else {
    const newPost = {
      id: Date.now(),
      title: form.value.title,
      writer: form.value.writer,
      password: form.value.password,
      category: form.value.category,
      content: form.value.content,
      createdAt: new Date().toISOString().slice(0, 10),
      views: 0,
      likes: 0,
      likedByMe: false,
      tags,
      image: form.value.image,
      comments: []
    }

    posts.value.unshift(newPost)
    selectedPost.value = newPost
  }

  savePosts()
  showForm.value = false
  resetForm()
  alert(isEditing.value ? '게시글이 수정되었습니다.' : '게시글이 등록되었습니다.')
}

function deletePost(post) {
  const inputPassword = window.prompt('삭제하려면 비밀번호를 입력하세요.')
  if (!inputPassword) return

  if (inputPassword !== post.password) {
    alert('비밀번호가 일치하지 않습니다.')
    return
  }

  posts.value = posts.value.filter((item) => item.id !== post.id)
  selectedPost.value = posts.value[0] || null
  savePosts()
  alert('게시글이 삭제되었습니다.')
}

function selectPost(post) {
  posts.value = posts.value.map((item) =>
    item.id === post.id ? { ...item, views: (item.views || 0) + 1 } : item
  )

  selectedPost.value = posts.value.find((item) => item.id === post.id) || null
  savePosts()
}

function openPostDetail(post) {
  selectPost(post)
  router.push({ name: 'PostDetail', params: { id: post.id } })
}

function toggleLike(post) {
  posts.value = posts.value.map((item) => {
    if (item.id !== post.id) return item

    const alreadyLiked = item.likedByMe
    return {
      ...item,
      likedByMe: !alreadyLiked,
      likes: Math.max(0, item.likes + (alreadyLiked ? -1 : 1))
    }
  })

  selectedPost.value = posts.value.find((item) => item.id === post.id) || null
  savePosts()
}

function isFavorite(postId) {
  return favorites.value.includes(postId)
}

function toggleFavorite(post) {
  if (favorites.value.includes(post.id)) {
    favorites.value = favorites.value.filter((id) => id !== post.id)
  } else {
    favorites.value.push(post.id)
  }

  saveFavorites()
}

function addComment() {
  if (!selectedPost.value) return
  if (!commentWriter.value.trim() || !commentText.value.trim()) {
    alert('댓글 작성자와 내용을 입력해주세요.')
    return
  }

  posts.value = posts.value.map((post) =>
    post.id === selectedPost.value.id
      ? {
          ...post,
          comments: [
            ...(post.comments || []),
            {
              id: Date.now(),
              writer: commentWriter.value.trim(),
              text: commentText.value.trim()
            }
          ]
        }
      : post
  )

  commentWriter.value = ''
  commentText.value = ''

  selectedPost.value = posts.value.find((post) => post.id === selectedPost.value.id) || null
  savePosts()
}

onMounted(() => {
  loadPosts()
  loadFavorites()
})

watch(posts, savePosts, { deep: true })
</script>

<style scoped>
.board-page {
  min-height: 100vh;
  background: #f7f9fc;
}

.board-container {
  max-width: 1300px;
  margin: 0 auto;
  padding: 40px 20px 80px;
}

.board-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
}

.eyebrow {
  color: #42b883;
  font-weight: bold;
  margin-bottom: 6px;
}

.board-header h1 {
  font-size: 32px;
  margin: 0 0 8px;
}

.board-header p {
  color: #666;
  margin: 0;
}

.write-btn,
.submit-btn,
.like-btn,
.favorite-btn,
.edit-btn,
.delete-btn,
.cancel-btn,
.detail-link {
  border: none;
  padding: 10px 14px;
  border-radius: 10px;
  cursor: pointer;
  font-weight: bold;
}

.write-btn,
.submit-btn {
  background: #42b883;
  color: white;
}

.cancel-btn {
  background: #eee;
  color: #333;
}

.like-btn {
  background: #ff8a00;
  color: white;
}

.favorite-btn {
  background: #3b82f6;
  color: white;
}

.edit-btn {
  background: #f59e0b;
  color: white;
}

.delete-btn {
  background: #ef4444;
  color: white;
}

.detail-link {
  background: #0f172a;
  color: white;
}

.toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 20px;
}

.toolbar input,
.write-form input,
.write-form select,
.write-form textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 10px;
  font-size: 14px;
}

.toolbar input {
  flex: 1;
  min-width: 240px;
}

.filter-group {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.filter-group select,
.tag-btn {
  border: 1px solid #ddd;
  background: white;
  padding: 8px 12px;
  border-radius: 999px;
  cursor: pointer;
}

.tag-btn.active {
  background: #42b883;
  color: white;
  border-color: #42b883;
}

.write-form {
  background: white;
  padding: 20px;
  border-radius: 16px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  margin-bottom: 24px;
}

.form-row {
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
}

.form-actions,
.detail-actions {
  display: flex;
  gap: 10px;
  margin-top: 12px;
  flex-wrap: wrap;
}

.write-form textarea {
  resize: vertical;
  margin-top: 10px;
}

.preview-image,
.post-image,
.detail-image {
  width: 100%;
  max-height: 220px;
  object-fit: cover;
  border-radius: 12px;
  margin-top: 12px;
}

.content-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 20px;
}

.post-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.post-card {
  background: white;
  border-radius: 14px;
  padding: 18px;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  border: 1px solid #eee;
}

.post-card.active {
  border-color: #42b883;
  box-shadow: 0 0 0 2px rgba(66, 184, 131, 0.2);
}

.post-meta,
.post-footer,
.detail-meta {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  font-size: 13px;
  color: #777;
  margin-bottom: 8px;
}

.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin: 10px 0;
}

.tag-badge {
  background: #eefaf4;
  color: #2f8f63;
  padding: 4px 8px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: bold;
}

.category-badge {
  background: #f3f4f6;
  color: #374151;
  padding: 4px 8px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: bold;
}

.post-card h3 {
  margin: 6px 0;
}

.post-card p {
  color: #555;
  margin: 0;
}

.card-actions {
  margin-top: 12px;
}

.detail-panel {
  min-width: 0;
}

.detail-box {
  background: white;
  border-radius: 14px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.detail-label {
  color: #42b883;
  font-weight: bold;
  margin-bottom: 8px;
}

.detail-top {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: flex-start;
}

.detail-content {
  color: #555;
  line-height: 1.6;
  margin-top: 12px;
}

.favorite-section {
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid #eee;
}

.favorite-section ul {
  padding-left: 18px;
}

.favorite-section li {
  margin-bottom: 8px;
  cursor: pointer;
  color: #2563eb;
}

.comment-section {
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid #eee;
}

.comment-item {
  background: #f9fafb;
  padding: 10px;
  border-radius: 10px;
  margin-bottom: 10px;
}

.comment-form {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.empty-box {
  background: white;
  border-radius: 14px;
  padding: 20px;
  color: #888;
  text-align: center;
}

@media (max-width: 900px) {
  .content-grid {
    grid-template-columns: 1fr;
  }

  .form-row {
    flex-direction: column;
  }

  .detail-top {
    flex-direction: column;
  }
}
</style>