<script setup>
import logo from '@/assets/img/logofooter.png';
</script>

<template>
  <a :href="href" class="footer-link" :aria-label="label">
    {{ text }}
  </a>
</template>

<style scoped>
.footer {
  background: #f7f7f7;
  padding: 2rem 1rem;
  margin-top: 4rem;
  border-top: 1px solid #ddd;
  font-family: "Poppins", sans-serif;
}

.footer-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 2rem;
}

.footer-logo img {
  width: 120px;
  height: auto;
}

.footer-links {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.footer-link {
  color: #555;
  text-decoration: none;
  font-size: 0.95rem;
}

.footer-link:hover {
  color: #000;
}

.footer-socials {
  display: flex;
  gap: 1rem;
}

.footer-social i {
  font-size: 1.4rem;
  color: #444;
  transition: 0.2s;
}

.footer-social i:hover {
  color: #000;
}

.footer-bottom {
  text-align: center;
  margin-top: 2rem;
  font-size: 0.85rem;
  color: #666;
}

@media (max-width: 600px) {
  .footer-content {
    flex-direction: column;
    text-align: center;
  }
}
</style>