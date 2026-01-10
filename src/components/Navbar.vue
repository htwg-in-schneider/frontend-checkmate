
<script setup>
import logo from '@/assets/img/logoheader2.png'
import { useAuth0 } from '@auth0/auth0-vue'

import { useCartStore } from "@/stores/cart"
import { computed } from "vue"
import { useRouter } from "vue-router"


const { loginWithRedirect, logout, isAuthenticated, isLoading } = useAuth0()

const onLoginClick = () => {
 loginWithRedirect({
  appState: { target: '/app' }
})
}

const onLogoutClick = () => {
  logout({ logoutParams: { returnTo: window.location.origin } })
}

const toggleLanguage = () => {
  const select = document.querySelector('.goog-te-combo')
  if (select) {
    const newValue = select.value === 'en' ? 'de' : 'en'
    select.value = newValue
    select.dispatchEvent(new Event('change'))
  } else {
    alert('Google Translate konnte noch nicht geladen werden. Bitte kurz warten.')
  }
}


const cart = useCartStore()
const router = useRouter()
const cartCount = computed(() => cart.count)

function goCheckout() {
  router.push("/checkout")
}
</script>
<template>
 

  <div class="header">
  <router-link to="/" class="logo">
    <img class="logo" :src="logo" alt="CheckMate Logo" />
    </router-link>

    <div class="right-Side">
      <button id="lang" @click="toggleLanguage">
        <i class="fa-solid fa-globe"></i> Sprache
      </button>

<button
  v-if="isAuthenticated"
  class="nav-btn position-relative"
  @click="router.push('/checkout')"
>
  🛒
  <span v-if="cartCount > 0" class="cart-badge">{{ cartCount }}</span>
</button>

      <button
        id="sign"
        v-if="!isLoading && !isAuthenticated"
        @click="onLoginClick"
      >
        Einloggen
      </button>

      <button
        id="sign"
        v-else-if="!isLoading && isAuthenticated"
        @click="onLogoutClick"
      >
        Abmelden
      </button>
    </div>
  </div>
</template>



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
.nav-btn {
  background-color: #c5bfb3;
  color: #697C44;
  border: none;
  border-radius: 10px;
  padding: 8px 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
}


</style>