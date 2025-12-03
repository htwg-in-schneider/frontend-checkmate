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
import logo from '@/assets/img/logoheader2.jpg';

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
</style>