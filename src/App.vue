<script setup>
import Button from './components/Button.vue'
import Navbar from './components/Navbar.vue';
import TutorList from './components/TutorList.vue';
import Footer from './components/Footer.vue';
</script>
<template>
  <Navbar />

  <main>
    <router-view />
  </main>

 
</template>
<router-view></router-view>


<style>
/* Optional: component-spezifische Styles */
</style>