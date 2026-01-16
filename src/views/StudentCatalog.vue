<script setup>
import { ref, onMounted, computed } from 'vue';
import Footer from '@/components/Footer.vue';
import TutorFilter from '@/components/TutorFilter.vue'; // kannst du wiederverwenden

import { useAuth0 } from '@auth0/auth0-vue';



const API_BASE = import.meta.env.VITE_API_BASE_URL;
const url = `${API_BASE}/api/students`;

const { getAccessTokenSilently } = useAuth0();

// komplette Liste aus dem Backend
const students = ref([]);
// gefilterte Liste für die Anzeige
const filteredStudents = ref([]);
const error = ref(null);
const loading = ref(true);

const currentIndex = ref(0);

const currentStudent = computed(() => {
  return filteredStudents.value[currentIndex.value] ?? null;
});

const swipeDirection = ref(null); // 'left' | 'right'

onMounted(fetchStudents);

async function fetchStudents() {
  loading.value = true;
  error.value = null;
  try {
    // 1. Token holen (wie in EditProfile.vue)
    const token = await getAccessTokenSilently();
    
    // 2. Header definieren
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    // 3. Den Request mit den Headern ausführen
    const response = await fetch(url, { headers });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    students.value = data;
    filteredStudents.value = data;
    console.log('Student:innen geladen:', data);
  } catch (err) {
    console.error('Error fetching students:', err);
    error.value = 'Student:innen konnten nicht geladen werden.';
  } finally {
    loading.value = false;
  }
}

// verfügbare Themen/Fächer aus den Studenten bauen
const availableSubjects = computed(() => {
  // Wir nehmen alle subjects-Listen aller Studenten und machen eine flache Liste daraus
  const all = students.value.flatMap(s => s.subjects || []);
  return Array.from(new Set(all)).filter(Boolean);
});
// wird vom Filter-Component aufgerufen (TutorFilter feuert @tutorUpdate)
function handleStudentUpdate(filter) {
  if (!filter || (!filter.name && !filter.subject)) {
    filteredStudents.value = students.value;
  } else {
    const name = (filter.name || '').toLowerCase();
    const subject = filter.subject || '';

    filteredStudents.value = students.value.filter((s) => {
      const matchesName = !name || ((s.user?.name || '').toLowerCase().includes(name));
      // Prüfen, ob das gesuchte Fach in der Liste des Studenten enthalten ist:
      const matchesSubject = !subject || (s.subjects && s.subjects.includes(subject));
      return matchesName && matchesSubject;
    });
  }

  // wichtig: zurück auf erstes Ergebnis wie Tinder
  currentIndex.value = 0;
}


function nextStudent() {
  if (currentIndex.value < filteredStudents.value.length - 1) {
    currentIndex.value++;
  } else {
    // optional: wieder von vorn oder "fertig"
    currentIndex.value = filteredStudents.value.length; // damit currentStudent null wird
  }
}

