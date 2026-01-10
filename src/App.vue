<script setup>
import Navbar from './components/Navbar.vue'
import Footer from './components/Footer.vue'
</script>

<template>
  <div class="layout">
    <Navbar />

    <main class="content">
      <router-view />
    </main>

    <Footer />
  </div>
</template>

<style>
html, body {
  height: 100%;
  margin: 0;
 

}

.layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.content {
  flex: 1; /* füllt den Raum bis zum Footer */
}
</style>