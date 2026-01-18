<script setup>
import { ref, onMounted } from "vue"
import { useRouter } from "vue-router"
import { useAuth0 } from "@auth0/auth0-vue"

const router = useRouter()
const { getAccessTokenSilently } = useAuth0()

const API_BASE = import.meta.env.VITE_API_BASE_URL

const loading = ref(true)
const error = ref(null)

const matches = ref([]) // echte Matches (mutual)
const likes = ref([])   // alle Likes die ich geschickt hab

const activeTab = ref("matches") // 'matches' | 'waiting'

onMounted(loadAll)

async function authedFetch(path) {
  const token = await getAccessTokenSilently()
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw new Error(`${path} failed: ${res.status}`)
  return await res.json()
}

async function loadAll() {
  loading.value = true
  error.value = null
  try {
    matches.value = await authedFetch("/api/matches/me")
    likes.value = await authedFetch("/api/matches/like")
  } catch (e) {
    console.error(e)
    error.value = "Konnte Matches nicht laden (Login/Backend)."
  } finally {
    loading.value = false
  }
}

function isAlreadyMatch(user) {
  return matches.value.some((m) => m.id === user.id)
}

function goBack() {
  router.back()
}

function openChat(u) {
  const otherOauthId = u.oauthId || u.otherOauthId
  if (!otherOauthId) return
  router.push({ path: "/messages", query: { user: otherOauthId } })
}
</script>

<template>
  <Navbar />

  <main class="page">
    <div class="container">
      <h2 class="title">Meine Matches</h2>
      <p class="subtitle">Hier siehst du deine Matches und wen du geliked hast.</p>

      <div class="tabs">
        <button class="tab" :class="{ active: activeTab === 'matches' }" @click="activeTab = 'matches'">
          ✅ Matches ({{ matches.length }})
        </button>

        <button class="tab" :class="{ active: activeTab === 'waiting' }" @click="activeTab = 'waiting'">
          ⏳ Warte auf Match ({{ likes.filter((u) => !isAlreadyMatch(u)).length }})
        </button>
      </div>

      <p v-if="loading" class="state">Lade…</p>
      <p v-else-if="error" class="state error">{{ error }}</p>

      <!-- MATCHES -->
      <div v-else-if="activeTab === 'matches'">
        <div v-if="matches.length" class="list">
          <div v-for="u in matches" :key="u.id" class="item">
            <div class="avatar">{{ (u.name || "?").slice(0, 1).toUpperCase() }}</div>

            <div class="info">
              <div class="name">{{ u.name || "—" }}</div>
              <div class="meta">{{ u.email || "" }}</div>
            </div>

            <div class="right">
              <div class="badge match">MATCH</div>
              <button class="msg-btn" @click="openChat(u)">💬 Nachricht</button>
            </div>
          </div>
        </div>

        <p v-else class="state">Noch keine Matches. Like weiter 🙂</p>
      </div>

      <!-- WAITING -->
      <div v-else>
        <div v-if="likes.filter((u) => !isAlreadyMatch(u)).length" class="list">
          <div v-for="u in likes.filter((x) => !isAlreadyMatch(x))" :key="u.id" class="item">
            <div class="avatar">{{ (u.name || "?").slice(0, 1).toUpperCase() }}</div>

            <div class="info">
              <div class="name">{{ u.name || "—" }}</div>
              <div class="meta">{{ u.email || "" }}</div>
            </div>

            <div class="badge waiting">WARTET</div>
          </div>
        </div>

        <p v-else class="state">Du wartest aktuell auf keine Matches.</p>
      </div>

      <div class="actions">
        <button class="btn" @click="loadAll">Neu laden</button>
        <button class="btn secondary" @click="goBack">Zurück</button>
      </div>
    </div>
  </main>
</template>

<style scoped>
.page {
  min-height: 100vh;
  background: #f3efdf;
  padding: 2rem 1rem;
}
.container {
  max-width: 560px;
  margin: 0 auto;
}
.title {
  font-weight: 800;
  margin-bottom: 0.2rem;
}
.subtitle {
  margin-bottom: 1.2rem;
  color: rgba(0, 0, 0, 0.65);
}
.tabs {
  display: flex;
  gap: 0.6rem;
  margin-bottom: 1rem;
}
.tab {
  flex: 1;
  border: 0;
  border-radius: 14px;
  padding: 0.8rem;
  font-weight: 700;
  cursor: pointer;
  background: rgba(255, 255, 255, 0.7);
}
.tab.active {
  background: rgba(105, 124, 68, 0.85);
  color: white;
}
.list {
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
}
.item {
  background: rgba(255, 255, 255, 0.75);
  border-radius: 16px;
  padding: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.9rem;
}
.avatar {
  width: 42px;
  height: 42px;
  border-radius: 999px;
  display: grid;
  place-items: center;
  font-weight: 800;
  background: rgba(164, 108, 58, 0.25);
}
.info {
  flex: 1;
}
.name {
  font-weight: 800;
}
.meta {
  font-size: 0.85rem;
  color: rgba(0, 0, 0, 0.65);
}

.right {
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: flex-end;
}

.msg-btn {
  border: 0;
  border-radius: 12px;
  padding: 0.45rem 0.7rem;
  font-weight: 800;
  cursor: pointer;
  background: rgba(0, 0, 0, 0.12);
}

.badge {
  font-size: 0.75rem;
  font-weight: 800;
  padding: 0.35rem 0.6rem;
  border-radius: 999px;
}
.badge.match {
  background: rgba(31, 140, 76, 0.18);
}
.badge.waiting {
  background: rgba(164, 108, 58, 0.18);
}

.state {
  text-align: center;
  margin: 1.2rem 0;
}
.state.error {
  color: #b00020;
}

.actions {
  margin-top: 1.2rem;
  display: flex;
  gap: 0.8rem;
  justify-content: center;
}
.btn {
  border: 0;
  border-radius: 14px;
  padding: 0.8rem 1.1rem;
  font-weight: 800;
  cursor: pointer;
  background: rgba(105, 124, 68, 0.85);
  color: white;
}
.btn.secondary {
  background: rgba(0, 0, 0, 0.15);
  color: black;
}
</style>