<script setup>
import { ref, computed } from 'vue';

// Parent übergibt die Liste der Subjects (Fächer)
const props = defineProps({
  subjects: {
    type: Array,
    default: () => [],
  },
});

// Event, das wir nach außen schicken
const emit = defineEmits(['tutorUpdate']);

const searchName = ref('');
const selectedSubject = ref('');

// doppelte Subjects entfernen
const uniqueSubjects = computed(() =>
  Array.from(new Set(props.subjects.filter(Boolean)))
);

function onSearch() {
  emit('tutorUpdate', {
    name: searchName.value,
    subject: selectedSubject.value,
  });
}

function onReset() {
  searchName.value = '';
  selectedSubject.value = '';
  emit('tutorUpdate', { name: '', subject: '' });
}
</script>

<template>
  <div class="tutor-filter-box">
    <!-- OBERSTE ZEILE: Label + Eingabefelder wie bisher -->
    <div class="d-flex align-items-center gap-2 flex-wrap justify-content-end">
      <span class="me-2 fw-bold">Filter:</span>

      <!-- Suche -->
      <input
        v-model="searchName"
        type="text"
        class="form-control form-control-sm w-auto"
        placeholder="Name suchen..."
        @keyup.enter="onSearch"
      />

      <!-- Fach-Auswahl -->
      <select
        v-model="selectedSubject"
        class="form-select form-select-sm w-auto"
        @change="onSearch"
      >
        <option value="">Alle Fächer</option>
        <option
          v-for="subject in uniqueSubjects"
          :key="subject"
          :value="subject"
        >
          {{ subject }}
        </option>
      </select>
    </div>

    <!-- NEUE ZEILE: Buttons unterhalb der Felder, nebeneinander rechts -->
    <div class="d-flex gap-2 justify-content-end mt-2">
      <button
        type="button"
        class="btn btn-primary btn-sm search-btn"
        @click="onSearch"
      >
        🔍 Suchen
      </button>

      <button
        type="button"
        class="btn btn-outline-secondary btn-sm"
        @click="onReset"
      >
        ⟳ Reset
      </button>
    </div>
  </div>
</template>

<style scoped>
.tutor-filter-box {
  border: 2px solid hotpink;
  background: #ffe4f4;
  padding: 0.75rem 1rem;
  margin: -1.5rem auto 1.5rem auto; /* ein bisschen näher an den Header ran */
  max-width: 1100px;
  border-radius: 8px;
}

.search-btn {
  background-color: #607953 !important; /* CheckMate-Grün */
  border-color: #607953 !important;
  color: white !important;
}

.search-btn:hover {
  background-color: #4f6746 !important;
  border-color: #4f6746 !important;
}
</style>