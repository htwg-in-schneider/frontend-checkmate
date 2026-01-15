<script setup>
import { ref, onMounted, computed, watch } from "vue"
import TutorCard from "@/components/TutorCard.vue"
import TutorFilter from "@/components/TutorFilter.vue"
import { useAuth0 } from "@auth0/auth0-vue"
import { useCartStore } from "@/stores/cart"
import { useRouter } from "vue-router"

const router = useRouter()
const cart = useCartStore()

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8081"
const { getAccessTokenSilently, isAuthenticated, isLoading } = useAuth0()

const tutors = ref([])
const categories = ref([])
const loading = ref(true)
const error = ref(null)

const backendProfile = ref(null)
const isAdmin = ref(false)

// Filter-States (kommen aus TutorFilter)
const searchName = ref("")
const selectedCategory = ref("")

const showCreateForm = ref(false)
const newTutor = ref({
  name: "",
  subject: "",
  semester: 1,
  image: "",
})

// ============================
// Booking Modal (Datum + Zeit)
// ============================
const showBookingModal = ref(false)
const selectedTutor = ref(null)

const availableDates = ref([])
const selectedDate = ref("")

const availableTimes = ref([])
const selectedTime = ref("")

const bookingForm = ref({
  durationMinutes: 60,
  note: "",
})

const bookingError = ref(null)
const bookingOk = ref(false)

const computedStartAt = computed(() => {
  if (!selectedDate.value || !selectedTime.value) return ""
  return `${selectedDate.value}T${selectedTime.value}`
})

const hasAnyBookingInCart = computed(() => {
  if (!selectedTutor.value) return false
  return (cart.items || []).some(
    (it) => it.type === "booking" && it.tutorId === selectedTutor.value.id
  )
})

const isThisBookingInCart = computed(() => {
  if (!selectedTutor.value) return false
  if (!computedStartAt.value) return false

  const key = `booking-${selectedTutor.value.id}-${computedStartAt.value}`

  return (cart.items || []).some((it) => {
    if (it.key && it.key === key) return true
    return (
      it.type === "booking" &&
      it.tutorId === selectedTutor.value.id &&
      it.startAt === computedStartAt.value
    )
  })
})

function toMinutes(hhmm) {
  const [h, m] = (hhmm || "").split(":").map(Number)
  return h * 60 + m
}
function overlap(aStart, aDur, bStart, bDur) {
  const aEnd = aStart + aDur
  const bEnd = bStart + bDur
  return aStart < bEnd && bStart < aEnd
}
function hasOverlappingBookingInCart(tutorId, dateYYYYMMDD, startHHmm, durationMinutes) {
  const newStart = toMinutes(startHHmm)
  const newDur = Number(durationMinutes)

  return (cart.items || []).some((it) => {
    if (it.type !== "booking") return false
    if (it.tutorId !== tutorId) return false

    const [itDate, itTime] = String(it.startAt || "").split("T")
    if (itDate !== dateYYYYMMDD) return false

    const itStart = toMinutes(itTime)
    const itDur = Number(it.durationMinutes ?? 0)

    return overlap(newStart, newDur, itStart, itDur)
  })
}

const filteredAvailableTimes = computed(() => {
  if (!selectedTutor.value) return availableTimes.value
  if (!selectedDate.value) return availableTimes.value

  const tutorId = selectedTutor.value.id
  const dur = Number(bookingForm.value.durationMinutes ?? 60)

  const cartBookingsSameTutorSameDate = (cart.items || []).filter((it) => {
    if (it.type !== "booking") return false
    if (it.tutorId !== tutorId) return false
    const [d] = String(it.startAt || "").split("T")
    return d === selectedDate.value
  })

  if (!cartBookingsSameTutorSameDate.length) return availableTimes.value

  return availableTimes.value.filter((t) => {
    const candStart = toMinutes(t)
    const clashes = cartBookingsSameTutorSameDate.some((it) => {
      const [, itTime] = String(it.startAt || "").split("T")
      const itStart = toMinutes(itTime)
      const itDur = Number(it.durationMinutes ?? 0)
      return overlap(candStart, dur, itStart, itDur)
    })
    return !clashes
  })
})

