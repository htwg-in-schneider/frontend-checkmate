<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
  subjects: {
    type: Array,
    default: () => [],
  },

  // ✅ neu: Texte flexibel machen, Design bleibt gleich
  title: { type: String, default: 'Filter' },
  nameLabel: { type: String, default: 'Name' },
  namePlaceholder: { type: String, default: 'z.B. Lisa' },
  subjectLabel: { type: String, default: 'Modul / Fach' },
  allSubjectsText: { type: String, default: 'Alle Fächer' },

  // ✅ neu: Button-Text optional
  toggleOpenText: { type: String, default: 'Close' },
  toggleClosedText: { type: String, default: 'Filter' },
});

const emit = defineEmits(['tutorUpdate']);
const isOpen = ref(false);

const searchName = ref('');
const selectedSubject = ref('');

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
  <div class="filter-wrapper container">
    <div class="d-flex justify-content-end mb-3">
      <button
        class="btn btn-filter-toggle rounded-pill shadow-sm d-flex align-items-center gap-2 px-3 py-1"
        @click="isOpen = !isOpen"
      >
        <span>{{ isOpen ? toggleOpenText : toggleClosedText }}</span>
        <i v-if="!isOpen" class="bi bi-sliders"></i>
      </button>
    </div>

    <Transition name="slide-fade">
      <div v-if="isOpen" class="tutor-filter-box shadow-lg">
        <h5 class="fw-bold mb-4 text-center">{{ title }}</h5>

        <div class="filter-grid">
          <div class="filter-group">
            <label>{{ nameLabel }}</label>
            <input
              v-model="searchName"
              type="text"
              class="form-control"
              :placeholder="namePlaceholder"
            />
          </div>

          <div class="filter-group">
            <label>{{ subjectLabel }}</label>
            <select v-model="selectedSubject" class="form-select">
              <option value="">{{ allSubjectsText }}</option>
              <option v-for="subject in uniqueSubjects" :key="subject" :value="subject">
                {{ subject }}
              </option>
            </select>
          </div>
        </div>

        <div class="d-flex gap-2 justify-content-center mt-4">
          <button class="btn btn-primary search-btn px-4" @click="onSearch">Suchen</button>
          <button class="btn btn-outline-black px-4" @click="onReset">Reset</button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.btn-filter-toggle {
  background-color: #A5BDD4;
  color: black;
  font-size: 0.9rem;
  font-weight: bold;
  transition: all 0.2s ease-in-out;
  width: 100px;
  text-align: center;
}
.tutor-filter-box {
  border: 2px solid #697C44;
  background: #BDCFAA;
  padding: 0.75rem 1rem;
  margin: -1.5rem auto 1.5rem auto;
  max-width: 1100px;
  border-radius: 8px;
}
.search-btn {
  background-color: #607953 !important;
  border-color: #607953 !important;
  color: white !important;
}
.search-btn:hover {
  background-color: #4f6746 !important;
  border-color: #4f6746 !important;
}
</style>