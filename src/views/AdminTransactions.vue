<script setup>
import { ref, onMounted } from "vue"
import { useAuth0 } from "@auth0/auth0-vue"

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8081"
const { getAccessTokenSilently } = useAuth0()

const transactions = ref([])
const error = ref(null)

onMounted(async () => {
  try {
    const token = await getAccessTokenSilently()

    const res = await fetch(`${API_BASE}/api/admin/transactions`, {
      headers: { Authorization: `Bearer ${token}` },
    })

    if (!res.ok) throw new Error("Zugriff verweigert")

    transactions.value = await res.json()
  } catch (e) {
    error.value = e.message
  }
})
</script>

<template>
  <div class="container py-4">
    <h1>Alle Transaktionen (Admin)</h1>

    <p v-if="error" class="text-danger">{{ error }}</p>

    <div v-for="t in transactions" :key="t.id" class="border rounded p-3 mb-3">
      <strong>#{{ t.id }}</strong> – {{ t.buyerEmail || "Kein Email" }}  
      <div class="text-muted">{{ t.createdAt }}</div>

      <ul>
        <li v-for="i in t.items" :key="i.id">
          {{ i.tutorName }} – {{ i.startAt }} – {{ i.durationMinutes }} Min – {{ i.price }} €
        </li>
      </ul>

      <strong>Total: {{ t.total }} €</strong>
    </div>
  </div>
</template>