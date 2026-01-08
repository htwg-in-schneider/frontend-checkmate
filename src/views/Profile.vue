<script setup>
import { ref, onMounted } from 'vue'
import { useAuth0 } from '@auth0/auth0-vue'

const { isAuthenticated, user, loginWithRedirect, logout, getAccessTokenSilently } = useAuth0()

const backendProfile = ref(null)
const backendError = ref(null)
const loading = ref(false)

async function testProfile() {
  const token = await getAccessTokenSilently()

  const res = await fetch('http://localhost:8081/api/profile', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  console.log('STATUS', res.status)
  console.log(await res.text())
}

async function loadBackendProfile() {
  backendError.value = null
  backendProfile.value = null
  loading.value = true

  try {
    const token = await getAccessTokenSilently()

    const res = await fetch('http://localhost:8081/api/profile', {
      headers: { Authorization: `Bearer ${token}` },
    })

    if (!res.ok) {
      const txt = await res.text().catch(() => '')
      throw new Error(`Backend ${res.status}: ${txt}`)
    }

    backendProfile.value = await res.json()
  } catch (e) {
    backendError.value = e?.message ?? String(e)
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  if (isAuthenticated.value) {
    await loadBackendProfile()
  }
})
</script>