async function sendDecision(type, student) {
  const token = await getAccessTokenSilently();

  const res = await fetch(`${API_BASE}/api/matches/${type}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      targetUserId: student.user.id, // WICHTIG: User-ID
    }),
  });

  if (!res.ok) {
    throw new Error(`Match ${type} failed: ${res.status}`);
  }

  // like liefert DecisionResponse, dislike nicht
  return type === 'like' ? await res.json() : null;
}

async function likeStudent(s) {
  const result = await sendDecision('like', s);

  if (result?.matched) {
    alert(`🎉 Match mit ${s.user?.name}!`);
  }

  nextStudent();
}

async function dislikeStudent(s) {
  await sendDecision('dislike', s);
  nextStudent();
}

</script>

<template>
  <Navbar />

  <!-- Header -->
  <section class="py-5 text-center">
    <div class="container">
      <h2 class="fw-bold">Study-Partner suchen</h2>
      <p>Study-Partners auf der Suche</p>
    </div>
  </section>

  <!-- Filter -->
  <TutorFilter :subjects="availableSubjects" @tutorUpdate="handleStudentUpdate" />

  <div class="container py-4">
    <!-- Lade- & Fehlerzustände -->
    <p v-if="loading" class="text-center">Lade Study-Partner…</p>
    <p v-else-if="error" class="text-center text-danger">{{ error }}</p>

    <!-- Grid -->
   <div v-else class="d-flex justify-content-center">
  <Transition :name="swipeDirection ? `swipe-${swipeDirection}` : 'card'" mode="out-in">
  <div
    v-if="currentStudent"
    :key="currentStudent.id"
    class="card shadow-sm"
    style="max-width: 520px; width: 100%;"
  >
    <img :src="currentStudent.imageUrl || currentStudent.image"
         class="card-img-top"
         alt="Profil Bild"
         style="height: 350px; object-fit: cover;" />

    <div class="card-body d-flex flex-column">
      <h4 class="card-title">{{ currentStudent.user?.name || '—' }}</h4>

      <div class="mt-2">
        <div class="fw-bold">Über mich:</div>
        <div class="text-muted small">{{ currentStudent.aboutMe || '—' }}</div>
      </div>

      <div class="mt-3">
        <div class="fw-bold">Ich studiere:</div>
        <div class="text-muted small">{{ currentStudent.fieldOfStudy || '—' }}</div>
      </div>

      <div class="mt-3">
        <div class="fw-bold">Fächer:</div>
        <div class="text-muted small">{{ currentStudent.subjects && currentStudent.subjects.length > 0 ? currentStudent.subjects.join(', ') : '—' }}</div>
      </div>

      <div class="mt-3">
        <div class="fw-bold">Semester:</div>
        <div class="text-muted small">{{ currentStudent.semester ?? '—' }}</div>
      </div>

      <div class="mt-3">
        <div class="fw-bold">Ich studiere an der:</div>
        <div class="text-muted small">{{ currentStudent.university ?? '—' }}</div>
      </div>

      <div class="mt-auto d-flex justify-content-between gap-3 pt-3">
        <button class="btn btn-outline-danger w-50" @click="dislikeStudent(currentStudent)">
          ❌
        </button>
        <button class="btn btn-success w-50" @click="likeStudent(currentStudent)">
          ✅
        </button>
      </div>

      <div class="text-center text-muted small mt-3">
        {{ currentIndex + 1 }} / {{ filteredStudents.length }}
      </div>
    </div>
  </div>

  <p v-else class="text-center mt-4">
    Keine Student:innen gefunden. Passe die Filter an.
  </p>
  </Transition>
</div>

  </div>

  <div class="text-center mt-5">
    <button class="btn btn-outline-secondary" @click="$router.back()">
      Zurück
    </button>
  </div>

</template>

<style scoped>

/* ===== Filter-Layout wie TutorList ===== */
.header-container {
  position: relative;
  margin-bottom: 2rem;
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

/* optional: gleiche Optik wie eure TutorList-Header */
.page-title {
  color: #111;
  margin: 0;
}
.page-subtitle {
  margin: 0.5rem 0 0;
  color: #444;
}

/* Mobile: Filter oben normal einreihen */
@media (max-width: 576px) {
  .filter-top-right {
    position: static;
    margin-bottom: 1rem;
    display: flex;
    justify-content: flex-start;
  }
}







/* optional: kleine UI-Verbesserungen */
.card {
  border-radius: 14px;
}
/* Default (beim Filtern etc.) */
.card-enter-active,
.card-leave-active {
  transition: opacity 180ms ease, transform 180ms ease;
}
.card-enter-from,
.card-leave-to {
  opacity: 0;
  transform: translateY(8px);
}

/* ❌ Swipe LEFT (Dislike) */
.swipe-left-leave-active {
  transition: transform 200ms ease, opacity 200ms ease;
}
.swipe-left-leave-to {
  transform: translateX(-120%) rotate(-6deg);
  opacity: 0;
}

/* ✅ Swipe RIGHT (Like) */
.swipe-right-leave-active {
  transition: transform 200ms ease, opacity 200ms ease;
}
.swipe-right-leave-to {
  transform: translateX(120%) rotate(6deg);
  opacity: 0;
}
.swipe-left-enter-active,
.swipe-right-enter-active {
  transition: opacity 180ms ease, transform 180ms ease;
}
.swipe-left-enter-from,
.swipe-right-enter-from {
  opacity: 0;
  transform: translateY(8px);
}


</style>
