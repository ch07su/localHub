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
          <button class="edit-btn" @click="openEditForm">
            {{ showEditForm ? '수정 취소' : '수정' }}
          </button>
          <button class="delete-btn" @click="requestDeletePost">삭제</button>
        </div>

        <div v-if="showDeleteConfirm" class="inline-password-box">
          <input v-model="deletePassword" type="password" placeholder="비밀번호를 입력하세요" />
          <button class="submit-btn" @click="confirmDeletePost(post)">삭제 확인</button>
          
        </div>

        <section v-if="showEditPasswordPrompt" class="write-form">
  <h3>게시글 수정</h3>

  <div class="form-row">
    <input v-model="editPassword" type="password" placeholder="수정 비밀번호를 입력하세요" />
  </div>

  <div class="form-actions">
    <button class="submit-btn" @click="verifyEditPassword">확인</button>
    <button class="cancel-btn" @click="cancelEditProcess">취소</button>
  </div>
</section>

<section v-if="showEditForm" class="write-form">
  <h3>게시글 수정</h3>

  <div class="form-row">
    <input v-model="editForm.title" class="flex-large" placeholder="제목" />
    <input v-model="editForm.writer" class="flex-small" placeholder="작성자" />
  </div>

  <div class="form-row">
    <input v-model="editForm.password" type="password" class="flex-large" placeholder="비밀번호" />
    <select v-model="editForm.region" class="flex-small">
      <option value="">지역 선택</option>
      <option v-for="region in regionOptions" :key="region" :value="region">
        {{ region }}
      </option>
    </select>
  </div>

  <div class="form-row">
    <select v-model="editForm.category" class="flex-small">
      <option value="">게시판 선택</option>
      <option value="공지사항">공지사항</option>
      <option value="자유게시판">자유게시판</option>
      <option value="Q&A">Q&A</option>
    </select>

    <input
      v-model="editForm.tagInput"
      class="tag-input flex-large"
      placeholder="태그를 쉼표로 입력하세요. 예: 서울, 밤산책"
    />
  </div>

  <textarea v-model="editForm.content" rows="6" placeholder="내용을 입력하세요."></textarea>

  <input type="file" accept="image/*" @change="handleEditImageUpload" />
  <img v-if="editForm.image" :src="editForm.image" class="preview-image" />

  <div v-if="editForm.image || post.image" class="form-actions">
    <button type="button" class="cancel-btn" @click="removeEditImage">
      기존 이미지 삭제
    </button>
  </div>

  <div class="form-actions">
    <button class="submit-btn" @click="submitEdit">수정하기</button>
    <button class="cancel-btn" @click="cancelEditProcess">취소</button>
  </div>
</section>

        <section class="comment-section">
          <h3>댓글</h3>

          <div v-for="comment in post.comments" :key="comment.id" class="comment-item">
            <div class="comment-header">
              <strong>{{ comment.writer }}</strong>
              <div class="comment-actions">
                <button class="small-btn" @click="requestCommentAction(comment, 'edit')">수정</button>
                <button class="small-btn danger" @click="requestCommentAction(comment, 'delete')">삭제</button>
              </div>
            </div>

            <p v-if="editingCommentId !== comment.id">{{ comment.text }}</p>
            <div v-else class="comment-edit-box">
              <textarea v-model="commentDraft"></textarea>
              <button class="small-btn" @click="saveCommentEdit(comment)">저장</button>
            </div>

            <div v-if="passwordCheck.commentId === comment.id" class="inline-password-box">
              <input v-model="passwordCheck.value" type="password" placeholder="댓글 비밀번호" />
              <button class="small-btn" @click="confirmPasswordCheck(comment)">확인</button>
              
            </div>
          </div>

          <div class="comment-form">
            <input v-model="commentWriter" placeholder="댓글 작성자" />
            <input v-model="commentPassword" type="password" placeholder="비밀번호" />
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

const regionOptions = [
  '종로구','중구','용산구','성동구','광진구','동대문구','중랑구',
  '성북구','강북구','도봉구','노원구','은평구','서대문구','마포구',
  '양천구','강서구','구로구','금천구','영등포구','동작구','관악구',
  '서초구','강남구','송파구','강동구'
]

const STORAGE_KEY = 'localhub-posts'
const FAVORITES_KEY = 'localhub-favorites'

const route = useRoute()
const router = useRouter()

const posts = ref([])
const post = ref(null)
const favorites = ref([])
const showEditPasswordPrompt = ref(false)
const showEditForm = ref(false)
const editPassword = ref('')
const isEditVerified = ref(false)

const editForm = ref({
  title: '',
  writer: '',
  password: '',
  region: '',
  category: '자유게시판',
  content: '',
  image: '',
  tagInput: ''
})
const commentWriter = ref('')
const commentPassword = ref('')
const commentText = ref('')
const editingCommentId = ref(null)
const commentDraft = ref('')
const showDeleteConfirm = ref(false)
const deletePassword = ref('')
const passwordCheck = ref({ commentId: null, action: null, value: '' })

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

