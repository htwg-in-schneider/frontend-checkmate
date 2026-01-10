<script setup>
import { ref, onMounted, computed } from 'vue'
import TutorCard from '@/components/TutorCard.vue'
import TutorFilter from '@/components/TutorFilter.vue'
import { useAuth0 } from '@auth0/auth0-vue'
import { useCartStore } from "@/stores/cart"

const cart = useCartStore()
//const addedToCart = ref(false)


const isThisBookingInCart = computed(() => {
  if (!selectedTutor.value) return false
  if (!bookingForm.value.startAt) return false

  return cart.items?.some(it =>
    it.type === "booking" &&
    it.tutorId === selectedTutor.value.id &&
    it.startAt === bookingForm.value.startAt &&
    it.durationMinutes === bookingForm.value.durationMinutes
  )
})

// Basis-URL – entweder aus .env oder fallback auf localhost
const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081'

// Auth0
const { getAccessTokenSilently, isAuthenticated, isLoading, loginWithRedirect } = useAuth0()

// State
const tutors = ref([])
const categories = ref([])
const loading = ref(true)
const error = ref(null)

// Role / Profile
const backendProfile = ref(null)
const isAdmin = ref(false)

// Filter-States
const searchName = ref('')
const selectedCategory = ref('') // "" = keine Kategorie → alle anzeigen

// Admin: Create Tutor Modal
const showCreateForm = ref(false)
const newTutor = ref({
  name: "",
  subject: "",
  semester: 1,
  image: ""
})

// ============================
// Booking (Stunde buchen) Modal
// ============================
const showBookingModal = ref(false)
const selectedTutor = ref(null)

const bookingForm = ref({
  startAt: "",          // datetime-local value
  durationMinutes: 60,  // 30/60/90/120
  note: ""
})

const bookingSubmitting = ref(false)
const bookingError = ref(null)
const bookingOk = ref(false)

// Daten laden
onMounted(async () => {
  await Promise.all([fetchTutors(), fetchCategories()])

  if (isAuthenticated.value) {
    await loadBackendProfile()
  }
})


