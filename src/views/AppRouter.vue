<script setup>
import { watchEffect } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth0 } from '@auth0/auth0-vue'

const router = useRouter()
const { user, isAuthenticated, isLoading } = useAuth0()
const rolesClaim = user.value?.['https://checkmate.app/roles']
console.log('USER:', user.value)
console.log('ROLES CLAIM:', rolesClaim)

watchEffect(() => {
  if (isLoading.value) return
  if (!isAuthenticated.value) return

  // 👉 HIER wird die Rolle gelesen
  const roles = user.value?.['https://checkmate.app/roles'] || []

  // 👉 HIER entscheidest du, wohin geroutet wird
  if (roles.includes('tutor')) {
    router.replace('/tutor')
  } else {
    router.replace('/student')
  }
})
</script>

<template>
  <div style="min-height:60vh;display:flex;align-items:center;justify-content:center;">
    Weiterleitung...
  </div>
</template>
