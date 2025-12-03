<script setup>
const props = defineProps({
  type: { type: String, default: 'button' },
  variant: { type: String, default: 'accent' },
  onClick: { type: Function, default: null }
});

const buttonClass = ⁠ btn btn-${props.variant} ⁠;
</script>

<template>
  <button :type="type" :class="buttonClass" @click="onClick">
    <slot />
  </button>
</template>


<style scoped>

.store-btn {
      height: 60px;                 /* gleiche Größe */
      width: auto;
    }

    .store-btn:hover {
      transform: scale(1.05); /* leichtes Vergrößern beim Antippen */
    }
  </style>