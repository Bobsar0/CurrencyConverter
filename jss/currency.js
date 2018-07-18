// PROJECT NAME : CURRENCY CONVERTER 
// AUTHOR       : Steve Onyeneke
// SPONSORS     : Google, Udacity, & Andela as part of the 2018 Google Challenge Scholarship Program...#7DaysofCodeChallenge
// TRACK		: Mobile Web Specialist
//*********************************************************************************************************************************************************/
//TASK: Implement a front-end application in Javascript (>=ES6) that uses the Freecurrencyconverter api to convert one currency to another online or offline
//*********************************************************************************************************************************************************/

/**
 * @author Steve Onyeneke
 * @version 2.0
 * @function initServiceWorker
 * @description Initializes the Service Worker and handles its Registration Event Listeners
 * @param null
 * @returns new Service Worker Registration Object
 */
function initController() {
	console.log("Controller initiated")          
	//Check that user's browser supports IndexedDB
	if (!('indexedDB' in window)) {
		alert('Your browser does not support IndexedDB! Please upgrade to the latest browser version to enjoy Offline Functionality. Chrome most recommended');
	}

	// Registering the ServiceWorker
	if('serviceWorker' in navigator) { //if browser supports the ServiceWorker feature...
		navigator.serviceWorker.register('./sw.js').then(reg => { //If registered successfully,
			console.log("SW successfully registered");
			// If there's a waiting SW, bypass network & fetch currency list from IndexedDB
			if (reg.waiting) {
				console.log("SW waiting!");
				return getDB('currencies').then(allCurrencies => {
					sortCurrencies(allCurrencies)
					console.log('currency.js: ALL CURRENCIES RETURNED SUCCESSFULLY: ', allCurrencies)
				})
			}
			// If there's an installing SW, then it's loading for the first time
			// Fetch currency list from API, then add to database
			else if (reg.installing) {
				console.log("SW Installing..")
				// const req = new Request(`https://free.currencyconverterapi.com/api/v5/currencies`); //creates a new Request object with the url to retrieve currencies from the api passed into it
				fetch(`https://free.currencyconverterapi.com/api/v5/currencies`).then(resp => {
					return resp.json().then(currencies => {
						const currencyObj = Object.entries(currencies.results);
						sorted = sortCurrencies(currencyObj);
						//Add to database
						currencyObj.map(currency => {
							currency = {
								id: currency[1].currencyName,
								value: currency[1],
							};
							addDB('currencies', currency)
						});
						console.log("Add successful!!!!: ", currencyObj)

					}); 
				});           
				//If there is a change in the state of the installing SW
				reg.installing.addEventListener('statechange', () => {
					console.log("SW Installing changed state...")
					if (this.state === 'installed') {//retrieve currencies from database
						console.log("SW Installed!...")
						return getDB('currencies').then(allCurrencies => {
							populateSelect(allCurrencies)
						})
					}
				});
			}
			// If there's an activated worker, bypass network
			// Fetch currency list from IndexedDB
			else if (reg.active.state === 'activated') {
				console.log("SW ACTIVATED!...Getting all currencies")
				return getDB('currencies').then(allCurrencies => {
					populateSelect(allCurrencies)
				})
			}
		});
	}
}
/**
* @function getCurrencies
* @description Fetches sorted Currency list from IDB(offline-first) or API if not present
and populates the currency select-option element
* @param object Array of Currency object (entries)
* @returns Sorted array of Currency object. [[ID1, {currency Object1}], [ID2, {currency Object2}],... ]
*/
// function getCurrencies(){
// 	//Attempt to fetch from idb
// 	return getDB('currencies').then(allCurrencies => {
// 		sortCurrencies(allCurrencies) //sorts and populates currency select fields
// 	}).catch(() => {
// 		// const urlReq = new Request(`https://free.currencyconverterapi.com/api/v5/currencies`); //creates a new Request object with the url to retrieve currencies from the api passed into it
// 		fetch(`https://free.currencyconverterapi.com/api/v5/currencies`).then(urlResp => { //Fetch urlReq resources from the network. This returns a Promise that resolves to the Response (urlResp) to that request
// 			return urlResp.json().then(currencies => {
// 				//console.log("Currencies", currencies); //to check contents of currencies object 
// 				const entries = Object.entries(currencies.results);
// 				//sort by currencyName using sort function
// 				console.log("Entries:: ", entries)
// 				const sorted = sortCurrencies(entries);
// 				sorted.map(currency => {
// 					currency = {
// 						id: currency[0],
// 						value: currency[1],
// 					};
// 					//Add to DB
// 					addDB('currencies', currency)
// 				});
// 				populateSelect(sorted)
// 			}).catch(function(jsonErr){
// 				console.log("getCurrencies: Error in parsing JSON data: ", jsonErr);
// 			});
// 		});
// 	})
// }

/*
 * @function sortCurrencies
 * @description Sorts Currency list 
 * @param object Array of Currency object (entries)
 * @returns Sorted array of Currency object. [[ID1, {currency Object1}], [ID2, {currency Object2}],... ]
 */
