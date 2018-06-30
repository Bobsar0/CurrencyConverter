//*********************THE SERVICE WORKER FILE **********************/

// Registering the ServiceWorker
if('serviceWorker' in navigator) { //if browser supports the ServiceWorker feature...
    navigator.serviceWorker.register('/sw.js').then(function(){ //If registered successfully,
        console.log("SW successfully registered");
    }).catch(function(err){ //Otherwise
        console.log("Error in SW registration!", err);
    });   
}

// CACHING

// Creating the cache and adding items to it
let staticCacheName = 'converter-v2'; //TO-DO: VERSIONING

// On the ServiceWorker install event - We cache the HTML, CSS, JS, and any files that make up the application shell. Also cache the currency store from the API URL to quickly populate list of currencies upon document load:
// This event listener triggers when the ServiceWorker is first installed
self.addEventListener('install', function(event) {
    var urlsToCache = [
      '/',
      '/currency.js',
      '/css/style.css',
      '/css/table.css',
      '/css/fontawesome/fontawesome-all.css',
      '/css/webfonts/fa-solid-900.woff2',
      '/img/headerbg.png',
      
      'https://free.currencyconverterapi.com/api/v5/currencies'
    ];
    event.waitUntil(
      // Add the urls from urlsToCache to the cache      
      caches.open(staticCacheName).then(function(cache){ //open up 'converter' cache
          return cache.addAll(urlsToCache); //add urls to cache and return
      })
    );
  });

// Removing outdated caches
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => { //retrieve all cache names
            //Filter and delete previous currency converter cache
            return Promise.all(
                cacheNames.filter(cacheName => {
                    return cacheName.startsWith('converter') && cacheName != staticCacheName;
                }).map(cacheName => {
                    return caches.delete(cacheName);
                })
            );
        })
    )
});

 //Return entry for matching response from cache
// If there isn't, fetch from the network.
self.addEventListener('fetch', function(event) {
    event.respondWith(
        caches.match(event.request).then(function(response){
            if (response){ //If matching response is found in cache
                console.log("Entry found in cache!!!");	
                return response;
            }
            return fetch(event.request); //Otherwise, fetch from network
        }) 
    )
});