onMounted(async () => {
  await Promise.all([fetchTutors(), fetchCategories()])
  if (isAuthenticated.value) await loadBackendProfile()
})

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
    isAdmin.value = profile?.role === "ADMIN"
  } catch (e) {
    console.error("Could not load backend profile:", e)
    backendProfile.value = null
    isAdmin.value = false
  }
}

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

async function fetchTutors() {
  loading.value = true
  error.value = null
  try {
    const res = await fetch(`${API_BASE}/api/tutors`)
    if (!res.ok) throw new Error(`HTTP-Fehler: ${res.status}`)
    tutors.value = await res.json()
  } catch (err) {
    console.error("Fehler beim Laden der Tutor:innen:", err)
    error.value = "Fehler beim Laden der Tutor:innen."
  } finally {
    loading.value = false
  }
}

async function fetchCategories() {
  try {
    const res = await fetch(`${API_BASE}/api/category`)
    if (!res.ok) throw new Error(`HTTP-Fehler Kategorien: ${res.status}`)
    categories.value = await res.json()
  } catch (err) {
    console.error("Fehler beim Laden der Kategorien:", err)
  }
}

const filteredTutors = computed(() => {
  if (!searchName.value && !selectedCategory.value) return tutors.value
  return tutors.value.filter((tutor) => {
    const nameMatches =
      !searchName.value ||
      (tutor.name || "").toLowerCase().includes(searchName.value.toLowerCase())

    // TutorFilter gibt "subject" zurück -> bei euch steckt es in "category"
    // (weil /api/category aus dem Backend kommt). Daher: tutor.category
    const categoryMatches =
      !selectedCategory.value || tutor.category === selectedCategory.value

    return nameMatches && categoryMatches
  })
})

function handleTutorUpdate({ name, subject }) {
  searchName.value = name
  selectedCategory.value = subject
}

function handleTutorDeleted(id) {
  tutors.value = tutors.value.filter((t) => t.id !== id)
}

// ✅ Kontaktieren -> Nachrichten-Seite
function openContact(tutor) {
  if (!tutor?.id) return
  router.push({ path: "/messages", query: { tutorId: tutor.id } })
}

// Booking modal
async function openBookingModal(tutor) {
  selectedTutor.value = tutor
  bookingError.value = null
  bookingOk.value = false

  availableDates.value = []
  selectedDate.value = ""
  availableTimes.value = []
  selectedTime.value = ""

  bookingForm.value.durationMinutes = 60
  bookingForm.value.note = ""

  showBookingModal.value = true
  await reloadDates()
}

function closeBookingModal() {
  showBookingModal.value = false
  selectedTutor.value = null
}

async function reloadDates() {
  if (!selectedTutor.value) return

  bookingError.value = null
  availableDates.value = []
  selectedDate.value = ""
  availableTimes.value = []
  selectedTime.value = ""

  try {
    const res = await fetch(
      `${API_BASE}/api/tutors/${selectedTutor.value.id}/available-dates?days=14&durationMinutes=${bookingForm.value.durationMinutes}`
    )
    if (!res.ok) throw new Error(`Dates laden fehlgeschlagen: ${res.status}`)
    availableDates.value = await res.json()
  } catch (e) {
    bookingError.value = e?.message ?? String(e)
  }
}

function calcBookingPrice() {
  const rate = Number(selectedTutor.value?.hourlyRate ?? 0)
  const minutes = Number(bookingForm.value.durationMinutes ?? 0)
  if (!rate || !minutes) return "0.00"
  return (rate * (minutes / 60)).toFixed(2)
}