function sortCurrencies(currencies) {
	// const entries = Object.entries(currencyObj);
	//sort by currencyName using compare function
	return currencies.sort((a, b) => {
		let currencyA = a[1].currencyName.toUpperCase(); //ignore casing
		let currencyB = b[1].currencyName.toUpperCase(); //ignore casing
		if (currencyA < currencyB){return -1;} //currency A comes first
		if (currencyA > currencyB){return 1;} //name B comes first
		return 0; //names must be equal
	})
}
/**
* @function populateSelect
* @description Populates the currency select-option element
* @param object Array of Currency object (entries)
* @returns null
*/
function populateSelect(currencies){
	console.log('Currencies: ', currencies)
	currencies.forEach(entry => {
		// console.log("Values ENTRY: ", Object.values(entry))
		// console.log(entry.value.currencyName)
		const currencyListFrom_To = document.createElement('option'); //create new instance of list element
		currencyListFrom_To.textContent = `${entry.value.currencyName} (${entry.value.id})`; //updates the html content of the currency list created based on length of array as determined by the line above
		currencyListFrom_To.value = entry.value.id
		
		document.querySelector('select#selectFrom').appendChild(currencyListFrom_To); //adds new currency list to the list of currencies to convert from
		document.querySelector('select#selectTo').appendChild(currencyListFrom_To.cloneNode(true)); //adds new currency list to the list of currencies to convert to
	})
}


/**
 * @function convert
 * @description Fetches exchange rates from API or IndexedDB if offline.
 * @param null
 * @returns exchange rate
 */
function convert(){
	const selectFrom = document.querySelector('select#selectFrom').value; // returns the select Element within the HTML document with id="currencies"
	const selectTo= document.querySelector('select#selectTo').value; // returns the select Element within the HTML document with id="currencies"
			
	const inputAmt = document.getElementById("fromAmount");
	const amount = inputAmt.value; //gets the amount entered by user
	const outputAmt = document.getElementById("toAmount");

	const query = `${selectFrom}_${selectTo}`; //query string
	const url = `https://free.currencyconverterapi.com/api/v5/convert?q=${query}&compact=ultra`; //url
	const urlReq = new Request(url, {method: 'GET'}); //creates a new Request object with the url to retrieve currencies from the api and GET method passed into it
	
	//Fetches the rate from network if successful and updates the IDB. Retrieves the rate from IDB if unsuccessful i.e if offline
	fetch(urlReq).then(resp => { 
		return resp.json().then(data => { // Reads the response stream (resp) and  returns a promise that resolves with the result of parsing the JSON body text.
			outputAmt.value = Number(data[query])*amount;
			document.getElementById('convertResult').innerHTML = `${new Date()}: <br> <span style="color: greenyellow">1</span> ${selectFrom} is equal to <span style="color:greenyellow"><b>${(Number(data[query])).toFixed(2)}</b></span> ${selectTo} <br>
			<h6> <span style="color: goldenrod">${selectFrom}</span> to  <span style="color: goldenrod">${selectTo}</span> conversion rate can now be accessed OFFLINE</h6>`;//displays result on html element with id 'convertResult'
			
			const exchRateObj = {
				id: query,
				rate:  Number(data[query]),
				date: new Date().getTime(), //milliseconds
			};
			//Adding exchange rate object to the object store
			addDB('rates', exchRateObj);
			//Delete record from database after 1hour
			setTimeout(() => {
				deleteDB('rates', exchRateObj.id);
			}, 60*60000);
		}).catch(jsonErr => {console.log("Error in parsing JSON data: ", jsonErr);})
	}).catch(() => { //if fetch fails to retrieve from network:
		console.log("Error in fetching from network, Checking for rate in IDB... ");
		getDB('rates', query).then(val => {
			const output = document.getElementById("toAmount");
			output.value = val*amount;
			document.getElementById('convertResult').innerHTML = `<i><span style="color: red">OFFLINE?</span> Rates will still be displayed!...</i><br> ${new Date()}:<br><span style="color: green">${amount}</span> ${selectFrom} is equal to <span style="color:green"><b>${(val*amount).toFixed(2)}</b></span> ${selectTo}`;//displays result on html element with id 'convertResult'
			console.log("SUCCESSFULLY RETRIEVED FROM DATABASE!!");
			return;
		}).catch(() => {
			const output = document.getElementById("toAmount");
			output.value = null;
			document.getElementById('convertResult').innerHTML = "Are you OFFLINE? <br> Sorry result not in your local IDB yet. Please go back ONLINE asap so it can be updated for your next search";
		})
	});
	console.log("Plotting Graph");
	plotGraph(selectFrom, selectTo);
	$(window).resize(() => { //controls responsiveness of graph during screen resize - jQuery
		plotGraph(selectFrom, selectTo);
	});
}

/**
 * @function swap
 * @description Swaps the FROM/TO selected currencies
 * @param null
 * @returns null
 */
function swap(){
    //Get the 2 elements to be swapped
    let listFrom = document.querySelector('select#selectFrom'); // returns the select Element within the HTML document with id="currencies"
	let listTo= document.querySelector('select#selectTo'); // returns the select Element within the HTML document with id="currencies"
	// SWAP
	temp = listFrom.options[listFrom.selectedIndex]
	listFrom.options[listFrom.selectedIndex].text = listTo.options[listTo.selectedIndex].text;
	listFrom.options[listFrom.selectedIndex].value = listTo.options[listTo.selectedIndex].value;

	listTo.options[listTo.selectedIndex].text= temp.text;
	listTo.options[listTo.selectedIndex].value = temp.value;

	clearToInput();// clear previous output value and result string & graph underneath the convert button
	console.log("SWAPPED CURRENCIES SUCCESSFULLY!");
}
/**
 * @function clearToInput
 * @description //Clears previous output amount value and resultant string displayed
 * @param null
 * @returns null
 */
function clearToInput(){
	document.getElementById("toAmount").value = null;
	document.getElementById("convertResult").innerHTML = "";
	document.getElementById("graph").innerHTML = "";
}