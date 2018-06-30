//Check that user's browser supports IndexedDB
if (!('indexedDB' in window)) {
     alert('Your browser does not support IndexedDB! Please upgrade to the latest browser version to enjoy Offline Functionality. Chrome or Firefox most recommended');
}

//Creating the Database and the object store
// Open a Database
let dbPromise = idb.open('converterDB', 1, upgradeDb => {
    switch (upgradeDb.oldVersion){
        case 0:  // switch executes when the database is first created (oldVersion is 0)
        case 1:
            console.log('Creating the exchange rates objects store');
            upgradeDb.createObjectStore('rates', {keyPath: 'id'}) //Create the object store using the callback function. The id property is specified as the keyPath for the object store. Objects here must have an id property and the value must be unique.
        }
});

// Retrieves rate from IDB
function getRateDB(key){
	return dbPromise.then(db => {
		let tx = db.transaction('rates', 'readonly');
		let rateStore = tx.objectStore('rates');
		return rateStore.get(key);
	}).then(val => {
		return val.rate 
	});
}