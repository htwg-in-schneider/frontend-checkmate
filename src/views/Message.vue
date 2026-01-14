<script setup>
import { ref, onMounted, computed } from "vue"
import { useRoute, useRouter } from "vue-router"
import { useAuth0 } from "@auth0/auth0-vue"

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8081"
const route = useRoute()
const router = useRouter()

const { isAuthenticated, loginWithRedirect, getAccessTokenSilently } = useAuth0()

const loading = ref(true)
const error = ref(null)

const threads = ref([])          // [{ tutorId, tutorName, lastText, lastAt }]
const activeTutorId = ref(null)  // number
const messages = ref([])         // [{ id, tutorId, studentOauthId, sender, text, createdAt }]
const draft = ref("")

function formatDateTimeLocal(dt) {
  const s0 = String(dt || "").trim()
  if (!s0) return "—"

  // akzeptiert z.B. "2026-01-15T14:00:00", "2026-01-15T14:00:00.000", "2026-01-15 14:00:00"
  const normalized = s0.replace(" ", "T").replace(/(\.\d+)?$/, "")
  const [datePart, timePartFull] = normalized.split("T")
  if (!datePart || !timePartFull) return s0

  const timePart = timePartFull.slice(0, 5) // HH:mm
  const [y, m, d] = datePart.split("-")
  if (!y || !m || !d) return s0

  return `${d}.${m}.${y} ${timePart}`
}

const activeThread = computed(() =>
  threads.value.find((t) => String(t.tutorId) === String(activeTutorId.value))
)

onMounted(async () => {
  // Auth erzwingen
  if (!isAuthenticated.value) {
    await loginWithRedirect({ appState: { target: "/messages" } })
    return
  }

  // optional: /messages?tutorId=5
  if (route.query.tutorId) activeTutorId.value = Number(route.query.tutorId)

  await loadThreads()

  // wenn kein tutorId gesetzt → ersten Thread öffnen
  if (!activeTutorId.value && threads.value.length) {
    activeTutorId.value = threads.value[0].tutorId
  }

  if (activeTutorId.value) {
    await loadMessages(activeTutorId.value)
  }
})

async function loadThreads() {
  loading.value = true
  error.value = null
  try {
    const token = await getAccessTokenSilently()
    const res = await fetch(`${API_BASE}/api/my/messages/threads`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!res.ok) {
      const txt = await res.text().catch(() => "")
      throw new Error(txt || `HTTP ${res.status}`)
    }
    threads.value = await res.json()
  } catch (e) {
    error.value = e?.message ?? String(e)
  } finally {
    loading.value = false
  }
}

async function loadMessages(tutorId) {
  loading.value = true
  error.value = null
  try {
    const token = await getAccessTokenSilently()
    const res = await fetch(`${API_BASE}/api/my/messages/tutors/${tutorId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!res.ok) {
      const txt = await res.text().catch(() => "")
      throw new Error(txt || `HTTP ${res.status}`)
    }
    messages.value = await res.json()
  } catch (e) {
    error.value = e?.message ?? String(e)
  } finally {
    loading.value = false
  }
}

async function openThread(tutorId) {
  activeTutorId.value = tutorId
  await loadMessages(tutorId)
  router.replace({ path: "/messages", query: { tutorId } })
}

async function send() {
  error.value = null
  const text = String(draft.value || "").trim()
  if (!text) return
  if (!activeTutorId.value) return

  try {
    const token = await getAccessTokenSilently()
    const res = await fetch(`${API_BASE}/api/my/messages/tutors/${activeTutorId.value}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ text }),
    })

    if (!res.ok) {
      const txt = await res.text().catch(() => "")
      throw new Error(txt || `HTTP ${res.status}`)
    }

    draft.value = ""

    // neu laden (einfach & zuverlässig)
    await loadMessages(activeTutorId.value)
    await loadThreads()
  } catch (e) {
    error.value = e?.message ?? String(e)
  }
}
</script>

<template>
  <div class="container py-4">
    <h1>Nachrichten</h1>

    <p v-if="loading">Lade…</p>
    <p v-else-if="error" class="text-danger">{{ error }}</p>

    <div v-else class="row g-3">
      <!-- LEFT: Threads -->
      <div class="col-md-4">
        <div class="border rounded p-2">
          <div v-if="!threads.length" class="text-muted">Noch keine Chats.</div>

          <button
            v-for="t in threads"
            :key="t.tutorId"
            class="w-100 text-start btn mb-2"
            :class="String(t.tutorId) === String(activeTutorId) ? 'btn-outline-primary' : 'btn-light'"
            @click="openThread(t.tutorId)"
          >
            <div class="fw-bold">{{ t.tutorName }}</div>
            <div class="small text-muted">{{ t.lastText }}</div>
            <div class="small text-muted">{{ formatDateTimeLocal(t.lastAt) }}</div>
          </button>
        </div>
      </div>

      <!-- RIGHT: Chat -->
      <div class="col-md-8">
        <div class="border rounded p-3" style="min-height: 420px;">
          <div class="fw-bold mb-2">{{ activeThread?.tutorName || "Chat" }}</div>

          <div v-if="!activeTutorId" class="text-muted">
            Wähle links einen Chat aus.
          </div>

          <div v-else>
            <div class="messages-box border rounded p-2 mb-2">
              <div v-if="!messages.length" class="text-muted">Noch keine Nachrichten.</div>

              <div v-for="m in messages" :key="m.id" class="mb-2 d-flex">
                <div
                  class="p-2 rounded"
                  :class="m.sender === 'STUDENT' ? 'msg-me ms-auto' : 'msg-tutor me-auto'"
                >
                  <div class="small">{{ m.text }}</div>
                  <div class="small text-muted">{{ formatDateTimeLocal(m.createdAt) }}</div>
                </div>
              </div>
            </div>

            <div class="d-flex gap-2">
              <input
                v-model="draft"
                class="form-control"
                placeholder="Nachricht schreiben…"
                @keyup.enter="send"
              />
              <button class="btn btn-success" @click="send">Senden</button>
            </div>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<style scoped>
.messages-box {
  max-height: 320px;
  overflow: auto;
  background: #fafafa;
}

.msg-me {
  background: #e9f6ea;
  max-width: 80%;
}

.msg-tutor {
  background: #ffffff;
  border: 1px solid #eee;
  max-width: 80%;
}
</style>