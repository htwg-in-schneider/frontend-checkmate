import { defineStore } from "pinia"

const KEY = "checkmate_cart_v1"

function load() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]")
  } catch {
    return []
  }
}

export const useCartStore = defineStore("cart", {
  state: () => ({
    items: load(),
  }),

  getters: {
    count: (s) => s.items.reduce((sum, i) => sum + i.qty, 0),
    total: (s) => s.items.reduce((sum, i) => sum + (i.price ?? 0) * i.qty, 0),
  },

  actions: {
    persist() {
      localStorage.setItem(KEY, JSON.stringify(this.items))
    },

    add(lesson) {
      // lesson = { id, title, tutorId, tutorName, subject, image?, price? }
      const existing = this.items.find((x) => x.id === lesson.id)
      if (existing) existing.qty += 1
      else this.items.push({ ...lesson, qty: 1 })

      this.persist()
    },

    inc(id) {
      const it = this.items.find((x) => x.id === id)
      if (!it) return
      it.qty += 1
      this.persist()
    },

    dec(id) {
      const it = this.items.find((x) => x.id === id)
      if (!it) return
      it.qty -= 1
      if (it.qty <= 0) this.items = this.items.filter((x) => x.id !== id)
      this.persist()
    },

    remove(id) {
      this.items = this.items.filter((x) => x.id !== id)
      this.persist()
    },

    clear() {
      this.items = []
      this.persist()
    },
  },
})