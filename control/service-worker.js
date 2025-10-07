// Nama cache unik. Ubah nama ini jika Anda mengupdate aset.
const CACHE_NAME = 'atma-control-v4';

// Daftar file dan aset yang perlu di-cache saat instalasi.
const ASSETS_TO_CACHE = [
    './gesture.html',
    './user-guide.html',
    'https://deyiksanjaya.github.io/atma/image1.jpg',
    'https://deyiksanjaya.github.io/atma/image2.jpg',// Tambahkan ini agar halaman panduan juga offline
    'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=Lora:ital,wght@0,400;0,600&display=swap',
    'https://cdn.tailwindcss.com',
    'https://cdn.jsdelivr.net/npm/qrcodejs@1.0.0/qrcode.min.js',
    'https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js',
    'https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js',
    'https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js',
    'https://support.apple.com/content/dam/edam/applecare/images/en_US/psp/psp_heroes/mini-hero-photos.image.large_2x.png'
];

// Event 'install': Dijalankan saat service worker pertama kali diinstal.
self.addEventListener('install', (event) => {
    // Tunggu sampai semua aset penting berhasil di-cache.
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Service Worker: Caching App Shell');
                return cache.addAll(ASSETS_TO_CACHE);
            })
            .catch(error => {
                console.error('Failed to cache app shell:', error);
            })
    );
});

// Event 'activate': Dijalankan setelah instalasi. Berguna untuk membersihkan cache lama.
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    // Hapus cache lama jika namanya tidak sama dengan CACHE_NAME yang sekarang.
                    if (cacheName !== CACHE_NAME) {
                        console.log('Service Worker: Clearing old cache', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// Event 'fetch': Dijalankan setiap kali aplikasi membuat permintaan jaringan (mis. mengambil gambar, CSS, dll.).
self.addEventListener('fetch', (event) => {
    // Kita hanya menangani permintaan GET, karena permintaan lain (POST ke Firebase) harus selalu online.
    if (event.request.method !== 'GET') {
        return;
    }

    // Strategi: Cache-First. Coba ambil dari cache dulu, jika tidak ada, baru ambil dari jaringan.
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // Jika ditemukan di cache, kembalikan dari cache.
                if (response) {
                    // console.log(`Fetching from cache: ${event.request.url}`);
                    return response;
                }
                // Jika tidak ada di cache, ambil dari jaringan.
                // console.log(`Fetching from network: ${event.request.url}`);
                return fetch(event.request);
            })
    );
});
