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

// optional: damit du nur den Button der gerade storniert blockierst
const cancelLoadingId = ref(null)

onMounted(() => {
  load()
})

async function load() {
  loading.value = true
  error.value = null

  try {
    if (!isAuthenticated.value) {
      await loginWithRedirect({ appState: { target: "/unterricht" } })
      return
    }

    const token = await getAccessTokenSilently()
    const res = await fetch(`${API_BASE}/api/my/bookings`, {
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

async function cancelBooking(b) {
  if (!b?.id) return

  const ok = confirm(
    `Buchung bei ${b.tutorName} am ${formatStartAtRaw(b.startAt)} wirklich stornieren?`
  )
  if (!ok) return

  error.value = null
  cancelLoadingId.value = b.id

  try {
    const token = await getAccessTokenSilently()
    const res = await fetch(`${API_BASE}/api/my/bookings/${b.id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    })

    if (!res.ok) {
      const txt = await res.text().catch(() => "")
      throw new Error(`Stornieren fehlgeschlagen (${res.status}): ${txt}`)
    }

    bookings.value = bookings.value.filter((x) => x.id !== b.id)


   await router.push({ path: "/messages", query: { tutorId: b.tutorId } })
  } catch (e) {
    error.value = e?.message ?? String(e)
  } finally {
    cancelLoadingId.value = null
  }
}

/**
 * Robust: unterstützt startAt als
 * - ISO-String: "2026-01-15T14:00" / "2026-01-15T14:00:00"
 * - String mit Space: "2026-01-15 14:00"
 * - Array (Jackson timestamps): [2026,1,15,14,0,(sec?)]
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

  // normalisieren
  let normalized = s0.replace(" ", "T")
  // ms weg
  normalized = normalized.replace(/\.\d+/, "")

  const [datePart, timePartFull] = normalized.split("T")
  if (!datePart || !timePartFull) return s0

  const timePart = timePartFull.slice(0, 5) // HH:mm
  const [y, m, d] = datePart.split("-")
  if (!y || !m || !d) return s0

  return `${d}.${m}.${y} ${timePart}`
}
</script>

<template>
  <div class="container py-4">
    <h1>Meine Unterrichtsstunden</h1>

    <p v-if="loading">Lade Buchungen…</p>
    <p v-else-if="error" class="text-danger">{{ error }}</p>

    <div v-else>
      <p v-if="!bookings.length">Du hast noch keine Buchungen.</p>

      <div v-for="b in bookings" :key="b.id" class="border rounded p-3 mb-2">
        <div class="d-flex justify-content-between align-items-start gap-2">
          <div>
            <strong>{{ b.tutorName }}</strong>
            <div class="text-muted">
              Termin: {{ formatStartAtRaw(b.startAt) }} • {{ b.durationMinutes }} Min
            </div>
            <div>Preis: {{ Number(b.price ?? 0).toFixed(2) }} €</div>
            <div v-if="b.note" class="text-muted">Notiz: {{ b.note }}</div>
          </div>

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
</template>