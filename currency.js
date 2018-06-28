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

// /let chosenFrom, chosenTo;
let selectedFrom, selectedTo;

//Get currencies
function getCurrencies(){
	let id;

	let currenciesListFrom = document.querySelector('select#selectFrom'); // returns the select Element within the HTML document with id="currencies"
	let currenciesListTo= document.querySelector('select#selectTo'); // returns the select Element within the HTML document with id="currencies"
   
	//let currencyListFrom, currencyListTo;
    const urlReq = new Request(`${host}/api/v5/currencies`); //creates a new Request object with the url to retrieve currencies from the api passed into it
    
    fetch(urlReq).then(urlResp => { //Fetch urlReq resources from the network. This returns a Promise that resolves to the Response (urlResp) to that request
		return urlResp.json().then(currencies=>{
			console.log("Currencies", currencies); //to check contents of currencies object   
			//const results = currencies.results;

                for (let index in currencies.results){
                    //console.log("Currency values", curValues); // to check contents of curValues object
                    let currencyListFrom = document.createElement('option'); //create new instance of list element
                    let currencyListTo = document.createElement('option'); //create new instance of list element
                   
                    let curValues = Object.values(currencies.results[index]); // assigns an array of the results[index] object's own enumerable property value to curValue
					id = curValues.length < 3 ? curValues[1] : curValues[2];

					currencyListFrom.innerHTML = `${curValues[0]} <=> ${id}`; //updates the html content of the currency list created based on length of array as determined by the line above
                    currencyListTo.innerHTML = `${curValues[0]} <=> ${id}`; //updates the html content of the currency list created based on length of array as determined by the line above

					currenciesListFrom.appendChild(currencyListFrom); //adds new currency list to the list of currencies to convert from
                    currenciesListTo.appendChild(currencyListTo); //adds new currency list to the list of currencies to convert to
				}
				// reference to selected option
				let optionFrom = currenciesListFrom.options[currenciesListFrom.selectedIndex]; //gets the selected option
				let selectedFromText = optionFrom.text;
				selectedFrom = selectedFromText.slice(-3, ); //selects the id part to be used in conversion function
				let optionTo = currenciesListTo.options[currenciesListTo.selectedIndex];
				let selectedToText = optionTo.text
				selectedTo = selectedToText.slice(-3, );
			
				// console.log("select selected from", selectedFromText);
				// console.log("options id selected to", selectedTo);
				
            }).catch(function(jsonErr){
                console.log("Error in parsing JSON data: ", jsonErr);
		})
	}).catch(function(fetchErr){
		console.log("Error in fetching response from network", fetchErr);
	})
}
//getCurrencies();

//CONVERT
function convert(){
	getCurrencies();
	  console.log("from/to: ", selectedFrom, selectedTo);
	const fromEncoded = encodeURIComponent(selectedFrom); //encodes 'USD' as a valid URl component
  	const toEncoded = encodeURIComponent(selectedTo); //encodes 'NGN' as a valid URl component
  
    const inputAmt = document.getElementById("fromAmount");
	const amount = inputAmt.value; //gets the amount entered by user
//console.log("Amount ===", amount);
	const outputAmt = document.getElementById("toAmount");

	const query = `${fromEncoded}_${toEncoded}`; //query string
	console.log("Query: ", query);

	const url = `${host}/api/v5/convert?q=${query}&compact=ultra`; //url
	const urlReq = new Request(url, {method: 'GET'}); //creates a new Request object with the url to retrieve currencies from the api and GET method passed into it
	fetch(urlReq).then(function(resp){ //Fetch urlReq resources from the network. This returns a Promise that resolves to the Response (urlResp) to that request
		return resp.json().then(function(data){ // Reads the response stream (resp) and  returns a promise that resolves with the result of parsing the body text as JSON.
			//console.log(data); //to check returned data response
			outputAmt.value = Number(data[query])*amount;

			document.getElementById('convertResult').innerHTML = `${amount} ${selectedFrom} is equal to <b>${Number(data[query])*amount}</b> ${selectedTo}`;//displays result on html element with id 'convert'
			console.log("RESULT IS:", Number(data[query])*amount);

		}).catch(function(jsonErr){
			console.log("Error in parsing JSON data: ", jsonErr)
		})
	}).catch(function(err){
		console.log('Error in fetching response: ', err);
	})
}

//Listens for a mouse click on the HTML elements with the corresponding IDs and calls corresponding functions
//document.getElementById("fromSelect").addEventListener("click", getCurrencies());
//document.getElementById("toSelect").addEventListener("click", getCurrencies());

// document.getElementById("countries").addEventListener("click", getCountries());
// document.getElementById("convert").addEventListener("click", convert());








	