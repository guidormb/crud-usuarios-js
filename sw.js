const CACHE = "crud-v2-login" // <- cambiá v1 por v2
const FILES = ["./", "./index.html", "./login.html", "./style.css", "./main.js", "./storage.js", "./validaciones.js", "./auth.js", "./manifest.json"]

const FILES = ["./", "./index.html", "./style.css", "./main.js", "./storage.js", "./validaciones.js", "./manifest.json"]

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)))
})

self.addEventListener("fetch", e => {
  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request)))
})