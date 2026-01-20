<script setup>
import { ref, onMounted } from "vue"
import { useAuth0 } from "@auth0/auth0-vue"
import { useRouter } from "vue-router"

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8081"
const { getAccessTokenSilently, isAuthenticated, loginWithRedirect } = useAuth0()

const loading = ref(true)
const error = ref(null)
const bookings = ref([])
const router = useRouter()

const cancelLoadingId = ref(null)

onMounted(() => {
  load()
})

async function load() {
  loading.value = true
  error.value = null

  try {
    if (!isAuthenticated.value) {
      await loginWithRedirect({ appState: { target: "/tutorunterricht" } })
      return
    }

    const token = await getAccessTokenSilently()
    const res = await fetch(`${API_BASE}/api/my/tutor-bookings`, {
      headers: { Authorization: `Bearer ${token}` },
    })

    if (!res.ok) {
      const txt = await res.text().catch(() => "")
      throw new Error(`${res.status}: ${txt}`)
    }

    bookings.value = await res.json()
  } catch (e) {
    error.value = e?.message ?? String(e)
  } finally {
    loading.value = false
  }
}

/**
 * Robust:
 * - Array (Jackson LocalDateTime): [y,mo,d,h,mi,(sec?)]
 * - ISO String
 * - "YYYY-MM-DD HH:mm"
 */
function formatStartAtRaw(startAt) {
  if (!startAt) return "—"

  if (Array.isArray(startAt)) {
    const [y, mo, d, h = 0, mi = 0] = startAt
    const pad = (n) => String(n).padStart(2, "0")
    return `${pad(d)}.${pad(mo)}.${y} ${pad(h)}:${pad(mi)}`
  }

  const s0 = String(startAt).trim()
  if (!s0) return "—"

  const normalized = s0.replace(" ", "T").replace(/\.\d+/, "")
  const [datePart, timePartFull] = normalized.split("T")
  if (!datePart || !timePartFull) return s0

  const timePart = timePartFull.slice(0, 5)
  const [y, m, d] = datePart.split("-")
  if (!y || !m || !d) return s0

  return `${d}.${m}.${y} ${timePart}`
}

async function cancelBooking(b) {
  if (!b?.id) return

  const ok = confirm(
    `Termin mit ${b.studentName || "Student"} am ${formatStartAtRaw(
      b.startAt
    )} wirklich stornieren?`
  )
  if (!ok) return

  error.value = null
  cancelLoadingId.value = b.id

  try {
    const token = await getAccessTokenSilently()
    const res = await fetch(`${API_BASE}/api/my/tutor-bookings/${b.id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    })

    const txt = await res.text().catch(() => "")

    if (!res.ok) {
      throw new Error(`Stornieren fehlgeschlagen (${res.status}): ${txt}`)
    }

    // Response ist Map JSON { message, studentOauthId }
    let payload = {}
    try {
      payload = txt ? JSON.parse(txt) : {}
    } catch {
      payload = {}
    }

    // UI-Liste updaten
    bookings.value = bookings.value.filter((x) => x.id !== b.id)

    // ✅ Chat öffnen: Messages.vue akzeptiert query "user" (oder "userSub")
    const studentOauthId = payload?.studentOauthId || b?.studentOauthId

    if (studentOauthId) {
      await router.push({ path: "/messages", query: { user: studentOauthId } })
    } else {
      // Fallback: Chat-Seite ohne Auswahl öffnen
      await router.push({ path: "/messages" })
    }
  } catch (e) {
    error.value = e?.message ?? String(e)
  } finally {
    cancelLoadingId.value = null
  }
}

function openStudentChat(b) {
  const studentOauthId = b?.studentOauthId
  if (!studentOauthId) {
    alert("Kein studentOauthId vorhanden – Booking Response enthält es nicht.")
    return
  }

  router.push({ path: "/messages", query: { user: studentOauthId } })
}
</script>

<template>
  <div class="container py-4">
    <h1>Meine gebuchten Stunden </h1>

    <p v-if="loading">Lade Buchungen…</p>
    <p v-else-if="error" class="text-danger">{{ error }}</p>

    <div v-else>
      <p v-if="!bookings.length">Noch keine Buchungen.</p>

      <div v-for="b in bookings" :key="b.id" class="border rounded p-3 mb-2">
        <div class="d-flex justify-content-between align-items-start gap-2">
          <div>
            <strong>{{ b.studentName || "Student" }}</strong>
            <div class="text-muted">
              Termin: {{ formatStartAtRaw(b.startAt) }} • {{ b.durationMinutes }} Min
            </div>
            <div>mit {{ b.studentName }}</div>
            <div>Preis: {{ Number(b.price ?? 0).toFixed(2) }} €</div>
            <div v-if="b.note" class="text-muted">Notiz: {{ b.note }}</div>
          </div>

          <div class="d-flex flex-column gap-2">
            <button class="btn btn-outline-primary btn-sm" @click="openStudentChat(b)">
              Nachricht
            </button>

            <button
              class="btn btn-outline-danger btn-sm"
              @click="cancelBooking(b)"
              :disabled="cancelLoadingId === b.id"
            >
              {{ cancelLoadingId === b.id ? "…" : "Stornieren" }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>