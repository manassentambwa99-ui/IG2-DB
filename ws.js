// Service worker — Institut de la Gombe 2 — Espace Scolaire
const CACHE_NAME = "gombe2-espace-scolaire-v1";
const APP_SHELL = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icons/icon-192.png",
  "./icons/icon-512.png"
];

// Installation : on met en cache le "squelette" de l'application
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

// Activation : on nettoie les anciennes versions du cache
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// Stratégie : réseau d'abord pour Firebase (données vivantes),
// cache d'abord pour le reste (interface, icônes) afin que l'app
// s'ouvre même hors connexion ou avec un réseau instable.
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  const isFirebase = url.hostname.includes("firestore.googleapis.com") ||
                      url.hostname.includes("googleapis.com") ||
                      url.hostname.includes("gstatic.com");

  if (isFirebase || event.request.method !== "GET") {
    // Ne pas intercepter les appels Firebase / requêtes non-GET
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request)
        .then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          return response;
        })
        .catch(() => caches.match("./index.html"));
    })
  );
});