async function fetchAvailableTimes() {
  if (!selectedTutor.value || !selectedDate.value) return

  bookingError.value = null
  availableTimes.value = []
  selectedTime.value = ""

  try {
    const url =
      `${API_BASE}/api/tutors/${selectedTutor.value.id}/available-times` +
      `?date=${selectedDate.value}&durationMinutes=${bookingForm.value.durationMinutes}`

    const res = await fetch(url)
    if (!res.ok) throw new Error(`Times laden fehlgeschlagen: ${res.status}`)

    availableTimes.value = await res.json()

    if (selectedTime.value && !filteredAvailableTimes.value.includes(selectedTime.value)) {
      selectedTime.value = ""
    }
  } catch (e) {
    bookingError.value = e?.message ?? String(e)
  }
}

function addBookingToCart() {
  bookingError.value = null

  try {
    if (!selectedTutor.value) throw new Error("Kein Tutor ausgewählt.")
    if (!selectedDate.value) throw new Error("Bitte Datum auswählen.")
    if (!selectedTime.value) throw new Error("Bitte Startuhrzeit auswählen.")

    const rate = Number(selectedTutor.value.hourlyRate ?? 0)
    const minutes = Number(bookingForm.value.durationMinutes ?? 60)
    const priceTotal = rate ? (rate * (minutes / 60)).toFixed(2) : "0.00"

    const tutorId = selectedTutor.value.id

    if (hasOverlappingBookingInCart(tutorId, selectedDate.value, selectedTime.value, minutes)) {
      throw new Error("Dieser Termin überschneidet sich mit einer Buchung im Warenkorb.")
    }

    cart.addBooking({
      tutorId,
      tutorName: selectedTutor.value.name,
      subject: selectedTutor.value.subject,
      startAt: computedStartAt.value,
      durationMinutes: minutes,
      hourlyRate: rate,
      priceTotal: Number(priceTotal),
      note: bookingForm.value.note,
      type: "booking",
    })

    bookingOk.value = true
    fetchAvailableTimes()
  } catch (e) {
    bookingError.value = e?.message ?? String(e)
  }
}

watch(
  () => cart.items,
  async () => {
    if (!showBookingModal.value) return
    if (!selectedTutor.value || !selectedDate.value) return

    await fetchAvailableTimes()
    if (selectedTime.value && !filteredAvailableTimes.value.includes(selectedTime.value)) {
      selectedTime.value = ""
    }
  },
  { deep: true }
)
</script>

