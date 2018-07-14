//Check that user's browser supports IndexedDB
if (!('indexedDB' in window)) {
     alert('Your browser does not support IndexedDB! Please upgrade to the latest browser version to enjoy Offline Functionality. Chrome or Firefox most recommended');
}

//Creating the Database and the object store
// Open a Database
const dbPromise = idb.open('converterDB', 2, upgradeDb => {
    switch (upgradeDb.oldVersion){
        case 0:  // switch executes when the database is first created (oldVersion is 0)
        case 1:
            console.log('Creating the exchange rates objects store');
            upgradeDb.createObjectStore('rates', {keyPath: 'id'}) //Create the object store using the callback function. The id property is specified as the keyPath for the object store. Objects here must have an id property and the value must be unique.
        case 2:
        console.log('Creating the graph values objects store');
        upgradeDb.createObjectStore('graph', {keyPath: 'id'}) //Create the object store using the callback function. The id property is specified as the keyPath for the object store. Objects here must have an id property and the value must be unique.
    }
});

//To add contents to a store
function addDB(store, exchRate){
    return dbPromise.then(db => {
        let tx = db.transaction(store, 'readwrite');
        let rateStore = tx.objectStore(store);
        rateStore.add(exchRate);
        return tx.complete;	
    }).then(function(){
        if (store=='rates'){
            console.log("IDB: Exchange rate added successfully!");
        } else if(store=='graph'){
            console.log("IDB: Graph values added successfully!");
        }
    });
}

// Retrieves rate/graph values from IDB
function getDB(store, key){
    console.log("IDB: Getting rate: ", key)
	return dbPromise.then(db => {
		let tx = db.transaction(store, 'readonly');
		let rateStore = tx.objectStore(store);
		return rateStore.get(key);
	}).then(val => {
        if (store=='rates'){
            console.log("IDB: Exchange rate fetched from IDB successfully!");
            return val.rate 
        } else if(store=='graph'){
            console.log("IDB: Graph values fetched from IDB successfully!");
            return val.data
        }
	});
}

// Deletes rate/graph values from database after a specific time in secs
function deleteDB(store, key){
    return dbPromise.then(db => {
		let tx = db.transaction(store, 'readwrite');
		let rateStore = tx.objectStore(store);
        rateStore.delete(key);
        return tx.complete;
	}).then(() => {
        if (store=='rates'){
            alert(`${key} rate value deleted from your database. Value will be updated upon access from network`);
        } else if(store=='graph'){
            console.log("IDB: Graph values deleted... Will be updated in IDB upon next fetch from network");
        }
    })
}