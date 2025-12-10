<template>
  <div class="header">
    <img
      class="logo"
      :src="logo"
      alt="CheckMate Logo"
    />
    <div class="right-Side">
      <button id="lang" @click="toggleLanguage">
        <i class="fa-solid fa-globe"></i> Sprache
      </button>
      <button id="sign" @click="onLoginClick">
        Einloggen
      </button>
    </div>
  </div>
</template>

<script setup>
import logo from '@/assets/img/logoheader2.png';

// Event, das an den Parent (App.vue) gesendet wird
const emit = defineEmits(['open-tutor-list']);

const onLoginClick = () => {
  emit('open-tutor-list');
};

const toggleLanguage = () => {
  const select = document.querySelector('.goog-te-combo');
  if (select) {
    const newValue = select.value === 'en' ? 'de' : 'en';
    select.value = newValue;
    select.dispatchEvent(new Event('change'));
  } else {
    alert(
      'Google Translate konnte noch nicht geladen werden. Bitte kurz warten.'
    );
  }
};
</script>

<style scoped>
 .header {
  background: rgba(255, 255, 255, 0.35); /* Glass-Effekt */
  background-color: #697C44;
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  padding: 0.7rem 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  top: 0;
  z-index: 100;
}

  .logo {
  width: 400px;                  /* Desktopgröße */
  height: auto;
  flex-shrink: 1;                /* darf schrumpfen, wenn zu wenig Platz */
  max-width: 100%;               /* verhindert, dass es den Viewport sprengt */
}

@media (max-width: 750px) {
  .logo {
    content: url('@/assets/img/logofooter.png');
    width: 55px;
  }
}
</style>