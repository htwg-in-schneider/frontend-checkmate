<script setup>
import { ref, onMounted } from "vue"
import { useRouter } from "vue-router"
import { useAuth0 } from "@auth0/auth0-vue"

const router = useRouter()
const { isAuthenticated, isLoading, getAccessTokenSilently, loginWithRedirect } = useAuth0()

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8081"
const PROFILE_URL = `${API_BASE}/api/profile`
const OFFERS_URL = `${API_BASE}/api/offers`
const CATEGORY_URL = `${API_BASE}/api/category`

const role = ref(null)
const roleError = ref(null)

const loading = ref(false)
const error = ref(null)
const ok = ref(false)

// Kategorien
const categories = ref([])
const categoriesLoading = ref(true)
const categoriesError = ref(null)

// Angebot-Form
const offer = ref({
  subject: "",
  hourlyRate: 25,
  semester: 1,
})

// Availability
const AVAILABILITY_URL = (tutorId) => `${API_BASE}/api/tutors/${tutorId}/availability-rules`

const weekdays = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"]

const availabilityRules = ref([
  { dayOfWeek: "MONDAY", startTime: "09:00", endTime: "12:00" },
])

const availabilityError = ref(null)

function prettyDow(d) {
  const map = {
    MONDAY: "Montag",
    TUESDAY: "Dienstag",
    WEDNESDAY: "Mittwoch",
    THURSDAY: "Donnerstag",
    FRIDAY: "Freitag",
    SATURDAY: "Samstag",
    SUNDAY: "Sonntag",
  }
  return map[d] || d
}

function addRule() {
  availabilityRules.value.push({
    dayOfWeek: "MONDAY",
    startTime: "09:00",
    endTime: "12:00",
  })
}

function validateAvailability() {
  if (!availabilityRules.value.length) {
    throw new Error("Bitte mindestens eine Verfügbarkeit angeben.")
  }
  for (const r of availabilityRules.value) {
    if (!r.dayOfWeek || !r.startTime || !r.endTime) {
      throw new Error("Verfügbarkeit: Wochentag/Start/Ende fehlen.")
    }
    if (r.endTime <= r.startTime) {
      throw new Error("Verfügbarkeit: Endzeit muss nach Startzeit liegen.")
    }
  
  }
}

async function saveAvailabilityRules(tutorId) {
  availabilityError.value = null

  const token = await getAccessTokenSilently()
  const res = await fetch(AVAILABILITY_URL(tutorId), {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(availabilityRules.value),
  })

  if (!res.ok) {
    const txt = await res.text().catch(() => "")
    throw new Error(`Verfügbarkeit konnte nicht gespeichert werden (${res.status}): ${txt}`)
  }
}

