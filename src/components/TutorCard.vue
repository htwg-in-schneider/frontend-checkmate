<script setup>
const props = defineProps({
  tutor: {
    type: Object,
    required: true,
  },
});

function showAlert(description) {
  alert(description);
}
</script>

<template>
  <div class="card shadow-sm h-100">
    <img
      :src="tutor.image"
      class="card-img-top"
      alt="Tutor Bild"
      style="height: 220px; object-fit: cover;"
    />
    <div class="card-body">
      <h5 class="card-title">{{ tutor.name }}</h5>
      <p class="card-text">{{ tutor.subject }}</p>
      <p class="text-muted small">Semester: {{ tutor.semester }}</p>
      <button
        class="btn btn-primary w-100 mt-2"
        @click="showAlert(`Du kontaktierst ${tutor.name} für ${tutor.subject}`)"
      >
        Kontaktieren
      </button>
    </div>
  </div>
</template>

<style scoped>
/* falls du card-spezifische Styles brauchst */
</style>