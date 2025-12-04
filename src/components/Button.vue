<script setup>
const props = defineProps({
  type: { type: String, default: 'button' },
  variant: { type: String, default: 'accent' },
  onClick: { type: Function, default: null }
});

//const buttonClass = ⁠btn btn-${props.variant} ⁠;
const buttonClass = `btn btn-${props.variant}`;
</script>


<template>
  <button
    :type="type"
    :class="buttonClass"
    @click="onClick && onClick()"
  >
    <slot />
  </button>
</template>


<style scoped>

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;

  padding: 12px 24px;
  border-radius: 999px; /* wie dein “Jetzt starten”-Button */
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;

  border: none;
  transition: 0.25s ease;
}

/* Deine Varianten */
.btn-accent {
  background: #6a93b0; /* gleiche Farbe wie "Jetzt starten" */
  color: white;
}

.btn-accent:hover {
  background: #6a93b0;
  transform: scale(1.05);
}

/* Falls du später andere Varianten willst */
.btn-secondary {
  background: #e0e0e0;
  color: #333;
}

.btn-secondary:hover {
  transform: scale(1.05);
  background: #d5d5d5;
}
  </style>