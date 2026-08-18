const CACHE_NAME = "minhas-financas-v1";

const FILES_TO_CACHE = [
  "./",
  "./index.html",
  "./manifest.json",
  "./service-worker.js",
  "./icons/icon-192.png",
  "./icons/icon-512.png"
];


// ==========================================
// INSTALAÇÃO
// ==========================================

self.addEventListener(
  "install",
  event => {

    console.log(
      "Instalando Service Worker..."
    );

    event.waitUntil(

      caches.open(CACHE_NAME)
        .then(cache => {

          return cache.addAll(
            FILES_TO_CACHE
          );

        })

    );

    self.skipWaiting();
  }
);


// ==========================================
// ATIVAÇÃO
// ==========================================

self.addEventListener(
  "activate",
  event => {

    event.waitUntil(

      caches.keys()
        .then(cacheNames => {

          return Promise.all(

            cacheNames
              .filter(
                cacheName =>
                  cacheName !== CACHE_NAME
              )
              .map(
                cacheName =>
                  caches.delete(cacheName)
              )
          );

        })

    );

    self.clients.claim();
  }
);


// ==========================================
// FUNCIONAMENTO OFFLINE
// ==========================================

self.addEventListener(
  "fetch",
  event => {

    if (
      event.request.method !== "GET"
    ) {
      return;
    }

    event.respondWith(

      caches.match(event.request)
        .then(cachedResponse => {

          if (cachedResponse) {
            return cachedResponse;
          }

          return fetch(event.request)
            .then(networkResponse => {

              if (
                !networkResponse ||
                networkResponse.status !== 200 ||
                networkResponse.type === "opaque"
              ) {
                return networkResponse;
              }

              const responseClone =
                networkResponse.clone();

              caches.open(CACHE_NAME)
                .then(cache => {

                  cache.put(
                    event.request,
                    responseClone
                  );

                });

              return networkResponse;

            })
            .catch(() => {

              return caches.match(
                "./index.html"
              );

            });

        })

    );
  }
);
