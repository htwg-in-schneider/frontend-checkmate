<script setup>
import { ref, onMounted, watch, computed } from "vue"
import { useAuth0 } from "@auth0/auth0-vue"
import { useRoute, useRouter } from "vue-router"

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8081"

const { isAuthenticated, loginWithRedirect, getAccessTokenSilently, user } = useAuth0()
const route = useRoute()
const router = useRouter()

const loadingThreads = ref(true)
const loadingMessages = ref(false)
const error = ref(null)

const threads = ref([]) // [{ type, tutorId?, userOauthId?, title, lastText, updatedAt }]
const messages = ref([])

const active = ref({ type: null, tutorId: null, userOauthId: null })
const draft = ref("")

const activeThread = computed(() => {
  if (!active.value.type) return null
  return threads.value.find((t) => {
    if (active.value.type === "TUTOR") {
      return t.type === "TUTOR" && Number(t.tutorId) === Number(active.value.tutorId)
    }
    return t.type === "USER" && String(t.userOauthId) === String(active.value.userOauthId)
  })
})

const activeTitle = computed(() => activeThread.value?.title ?? "Chat")

onMounted(async () => {
  await ensureAuth()
  await loadThreads()

  const qTutorId = route.query.tutorId
  const qUser = route.query.user

  if (qTutorId) await openTutorThread(Number(qTutorId))
  else if (qUser) await openUserThread(String(qUser))
})

watch(
  () => route.query.tutorId,
  async (newId) => {
    if (newId) await openTutorThread(Number(newId))
  }
)

watch(
  () => route.query.user,
  async (newUser) => {
    if (newUser) await openUserThread(String(newUser))
  }
)

async function ensureAuth() {
  if (!isAuthenticated.value) {
    await loginWithRedirect({ appState: { target: "/messages" } })
  }
}

async function fetchWithAuth(url, options = {}) {
  const token = await getAccessTokenSilently()
  return fetch(url, {
    ...options,
    headers: {
      ...(options.headers || {}),
      Authorization: `Bearer ${token}`,
    },
  })
}

async function loadThreads() {
  loadingThreads.value = true
  error.value = null
  try {
    const res = await fetchWithAuth(`${API_BASE}/api/my/messages/threads`)
    if (!res.ok) {
      const txt = await res.text().catch(() => "")
      throw new Error(`Threads laden fehlgeschlagen (${res.status}): ${txt}`)
    }
    threads.value = await res.json()
  } catch (e) {
    error.value = e?.message ?? String(e)
  } finally {
    loadingThreads.value = false
  }
}

async function openTutorThread(tutorId) {
  active.value = { type: "TUTOR", tutorId, userOauthId: null }
  router.replace({ path: "/messages", query: { tutorId } })
  await loadTutorMessages(tutorId)
}

async function openUserThread(otherOauthId) {
  active.value = { type: "USER", tutorId: null, userOauthId: otherOauthId }
  router.replace({ path: "/messages", query: { user: otherOauthId } })
  await loadUserMessages(otherOauthId)
}

async function loadTutorMessages(tutorId) {
  loadingMessages.value = true
  error.value = null
  try {
    const res = await fetchWithAuth(`${API_BASE}/api/my/messages/tutors/${tutorId}`)
    if (!res.ok) {
      const txt = await res.text().catch(() => "")
      throw new Error(`Messages laden fehlgeschlagen (${res.status}): ${txt}`)
    }
    messages.value = await res.json()
  } catch (e) {
    error.value = e?.message ?? String(e)
  } finally {
    loadingMessages.value = false
  }
}

async function loadUserMessages(otherOauthId) {
  loadingMessages.value = true
  error.value = null
  try {
    const res = await fetchWithAuth(
      `${API_BASE}/api/my/messages/users/${encodeURIComponent(otherOauthId)}`
    )
    if (!res.ok) {
      const txt = await res.text().catch(() => "")
      throw new Error(`Messages laden fehlgeschlagen (${res.status}): ${txt}`)
    }
    messages.value = await res.json()
  } catch (e) {
    error.value = e?.message ?? String(e)
  } finally {
    loadingMessages.value = false
  }
}

async function send() {
  const text = String(draft.value || "").trim()
  if (!text) return

  if (!active.value.type) {
    error.value = "Kein Chat ausgewählt."
    return
  }

  error.value = null

  try {
    const url =
      active.value.type === "TUTOR"
        ? `${API_BASE}/api/my/messages/tutors/${active.value.tutorId}`
        : `${API_BASE}/api/my/messages/users/${encodeURIComponent(active.value.userOauthId)}`

    const res = await fetchWithAuth(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    })

    if (!res.ok) {
      const txt = await res.text().catch(() => "")
      throw new Error(`Senden fehlgeschlagen (${res.status}): ${txt}`)
    }

    draft.value = ""

    if (active.value.type === "TUTOR") await loadTutorMessages(active.value.tutorId)
    else await loadUserMessages(active.value.userOauthId)

    await loadThreads()
  } catch (e) {
    error.value = e?.message ?? String(e)
  }
}

/**
 * ✅ Robust:
 * - Array (Jackson LocalDateTime): [y,mo,d,h,mi,sec,nanos]
 * - ISO String
 * - "YYYY-MM-DD HH:mm"
 */
