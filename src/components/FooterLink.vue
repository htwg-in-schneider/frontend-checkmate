<script setup>
import { computed } from "vue"

const props = defineProps({
  text: { type: String, default: "" },
  label: { type: String, default: "" },
  href: { type: String, required: true },
})

const isExternal = computed(() => /^https?:\/\//.test(props.href))
</script>

<template>
  <!-- Extern: normales <a> -->
  <a
    v-if="isExternal"
    :href="href"
    class="footer-link"
    :aria-label="label"
    target="_blank"
    rel="noopener noreferrer"
  >
    <slot>{{ text }}</slot>
  </a>

  <!-- Intern: RouterLink -->
  <router-link
    v-else
    :to="href"
    class="footer-link"
    :aria-label="label"
  >
    <slot>{{ text }}</slot>
  </router-link>
</template>

<style scoped>
.footer-link {
  color: #555;
  text-decoration: none;
  font-size: 0.95rem;
}

.footer-link:hover {
  color: #000;
}
</style>