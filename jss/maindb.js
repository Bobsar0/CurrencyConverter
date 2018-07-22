//Creating the Database and the object store. See Jake Archibald's idb.js file attached
/**
 * @author Steve Onyeneke
 * @function openDB
 * @description Opens an IDB Database
 * @param null
 * @returns IDB Object (with promise)
 */
 const dbPromise = openDB();
 function openDB(){
    const dbPromise = idb.open('converterDB', 2, upgradeDb => {
        switch (upgradeDb.oldVersion){
            case 0:  // switch executes when the database is first created (oldVersion is 0)
            case 1:
                upgradeDb.createObjectStore('rates', {keyPath: 'id'}) //Create the object store using the callback function. The id property is specified as the keyPath for the object store. Objects here must have an id property and the value must be unique.
                upgradeDb.createObjectStore('currencies', {keyPath: 'currencyName'}) //Create the object store using the callback function. The id property is specified as the keyPath for the object store. Objects here must have an id property and the value must be unique.
            case 2:
            upgradeDb.createObjectStore('graph', {keyPath: 'id'}) //Create the object store using the callback function. The id property is specified as the keyPath for the object store. Objects here must have an id property and the value must be unique.
        }
    });
    return dbPromise;
}

/**
 * @function addDB
 * @description Adds an entry to the corresponding store
 * @param required store: IDB store to be transacted upon (string)
 * @param required entry: data to be added to store (string)
 * @returns Rate or Data from the store
 */
function addDB(store, entry){
    dbPromise.then(db => {
        let tx = db.transaction(store, 'readwrite');
        let entryStore = tx.objectStore(store);
        entryStore.add(entry);
        return tx.complete;
    }).catch(()=>console.log(''));
}

/**
 * @function getDB
 * @description Retrieves rate/graph values from IDB
 * @param required store: IDB store to be transacted upon(string)
 * @param optional key: optional in the case of store.getAll() (string)
 * @returns Rate or Data from the store
 */
function getDB(store, key){
		return dbPromise.then(db => {
		let tx = db.transaction(store, 'readonly');
		let Store = tx.objectStore(store);
		if (store=='currencies'){
				return Store.getAll()
		}
		return Store.get(key);
	}).then(val => {
        if (store=='rates'){
            return val.rate 
        } else if(store=='graph'){
            return val.data
        } else  if (store=='currencies'){
            return val
        }
	});
}
/**
 * @function deleteDB
 * @description Deletes rate/graph values from database after a specific time in secs
 * @param string IDB store to be transacted upon
 * @param string key
 * @returns Rate or Data from the store
 */
function deleteDB(store, key){
	return dbPromise.then(db => {
	let tx = db.transaction(store, 'readwrite');
	let rateStore = tx.objectStore(store);
		rateStore.delete(key);
		return tx.complete;
	}).then(() => {
			if (store=='rates'){
					alert(`${key} rate value deleted from your database. Value will be updated upon next fetch from network`);
			}
	})
}