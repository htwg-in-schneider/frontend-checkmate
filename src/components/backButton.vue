<script setup>
import { useRouter } from 'vue-router';

const router = useRouter();

// Props ermöglichen es dir, den Text oder das Ziel flexibel zu ändern
defineProps({
  label: {
    type: String,
    default: 'Zurück'
  },
  customClass: {
    type: String,
    default: 'btn-outline-secondary'
  }
});

function goBack() {
  router.back();
}
</script>

<template>
  <div class="text-center mt-5 mb-4">
    <button :class="['btn', customClass, 'px-4', 'rounded-pill']" @click="goBack">
      <i class="bi bi-arrow-left me-2"></i> {{ label }}
    </button>
  </div>
</template>

<style scoped>
.btn {
  transition: all 0.2s ease;
  font-weight: 500;
}

.btn:hover {
  transform: translateX(-5px); /* Kleiner visueller Effekt nach links */
}
</style>