// ----------------------------
// Backend Profile (Role) laden
// ----------------------------
async function loadBackendProfile() {
  try {
    const token = await getAccessTokenSilently()

    const res = await fetch(`${API_BASE}/api/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    })

    if (!res.ok) {
      const txt = await res.text().catch(() => "")
      throw new Error(`Profile load failed: ${res.status} ${txt}`)
    }

    const profile = await res.json()
    backendProfile.value = profile
    isAdmin.value = profile?.role === 'ADMIN'

    console.log('BACKEND PROFILE:', profile)
    console.log('ROLE FROM BACKEND:', profile?.role)
    console.log('isAdmin (Parent):', isAdmin.value)
  } catch (e) {
    console.error('Could not load backend profile:', e)
    backendProfile.value = null
    isAdmin.value = false
  }
}

// ----------------------------
// Admin: Tutor erstellen
// ----------------------------
async function createTutor() {
  try {
    if (!isAdmin.value) {
      alert("Nur Admins dürfen Tutor:innen erstellen.")
      return
    }

    const token = await getAccessTokenSilently()

    const response = await fetch(`${API_BASE}/api/tutors`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(newTutor.value),
    })

    if (!response.ok) {
      const txt = await response.text().catch(() => "")
      throw new Error(`Error creating tutor: ${response.status} ${txt}`)
    }

    await fetchTutors()
    showCreateForm.value = false
    newTutor.value = { name: "", subject: "", semester: 1, image: "" }
  } catch (e) {
    console.error(e)
    alert("Tutor konnte nicht erstellt werden.")
  }
}

// ----------------------------
// Tutor:innen laden
// ----------------------------
async function fetchTutors() {
  loading.value = true
  error.value = null
  try {
    const res = await fetch(`${API_BASE}/api/tutors`)
    if (!res.ok) throw new Error(`HTTP-Fehler: ${res.status}`)
    tutors.value = await res.json()
  } catch (err) {
    console.error('Fehler beim Laden der Tutor:innen:', err)
    error.value = 'Fehler beim Laden der Tutor:innen.'
  } finally {
    loading.value = false
  }
}

// ----------------------------
// Kategorien laden
// ----------------------------
async function fetchCategories() {
  try {
    const res = await fetch(`${API_BASE}/api/category`)
    if (!res.ok) throw new Error(`HTTP-Fehler Kategorien: ${res.status}`)
    categories.value = await res.json()
  } catch (err) {
    console.error('Fehler beim Laden der Kategorien:', err)
  }
}

// ----------------------------
// Filtered Tutors
// ----------------------------
const filteredTutors = computed(() => {
  if (!searchName.value && !selectedCategory.value) return tutors.value

  return tutors.value.filter((tutor) => {
    const nameMatches =
      !searchName.value ||
      (tutor.name || '').toLowerCase().includes(searchName.value.toLowerCase())

    const categoryMatches =
      !selectedCategory.value || tutor.category === selectedCategory.value

    return nameMatches && categoryMatches
  })
})

function addBookingToCart() {
  bookingError.value = null
  bookingOk.value = false

  try {
    if (!selectedTutor.value) throw new Error("Kein Tutor ausgewählt.")
    if (!bookingForm.value.startAt) throw new Error("Bitte Termin auswählen.")

    const rate = Number(selectedTutor.value.hourlyRate ?? 0)
    const minutes = Number(bookingForm.value.durationMinutes ?? 0)
    const priceTotal = rate && minutes ? Number((rate * (minutes / 60)).toFixed(2)) : 0

    cart.addBooking({
      type: "booking",
      id: `${selectedTutor.value.id}-${bookingForm.value.startAt}-${minutes}`, // eindeutige ID
      tutorId: selectedTutor.value.id,
      tutorName: selectedTutor.value.name,
      subject: selectedTutor.value.subject,
      startAt: bookingForm.value.startAt,
      durationMinutes: minutes,
      hourlyRate: rate,
      priceTotal,
      note: bookingForm.value.note,
      qty: 1,
      title: `Stunde bei ${selectedTutor.value.name}`,
    })

    bookingOk.value = true
    // addedToCart.value = true  // nicht mehr nötig, weil computed es erkennt
  } catch (e) {
    bookingError.value = e?.message ?? String(e)
  }
}

// Child Filter Event
function handleTutorUpdate({ name, subject }) {
  searchName.value = name
  selectedCategory.value = subject
}

function handleTutorDeleted(id) {
  tutors.value = tutors.value.filter(t => t.id !== id)
}

// =============================
// Booking: Modal öffnen/schließen
// =============================
function openBookingModal(tutor) {
  selectedTutor.value = tutor
  bookingOk.value = false
  bookingError.value = null
  //addedToCart.value = false

  bookingForm.value = {
    startAt: "",
    durationMinutes: 60,
    note: ""
  }

  showBookingModal.value = true
}

function closeBookingModal() {
  showBookingModal.value = false
  selectedTutor.value = null
}

// Preis berechnen: hourlyRate * duration
function calcBookingPrice() {
  const t = selectedTutor.value
  const rate = Number(t?.hourlyRate ?? 0)
  const minutes = Number(bookingForm.value.durationMinutes ?? 0)

  if (!rate || !minutes) return "0.00"
  return (rate * (minutes / 60)).toFixed(2)
}

// =============================
// Booking: POST ans Backend
// =============================
async function submitBooking() {
  bookingError.value = null
  bookingOk.value = false
  bookingSubmitting.value = true

  try {
    // Nur eingeloggte dürfen buchen
    if (!isAuthenticated.value) {
      await loginWithRedirect({ appState: { target: "/app" } })
      return
    }

    if (!selectedTutor.value) throw new Error("Kein Tutor ausgewählt.")
    if (!bookingForm.value.startAt) throw new Error("Bitte Termin auswählen.")

    const token = await getAccessTokenSilently()

    const payload = {
      tutorId: selectedTutor.value.id,
      startAt: bookingForm.value.startAt,
      durationMinutes: bookingForm.value.durationMinutes,
      price: calcBookingPrice(),
      note: bookingForm.value.note,
    }

    const res = await fetch(`${API_BASE}/api/bookings`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    })

    if (!res.ok) {
      const txt = await res.text().catch(() => "")
      throw new Error(`Backend ${res.status}: ${txt}`)
    }

    bookingOk.value = true
  } catch (e) {
    bookingError.value = e?.message ?? String(e)
  } finally {
    bookingSubmitting.value = false
  }
}
</script>

<template>
  <div class="tutor-page">
    <div class="container py-4 tutorlist">

      <div class="tutor-header-container">
        <div class="filter-top-right">
          <div class="filter-clean">
            <TutorFilter
              :subjects="categories"
              @tutorUpdate="handleTutorUpdate"
            />
          </div>
        </div>

        <h1 class="tutor-title">Unsere Tutor:innen</h1>
      </div>

      <!-- ✅ Create-Button nur für Admin -->
      <div class="text-end mb-3" v-if="!isLoading && isAuthenticated && isAdmin">
        <button class="btn btn-success" @click="showCreateForm = true">
          + Tutor erstellen
        </button>
      </div>

      <p class="text-end text-light" v-else-if="!isLoading && isAuthenticated && !isAdmin">
        (Nur Admins können Tutor:innen erstellen.)
      </p>

      <p v-if="loading" class="text-center">Lade Tutor:innen…</p>
      <p v-else-if="error" class="text-center text-danger">{{ error }}</p>

      <div v-else class="row g-4">
        <div v-for="tutor in filteredTutors" :key="tutor.id" class="col-md-4">
          <TutorCard
            :tutor="tutor"
            :is-admin="isAdmin"
            @deleted="handleTutorDeleted"
            @book="openBookingModal"
          />
        </div>

        <p v-if="!filteredTutors.length && !loading" class="text-center mt-4">
          Keine Tutor:innen gefunden. Passe Suche oder Kategorie an.
        </p>
      </div>

      <div class="text-center mt-5">
        <button class="btn btn-outline-secondary" @click="$router.push('/')">
          Zurück zur Startseite
        </button>
      </div>
    </div>
  </div>

  <!-- ✅ Admin: Create Tutor Modal -->
  <div v-if="showCreateForm && !isLoading && isAuthenticated && isAdmin" class="modal-backdrop">
    <div class="modal-content">
      <h3>Neuen Tutor erstellen</h3>

      <input v-model="newTutor.name" class="form-control mb-2" placeholder="Name" />
      <input v-model="newTutor.subject" class="form-control mb-2" placeholder="Fach" />
      <input v-model="newTutor.semester" type="number" class="form-control mb-2" placeholder="Semester" />
      <input v-model="newTutor.image" class="form-control mb-2" placeholder="Bild-URL" />

      <div class="d-flex gap-2 mt-3">
        <button class="btn btn-success" @click="createTutor">Erstellen</button>
        <button class="btn btn-secondary" @click="showCreateForm = false">Abbrechen</button>
      </div>
    </div>
  </div>
<!-- ✅ Booking Modal -->
<div v-if="showBookingModal" class="modal-backdrop">
  <div class="modal-content">
    <h3>Stunde buchen</h3>

    <p v-if="selectedTutor">
      Tutor: <strong>{{ selectedTutor.name }}</strong><br />
      Preis: <strong>{{ selectedTutor.hourlyRate ?? '—' }} € / Stunde</strong>
    </p>

    <label class="form-label">Termin-Vorschlag</label>
    <input v-model="bookingForm.startAt" type="datetime-local" class="form-control mb-2" />

    <label class="form-label">Dauer</label>
    <select v-model.number="bookingForm.durationMinutes" class="form-control mb-2">
      <option :value="30">30 Minuten</option>
      <option :value="60">60 Minuten</option>
      <option :value="90">90 Minuten</option>
      <option :value="120">120 Minuten</option>
    </select>

    <label class="form-label">Notiz (optional)</label>
    <textarea v-model="bookingForm.note" class="form-control mb-2" rows="2"></textarea>

    <div class="mt-2">
      Gesamtpreis: <strong>{{ calcBookingPrice() }} €</strong>
    </div>

    <div class="d-flex gap-2 mt-3">
      <!-- ✅ v-if und v-else müssen direkt nebeneinander stehen -->
     <button
  v-if="!isThisBookingInCart"
  class="btn btn-success"
  @click="addBookingToCart"
>
  In den Warenkorb
</button>

<button
  v-else
  class="btn btn-outline-primary"
  @click="$router.push('/checkout')"
>
  Im Warenkorb ansehen
</button>

      <button class="btn btn-secondary" @click="closeBookingModal">
        Schließen
      </button>
    </div>

    <p v-if="bookingOk" class="text-success mt-2">
      Erfolgreich zum Warenkorb hinzugefügt!
    </p>
    <p v-if="bookingError" class="text-danger mt-2">{{ bookingError }}</p>
  </div>
</div>
</template>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.4);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.modal-content {
  background: white;
  padding: 20px;
  border-radius: 12px;
  width: 420px;
  max-width: 92vw;
  box-shadow: 0 4px 20px rgba(0,0,0,0.2);
}

.tutor-page {
  min-height: 100vh;
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.6), rgba(255, 255, 255, 0.75)),
    url('@/assets/img/background.avif');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  padding-top: 4rem;
  padding-bottom: 4rem;
}

.tutor-header-container {
  position: relative;
  margin-bottom: 2rem;
}

.tutor-title {
  font-family: sans-serif;
  font-size: 80px;
  font-weight: 600;
  color: white !important;
  letter-spacing: 0.8px;
  text-align: left;
  text-shadow: 0 0 12px #607953;
}

.filter-top-right {
  position: absolute;
  top: 0;
  right: 0;
}

.filter-clean ::v-deep .tutor-filter-box {
  border: none !important;
  background: transparent !important;
  padding: 0 !important;
  margin: 0 !important;
}

@media (max-width: 576px) {
  .tutor-page { padding-top: 2rem; }
  .filter-top-right {
    position: static;
    margin-bottom: 1rem;
    display: flex;
    justify-content: flex-start;
  }
  .tutor-title { margin-top: 0; }
}
</style>