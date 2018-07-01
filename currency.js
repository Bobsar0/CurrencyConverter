// PROJECT NAME : CURRENCY CONVERTER 
// AUTHOR       : Steve Onyeneke
// SPONSORS     : Google, Udacity, & Andela as part of the 2018 Google Challenge Scholarship Program...#7DaysofCodeChallenge
// TRACK		: Mobile Web Specialist
//*********************************************************************************************************************************************************/
//TASK: Implement a front-end application in Javascript (>=ES6) that uses the Freecurrencyconverter api to convert one currency to another online or offline
//*********************************************************************************************************************************************************/
// TO-DO LIST
// - Create basic UI
// - Interface basic UI to API to test/ensure API calls can be made and the results retrieved successfully:
// - Customize UI to include currency conversion functionality
// - Implement offline mode - (ServiceWorker, IndexedDB, Cache API)
// - Enhance UI to include extra functionalities

//*************** TESTING CALLS TO THE APIs *****************/

const host = "https://free.currencyconverterapi.com" //API url host

let selectedFrom, selectedTo;

//Get currencies
function getCurrencies(){
	let id;

	let currenciesListFrom = document.querySelector('select#selectFrom'); // returns the select Element within the HTML document with id="currencies"
	let currenciesListTo= document.querySelector('select#selectTo'); // returns the select Element within the HTML document with id="currencies"

    const urlReq = new Request(`${host}/api/v5/currencies`); //creates a new Request object with the url to retrieve currencies from the api passed into it
    
    fetch(urlReq).then(urlResp => { //Fetch urlReq resources from the network. This returns a Promise that resolves to the Response (urlResp) to that request
		return urlResp.json().then(currencies => {
			//console.log("Currencies", currencies); //to check contents of currencies object   
			for (let index in currencies.results){
				//console.log("Currency values", curValues); // to check contents of curValues object
				let currencyListFrom = document.createElement('option'); //create new instance of list element
				let currencyListTo = document.createElement('option'); //create new instance of list element
				
				let curValues = Object.values(currencies.results[index]); // assigns an array of the results[index] object's own enumerable property value to curValue
				id = curValues.length < 3 ? curValues[1] : curValues[2];

				currencyListFrom.innerHTML = `${id}   <=>    ${curValues[0]}`; //updates the html content of the currency list created based on length of array as determined by the line above
				currencyListTo.innerHTML = `${id}   <=>    ${curValues[0]}`; //updates the html content of the currency list created based on length of array as determined by the line above

				currenciesListFrom.appendChild(currencyListFrom); //adds new currency list to the list of currencies to convert from
				currenciesListTo.appendChild(currencyListTo); //adds new currency list to the list of currencies to convert to
			}
			// reference to selected option
			let optionFrom = currenciesListFrom.options[currenciesListFrom.selectedIndex]; //gets the selected option
			let selectedFromText = optionFrom.text;
			selectedFrom = selectedFromText.slice(0, 3); //selects the id part to be used in conversion function below
			let optionTo = currenciesListTo.options[currenciesListTo.selectedIndex];
			let selectedToText = optionTo.text
			selectedTo = selectedToText.slice(0, 3);				
            }).catch(function(jsonErr){
                console.log("Error in parsing JSON data: ", jsonErr);
		});
	});
}

//CONVERT
function convert(){
	getCurrencies(); //selectedFrom and selectedTo are assigned selected values here
	const fromEncoded = encodeURIComponent(selectedFrom); //encodes 'USD' as a valid URl component
  	const toEncoded = encodeURIComponent(selectedTo); //encodes 'NGN' as a valid URl component
  
    const inputAmt = document.getElementById("fromAmount");
	const amount = inputAmt.value; //gets the amount entered by user
	const outputAmt = document.getElementById("toAmount");

	const query = `${fromEncoded}_${toEncoded}`; //query string
	const url = `${host}/api/v5/convert?q=${query}&compact=ultra`; //url
	const urlReq = new Request(url, {method: 'GET'}); //creates a new Request object with the url to retrieve currencies from the api and GET method passed into it
	
	//Fetch urlReq resources from the network. This returns a Promise that resolves to the Response (urlResp) to that request
	//Fetches the rate from network if successful and updates the IDB. Retrieves the rate from IDB if unsuccessful i.e if offline
	fetch(urlReq).then(resp => { 
		return resp.json().then(data => { // Reads the response stream (resp) and  returns a promise that resolves with the result of parsing the JSON body text.
			//console.log("dataaaa: ", data); //to check returned data response
			outputAmt.value = Number(data[query])*amount;

			document.getElementById('convertResult').innerHTML = `<span style="color: green">${amount}</span> ${selectedFrom} is equal to <span style="color:green"><b>${(Number(data[query])*amount).toFixed(2)}</b></span> ${selectedTo}`;//displays result on html element with id 'convertResult'

			//Adding exchange rate objects to the object store
			dbPromise.then(db => {
				let tx = db.transaction('rates', 'readwrite');
				let rateStore = tx.objectStore('rates');
				let exchRate = {
					url: url,
					id: `${selectedFrom}_${selectedTo}`,
					rate:  Number(data[query]),
				   	date: new Date().getTime()
				};
				//console.log('Adding rate to IDB... ', exchRate);
				rateStore.add(exchRate);
				return tx.complete;	
			}).then(function(){
				console.log("Rate added successfully!");
			});
		}).catch(jsonErr => {console.log("Error in parsing JSON data: ", jsonErr);})
	}).catch(function(){ //if fetch fails to retrieve from network:
		console.log("Error in fetching from network, Checking for rate in IDB... ");
		getRateDB(query).then(function(val){
			let output = document.getElementById("toAmount");
			output.value = val*amount;
			document.getElementById('convertResult').innerHTML = `<span style="color: green">${amount}</span> ${selectedFrom} is equal to <span style="color:green"><b>${(Number(data[query])*amount).toFixed(2)}</b></span> ${selectedTo}`;//displays result on html element with id 'convertResult'
			console.log("SUCCESSFULLY RETRIEVED FROM DATABASE!!");
			return;
		}).catch(function(){
			console.log("Result not yet in IDB. Please go online to update the database");
			let output = document.getElementById("toAmount");
			output.value = undefined;
			document.getElementById('convertResult').innerHTML = "Sorry result not in your local IDB yet. Get back online asap so it can be updated for your next search";
		})
	 });
}

function swap(){
	console.log("Swapping initiated!...")
    
    //Get the 2 elements to be swapped (a,b)
    let listFrom = document.querySelector('select#selectFrom'); // returns the select Element within the HTML document with id="currencies"
	let listTo= document.querySelector('select#selectTo'); // returns the select Element within the HTML document with id="currencies"
	let fromOption = listFrom.options[listFrom.selectedIndex]
	let selectFromText = fromOption.text;

	let toOption = listTo.options[listTo.selectedIndex];
	let selectToText = toOption.text;

	listFrom.options[listFrom.selectedIndex].text = selectToText;
	selectedFrom = selectToText.slice(0, 3); //selects the id part to be used in conversion function below

	listTo.options[listTo.selectedIndex].text = selectFromText;
	selectedTo = selectFromText.slice(0, 3); //selects the id part to be used in conversion function below

	clearToInput();// clear previous output value and result string underneath the convert button

	console.log("SWAPPED CURRENCIES SUCCESSFULLY!");
}

//Clears previous output amount value and resultant string displayed
function clearToInput(){
	document.getElementById("toAmount").value = null;
	document.getElementById("convertResult").innerHTML = "";
}