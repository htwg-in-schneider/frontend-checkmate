<script setup>
import NavButton from '@/components/NavButton.vue'; // WICHTIG: damit der Button funktioniert!

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

    <div class="card-body d-flex flex-column">
      <h5 class="card-title">{{ tutor.name }}</h5>
      <p class="card-text">{{ tutor.subject }}</p>
      <p class="text-muted small">Semester: {{ tutor.semester }}</p>
      <TutorReviews :tutor-id="tutor.id" />

      <button
        class="btn btn-primary w-100 mt-2"
        @click="showAlert(`Du kontaktierst ${tutor.name} für ${tutor.subject}`)"
      >
        Kontaktieren
      </button>

      <!-- NAVBUTTON unten -->
      <NavButton
        variant="secondary"
        class="mt-3 w-100"
        :to="`/tutor/edit/${tutor.id}`"
      >
        Bearbeiten
      </NavButton>
    </div>
  </div>
</template>

<style scoped>
/* Optional eigene Styles */
</style>