// Nama cache unik. Ubah nama ini jika Anda mengupdate aset.
const CACHE_NAME = 'atma-control-v5'; // Versi cache diubah untuk memastikan pembaruan

// Daftar file dan aset yang perlu di-cache saat instalasi.
const ASSETS_TO_CACHE = [
    './gesture.html', 
    './user-guide.html',
    'https://deyiksanjaya.github.io/atma/image1.jpg',
    'https://deyiksanjaya.github.io/atma/image2.jpg',
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

// Event 'fetch': Dijalankan setiap kali aplikasi membuat permintaan jaringan.
self.addEventListener('fetch', (event) => {
    // Kita hanya menangani permintaan GET.
    if (event.request.method !== 'GET') {
        return;
    }

    // Strategi: Network First. Coba ambil dari jaringan dulu.
    // Jika gagal (offline), baru ambil dari cache sebagai fallback.
    event.respondWith(
        fetch(event.request)
            .then((networkResponse) => {
                // Jika berhasil, kita simpan respons ke cache untuk penggunaan di masa depan.
                return caches.open(CACHE_NAME).then((cache) => {
                    // Kita harus mengkloning respons karena respons hanya bisa dibaca sekali.
                    cache.put(event.request, networkResponse.clone());
                    // Kembalikan respons asli dari jaringan ke aplikasi.
                    return networkResponse;
                });
            })
            .catch(() => {
                // Jika permintaan jaringan gagal (misalnya, offline), coba cari di cache.
                console.log(`Network request for ${event.request.url} failed, trying cache.`);
                return caches.match(event.request);
            })
    );
});