function prettyCategory(c) {
  return String(c)
    .replaceAll("_", " ")
    .replace(/(\D)(\d)/g, "$1 $2")
    .toLowerCase()
    .replace(/(^|\s)\S/g, (m) => m.toUpperCase())
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

// Kategorien laden
async function fetchCategories() {
  categoriesLoading.value = true
  categoriesError.value = null

  try {
    const res = await fetch(CATEGORY_URL)
    if (!res.ok) throw new Error(`HTTP-Fehler Kategorien: ${res.status}`)
    const data = await res.json()

    categories.value = Array.isArray(data) ? data : []

    if (!offer.value.subject && categories.value.length) {
      offer.value.subject = categories.value[0]
    }
  } catch (e) {
    categoriesError.value = e?.message ?? String(e)
    categories.value = []
  } finally {
    categoriesLoading.value = false
  }
}

// ---------- submit ----------
async function createOffer() {
  ok.value = false
  error.value = null
  availabilityError.value = null
  loading.value = true

  try {
    const loggedIn = await ensureLoggedIn()
    if (!loggedIn) return

    // optional: wenn role geladen ist, prüfen
    if (role.value && !isTutorOrAdmin()) {
      throw new Error("Nur Tutor:innen dürfen Angebote erstellen.")
    }

    // Basic validation Offer
    if (!String(offer.value.subject || "").trim()) throw new Error("Bitte Fach auswählen.")
    if (Number(offer.value.hourlyRate) <= 0) throw new Error("Stundensatz muss > 0 sein.")

    // Basic validation Availability
    validateAvailability()

    const token = await getAccessTokenSilently()
    const res = await fetch(OFFERS_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(offer.value),
    })

    if (!res.ok) {
      const txt = await res.text().catch(() => "")
      throw new Error(`Angebot konnte nicht gespeichert werden (${res.status}): ${txt}`)
    }

    const createdOffer = await res.json()
    const tutorId = createdOffer?.tutorId
    if (!tutorId) throw new Error("Offer erstellt, aber tutorId fehlt in der Response.")

    await saveAvailabilityRules(tutorId)

    ok.value = true
    router.push("/meine-angebote")
  } catch (e) {
    const msg = e?.message ?? String(e)
    // Wenn du Availability-Fehler getrennt anzeigen willst:
    if (msg.toLowerCase().includes("verfügbarkeit")) availabilityError.value = msg
    else error.value = msg
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await fetchCategories()
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

    <div class="container pb-5" style="max-width: 720px">
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
                <label class="form-label fw-bold">Fach</label>

                <p v-if="categoriesLoading" class="text-muted small mb-2">Lade Fächer…</p>
                <p v-else-if="categoriesError" class="text-danger small mb-2">
                  Fächer konnten nicht geladen werden: {{ categoriesError }}
                </p>

                <select
                  v-model="offer.subject"
                  class="form-select"
                  :disabled="categoriesLoading || !categories.length"
                >
                  <option value="" disabled>Bitte auswählen…</option>
                  <option v-for="c in categories" :key="c" :value="c">
                    {{ prettyCategory(c) }}
                  </option>
                </select>

              </div>

              <div class="mb-3">
                <label class="form-label fw-bold">Semester</label>
                <select v-model.number="offer.semester" class="form-select">
                  <option v-for="n in 10" :key="n" :value="n">{{ n }}. Semester</option>
                </select>
              </div>

              <div class="row g-3">
                <div class="col-md-6">
                  <label class="form-label fw-bold">Stundensatz (€)</label>
                  <input v-model.number="offer.hourlyRate" type="number" min="1" class="form-control" />
                </div>
              </div>

              <hr class="my-4" />

              <h5 class="fw-bold">Verfügbarkeit</h5>
              <p class="text-muted small">
                Wähle Wochentag und Zeitraum. Daraus werden später buchbare Zeitslots erzeugt.
              </p>

              <p v-if="availabilityError" class="text-danger">{{ availabilityError }}</p>

              <div class="vstack gap-2">
                <div
                  v-for="(r, idx) in availabilityRules"
                  :key="idx"
                  class="border rounded p-2 bg-light"
                >
                  <div class="row g-2 align-items-end">
                    <div class="col-md-4">
                      <label class="form-label mb-1">Wochentag</label>
                      <select v-model="r.dayOfWeek" class="form-select">
                        <option v-for="d in weekdays" :key="d" :value="d">
                          {{ prettyDow(d) }}
                        </option>
                      </select>
                    </div>

                    <div class="col-md-3">
                      <label class="form-label mb-1">Von</label>
                      <input v-model="r.startTime" type="time" class="form-control" />
                    </div>

                    <div class="col-md-3">
                      <label class="form-label mb-1">Bis</label>
                      <input v-model="r.endTime" type="time" class="form-control" />
                    </div>

                   

                    <div class="col-12 text-end">
                      <button
                        class="btn btn-sm btn-outline-danger"
                        type="button"
                        @click="availabilityRules.splice(idx, 1)"
                        :disabled="availabilityRules.length === 1"
                      >
                        Entfernen
                      </button>
                    </div>
                  </div>
                </div>

                <button class="btn btn-outline-primary" type="button" @click="addRule">
                  + Zeitraum hinzufügen
                </button>
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