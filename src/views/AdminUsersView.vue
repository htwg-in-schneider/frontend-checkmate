<script setup>
import { ref, onMounted, computed } from "vue"
import { useAuth0 } from "@auth0/auth0-vue"
import { useRouter } from "vue-router"

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8081"
const { getAccessTokenSilently, isAuthenticated, loginWithRedirect, isLoading } = useAuth0()
const router = useRouter()

const loading = ref(true)
const error = ref(null)
const rows = ref([])

const search = ref("")
const roleFilter = ref("ALL") // ALL | STUDENT | TUTOR | ADMIN

onMounted(() => {
  load()
})

async function load() {
  loading.value = true
  error.value = null

  try {
    if (!isAuthenticated.value) {
      await loginWithRedirect({ appState: { target: "/admin/users" } })
      return
    }

    const token = await getAccessTokenSilently()

    const res = await fetch(`${API_BASE}/api/admin/users`, {
      headers: { Authorization: `Bearer ${token}` },
    })

    if (!res.ok) {
      const txt = await res.text().catch(() => "")
      if (res.status === 401) {
        error.value = "Nicht eingeloggt / Session abgelaufen. Bitte neu einloggen."
        await loginWithRedirect({ appState: { target: "/admin/users" } })
        return
      }
      if (res.status === 403) {
        error.value = "Zugriff verweigert (403). Du bist vermutlich kein Admin."
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

function normRole(r) {
  const s = String(r ?? "").toUpperCase()
  // Falls Backend "ROLE_ADMIN" liefert:
  if (s.startsWith("ROLE_")) return s.replace("ROLE_", "")
  return s
}

function formatDateTime(dt) {
  if (!dt) return "—"
  if (Array.isArray(dt)) {
    const [y, mo, d, h = 0, mi = 0] = dt
    const pad = (n) => String(n).padStart(2, "0")
    return `${y}-${pad(mo)}-${pad(d)} ${pad(h)}:${pad(mi)}`
  }
  let s = String(dt).trim()
  if (!s) return "—"
  s = s.replace(/\.\d+/, "") // ms weg
  s = s.replace("T", " ")
  // Sekunden optional entfernen (wenn du nur bis Minute willst):
  // "2026-01-16 10:56:02" -> "2026-01-16 10:56"
  s = s.replace(/:\d{2}$/, "")
  return s
}

const filteredRows = computed(() => {
  const q = search.value.trim().toLowerCase()
  const rf = roleFilter.value

  const includes = (v) => String(v ?? "").toLowerCase().includes(q)

  return rows.value
    .filter((u) => {
      const r = normRole(u.role)
      if (rf === "ALL") return true
      return r === rf
    })
    .filter((u) => {
      if (!q) return true
      return (
        includes(u.id) ||
        includes(u.name) ||
        includes(u.email) ||
        includes(u.oauthId) ||
        includes(normRole(u.role)) ||
        includes(formatDateTime(u.createdAt))
      )
    })
})

const countsByRole = computed(() => {
  const c = { ALL: rows.value.length, STUDENT: 0, TUTOR: 0, ADMIN: 0 }
  for (const u of rows.value) {
    const r = normRole(u.role)
    if (r === "STUDENT") c.STUDENT++
    if (r === "TUTOR") c.TUTOR++
    if (r === "ADMIN") c.ADMIN++
  }
  return c
})

function goBack() {
  router.back()
}
</script>

<template>
  <div class="container py-4">
    <h1>Userübersicht (Admin)</h1>

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
      <!-- Toolbar -->
      <div class="d-flex flex-wrap gap-2 align-items-center mb-3">
        <input
          v-model="search"
          type="search"
          class="form-control"
          style="max-width: 420px"
          placeholder="Suchen (Name, Email, oauthId, Rolle …)"
        />

        <select v-model="roleFilter" class="form-select" style="max-width: 220px">
          <option value="ALL">Alle ({{ countsByRole.ALL }})</option>
          <option value="STUDENT">Student ({{ countsByRole.STUDENT }})</option>
          <option value="TUTOR">Tutor ({{ countsByRole.TUTOR }})</option>
          <option value="ADMIN">Admin ({{ countsByRole.ADMIN }})</option>
        </select>

        <button class="btn btn-outline-secondary" @click="search = ''" v-if="search">Suche löschen</button>
        <button class="btn btn-outline-primary" @click="load">Reload</button>

        <div class="text-muted small ms-auto">
          {{ filteredRows.length }} / {{ rows.length }}
        </div>
      </div>

      <p v-if="!rows.length" class="text-muted">Keine User vorhanden.</p>
      <p v-else-if="!filteredRows.length" class="text-muted">Keine Treffer.</p>

      <!-- List -->
      <div v-for="u in filteredRows" :key="u.id ?? u.oauthId" class="border rounded p-3 mb-2">
        <div class="d-flex flex-wrap justify-content-between gap-2">
          <div>
            <div class="fw-semibold">{{ u.name ?? "—" }}</div>
            <div class="text-muted small">{{ u.email ?? "—" }}</div>
          </div>

          <span class="badge text-bg-secondary align-self-start">
            {{ normRole(u.role) || "—" }}
          </span>
        </div>

        <div class="mt-2 small">
          <div><strong>oauthId:</strong> <span class="text-break">{{ u.oauthId ?? "—" }}</span></div>
        </div>
      </div>
    </div>
  </div>
</template>