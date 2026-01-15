<script setup>
import { ref, onMounted, watch, computed } from "vue"
import { useAuth0 } from "@auth0/auth0-vue"
import { useRoute, useRouter } from "vue-router"

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8081"
const { isAuthenticated, loginWithRedirect, getAccessTokenSilently } = useAuth0()
const route = useRoute()
const router = useRouter()

const loadingThreads = ref(true)
const loadingMessages = ref(false)
const error = ref(null)

const threads = ref([])   // [{ tutorId, tutorName, lastText, lastAt }]
const messages = ref([])  // [{ id, tutorId, sender, text, createdAt }]
const activeTutorId = ref(null)
const activeTutorName = ref("")
const draft = ref("")

const activeThread = computed(() =>
  threads.value.find((t) => Number(t.tutorId) === Number(activeTutorId.value))
)

onMounted(async () => {
  await ensureAuth()
  await loadThreads()

  const qTutorId = route.query.tutorId
  if (qTutorId) await openThread(Number(qTutorId))
})

watch(
  () => route.query.tutorId,
  async (newId) => {
    if (!newId) return
    await openThread(Number(newId))
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

async function openThread(tutorId) {
  if (!tutorId) return
  activeTutorId.value = tutorId

  const t = threads.value.find((x) => Number(x.tutorId) === Number(tutorId))
  activeTutorName.value = t?.tutorName || `Tutor #${tutorId}`

  router.replace({ path: "/messages", query: { tutorId } })
  await loadMessages(tutorId)
}

async function loadMessages(tutorId) {
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

async function send() {
  const text = String(draft.value || "").trim()
  if (!activeTutorId.value) {
    error.value = "Kein Tutor ausgewählt."
    return
  }
  if (!text) return

  error.value = null

  try {
    if (!isAuthenticated.value) {
      await loginWithRedirect({ appState: { target: `/messages?tutorId=${activeTutorId.value}` } })
      return
    }

    const res = await fetchWithAuth(`${API_BASE}/api/my/messages/tutors/${activeTutorId.value}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    })

    if (!res.ok) {
      const txt = await res.text().catch(() => "")
      throw new Error(`Senden fehlgeschlagen (${res.status}): ${txt}`)
    }

    draft.value = ""
    await Promise.all([loadMessages(activeTutorId.value), loadThreads()])
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
    // ISO build:
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
          :key="t.tutorId"
          class="thread-item"
          :class="{ active: Number(t.tutorId) === Number(activeTutorId) }"
          @click="openThread(t.tutorId)"
        >
          <div class="fw-semibold">{{ t.tutorName }}</div>
          <div class="small text-muted text-truncate">{{ t.lastText || "—" }}</div>

          <!-- ✅ hier das richtige Format -->
          <div class="small text-muted">
            {{ formatDateTime(t.lastAt || t.updatedAt) }}
          </div>
        </button>
      </aside>

      <!-- RIGHT -->
      <section class="chat">
        <div v-if="!activeTutorId" class="text-muted">
          Wähle links einen Chat aus oder klicke bei einem Tutor auf „Kontaktieren“.
        </div>

        <div v-else>
          <div class="chat-header">
            <div class="fw-semibold">Chat mit {{ activeTutorName }}</div>
            <div class="small text-muted" v-if="activeThread">
              Letzte Aktivität:
              {{ formatDateTime(activeThread.lastAt || activeThread.updatedAt) }}
            </div>
          </div>

          <div class="chat-body">
            <p v-if="loadingMessages">Lade Nachrichten…</p>

            <div v-else-if="!messages.length" class="text-muted">
              Noch keine Nachrichten – schreib die erste 🙂
            </div>

            <div v-else class="chat-messages">
              <div v-for="m in messages" :key="m.id || (String(m.createdAt) + m.text)" class="msg">
                <div class="msg-meta small text-muted">
                  {{ formatSender(m.sender) }} • {{ formatDateTime(m.createdAt) }}
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