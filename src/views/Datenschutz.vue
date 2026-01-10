<template>
  <div class="page">
    <div class="container">
      <h1>Datenschutzerklärung</h1>
      <p class="subtitle">
        Hier erklären wir dir einfach & transparent, welche Daten in CheckMate verarbeitet werden.
      </p>

      <section class="card">
        <h2>1) Verantwortliche Stelle</h2>
        <p>
          <strong>CheckMate (Projekt im Rahmen der Lehrveranstaltung Web-Technologien)</strong><br />
          HTWG Konstanz<br />
          Kontakt: <a href="mailto:ja591dau@htwg-konstanz.de">ja591dau@htwg-konstanz.de</a> /
          <a href="mailto:th591ngu@htwg-konstanz.de">th591ngu@htwg-konstanz.de</a>
        </p>
      </section>

      <section class="card">
        <h2>2) Welche Daten verarbeiten wir?</h2>
        <ul>
          <li><strong>Login-Daten</strong> (über Auth0): z.B. Nutzer-ID („sub“), Name, E-Mail (falls von Auth0 bereitgestellt)</li>
          <li><strong>Buchungs-/Warenkorb-Daten</strong>: Tutor, Termin-Vorschlag, Dauer, Preis (im Browser gespeichert)</li>
          <li><strong>Technische Daten</strong>: z.B. Datum/Uhrzeit von Requests (Server-Logs – je nach Hosting/IDE)</li>
          <li><strong>Kontakt</strong>: Wenn du das Kontaktformular nutzt, wird dein Mailprogramm geöffnet (mailto)</li>
        </ul>
      </section>

      <section class="card">
        <h2>3) Auth0 Login (Drittanbieter)</h2>
        <p>
          Für Login/Authentifizierung nutzen wir <strong>Auth0</strong>. Dabei verarbeitet Auth0 personenbezogene Daten, die
          für den Login notwendig sind (z.B. E-Mail oder Nutzer-ID). Nach dem Login erhält unsere Anwendung ein Token (JWT),
          um geschützte Bereiche aufzurufen.
        </p>
        <p class="note">
          Hinweis: Welche Daten Auth0 genau verarbeitet, hängt von eurer Auth0-Konfiguration und der gewählten Login-Methode ab.
        </p>
      </section>

      <section class="card">
        <h2>4) Warenkorb / localStorage</h2>
        <p>
          Der Warenkorb wird in deinem Browser in <strong>localStorage</strong> gespeichert, damit er auch nach einem Reload
          oder einem Auth0-Redirect erhalten bleibt.
        </p>
        <ul>
          <li>Was wird gespeichert? z.B. Tutor, Termin-Vorschlag, Dauer, Preis, Notiz</li>
          <li>Wo? Nur lokal in deinem Browser (nicht automatisch bei uns auf dem Server)</li>
        </ul>

        <button class="btn" @click="clearLocalCart">
          Warenkorb-Daten im Browser löschen 🧹
        </button>
        <p v-if="cleared" class="ok">✅ localStorage-Warenkorb wurde gelöscht.</p>
      </section>

      <section class="card">
        <h2>5) Buchung / Checkout & Backend</h2>
        <p>
          Wenn du im Checkout eine Buchung absendest, wird ein Payload an unser Backend gesendet (z.B. gebuchte Stunde,
          Termin-Vorschlag, Dauer, Preis). Je nach Implementierung wird das im Backend protokolliert oder gespeichert.
        </p>
        <p class="note">
          Diese WebApp ist ein Hochschulprojekt. Es gibt aktuell keine Zahlung, keine Verifizierung und keine rechtsverbindliche Buchungsbestätigung.
        </p>
      </section>

      <section class="card">
        <h2>6) Kontaktformular</h2>
        <p>
          Unser Kontaktformular nutzt einen <strong>mailto-Link</strong>. Das heißt:
        </p>
        <ul>
          <li>Dein Mailprogramm wird geöffnet</li>
          <li>Die Nachricht wird erst versendet, wenn du sie in deinem Mailprogramm abschickst</li>
          <li>Wir speichern über das Formular keine Nachrichten serverseitig</li>
        </ul>
      </section>

      <section class="card">
        <h2>7) Cookies</h2>
        <p>
          Wir setzen selbst keine Tracking-Cookies. Auth0 kann technisch notwendige Cookies einsetzen, um Login/Session zu ermöglichen
          (abhängig von Konfiguration und Browser).
        </p>
      </section>

      <section class="card">
        <h2>8) Deine Rechte</h2>
        <p>Du hast grundsätzlich folgende Rechte (je nach Kontext und soweit anwendbar):</p>
        <ul>
          <li>Auskunft über gespeicherte Daten</li>
          <li>Berichtigung</li>
          <li>Löschung</li>
          <li>Einschränkung der Verarbeitung</li>
          <li>Widerspruch</li>
        </ul>
        <p>
          Schreib uns dazu einfach:
          <a href="mailto:ja591dau@htwg-konstanz.de">ja591dau@htwg-konstanz.de</a>
          oder
          <a href="mailto:th591ngu@htwg-konstanz.de">th591ngu@htwg-konstanz.de</a>
        </p>
      </section>

      <section>
        <p>Stand: {{ today }}</p>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue"

const cleared = ref(false)
const today = computed(() => new Date().toLocaleDateString("de-DE"))

function clearLocalCart() {
  // passt zu deinem cart.js:
  localStorage.removeItem("checkmate_cart_v1")
  cleared.value = true
  setTimeout(() => (cleared.value = false), 2500)
}
</script>

<style scoped>
.page {
  background: #ffffff;
  min-height: 100vh;
  padding: 2.5rem 1rem 4rem;
}

.container {
  width: min(95%, 900px);
  margin: 0 auto;
}

h1 {
  font-size: 2.2rem;
  margin-bottom: 0.5rem;
}

.subtitle {
  color: #444;
  margin-bottom: 1.5rem;
  line-height: 1.5;
}

.card {
  background: #F3EFDF;
  border-radius: 18px;
  padding: 1.2rem 1.2rem;
  margin-bottom: 1rem;
  box-shadow: 0 4px 18px rgba(0,0,0,0.08);
}

.card h2 {
  margin-top: 0;
  font-size: 1.25rem;
}

.card p, .card li {
  line-height: 1.55;
}

a {
  color: #2b4a1d;
  font-weight: 600;
  text-decoration: none;
}
a:hover {
  text-decoration: underline;
}

.note {
  font-size: 0.95rem;
  color: #333;
  opacity: 0.9;
}

.btn {
  margin-top: 0.6rem;
  border: none;
  background: #697C44;
  color: white;
  padding: 0.7rem 1rem;
  border-radius: 999px;
  cursor: pointer;
  transition: 0.2s;
}
.btn:hover {
  filter: brightness(0.95);
}

.ok {
  margin-top: 0.6rem;
  color: #1b5e20;
  font-weight: 600;
}
</style>