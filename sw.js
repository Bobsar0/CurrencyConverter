//*********************THE SERVICE WORKER FILE **********************/

// The ServiceWorker is registered in the controller file

// Creating the cache and adding items to it
const staticCacheName = 'converter-v2'; //TO-DO: VERSIONING

// On the ServiceWorker install event - We cache the HTML, CSS, JS, and any files that make up the application shell. Also cache the currency store from the API URL to quickly populate list of currencies upon document load:
// This event listener triggers when the ServiceWorker is first installed
self.addEventListener('install', event => {
    let urlsToCache = [
        './',
        './index.html',
        './sw.js',
        './jss/idb.js',
        './jss/maindb.js',
        './jss/controller.js',
        './jss/currency.js',
        './jss/chart/graph.js',
        './jss/chart/jquery-3.3.1.min.js',
        './css/style.css',
        './css/form.css',
        './css/fontawesome/fontawesome-all.css',
        './css/webfonts/',
        './img/headerbg.png',
        './img/swap5.png',
        'https://free.currencyconverterapi.com/api/v5/currencies',
        // 'https://www.gstatic.com/charts/loader.js'
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
            //Filter and delete previous currency converter cache(s)
            return Promise.all(
                cacheNames.filter(cacheName => {
                    return cacheName.startsWith('converter-') && cacheName != staticCacheName;
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
    event.respondWith(  
        caches.open(staticCacheName).then(cache => {
            return cache.match(event.request.url).then(response => {
                if (response){ //If matching response is found in cache
                    console.log("SW: Entry found in cache for request URL: ",event.request.url);	
                    return response;
                }
                //Attempt to fetch from network if the item is not matched in cache
                // return fetch(event.request)
                return fetch(event.request).then(resp => { //Otherwise, fetch from network
                    if (resp.status == 404){
                        console.log("SW: 404 error! Displaying custom image...")
                        // return fetch('./img/404.gif'); //return custom 404 page or...
                        return new Response(`<div style="min-height:400px; background:url('./img/headerbg.png') no-repeat center;
                                                background-size:cover; text-align: center; color: #fcfcfc">
                                                <div style='margin-top: 40px'><h1 style="margin-top: 40px; font-size: 35px; margin-bottom: 10px; text-shadow: 2px 2px 4px #000000";>
                                                    SORRY<br><br>The page you are trying to access does not exist anywhere in this Universe!...</h1>
                                                </div>
                                            </div>
                                            <div><h3>Please click <a href="./">HERE</a> to return to the Home Page</h3></div>`,
                            {headers: {'content-type': 'text/html'}}
                        )
                    }
                    return resp;
                })
            });
        })    
    );
});
