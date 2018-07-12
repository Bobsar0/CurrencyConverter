//Plots the graph of history of the selected currencies

function plotGraph(){
    // *********GET GRAPH DATA*********
	const fromEncoded = encodeURIComponent(selectedFrom); //encodes 'USD' as a valid URl component
  	const toEncoded = encodeURIComponent(selectedTo); //encodes 'NGN' as a valid URl component
    const query = `${fromEncoded}_${toEncoded}`; //query string
    if (query == 'NGN_BTC'){
        alert(`Cannot generate graph of ${fromEncoded} to ${toEncoded} due to insignificant rate value`);
        return;
    }
    const graphTitle=`Plot of ${fromEncoded} to ${toEncoded} over a Week`;

    //Get required Date format
    const d = new Date();
    const yr = d.getFullYear(); //gets current yr as number
    let endM = d.getMonth()+1; //gets current month as number(zero-based index)
    let startM = d.getMonth()+1;
    let startMonthDays = 31; //no of days in the start month
    let day = d.getDate(); //gets current day of the month as number
    let fromDay =  day-6; // no of days to range (API allows max 7days)

    if (day <= 7 || fromDay <= 0){
        if (startM == 4 || startM == 6 || startM == 9 || startM == 11){
            startMonthDays = 30;
        }
        startM = startM-1; //set start month as previous month
        fromDay = startMonthDays + day - 7; //if day=7, we want fromDay to be 31; if day=6, fromDate to be 30 etc (for a 31-day month)
    }   
    day     = day.toString().length < 2 ? `0${day}` : day  //if day is single digit, prepend 0
    fromDay = fromDay.toString().length < 2 ? `0${fromDay}` : fromDay  //if day is single digit, prepend 0
    endM    = endM.toString().length < 2 ? `0${endM}` : endM  //if day is single digit, prepend 0
    startM  = startM.toString().length < 2 ? `0${startM}` : startM  //if day is single digit, prepend 0
   
    const endDate = encodeURIComponent(`${yr}-${endM}-${day}`) // encodes current date (string) as a valid URl component
    const startDate = encodeURIComponent(`${yr}-${startM}-${fromDay}`) // encodes start date (string) as a valid URl component

    const url = `${host}/api/v5/convert?q=${query}&compact=ultra&date=${startDate}&endDate=${endDate}`; //url
    const urlReq = new Request(url, {method: 'GET'}); //creates a new Request object with the url to retrieve currencies from the api and GET method passed into it

	//Fetch urlReq resources from the network. This returns a Promise that resolves to the Response (urlResp) to that request
	//Fetches the rate from network if successful and updates the IDB. Retrieves the rate from IDB if unsuccessful i.e if offline
	fetch(urlReq).then(resp => { 
		return resp.json().then(data => { // Reads the response stream (resp) and  returns a promise that resolves with the result of parsing the JSON body text.
            const entries = Object.entries(data);
            entVal = entries[0][1];
            let valArray = Object.entries(entVal);
            // console.log("entV: ", valArray)
            valArray.forEach(arr => {
                arr[1] = Number(Math.round(arr[1]+'e2')+'e-2'); //rounding number to 2 decimal places. Solves all rounding problems (eg 1.005 to 2 dec places being rounded to 1 instead of 1.01)
                // arr[1] = Number((arr[1]).toFixed(2)); //rounding number to 2 decimal places. Solves all rounding problems (eg 1.005 to 2 dec places being rounded to 1 instead of 1.01)
            })
            console.log("entV2:: ", valArray)

            // **********PLOT GRAPH*************
            plot(valArray, graphTitle);

            //***ADD TO DATABASE FOR OFFLINE FETCH *****/
            let graphObj = {
				id: query,
				value:  valArray,
				date: new Date().getTime(), //milliseconds
			};
			//Adding graph objects to the object store
            addDB('graph', graphObj);
   			//Delete record from database after 1hour
            setTimeout(() => {
				deleteDB('rates', exchRateObj.id);
			}, 60*60000);
		}).catch(jsonErr => {console.log("Error in parsing JSON data: ", jsonErr);})
	}).catch(() => { //if fetch fails to retrieve from network:
		console.log("Error in fetching from network, Checking for graph values in IDB... ");
		getDB('graph', query).then(val => {
            console.log("SUCCESSFULLY RETRIEVED GRAPH FROM DATABASE!!");
            plot(val, graphTitle);
			return;
		})
     });
}

function plot(arr, title){
    let myChart = new JSChart('graph', 'line'); //initializes the chart by providing the container ID, the chart type (possible values are line, bar and pie).
                    
            myChart.setDataArray(arr); //introduces the data to the JSChart object
            myChart.setAxisNameFontSize(10);
            myChart.setAxisNameX('Dates');
            myChart.setAxisNameY('Rates');
            myChart.setAxisNameColor('#FFFFFF');
            myChart.setAxisValuesNumberX(7);
            myChart.setAxisValuesNumberY(5);
            myChart.setAxisValuesColor('#38a4d9');
            myChart.setAxisColor('#38a4d9');
            myChart.setLineColor('#C71112');
            myChart.setTitle(title);
            myChart.setTitleColor('#FFFFFF');
            myChart.setGraphExtend(true);
            myChart.setGridColor('#38a4d9');
            myChart.setSize(750, 321);
            myChart.setAxisPaddingLeft(150);
            myChart.setAxisPaddingRight(140);
            myChart.setAxisPaddingTop(60);
            myChart.setAxisPaddingBottom(45);
            myChart.setTextPaddingLeft(105);
            myChart.setTextPaddingBottom(12);
            // myChart.setBackgroundImage('../img/chart_bg.jpg');
            
            myChart.draw(); //executes the chart drawing
}
