/* IDOL LIFE · çevrimdışı çalışma
   Site güncellendiğinde VERSION'ı (ve index.html'deki ?v= değerlerini) birlikte artır. */
const VERSION = "v34";
const CACHE = "idol-life-" + VERSION;
const CORE = [
  "./",
  "./index.html",
  "./main.js?v=34",
  "./main.css?v=34",
  "./aurora.css?v=34",
  "./aurora-cards.css?v=34",
  "./aurora.js?v=34",
  "./hero.webp",
  "./manifest.webmanifest",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/apple-touch-icon.png",
  "./icons/favicon-32.png"
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(CORE)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith("idol-life-") && k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET" || req.headers.has("range")) return; // müzik akışı ağdan gelsin
  const url = new URL(req.url);

  // Sayfanın kendisi: önce ağ, yoksa kayıtlı kopya
  if (req.mode === "navigate") {
    e.respondWith(
      fetch(req)
        .then((res) => { const copy = res.clone(); caches.open(CACHE).then((c) => c.put("./index.html", copy)); return res; })
        .catch(() => caches.match("./index.html"))
    );
    return;
  }

  // Google yazı tipleri: kayıtlı kopyayı göster, arkada yenile
  if (url.hostname === "fonts.googleapis.com" || url.hostname === "fonts.gstatic.com") {
    e.respondWith(
      caches.open(CACHE).then((c) =>
        c.match(req).then((hit) => {
          const net = fetch(req).then((res) => { if (res.ok || res.type === "opaque") c.put(req, res.clone()); return res; }).catch(() => hit);
          return hit || net;
        })
      )
    );
    return;
  }

  // Sitenin kendi dosyaları: önce kayıtlı kopya, yoksa ağ (ve kaydet)
  if (url.origin === self.location.origin) {
    e.respondWith(
      caches.match(req).then((hit) => hit || fetch(req).then((res) => {
        if (res.ok) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req, copy)); }
        return res;
      }))
    );
  }
});
