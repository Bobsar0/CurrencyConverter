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
        './',
        './jss/idb.js',
        './jss/maindb.js',
        './jss/currency.js',
        './jss/jscharts.js',
        './jss/graph.js',
        './css/style.css',
        './css/form.css',
        './css/fontawesome/fontawesome-all.css',
        './css/webfonts/',
        './img/headerbg.png',
        './img/swap5.png',
        
        'https://free.currencyconverterapi.com/api/v5/currencies',
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
self.addEventListener('fetch', event => {
    // console.log("Event: ", event);
    // console.log("Event Request: ", event.request);
    event.respondWith(      
        caches.match(event.request).then(function(response){
            // if (event.request.url.endsWith(".js")){
                // event.request.headers{ "Content-Type": "application/json" }
            // }
            if (response){ //If matching response is found in cache
                console.log("SW: Entry found in cache!!!");	
                return response;
            }
            return fetch(event.request)
            // return fetch(event.request).then(function(resp){ //Otherwise, fetch from network
            //     if (resp.status === 404){
            //         console.log("SW: 404 error! Displaying custom image...")
            //         fetch('./img/404.gif'); //return custom 404 page
            //     }
            // }).catch(err=>console.log("SW fetch from network: Failed!", err)) 
        })
    );
});
