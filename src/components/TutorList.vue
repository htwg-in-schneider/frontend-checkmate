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

// Daten laden, sobald Komponente gemountet ist
onMounted(async () => {
  await Promise.all([fetchTutors(), fetchCategories()]);
});

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
</script>

<template>
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
        <TutorCard :tutor="tutor" />
      </div>

      <p
        v-if="!filteredTutors.length && !loading"
        class="text-center mt-4"
      >
        Keine Tutor:innen gefunden. Passe Suche oder Kategorie an.
      </p>
    </div>
  </div>
</template>

<style scoped>
/* Header Layout */
.tutor-header-container {
  position: relative;
  margin-bottom: 2rem;
}

/* Überschrift links */
.tutor-title {
  font-weight: 600;
  text-align: left;
  margin-top: 48px; /* Platz für Filter */
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