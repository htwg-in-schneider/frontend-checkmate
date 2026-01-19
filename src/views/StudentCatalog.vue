<script setup>
import { ref, onMounted, computed } from 'vue';
import Footer from '@/components/Footer.vue';
import TutorFilter from '@/components/TutorFilter.vue'; // kannst du wiederverwenden

import { useAuth0 } from '@auth0/auth0-vue';



const API_BASE = import.meta.env.VITE_API_BASE_URL;
const url = `${API_BASE}/api/students`;

const { getAccessTokenSilently, isAuthenticated, isLoading } = useAuth0();

const currentStudent = computed(() => {
  return filteredStudents.value[currentIndex.value] ?? null;
});

const swipeDirection = ref(null); // 'left' | 'right'

// ✅ Admin-Zustand & Modal-Steuerung
const isAdmin = ref(false);
const showCreateStudentForm = ref(false);
const subjectsInput = ref(""); 

const newStudent = ref({
  name: "",        // Für das User-Objekt
  email: "",
  aboutMe: "",
  fieldOfStudy: "",
  subjects: [], 
  semester: 1,
  university: "",
  imageUrl: ""
});

const students = ref([]);
const filteredStudents = ref([]);
const error = ref(null);
const loading = ref(true);
const currentIndex = ref(0);

// Admin-Check laden
async function loadAdminStatus() {
  try {
    const token = await getAccessTokenSilently();
    const res = await fetch(`${API_BASE}/api/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      const profile = await res.json();
      isAdmin.value = profile?.role === "ADMIN";
    }
  } catch (e) {
    console.error("Admin-Check fehlgeschlagen", e);
  }
}

// Student erstellen (Admin-Funktion)
async function createStudentAdmin() {
  try {
    const token = await getAccessTokenSilently();
    
    // Fächer von String zu Array umwandeln
    newStudent.value.subjects = subjectsInput.value
      .split(',')
      .map(s => s.trim())
      .filter(s => s !== "");

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      // Das Objekt enthält nun name und email
      body: JSON.stringify(newStudent.value),
    });

    if (!response.ok) throw new Error("Fehler beim Erstellen des Studenten.");

    await fetchStudents();
    showCreateStudentForm.value = false;
    
    // Reset Form inklusive der neuen Felder
    newStudent.value = { 
      name: "", email: "", aboutMe: "", fieldOfStudy: "", 
      subjects: [], semester: 1, university: "", imageUrl: "" 
    };
    subjectsInput.value = "";
  } catch (e) {
    console.error(e);
    alert("Fehler: " + e.message);
  }
}

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

onMounted(async () => {
  await fetchStudents();
  if (isAuthenticated.value) await loadAdminStatus();
});

</script>

<template>
  <Navbar />

  <!-- Header -->
  <div class="studentSite">

  <section class="py-5 text-center">
    <div class="container">
      <h2 class="page-title">Study-Partner suchen</h2>
      <p class="page-subtitle">Study-Partners auf der Suche</p>
    </div>
  </section>

  <!-- Filter -->
  <TutorFilter :subjects="availableSubjects" @tutorUpdate="handleStudentUpdate" />
  <div class="filter-wrapper container" v-if="!isLoading && isAuthenticated && isAdmin">
  <div class="d-flex justify-content-end mb-3" v-if="!isLoading && isAuthenticated && isAdmin">
    <button class="btn btn-create shadow-sm" @click="showCreateStudentForm = true">
      <span>+ Student erstellen</span>
      <i class="bi bi-person-plus-fill ms-2"></i>
    </button>
  </div>
  </div>

  <div v-if="showCreateStudentForm" class="modal-backdrop">
    <div class="modal-content">
      <h3>Neuen Studenten erstellen</h3>
      <div class="row">
      <div class="col-6">
        <label class="small fw-bold mt-2">Vollständiger Name</label>
        <input v-model="newStudent.name" class="form-control mb-2" placeholder="Max Mustermann" />
      </div>
      <div class="col-6">
        <label class="small fw-bold mt-2">E-Mail Adresse</label>
        <input v-model="newStudent.email" type="email" class="form-control mb-2" placeholder="max@beispiel.de" />
      </div>
    </div>
      <label class="small fw-bold mt-2">Über mich</label>
      <textarea v-model="newStudent.aboutMe" class="form-control mb-2" rows="2"></textarea>
      
      <label class="small fw-bold">Studiengang</label>
      <input v-model="newStudent.fieldOfStudy" class="form-control mb-2" />
      
      <label class="small fw-bold">Fächer (kommagetrennt)</label>
      <input v-model="subjectsInput" class="form-control mb-2" placeholder="Mathe, Java..." />
      
      <div class="row">
        <div class="col-6">
          <label class="small fw-bold">Semester</label>
          <input v-model="newStudent.semester" type="number" class="form-control mb-2" />
        </div>
        <div class="col-6">
          <label class="small fw-bold">Uni</label>
          <input v-model="newStudent.university" class="form-control mb-2" />
        </div>
      </div>
      
      <label class="small fw-bold">Bild-URL</label>
      <input v-model="newStudent.imageUrl" class="form-control mb-2" />

      <div class="d-flex gap-2 mt-3">
        <button class="btn btn-success" @click="createStudentAdmin">Erstellen</button>
        <button class="btn btn-secondary" @click="showCreateStudentForm = false">Abbrechen</button>
      </div>
    </div>
  </div>
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

  <div class="text-center mb-5 ">
    <button class="btn btn-outline-secondary" @click="$router.back()">
      Zurück
    </button>
  </div>
  </div>

</template>

<style scoped>
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
  width: 100%;
  height: 100%;
  background-image: url('@/assets/img/matcha.jpg');
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
  opacity: 0.3; 
  z-index: -1; 
}
/* ===== Filter-Layout wie TutorList ===== */
.header-container {
  position: relative;
  margin-bottom: 2rem;
}
.container {
  margin-top:0px;
}


.filter-clean ::v-deep .tutor-filter-box {
  border: none !important;
  background: transparent !important;
  padding: 0 !important;
  margin: 0 !important;
}

/* optional: gleiche Optik wie eure TutorList-Header */
.page-title {
  font-size: 60px;
  font-weight: 700;
  color: #111;
  margin: 0;
}
.page-subtitle {
  font-size: 30px;
  margin: 0.5rem 0 0;
  color: #444;
}


/* Mobile: Filter oben normal einreihen */
@media (max-width: 576px) {
  .page-title {
    font-size: 40px;
  }
  .page-subtitle {
    font-size: 20px;
  }
  .filter-top-right {
    position: static;
    margin-bottom: 1rem;
    display: flex;
    justify-content: flex-start;
  }
}


/* optional: kleine UI-Verbesserungen */
.card {
   border-radius: 40px;
  background-color: #F3EFDF;
  max-width: 500px;
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

.btn-create{
  background: rgba(32, 118, 32, 0.776);
  border-radius: 999px;
  font-weight: 500;
  color: #F3EFDF;
  border: 0px;
  padding: 0.35rem 0.6rem;


}

</style>
