<script setup>
import { ref, onMounted } from "vue"
import { useRouter } from "vue-router"
import { useAuth0 } from "@auth0/auth0-vue"

const router = useRouter()
const { isAuthenticated, isLoading, getAccessTokenSilently, loginWithRedirect } = useAuth0()

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8081"
const PROFILE_URL = `${API_BASE}/api/profile`
const OFFERS_URL = `${API_BASE}/api/offers` // <-- ggf. anpassen

const role = ref(null)
const roleError = ref(null)

const loading = ref(false)
const error = ref(null)
const ok = ref(false)

// Angebot-Form (feel free to extend)
const offer = ref({
  "title": "...",
  "subject": "...",
  "description": "...",
  "hourlyRate": 25,
  "durationMinutes": 60,
  "location": "Online"
})

// ---------- helpers ----------
function lsKey() {
  return "checkmate_offers"
}
function readLocalOffers() {
  try {
    return JSON.parse(localStorage.getItem(lsKey()) || "[]")
  } catch {
    return []
  }
}
function writeLocalOffers(items) {
  localStorage.setItem(lsKey(), JSON.stringify(items))
}

// ---------- auth / role ----------
async function ensureLoggedIn() {
  if (!isAuthenticated.value) {
    await loginWithRedirect()
    return false
  }
  return true
}

async function loadRole() {
  roleError.value = null
  role.value = null

  if (!isAuthenticated.value) return

  try {
    const token = await getAccessTokenSilently()
    const res = await fetch(PROFILE_URL, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!res.ok) throw new Error(`Profile HTTP ${res.status}`)
    const profile = await res.json()
    role.value = profile?.role ?? null
  } catch (e) {
    roleError.value = e?.message ?? String(e)
  }
}

function isTutorOrAdmin() {
  return role.value === "TUTOR" || role.value === "ADMIN"
}

// ---------- submit ----------
async function createOffer() {
  ok.value = false
  error.value = null
  loading.value = true

  try {
    const loggedIn = await ensureLoggedIn()
    if (!loggedIn) return

    // wenn ihr Tutor-Rollen wirklich nutzt:
    if (role.value && !isTutorOrAdmin()) {
      throw new Error("Nur Tutor:innen dürfen Angebote erstellen.")
    }

    // Basic validation
    if (!offer.value.title.trim()) throw new Error("Bitte Titel angeben.")
    if (!offer.value.subject.trim()) throw new Error("Bitte Fach angeben.")
    if (Number(offer.value.hourlyRate) <= 0) throw new Error("Stundensatz muss > 0 sein.")

    // ---- Versuch: Backend ----
    try {
      const token = await getAccessTokenSilently()
      const res = await fetch(OFFERS_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(offer.value),
      })

      if (res.ok) {
        ok.value = true
        router.push("/meine-angebote")
        return
      }

      // Wenn Backend nicht existiert/kein Endpoint:
      // wir fallen auf localStorage zurück
      console.warn("Backend createOffer failed:", res.status)
    } catch (backendErr) {
      console.warn("Backend createOffer error, fallback to localStorage:", backendErr)
    }

    // ---- Fallback: localStorage ----
    const items = readLocalOffers()
    const newItem = {
      id: crypto?.randomUUID?.() ?? String(Date.now()),
      ...offer.value,
      createdAt: new Date().toISOString(),
      // optional: owner marker
      owner: "me",
    }
    items.unshift(newItem)
    writeLocalOffers(items)

    ok.value = true
    router.push("/meine-angebote")
  } catch (e) {
    error.value = e?.message ?? String(e)
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  if (isAuthenticated.value) {
    await loadRole()
  }
})
</script>

<template>
  <div class="page">
    <Navbar />

    <section class="py-5 text-center">
      <div class="container">
        <h2 class="fw-bold">Angebot erstellen</h2>
        <p>Erstelle dein Tutor-Angebot für Studierende</p>
      </div>
    </section>

    <div class="container pb-5" style="max-width: 720px;">
      <div class="card shadow-sm">
        <div class="card-body">
          <p v-if="isLoading" class="text-center mb-0">Lade…</p>

          <div v-else>
            <div v-if="!isAuthenticated" class="alert alert-warning">
              Du musst eingeloggt sein, um ein Angebot zu erstellen.
              <div class="mt-2">
                <button class="btn btn-primary" @click="loginWithRedirect()">Login</button>
              </div>
            </div>

            <div v-else>
              <div v-if="roleError" class="alert alert-warning">
                Profil/Rolle konnte nicht geladen werden: {{ roleError }}
                <div class="small text-muted">
                  (Wenn ihr keine Rollen habt, ist das okay – dann ignorieren.)
                </div>
              </div>

              <div v-if="role && role !== 'TUTOR' && role !== 'ADMIN'" class="alert alert-danger">
                Dein Account ist keine Tutor-Rolle ({{ role }}). Angebote sind nur für Tutor:innen.
              </div>

              <div class="mb-3">
                <label class="form-label fw-bold">Titel</label>
                <input v-model="offer.title" class="form-control" placeholder="z.B. Mathe 1 Nachhilfe" />
              </div>

              <div class="mb-3">
                <label class="form-label fw-bold">Fach</label>
                <input v-model="offer.subject" class="form-control" placeholder="z.B. Mathe 1" />
              </div>

              <div class="mb-3">
                <label class="form-label fw-bold">Beschreibung</label>
                <textarea v-model="offer.description" class="form-control" rows="4"
                  placeholder="Kurz beschreiben, wie du unterstützt, Niveau, Inhalte, etc."></textarea>
              </div>

              <div class="row g-3">
                <div class="col-md-6">
                  <label class="form-label fw-bold">Stundensatz (€)</label>
                  <input v-model.number="offer.hourlyRate" type="number" min="1" class="form-control" />
                </div>

                <div class="col-md-6">
                  <label class="form-label fw-bold">Dauer</label>
                  <select v-model.number="offer.durationMinutes" class="form-select">
                    <option :value="30">30 Minuten</option>
                    <option :value="60">60 Minuten</option>
                    <option :value="90">90 Minuten</option>
                    <option :value="120">120 Minuten</option>
                  </select>
                </div>
              </div>

              <div class="mt-3">
                <label class="form-label fw-bold">Ort</label>
                <select v-model="offer.location" class="form-select">
                  <option>Online</option>
                  <option>Vor Ort</option>
                  <option>Hybrid</option>
                </select>
              </div>

              <p v-if="error" class="text-danger mt-3">{{ error }}</p>

              <div class="d-flex gap-2 mt-4">
                <button class="btn btn-success" :disabled="loading" @click="createOffer">
                  {{ loading ? "Speichere..." : "Angebot speichern" }}
                </button>
                <button class="btn btn-outline-secondary" :disabled="loading" @click="$router.back()">
                  Abbrechen
                </button>
              </div>

              <p v-if="ok" class="text-success mt-3">Angebot erstellt ✅</p>

              <div class="text-muted small mt-3">
                Hinweis: Wenn das Backend den Endpoint <code>/api/offers</code> noch nicht hat,
                wird automatisch localStorage als Test-Speicher genutzt.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <Footer />
  </div>
</template>

<style scoped>
.page {
  min-height: 100vh;
  background: #f3efdf;
}
</style>