function formatDateTime(dt) {
  if (!dt) return "—"

  if (Array.isArray(dt)) {
    const [y, mo, d, h = 0, mi = 0, s = 0] = dt
    const pad = (n) => String(n).padStart(2, "0")
    const iso = `${y}-${pad(mo)}-${pad(d)}T${pad(h)}:${pad(mi)}:${pad(s)}`
    const date = new Date(iso)
    if (isNaN(date.getTime())) return `${pad(d)}.${pad(mo)}.${y} ${pad(h)}:${pad(mi)}`
    return date.toLocaleString("de-DE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const s0 = String(dt).trim()
  if (!s0) return "—"

  const normalized = s0.replace(" ", "T").replace(/(\.\d+)?$/, "")
  const date = new Date(normalized)

  return isNaN(date.getTime())
    ? s0
    : date.toLocaleString("de-DE", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
}

function formatSender(sender) {
  const s = String(sender || "").toUpperCase()
  if (s === "STUDENT") return "STUDENT"
  if (s === "TUTOR") return "TUTOR"
  return "DU"
}
function formatSenderForDirect(m) {

  return m?.senderName || "Match"
}
</script>

<template>
  <div class="container py-4">
    <h1>Nachrichten</h1>

    <p v-if="error" class="text-danger">{{ error }}</p>

    <div class="messages-grid">
      <!-- LEFT -->
      <aside class="threads">
        <div class="d-flex justify-content-between align-items-center mb-2">
          <h5 class="mb-0">Chats</h5>
          <button class="btn btn-sm btn-outline-secondary" @click="loadThreads" :disabled="loadingThreads">
            {{ loadingThreads ? "..." : "Refresh" }}
          </button>
        </div>

        <p v-if="loadingThreads">Lade Chats…</p>
        <p v-else-if="!threads.length" class="text-muted">Noch keine Nachrichten.</p>

        <button
          v-for="t in threads"
          :key="t.type + ':' + (t.tutorId ?? t.userOauthId)"
          class="thread-item"
          :class="{
            active:
              (t.type === 'TUTOR' && active.type === 'TUTOR' && Number(t.tutorId) === Number(active.tutorId)) ||
              (t.type === 'USER' && active.type === 'USER' && String(t.userOauthId) === String(active.userOauthId))
          }"
          @click="t.type === 'TUTOR' ? openTutorThread(t.tutorId) : openUserThread(t.userOauthId)"
        >
          <div class="fw-semibold">{{ t.title }}</div>
          <div class="small text-muted text-truncate">{{ t.lastText || "—" }}</div>
          <div class="small text-muted">{{ formatDateTime(t.updatedAt) }}</div>
        </button>
      </aside>

      <!-- RIGHT -->
      <section class="chat">
        <div v-if="!active.type" class="text-muted">
          Wähle links einen Chat aus oder klicke bei einem Tutor/Match auf „Nachricht“.
        </div>

        <div v-else>
          <div class="chat-header">
            <div class="fw-semibold">Chat mit {{ activeTitle }}</div>
            <div class="small text-muted" v-if="activeThread">
              Letzte Aktivität: {{ formatDateTime(activeThread.updatedAt) }}
            </div>
          </div>

          <div class="chat-body">
            <p v-if="loadingMessages">Lade Nachrichten…</p>

            <div v-else-if="!messages.length" class="text-muted">
              Noch keine Nachrichten – schreib die erste 🙂
            </div>

            <div v-else class="chat-messages">
              <div
                v-for="m in messages"
                :key="m.id || (String(m.createdAt) + m.text)"
                class="msg"
              >
                <div class="msg-meta small text-muted">
                  {{
                    active.type === "USER"
                      ? formatSenderForDirect(m)
                      : (m.senderName || formatSender(m.sender))
                  }}
                  • {{ formatDateTime(m.createdAt) }}
                </div>
                <div class="msg-text">{{ m.text }}</div>
              </div>
            </div>
          </div>

          <div class="chat-input">
            <textarea
              v-model="draft"
              class="form-control"
              rows="2"
              placeholder="Nachricht schreiben…"
              @keydown.enter.exact.prevent="send"
            />
            <button class="btn btn-success mt-2 w-100" @click="send" :disabled="!draft.trim()">
              Senden
            </button>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.messages-grid {
  display: grid;
  grid-template-columns: 320px 1fr;
  gap: 16px;
}

.threads {
  border: 1px solid #eee;
  border-radius: 12px;
  padding: 12px;
  background: white;
  max-height: 70vh;
  overflow: auto;
}

.thread-item {
  width: 100%;
  text-align: left;
  border: 1px solid #eee;
  background: #fff;
  border-radius: 10px;
  padding: 10px;
  margin-bottom: 10px;
}

.thread-item.active {
  border-color: #607953;
  box-shadow: 0 0 0 2px rgba(96, 121, 83, 0.15);
}

.chat {
  border: 1px solid #eee;
  border-radius: 12px;
  padding: 12px;
  background: white;
  min-height: 70vh;
  display: flex;
  flex-direction: column;
}

.chat-header {
  border-bottom: 1px solid #eee;
  padding-bottom: 10px;
  margin-bottom: 10px;
}

.chat-body {
  flex: 1;
  overflow: auto;
  padding-right: 4px;
}

.chat-messages {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.msg {
  border: 1px solid #f1f1f1;
  border-radius: 10px;
  padding: 10px;
  background: #fafafa;
}

.msg-text {
  white-space: pre-wrap;
}

.chat-input {
  border-top: 1px solid #eee;
  padding-top: 10px;
  margin-top: 10px;
}

@media (max-width: 900px) {
  .messages-grid {
    grid-template-columns: 1fr;
  }
  .threads {
    max-height: 30vh;
  }
  .chat {
    min-height: 55vh;
  }
}
</style>