const APP_PREFIX = 'BudgetTracker-';
const VERSION = 'version_01';
const CACHE_NAME = APP_PREFIX + VERSION;
const FILES_TO_CACHE = [
    './index.html',
    './css/styles.css',
    './js/index.js'
];

// Install new Service Worker(if one isnt installed already) -- Cache resources
self.addEventListener('install', function(e) {
    console.log('1');
    e.waitUntil(
        caches.open(CACHE_NAME).then(function(Cache) {
            console.log('2');
            console.log('installing cache : ' + CACHE_NAME)
            console.log('3');
            return Cache.addAll(FILES_TO_CACHE);
        })
    )
})

// Delete outdated caches
self.addEventListener('activate', function(e) {
    e.waitUntil(
        caches.keys().then(function(keyList) {
            let cacheKeeplist = keyList.filter(function(key) {
                return key.indexOf(APP_PREFIX);
            })
            cacheKeeplist.push(CACHE_NAME);

            return Promise.all(
                keyList.map(function(key, i) {
                    if (cacheKeeplist.indexOf(key) === -1) {
                        console.log('Deleting cache : ' + keyList[i]);
                        return caches.delete(keyList[i]);
                    }
                })
            );
        })
    );
});

// Respond with cache resources when offline
self.addEventListener('fetch', function(e) {
    console.log('fetch request : ' + e.request.url)
    e.respondWith(
        caches.match(e.request).then(function(request) {
            if (request) {
                console.log('Responding with cache : ' + e.request.url)
                return request;
            } else {
                console.log('File is not cached, fetching : ' + e.request.url)
                return fetch(e.request);
            }
        })
    )
})