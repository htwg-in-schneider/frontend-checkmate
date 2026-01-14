<script setup>
import { ref, onMounted, computed } from 'vue'
import TutorCard from '@/components/TutorCard.vue'
import TutorFilter from '@/components/TutorFilter.vue'
import { useAuth0 } from '@auth0/auth0-vue'
import BackButton from '@/components/backButton.vue'



// Basis-URL – entweder aus .env oder fallback auf localhost
const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081'

// Auth0
const { getAccessTokenSilently, isAuthenticated, isLoading } = useAuth0()

// State
const tutors = ref([])
const categories = ref([])
const loading = ref(true)
const error = ref(null)

// Role / Profile
const backendProfile = ref(null)
const isAdmin = ref(false)

// Filter-States (werden vom Child gesetzt)
const searchName = ref('')
const selectedCategory = ref('') // "" = keine Kategorie → alle anzeigen

const showCreateForm = ref(false)
const newTutor = ref({
  name: "",
  subject: "",
  semester: 1,
  image: ""
})

// Daten laden, sobald Komponente gemountet ist
onMounted(async () => {
  await Promise.all([fetchTutors(), fetchCategories()])

  // Profile nur laden, wenn eingeloggt
  if (isAuthenticated.value) {
    await loadBackendProfile()
  }
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
    isAdmin.value = profile?.role === 'ADMIN'

    // 🔍 DEBUG
    console.log('BACKEND PROFILE:', profile)
    console.log('ROLE FROM BACKEND:', profile?.role)
    console.log('isAdmin (Parent):', isAdmin.value)
  } catch (e) {
    console.error('Could not load backend profile:', e)
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

    // neu laden + modal zu + reset
    await fetchTutors()
    showCreateForm.value = false
    newTutor.value = { name: "", subject: "", semester: 1, image: "" }
  } catch (e) {
    console.error(e)
    alert("Tutor konnte nicht erstellt werden.")
  }
}

// Tutor:innen vom Backend holen
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

// Kategorien aus dem Backend holen
async function fetchCategories() {
  try {
    const res = await fetch(`${API_BASE}/api/category`)
    if (!res.ok) throw new Error(`HTTP-Fehler Kategorien: ${res.status}`)
    categories.value = await res.json()
  } catch (err) {
    console.error('Fehler beim Laden der Kategorien:', err)
  }
}

// gefilterte Liste (Name + Kategorie)
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

// Event-Handler vom Child TutorFilter
function handleTutorUpdate({ name, subject }) {
  searchName.value = name
  selectedCategory.value = subject
}

function handleTutorDeleted(id) {
  tutors.value = tutors.value.filter(t => t.id !== id)
}
</script>

<template>
  <div class="tutor-page">
    <div class="container py-4 tutorlist">

      <div class="tutor-header-container">

        <h1 class="tutor-title">Unsere Tutor:innen</h1>

        <div class="filter-clean">
            <TutorFilter :subjects="categories" @tutorUpdate="handleTutorUpdate" />
          </div>
      </div>

      <!-- ✅ Create-Button nur für Admin -->
      <div class="text-end mb-3" v-if="!isLoading && isAuthenticated && isAdmin">
        <button class="btn btn-success" @click="showCreateForm = true">
          + Tutor erstellen
        </button>
      </div>


      <p v-if="loading" class="text-center">Lade Tutor:innen…</p>
      <p v-else-if="error" class="text-center text-danger">{{ error }}</p>

      <div v-else class="row g-4">
        <div v-for="tutor in filteredTutors" :key="tutor.id" class="col-md-4">
          <TutorCard :tutor="tutor" :is-admin="isAdmin" @deleted="handleTutorDeleted" />
        </div>

        <p v-if="!filteredTutors.length && !loading" class="text-center mt-4">
          Keine Tutor:innen gefunden. Passe Suche oder Kategorie an.
        </p>
      </div>

      <div class="text-center mt-5">
           <BackButton />
      </div>
    </div>
  </div>

  <!-- ✅ Modal nur für Admin -->
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
</template>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal-content {
  background: #F3EFDF;
  padding: 20px;
  border-radius: 12px;
  width: 400px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
}
.tutor-page {
  

  position: relative;
  min-height: 100vh;
  width: 100%;
  overflow: hidden; /* Verhindert unschöne Ränder */
}

.tutor-page::before {
  /* 1. Zwingend erforderlich, sonst wird das Element nicht erzeugt */
  content: ""; 
  
  /* 2. Über die gesamte Fläche des Containers strecken */
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  
  /* 3. Das Bild und seine Darstellung */
  background-image: url('@/assets/img/matcha.jpg');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  background-attachment: fixed; /* Optional: Bild scrollt nicht mit */
  
  /* 4. Deckkraft wie gewünscht */
  opacity: 0.3;
  
  /* 5. Hinter den Text und die Karten schieben */
  z-index: -1;
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


@media (max-width: 576px) {
  .tutor-page {
    padding-top: 2rem;
  }

  #h1 {

    font-size: medium;

  }

  .filter-top-right {
    position: static;
    margin-bottom: 1rem;
    display: flex;
    justify-content: flex-start;
  }

  .tutor-title {
    margin-top: 0;
    font-size: 28px;  }
}
</style>