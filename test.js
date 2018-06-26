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

//Get currencies
function getCurrencies(){
	let currenciesList = document.querySelector('ul#currencies'); // returns the ul Element within the HTML document with id="currencies"
	const urlReq = new Request(`${host}/api/v5/currencies`); //creates a new Request object with the url to retrieve currencies from the api passed into it
    
    fetch(urlReq).then(function(urlResp){ //Fetch urlReq resources from the network. This returns a Promise that resolves to the Response (urlResp) to that request
		return urlResp.json().then(function(currencies){
			//console.log(currencies); //to check contents of currencies object   
			const results = currencies.results

			for (let index in results){
                let curValues = Object.values(results[index]) // assigns an array of the results[index] object's own enumerable property value to curValue
				//console.log(curValues); // to check contents of curValues object
				let currency = document.createElement('li'); //create new instance of list element
				let id = curValues.length < 3 ? curValues[1] : curValues[2]
				currency.innerHTML = `${curValues[0]} -> <b>${id}</b>`; //updates the html content of the currency list created based on length of array

				currenciesList.appendChild(currency); //adds new currency list to the list of currencies
			}
		}).catch(function(jsonErr){
			console.log("Error in parsing JSON data: ", jsonErr)
		})
	}).catch(function(fetchErr){
		console.log("Error in fetching response from network", fetchErr);
	})
}

//Get countries
function getCountries(){
	let countriesList = document.querySelector('ul#countries'); // returns the ul Element within the HTML document with id="countries"
	urlReq = new Request(`${host}/api/v5/countries`);
	fetch(urlReq).then(function(urlResp){ 
		return urlResp.json().then(function(countries){	
			//console.log("Countries object: ", countries); //object of objects of key-value pairs 
			const countryEntries = Object.entries(countries.results); // returns an array of the result object's own enumerable property [key, value] pairs
			console.log("Country entries: ", countryEntries); //object of key-value pairs 

			for(let entry of countryEntries){ //iterates over each value of 'countryEntries'
				//console.log("Country entry: ", entry); //to check content of 'entry' 
				let country = document.createElement('li'); //creates new instance of list element
				country.innerHTML = entry[1].name; //updates the html content of the country list with the name of the country
				countriesList.appendChild(country); //adds new country list to the list of countries
			}
		}).catch(function(jsonErr){
			console.log("Error in parsing JSON data: ", jsonErr)
		})
	}).catch(function(fetchErr){
		console.log("Error in fetching response from network", fetchErr);
	})
}

//CONVERT


// Test function to convert between USD and NGN
function USD_NGN(){
	USD = encodeURIComponent('USD') //encodes 'USD' as a valid URl component
	NGN = encodeURIComponent('NGN') //encodes 'NGN' as a valid URl component

	const query = `${USD}_${NGN}`; //query string
	const url = `${host}/api/v5/convert?q=${query}&compact=ultra`; //url

	const urlReq = new Request(url, {method: 'GET'}); //creates a new Request object with the url to retrieve currencies from the api and GET method passed into it

	fetch(urlReq).then(function(resp){ //Fetch urlReq resources from the network. This returns a Promise that resolves to the Response (urlResp) to that request
		return resp.json().then(function(data){ // Reads the response stream (resp) and  returns a promise that resolves with the result of parsing the body text as JSON.
			//console.log(data); //to check returned data response
			document.getElementById('convert').innerHTML = `1 USD = ${data[query]} NGN`;//displays result on html element with id 'convert'
		}).catch(function(jsonErr){
			console.log("Error in parsing JSON data: ", jsonErr)
		})
	}).catch(function(err){
		console.log('Error in fetching response: ', err);
	})
}

//Listens for a mouse click on the HTML elements with the corresponding IDs and calls corresponding functions
document.getElementById("currencies").addEventListener("click", getCurrencies());
document.getElementById("countries").addEventListener("click", getCountries());
document.getElementById("convert").addEventListener("click", USD_NGN());








	