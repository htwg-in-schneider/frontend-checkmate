<script setup>
import { ref, onMounted } from "vue"
import { useAuth0 } from "@auth0/auth0-vue"
import { useRouter } from "vue-router"

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8081"
const { getAccessTokenSilently, isAuthenticated, loginWithRedirect, isLoading } = useAuth0()
const router = useRouter()

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
    // 1) Auth sicherstellen
    if (!isAuthenticated.value) {
      await loginWithRedirect({ appState: { target: "/admin/transactions" } }) // Route anpassen
      return
    }

    // 2) Token holen (mit audience/scope falls nötig)
    const token = await getAccessTokenSilently()

    // 3) Admin-Endpoint call
    const res = await fetch(`${API_BASE}/api/admin/bookings`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    // 4) Fehlerbehandlung (403/401/sonst)
    if (!res.ok) {
      const txt = await res.text().catch(() => "")

      if (res.status === 401) {
        error.value = "Du bist nicht eingeloggt oder deine Session ist abgelaufen. Bitte neu einloggen."
        // Optional: direkt relogin
        await loginWithRedirect({ appState: { target: "/admin/transactions" } })
        return
      }

      if (res.status === 403) {
        error.value =
          "Zugriff verweigert (403). Du bist vermutlich kein Admin (ROLE_ADMIN fehlt). " +
          "Melde dich mit einem Admin-Account an."
        return
      }

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

  // Array von Jackson
  if (Array.isArray(dt)) {
    const [y, mo, d, h = 0, mi = 0, s = 0] = dt
    const pad = (n) => String(n).padStart(2, "0")
    return `${y}-${pad(mo)}-${pad(d)} ${pad(h)}:${pad(mi)}:${pad(s)}`
  }

  const s0 = String(dt).trim()
  if (!s0) return "—"

  let normalized = s0.replace("T", " ")

  // Millisekunden abschneiden
  normalized = normalized.replace(/(\.\d+)?$/, "")

  // wenn nur bis Minuten -> :00 ergänzen (ISO)
  if (/T\d{2}:\d{2}$/.test(normalized)) normalized += ":00"

  // Anzeige als ISO (du wolltest ISO)
  return normalized
}

function goBack() {
  router.back()
}
</script>

<template>
  <div class="container py-4">
    <h1>Alle Transaktionen / Buchungen (Admin)</h1>

    <p v-if="isLoading">Auth lädt…</p>

    <p v-else-if="loading">Lade…</p>

    <div v-else-if="error" class="alert alert-danger">
      <div class="fw-semibold">Fehler</div>
      <div class="mt-1">{{ error }}</div>

      <div class="d-flex gap-2 mt-3">
        <button class="btn btn-outline-secondary" @click="goBack">Zurück</button>
        <button class="btn btn-outline-primary" @click="load">Nochmal versuchen</button>
      </div>
    </div>

    <div v-else>
      <p v-if="!rows.length" class="text-muted">Keine Daten.</p>

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