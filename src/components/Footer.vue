<script setup>
import FooterLink from './FooterLink.vue';
</script>

<template>
  <footer class="footer">
    <div class="footer-content">
      <div class="footer-logo">
        <img src="@/assets/img/logofooter.png" alt="CheckMate Logo" />
      </div>

      <!-- Links: jetzt mit FooterLink-Komponente -->
      <nav class="footer-links">
        <FooterLink text="About" label="Über uns" href="/about" />
        <span aria-hidden="true" class="divider">|</span>

        <FooterLink text="FAQ" label="FAQ" href="/faq" />
        <span aria-hidden="true" class="divider">|</span>

        <FooterLink text="Kontakt" label="Kontakt" href="/kontakt" />
        <span aria-hidden="true" class="divider">|</span>

        <FooterLink text="Impressum" label="Impressum" href="/impressum" />
      </nav>

      <!-- Social Icons – ebenfalls mit FooterLink-Komponente -->
      <div class="footer-socials">
        <FooterLink
          text=""
          label="Instagram"
          href="https://instagram.com"
        >
          <i class="fa-brands fa-instagram"></i>
        </FooterLink>

        <FooterLink
          text=""
          label="LinkedIn"
          href="https://linkedin.com"
        >
          <i class="fa-brands fa-linkedin"></i>
        </FooterLink>

        <FooterLink
          text=""
          label="GitHub"
          href="https://github.com"
        >
          <i class="fa-brands fa-github"></i>
        </FooterLink>
      </div>
    </div>

    <div class="footer-bottom">
      <p>©️ 2025 CheckMate • Gemeinsam schlauer lernen</p>
    </div>
  </footer>
</template>

<style scoped>
.footer-links,
.footer-socials {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.divider {
  color: #aaa;
}

.footer-socials i {
  font-size: 1.3rem;
  color: #aaa;
}

.footer-socials i:hover {
  color: #ff6600;
}
</style>