function requestDeletePost() {
  showDeleteConfirm.value = true
  deletePassword.value = ''
}

function cancelDeletePost() {
  showDeleteConfirm.value = false
  deletePassword.value = ''
}





function confirmDeletePost(target) {
  if (!deletePassword.value.trim()) {
    alert('비밀번호를 입력해주세요.')
    return
  }

  if (deletePassword.value !== target.password) {
    alert('비밀번호가 일치하지 않습니다.')
    return
  }

  posts.value = posts.value.filter((item) => item.id !== target.id)
  savePosts()
  router.push('/community')
}


function openEditForm() {
  if (!post.value) return
  editPassword.value = ''
  showEditPasswordPrompt.value = true
  showEditForm.value = false
  isEditVerified.value = false
}

function cancelEditProcess() {
  showEditPasswordPrompt.value = false
  showEditForm.value = false
  editPassword.value = ''
  isEditVerified.value = false
}

function verifyEditPassword() {
  // 입력값 존재 확인
  if (!editPassword.value || !editPassword.value.toString().trim()) {
    alert('비밀번호를 입력해주세요.')
    return
  }

  // 안전하게 문자열로 변환하여 비교 (숫자/문자 구분 제거, 공백 제거)
  const entered = editPassword.value.toString().trim()
  const stored = (post.value && post.value.password != null) ? post.value.password.toString().trim() : ''

  console.log('verifyEditPassword:', { entered, stored })

  if (!post.value || entered !== stored) {
    alert('비밀번호가 일치하지 않습니다.')
    return
  }

  // 일치하면 편집폼에 기존 값 채우기
  isEditVerified.value = true
  editForm.value = {
    title: post.value.title,
    writer: post.value.writer,
    password: post.value.password != null ? post.value.password.toString() : '',
    region: post.value.region || '',
    category: post.value.category || '자유게시판',
    content: post.value.content,
    image: post.value.image || '',
    tagInput: (post.value.tags || []).join(', ')
  }

  showEditPasswordPrompt.value = false
  showEditForm.value = true
}

function handleEditImageUpload(event) {
  const file = event.target.files[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = () => {
    editForm.value.image = reader.result
  }
  reader.readAsDataURL(file)
}

function submitEdit() {
  if (!editForm.value.title.trim() || !editForm.value.writer.trim() || !editForm.value.password.trim() || !editForm.value.content.trim()) {
    alert('제목, 작성자, 비밀번호, 내용을 모두 입력해주세요.')
    return
  }

  if (!isEditVerified.value) {
    alert('비밀번호 확인이 필요합니다.')
    return
  }

  const tags = editForm.value.tagInput
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean)

  posts.value = posts.value.map((item) =>
    item.id === post.value.id
      ? {
          ...item,
          title: editForm.value.title,
          writer: editForm.value.writer,
          password: editForm.value.password,
          region: editForm.value.region,
          category: editForm.value.category,
          content: editForm.value.content,
          image: editForm.value.image,
          tags
        }
      : item
  )

  post.value = posts.value.find((item) => item.id === post.value.id) || null
  savePosts()
  showEditForm.value = false
  isEditVerified.value = false
  editPassword.value = ''
  alert('게시글이 수정되었습니다.')
}

function addComment() {
  if (!post.value) return
  if (!commentWriter.value.trim() || !commentPassword.value.trim() || !commentText.value.trim()) {
    alert('닉네임, 비밀번호, 댓글 내용을 모두 입력해주세요.')
    return
  }

  posts.value = posts.value.map((item) =>
    item.id === post.value.id
      ? {
          ...item,
          comments: [
            ...(item.comments || []),
            {
              id: Date.now(),
              writer: commentWriter.value.trim(),
              password: commentPassword.value.trim(),
              text: commentText.value.trim()
            }
          ]
        }
      : item
  )

  post.value = posts.value.find((item) => item.id === post.value.id) || null
  commentWriter.value = ''
  commentPassword.value = ''
  commentText.value = ''
  savePosts()
}

function requestCommentAction(comment, action) {
  passwordCheck.value = { commentId: comment.id, action, value: '' }
}

function cancelPasswordCheck() {
  passwordCheck.value = { commentId: null, action: null, value: '' }
}

