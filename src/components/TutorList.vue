<script setup>
import { ref, onMounted, computed } from 'vue';
import TutorCard from '@/components/TutorCard.vue';
import TutorFilter from '@/components/TutorFilter.vue';

// Basis-URL – entweder aus .env oder fallback auf localhost
const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081';

// State
const tutors = ref([]);
const categories = ref([]);
const loading = ref(true);
const error = ref(null);

// Filter-States (werden vom Child gesetzt)
const searchName = ref('');
const selectedCategory = ref(''); // "" = keine Kategorie → alle anzeigen

const showCreateForm = ref(false);
const newTutor = ref({
  name: "",
  subject: "",
  semester: 1,
  image: ""
});


// Daten laden, sobald Komponente gemountet ist
onMounted(async () => {
  await Promise.all([fetchTutors(), fetchCategories()]);
});

async function createTutor() {
  try {
    const response = await fetch(`${API_BASE}/api/tutors`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newTutor.value)
    });

    if (!response.ok) {
      throw new Error("Error creating tutor");
    }

    //alert("Tutor erfolgreich erstellt!");

    showCreateForm.value = false;
    newTutor.value = { name: "", subject: "", semester: 1, image: "" };

    await fetchTutors(); // Liste nachladen
  } catch (err) {
    console.error(err);
   // alert("Fehler beim Erstellen");
  }
}


// Tutor:innen vom Backend holen
async function fetchTutors() {
  loading.value = true;
  error.value = null;
  try {
    const res = await fetch(`${API_BASE}/api/tutors`);
    if (!res.ok) {
      throw new Error(`HTTP-Fehler: ${res.status}`);
    }
    tutors.value = await res.json();
    console.log('Tutors:', tutors.value);
  } catch (err) {
    console.error('Fehler beim Laden der Tutor:innen:', err);
    error.value = 'Fehler beim Laden der Tutor:innen.';
  } finally {
    loading.value = false;
  }
}



// Kategorien aus dem Backend holen
async function fetchCategories() {
  try {
    const res = await fetch(`${API_BASE}/api/category`);
    if (!res.ok) {
      throw new Error(`HTTP-Fehler Kategorien: ${res.status}`);
    }
    categories.value = await res.json();
    console.log('Categories:', categories.value);
  } catch (err) {
    console.error('Fehler beim Laden der Kategorien:', err);
  }
}

// gefilterte Liste (Name + Kategorie)
const filteredTutors = computed(() => {
  if (!searchName.value && !selectedCategory.value) {
    return tutors.value;
  }

  return tutors.value.filter((tutor) => {
    const nameMatches =
      !searchName.value ||
      (tutor.name || '').toLowerCase().includes(searchName.value.toLowerCase());

    const categoryMatches =
      !selectedCategory.value || tutor.category === selectedCategory.value;

    return nameMatches && categoryMatches;
  });
});

// Event-Handler vom Child TutorFilter
function handleTutorUpdate({ name, subject }) {
  searchName.value = name;
  selectedCategory.value = subject;
}

function handleTutorDeleted(id) {
  tutors.value = tutors.value.filter(t => t.id !== id);
}

</script>

<template>


  <!-- NEU: Wrapper mit Hintergrundbild -->
  <div class="tutor-page">

    
    <div class="container py-4 tutorlist">

      <!-- Header-Bereich -->
      <div class="tutor-header-container">

        <!-- Filter oben rechts -->
        <div class="filter-top-right">
          <div class="filter-clean">
            <TutorFilter
              :subjects="categories"
              @tutorUpdate="handleTutorUpdate"
            />
          </div>
        </div>

        <!-- Titel links -->
        <h1 class="tutor-title">Unsere Tutor:innen</h1>
      </div>
        <div class="text-end mb-3">
  <button class="btn btn-success" @click="showCreateForm = true">
    + Tutor erstellen
  </button>
</div>

      <!-- Lade- & Fehlerzustände -->
      <p v-if="loading" class="text-center">Lade Tutor:innen…</p>
      <p v-else-if="error" class="text-center text-danger">{{ error }}</p>

      <!-- Tutor:innen-Liste -->
      <div v-else class="row g-4">
        <div
          v-for="tutor in filteredTutors"
          :key="tutor.id"
          class="col-md-4"
        >
          <TutorCard
           :tutor="tutor"
           @deleted="handleTutorDeleted"
          />
        </div>

        <p
          v-if="!filteredTutors.length && !loading"
          class="text-center mt-4"
        >
          Keine Tutor:innen gefunden. Passe Suche oder Kategorie an.
        </p>
      </div>

      <div class="text-center mt-5">
        <button
          class="btn btn-outline-secondary"
          @click="$router.push('/')"
        >
          Zurück zur Startseite
        </button>
      </div>
    </div>
  </div>
  <div v-if="showCreateForm" class="modal-backdrop">
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
  background: rgba(0,0,0,0.4);
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal-content {
  background: white;
  padding: 20px;
  border-radius: 12px;
  width: 400px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.2);
}

/* GANZE Tutor-Seite mit faded Hintergrundbild */
.tutor-page {
  min-height: 100vh;
  /* leichte weiße Schicht drüber, damit es "gefadet" wirkt */
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.6), rgba(255, 255, 255, 0.75)),
    url('@/assets/img/background.avif');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  padding-top: 4rem; /* etwas Luft unter der Navbar */
  padding-bottom: 4rem;
}

/* Header Layout */
.tutor-header-container {
  position: relative;
  margin-bottom: 2rem;
}

/* Überschrift links */
/*.tutor-title {
  font-weight: 600;
  text-align: left;
  margin-top: 48px; /* Platz für Filter */
  .tutor-title {
  font-family: sans-serif;
  font-size: 80px;
  font-weight: 600;
  color: white !important;
  letter-spacing: 0.8px;
    text-align: left;
     text-shadow: 0 0 12px #607953;

}


/* Filter oben rechts */
.filter-top-right {
  position: absolute;
  top: 0;
  right: 0;
}

/* Filter ohne Rand, neutral */
.filter-clean ::v-deep .tutor-filter-box {
  border: none !important;
  background: transparent !important;
  padding: 0 !important;
  margin: 0 !important;
}

/* Mobile: Filter unter dem Titel */
@media (max-width: 576px) {
  .tutor-page {
    padding-top: 2rem;
  }

  .filter-top-right {
    position: static;
    margin-bottom: 1rem;
    display: flex;
    justify-content: flex-start;
  }

  .tutor-title {
    margin-top: 0;
  }
}
</style>