<template>
  <Navbar />

  <!-- Header wie Student-Seite -->
  <section class="py-5 text-center">
    <div class="container">
      <h2 class="fw-bold">Tutor:innen suchen</h2>
      <p>Tutor:innen auf der Suche</p>
    </div>
  </section>

  <!-- ✅ Filter: direkt einbinden (NICHT in absolute wrapper), damit es groß aufklappen kann -->
  <TutorFilter :subjects="categories" @tutorUpdate="handleTutorUpdate" />

  <div class="container py-4 tutorlist">
    <!-- ✅ Button nur für Admin -->
    <div class="text-end mb-3" v-if="!isLoading && isAuthenticated && isAdmin">
      <button class="btn btn-success" @click="showCreateForm = true">
        + Tutor erstellen
      </button>
    </div>

    <p class="text-end text-muted" v-else-if="!isLoading && isAuthenticated && !isAdmin">
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
          @contact="openContact"
        />
      </div>

      <p v-if="!filteredTutors.length && !loading" class="text-center mt-4">
        Keine Tutor:innen gefunden. Passe Suche oder Kategorie an.
      </p>
    </div>

    <div class="text-center mt-5">
      <button class="btn btn-outline-secondary" @click="$router.back()">
        Zurück
      </button>
    </div>
  </div>

  <!-- Admin Modal -->
  <div v-if="showCreateForm && !isLoading && isAuthenticated && isAdmin" class="modal-backdrop">
    <div class="modal-content">
      <h3>Neuen Tutor erstellen</h3>

      <input v-model="newTutor.name" class="form-control mb-2" placeholder="Name" />
      <input v-model="newTutor.subject" class="form-control mb-2" placeholder="Fach" />
      <input
        v-model="newTutor.semester"
        type="number"
        class="form-control mb-2"
        placeholder="Semester"
      />
      <input v-model="newTutor.image" class="form-control mb-2" placeholder="Bild-URL" />

      <div class="d-flex gap-2 mt-3">
        <button class="btn btn-success" @click="createTutor">Erstellen</button>
        <button class="btn btn-secondary" @click="showCreateForm = false">Abbrechen</button>
      </div>
    </div>
  </div>

  <!-- Booking Modal -->
  <div v-if="showBookingModal" class="modal-backdrop">
    <div class="modal-content">
      <h3>Stunde buchen</h3>

      <p v-if="selectedTutor">
        Tutor: <strong>{{ selectedTutor.name }}</strong><br />
        Preis: <strong>{{ selectedTutor.hourlyRate ?? "—" }} € / Stunde</strong>
      </p>

      <label class="form-label">Dauer</label>
      <select v-model.number="bookingForm.durationMinutes" class="form-control mb-2" @change="reloadDates">
        <option :value="30">30 Minuten</option>
        <option :value="60">60 Minuten</option>
        <option :value="90">90 Minuten</option>
        <option :value="120">120 Minuten</option>
      </select>

      <label class="form-label">Datum wählen</label>
      <select
        v-model="selectedDate"
        class="form-control mb-2"
        @change="fetchAvailableTimes"
        :disabled="!availableDates.length"
      >
        <option value="" disabled>Bitte auswählen…</option>
        <option v-for="d in availableDates" :key="d" :value="d">
          {{ d }}
        </option>
      </select>

      <label class="form-label">Startuhrzeit</label>
      <select v-model="selectedTime" class="form-control mb-2" :disabled="!filteredAvailableTimes.length">
        <option value="" disabled>Bitte auswählen…</option>
        <option v-for="t in filteredAvailableTimes" :key="t" :value="t">
          {{ t }}
        </option>
      </select>

      <label class="form-label">Notiz (optional)</label>
      <textarea v-model="bookingForm.note" class="form-control mb-2" rows="2"></textarea>

      <div class="mt-2">Gesamtpreis: <strong>{{ calcBookingPrice() }} €</strong></div>

      <div class="d-flex gap-2 mt-3">
        <button
          class="btn btn-success"
          :disabled="!selectedDate || !selectedTime"
          v-if="!isThisBookingInCart"
          @click="addBookingToCart"
        >
          In den Warenkorb
        </button>

        <button class="btn btn-outline-primary" v-if="hasAnyBookingInCart" @click="$router.push('/checkout')">
          Im Warenkorb ansehen
        </button>

        <button class="btn btn-secondary" @click="closeBookingModal">Schließen</button>
      </div>

      <p v-if="bookingOk" class="text-success mt-2">Erfolgreich zum Warenkorb hinzugefügt!</p>
      <p v-if="bookingError" class="text-danger mt-2">{{ bookingError }}</p>
    </div>
  </div>

  <Footer />
</template>

<style scoped>
/* ✅ wichtigste Änderung: KEIN filter-top-right / filter-clean mehr,
   weil das die große Filterbox kaputt macht. TutorFilter steuert das selbst. */

.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.modal-content {
  background: white;
  padding: 20px;
  border-radius: 12px;
  width: 400px;
  max-width: 92vw;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
}

/* Optional: wenn du weiterhin Hintergrundbild willst */
.tutor-page {
  min-height: 100vh;
  background-image:
     linear-gradient(rgba(255, 255, 255, 0.6), rgba(255, 255, 255, 0.75)),
    url('@/assets/img/background.avif');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  padding-top: 2rem;
  padding-bottom: 2rem;
}
</style>