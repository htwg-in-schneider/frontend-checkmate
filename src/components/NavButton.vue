<template>
  <router-link :to="to" :class="buttonClass">
    <slot />
  </router-link>
</template>

<script setup>
const props = defineProps({
  to: { 
    type: [String, Object], 
    required: true 
  },
  variant: { 
    type: String, 
    default: 'accent'   // z.B. btn-accent aus eurem Button-Stil
  },
  size: {
    type: String,
    default: 'md'       // optional: sm, md, lg
  }
});

// erzeugt z.B.:
// btn btn-accent btn-md
const buttonClass = `btn btn-${props.variant} btn-${props.size}`;
</script>

<style scoped>
/* Optional: Falls euer globales Button-Styling kein sizing unterstützt */

.btn-md {
  padding: 0.55rem 1.2rem;
  font-size: 1rem;
  border-radius: 8px;
}

.btn-sm {
  padding: 0.35rem 0.8rem;
  font-size: 0.85rem;
  border-radius: 6px;
}

.btn-lg {
  padding: 0.75rem 1.5rem;
  font-size: 1.1rem;
  border-radius: 10px;
}
</style>