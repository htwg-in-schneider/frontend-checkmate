<script setup>
import { ref, onMounted, computed } from 'vue';
import Navbar from '@/components/Navbar.vue';
import Footer from '@/components/Footer.vue';
import TutorFilter from '@/components/TutorFilter.vue'; // kannst du wiederverwenden
import BackButton from '@/components/backButton.vue'

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
    // 1. Token holen
    const token = await getAccessTokenSilently(); 

    // 2. Token im Header mitschicken
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
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
const availableSubjects = computed(() =>
  Array.from(new Set(students.value.map((s) => s.subject).filter(Boolean)))
);

// wird vom Filter-Component aufgerufen (TutorFilter feuert @tutorUpdate)
function handleStudentUpdate(filter) {
  if (!filter || (!filter.name && !filter.subject)) {
    filteredStudents.value = students.value;
  } else {
    const name = (filter.name || '').toLowerCase();
    const subject = filter.subject || '';

    filteredStudents.value = students.value.filter((s) => {
      const matchesName = !name || ((s.user?.name || '').toLowerCase().includes(name));
      const matchesSubject = !subject || s.subject === subject;
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
  <div class="studentSite">

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
        <div class="fw-bold">Fach:</div>
        <div class="text-muted small">{{ currentStudent.subject ?? '—' }}</div>
      </div>

      <div class="mt-3">
        <div class="fw-bold">Semester:</div>
        <div class="text-muted small">{{ currentStudent.semester ?? '—' }}</div>
      </div>

      <div class="mt-3">
        <div class="fw-bold">Ich studiere an der:</div>
        <div class="text-muted small">{{ currentStudent.university ?? '—' }}</div>
      </div>

      <div class="mt-auto d-flex justify-content-between gap-3 px-5 pt-3">
        <button class="btn btn-danger btn-round" @click="dislikeStudent(currentStudent)">
          <i class="bi bi-x"></i>
        </button>
        <button class="btn btn-success btn-round" @click="likeStudent(currentStudent)">
          <i class="bi bi-check-lg"></i>
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
    <BackButton />
  </div>
</div>
  <Footer />
</template>

<style scoped>
/* optional: kleine UI-Verbesserungen */
.card {
  border-radius: 40px;
  background-color: #F3EFDF;
  width: 100%;
  max-width: 520px;
  overflow: hidden; /* Damit das Bild oben auch rund ist */
  
}




.card-img-top {
  /* Nur die oberen Ecken abrunden, damit es bündig mit der Karte ist */
  border-top-left-radius: 39px;
  border-top-right-radius: 39px;
  /* Deine bestehenden Styles bleiben: */
  height: 350px;
  object-fit: cover;
}


.studentSite {
  /* Der Container selbst braucht diese Einstellungen, 
     damit die Ebene dahinter richtig positioniert wird */
  position: relative;
  min-height: 100vh;
  width: 100%;
  overflow: hidden; /* Verhindert unschöne Ränder */
}

/* Diese "Ebene" hält das Hintergrundbild */
.studentSite::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  
  /* Dein Bild */
  background-image: url('@/assets/img/matcha.jpg');
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
  
  /* HIER stellst du die Deckkraft ein (0.0 bis 1.0) */
  opacity: 0.3; 
  
  /* Das Bild muss hinter den Inhalt */
  z-index: -1; 
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

.btn-danger i {
  font-size: 3.2rem; /* Hier kannst du die Größe beliebig anpassen */
}
.btn-success i {
  font-size: 2.5rem; 
}
.btn-round {
  width: 70px;        /* Gleiche Breite */
  height: 70px;       /* Gleiche Höhe */
  border-radius: 50%; /* Macht den Button kreisrund */
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;         /* Entfernt Standard-Padding, damit das Icon zentriert ist */
  font-size: 1.5rem;  /* Macht das Icon etwas größer */
  transition: transform 0.2s ease; /* Kleiner Effekt beim Drüberfahren */
}

.btn-round:hover {
  transform: scale(1.1); /* Button wird beim Hovern leicht größer */
}

</style>
