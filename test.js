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

//Listens for a mouse click on the HTML element with 'currencies' ID and calls getCurrencies() function upon click
document.getElementById("currencies").addEventListener("click", getCurrencies());






	