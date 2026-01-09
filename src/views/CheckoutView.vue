<script setup>
import { ref, computed } from "vue"
import { useCartStore } from "@/stores/cart"
import { useAuth0 } from "@auth0/auth0-vue"

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8081"

const cart = useCartStore()
const { isAuthenticated, loginWithRedirect, getAccessTokenSilently } = useAuth0()

const shipping = ref({
  fullName: "",
  address: "",
  city: "",
  zip: "",
  country: "DE",
})

const items = computed(() => cart.items)
const total = computed(() => cart.total)

const submitting = ref(false)
const error = ref(null)
const ok = ref(false)

async function submitOrder() {
  error.value = null
  ok.value = false
  submitting.value = true

  try {
    // Wenn du Checkout nur eingeloggte erlauben willst:
    if (!isAuthenticated.value) {
      await loginWithRedirect({ appState: { target: "/checkout" } })
      return
    }

    const token = await getAccessTokenSilently()

    const payload = {
      shipping: shipping.value,
      items: cart.items,
      total: total.value,
    }

    const res = await fetch(`${API_BASE}/api/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    })

    if (!res.ok) {
      const txt = await res.text().catch(() => "")
      throw new Error(`Backend ${res.status}: ${txt}`)
    }

    ok.value = true
    cart.clear()
  } catch (e) {
    error.value = e?.message ?? String(e)
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="container py-4">
    <h1>Checkout</h1>

    <p v-if="items.length === 0">Warenkorb ist leer.</p>

    <div v-else>
      <h3>Deine Stunden</h3>

      <div v-for="it in items" :key="it.id" class="border rounded p-2 mb-2 d-flex align-items-center">
        <div class="flex-grow-1">
          <strong>{{ it.title }}</strong>
          <div class="text-muted">Menge: {{ it.qty }}</div>
        </div>

        <div class="d-flex gap-2">
          <button class="btn btn-sm btn-outline-secondary" @click="cart.dec(it.id)">-</button>
          <button class="btn btn-sm btn-outline-secondary" @click="cart.inc(it.id)">+</button>
          <button class="btn btn-sm btn-outline-danger" @click="cart.remove(it.id)">Entfernen</button>
        </div>
      </div>

      <h3 class="mt-4">Shipping</h3>
      <input v-model="shipping.fullName" class="form-control mb-2" placeholder="Name" />
      <input v-model="shipping.address" class="form-control mb-2" placeholder="Adresse" />
      <div class="d-flex gap-2">
        <input v-model="shipping.city" class="form-control mb-2" placeholder="Stadt" />
        <input v-model="shipping.zip" class="form-control mb-2" placeholder="PLZ" />
      </div>
      <input v-model="shipping.country" class="form-control mb-2" placeholder="Land" />

      <div class="mt-3"><strong>Total:</strong> {{ total }}</div>

      <button class="btn btn-success mt-3" :disabled="submitting" @click="submitOrder">
        {{ submitting ? "Sende..." : "Buchung abschicken" }}
      </button>

      <p v-if="ok" class="text-success mt-2">Buchung gesendet (basic).</p>
      <p v-if="error" class="text-danger mt-2">{{ error }}</p>
    </div>
  </div>
</template>