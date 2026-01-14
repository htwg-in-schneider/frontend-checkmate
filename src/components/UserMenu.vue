<script setup>
import { useAuth0 } from '@auth0/auth0-vue'

const { isAuthenticated, isLoading, loginWithRedirect, logout, user } = useAuth0()

function login() {
  loginWithRedirect()
}

function doLogout() {
  logout({ logoutParams: { returnTo: window.location.origin } })
}
</script>

<template>
  <div class="user-menu">
    <span v-if="isLoading">...</span>

    <button v-else-if="!isAuthenticated" @click="login">
      Anmelden
    </button>

    <div v-else class="authed">
      <img
        v-if="user?.picture"
        :src="user.picture"
        alt="avatar"
        style="width:32px;height:32px;border-radius:999px;"
      />
      <button @click="doLogout">Abmelden</button>
    </div>
  </div>
</template>