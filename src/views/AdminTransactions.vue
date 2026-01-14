<script setup>
import { ref, onMounted } from "vue"
import { useAuth0 } from "@auth0/auth0-vue"

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8081"
const { getAccessTokenSilently } = useAuth0()

const loading = ref(true)
const error = ref(null)
const rows = ref([])

onMounted(() => {
  load()
})

async function load() {
  loading.value = true
  error.value = null
  try {
    const token = await getAccessTokenSilently()
    const res = await fetch(`${API_BASE}/api/admin/bookings`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!res.ok) {
      const txt = await res.text().catch(() => "")
      throw new Error(`${res.status}: ${txt}`)
    }
    rows.value = await res.json()
  } catch (e) {
    error.value = e?.message ?? String(e)
  } finally {
    loading.value = false
  }
}

/**
 * Robust für startAt/createdAt:
 * - ISO string ("2026-01-15T14:00" / "...:00" / mit ".SSS")
 * - "YYYY-MM-DD HH:mm"
 * - Array (Jackson): [2026,1,15,14,0,(sec?)]
 */
function formatDateTime(dt) {
  if (!dt) return "—"

  // ✅ Falls Backend LocalDateTime als Array liefert
  if (Array.isArray(dt)) {
    const [y, mo, d, h = 0, mi = 0] = dt
    const pad = (n) => String(n).padStart(2, "0")
    return `${pad(d)}.${pad(mo)}.${y} ${pad(h)}:${pad(mi)}`
  }

  const s0 = String(dt).trim()
  if (!s0) return "—"

  // "2026-01-15 14:00" -> "2026-01-15T14:00"
  let normalized = s0.replace(" ", "T")

  // Millisekunden abschneiden (z.B. ".123")
  normalized = normalized.replace(/(\.\d+)?$/, "")

  const [datePart, timePartFull] = normalized.split("T")
  if (!datePart || !timePartFull) return s0

  const timePart = timePartFull.slice(0, 5) // "HH:mm"
  const [y, m, d] = datePart.split("-")
  if (!y || !m || !d) return s0

  return `${d}.${m}.${y} ${timePart}`
}
</script>

<template>
  <div class="container py-4">
    <h1>Alle Transaktionen / Buchungen (Admin)</h1>

    <p v-if="loading">Lade…</p>
    <p v-else-if="error" class="text-danger">{{ error }}</p>

    <div v-else>
      <p v-if="!rows.length">Keine Daten.</p>

      <div v-for="b in rows" :key="b.id" class="border rounded p-3 mb-2">
        <div><strong>Tutor:</strong> {{ b.tutorName }} (ID {{ b.tutorId }})</div>
        <div><strong>Student:</strong> {{ b.studentName }} ({{ b.studentOauthId }})</div>
        <div>
          <strong>Termin:</strong> {{ formatDateTime(b.startAt) }} • {{ b.durationMinutes }} Min
        </div>
        <div><strong>Preis:</strong> {{ Number(b.price ?? 0).toFixed(2) }} €</div>
        <div v-if="b.note"><strong>Notiz:</strong> {{ b.note }}</div>
        <div class="text-muted small">Erstellt: {{ formatDateTime(b.createdAt) }}</div>
      </div>
    </div>
  </div>
</template>