function confirmPasswordCheck(comment) {
  if (!passwordCheck.value.value.trim()) {
    alert('비밀번호를 입력해주세요.')
    return
  }

  if (passwordCheck.value.value !== comment.password) {
    alert('비밀번호가 일치하지 않습니다.')
    return
  }

  if (passwordCheck.value.action === 'edit') {
    editingCommentId.value = comment.id
    commentDraft.value = comment.text
  } else if (passwordCheck.value.action === 'delete') {
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

  cancelPasswordCheck()
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



function removeEditImage() {
  editForm.value.image = ''
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
  background: #ffffff;
}

.detail-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 32px 20px 80px;
}

.back-btn {
  border: 1px solid #e3e3e3;
  background: white;
  color: #555;
  padding: 9px 16px;
  border-radius: 8px;
  margin-bottom: 18px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
}

.back-btn:hover {
  background: #fafafa;
  border-color: #ff7a3d;
  color: #ff7a3d;
}

.detail-card {
  background: white;
  border: 1px solid #ebebeb;
  border-radius: 12px;
  padding: 28px;
}

.detail-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.detail-top h1 {
  font-size: 22px;
  font-weight: 800;
  color: #222;
  margin: 0;
}

.eyebrow {
  color: #ff7a3d;
  font-weight: 700;
  font-size: 13px;
  margin-bottom: 6px;
}

.meta-row {
  display: flex;
  gap: 14px;
  flex-wrap: wrap;
  color: #999;
  font-size: 13px;
  margin: 14px 0;
}

.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin: 10px 0 18px;
}

.tag-badge {
  background: #fff3ea;
  color: #ff7a3d;
  padding: 4px 9px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
}

.detail-image {
  width: 100%;
  max-height: 320px;
  object-fit: cover;
  border-radius: 10px;
  margin: 12px 0;
}

.detail-content {
  line-height: 1.7;
  color: #444;
  font-size: 15px;
  padding: 4px 0 20px;
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
  padding: 8px 14px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 700;
  font-size: 13px;
}

.like-btn {
  background: #f59e0b;
  color: white;
}

.favorite-btn {
  background: #3b82f6;
  color: white;
}

.edit-btn {
  background: #f1f1f1;
  color: #444;
}

.submit-btn,
.small-btn {
  background: #ff7a3d;
  color: white;
}

.submit-btn:hover,
.small-btn:hover {
  background: #ef6a2e;
}

.delete-btn,
.small-btn.danger {
  background: #ef4444;
  color: white;
}

.action-bar {
  padding-top: 18px;
  border-top: 1px solid #f0f0f0;
}

.inline-password-box {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-top: 10px;
  flex-wrap: wrap;
}

.inline-password-box input {
  flex: 1;
  min-width: 160px;
}

.edit-form,
.comment-form {
  margin-top: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.edit-form {
  background: #fafafa;
  border: 1px solid #eee;
  border-radius: 10px;
  padding: 16px;
}

.edit-form h3 {
  margin: 0 0 4px;
  font-size: 15px;
}

input,
textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #e3e3e3;
  border-radius: 8px;
  font-size: 14px;
  color: #333;
  background: white;
}

input:focus,
textarea:focus {
  outline: none;
  border-color: #ff7a3d;
}

.comment-section {
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid #f0f0f0;
}

.comment-section h3 {
  font-size: 16px;
  margin: 0 0 12px;
  color: #222;
}

.comment-item {
  background: #fafafa;
  border: 1px solid #f0f0f0;
  border-radius: 10px;
  padding: 12px 14px;
  margin-bottom: 10px;
}

.comment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.comment-item p {
  color: #555;
  font-size: 14px;
  margin: 0;
}

.comment-edit-box {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.empty-box {
  background: white;
  border: 1px solid #eee;
  padding: 24px;
  text-align: center;
  border-radius: 10px;
  color: #888;
  font-weight: 600;
}

.write-form {
  background: white;
  padding: 20px;
  border-radius: 12px;
  border: 1px solid #eee;
  margin-bottom: 24px;
}

.form-row {
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
}

.flex-small {
  flex: 1;
  min-width: 0;
}

.flex-large {
  flex: 2;
}

.write-form input,
.write-form select,
.write-form textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #e3e3e3;
  border-radius: 8px;
  font-size: 14px;
  color: #333;
  background: white;
}

.write-form input:focus,
.write-form select:focus,
.write-form textarea:focus {
  outline: none;
  border-color: #ff7a3d;
}

.form-actions {
  display: flex;
  gap: 10px;
  margin-top: 12px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.submit-btn {
  border: none;
  border-radius: 10px;
  padding: 12px 22px;
  background: linear-gradient(135deg, #ff7a3d 0%, #ff945f 100%);
  color: #ffffff;
  font-weight: 800;
  font-size: 14px;
  cursor: pointer;
  box-shadow: 0 12px 24px rgba(255, 122, 61, 0.18);
  transition: transform 0.18s ease, box-shadow 0.18s ease;
}

.submit-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 16px 28px rgba(255, 122, 61, 0.24);
}

.cancel-btn {
  border: 1px solid #ff7a3d;
  background: #ffffff;
  color: #ff7a3d;
  border-radius: 10px;
  padding: 12px 22px;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.18s ease, color 0.18s ease, transform 0.18s ease;
}

.cancel-btn:hover {
  background: #ff7a3d;
  color: #ffffff;
  transform: translateY(-1px);
}

.preview-image {
  width: 100%;
  max-height: 220px;
  object-fit: cover;
  border-radius: 10px;
  margin-top: 12px;
}

.detail-content {
  white-space: pre-wrap;
  word-break: break-word;
}

@media (max-width: 700px) {
  .detail-top {
    flex-direction: column;
  }
}
</style>