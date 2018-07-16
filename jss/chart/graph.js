//Plots the graph of history of the selected currencies

function plotGraph(from, to){
    // *********GET GRAPH DATA*********
	const fromEncoded = encodeURIComponent(from); //encodes 'USD' as a valid URl component
  	const toEncoded = encodeURIComponent(to); //encodes 'NGN' as a valid URl component
    const query = `${fromEncoded}_${toEncoded}`; //query string
    if (query == 'NGN_BTC'){
        alert(`Cannot generate graph of ${from} to ${to} due to insignificant rate value`);
        return;
    }
    const graphTitle=`PLOT of <span style='color: #32a0c2'>${fromEncoded}</span> to <span style='color: #32a0c2'>${toEncoded}</span><br><i>(over a weekly period)</i>`;

    //Checking for Graph parameters in IDB to achieve offline first:
    console.log("Checking for Graph params in IDB first... ");
    getDB('graph', query).then(val => {
        console.log("SUCCESSFULLY RETRIEVED GRAPH FROM DATABASE!!, valArray: ", val);
        plot(val, graphTitle);
        return;
    }) //Otherwise fetch from network
    .catch(function(){
        //Get required Date format
        const d = new Date();
        const yr = d.getFullYear(); //gets current yr as number
        let endM = d.getMonth()+1; //gets current month as number(zero-based index)
        let startM = d.getMonth()+1;
        let startMonthDays = 31; //no of days in the start month
        let day = d.getDate(); //gets current day of the month as number
        let fromDay =  day-6; // no of days to range (API allows max 7days so 7 days ago from current day)

        if (day <= 7 || fromDay <= 0){
            if (startM == 4 || startM == 6 || startM == 9 || startM == 11){
                startMonthDays = 30;
            }
            startM = startM-1; //set start month as previous month
            fromDay = startMonthDays + day - 7; //if day=7, we want fromDay to be 31; if day=6, fromDate to be 30 etc (for a 31-day month)
        }   
        day     = day.toString().length < 2 ? `0${day}` : day.toString()  //if day is single digit, prepend 0
        fromDay = fromDay.toString().length < 2 ? `0${fromDay}` : fromDay.toString  //if day is single digit, prepend 0
        endM    = endM.toString().length < 2 ? `0${endM}` : endM.toString()  //if day is single digit, prepend 0
        startM  = startM.toString().length < 2 ? `0${startM}` : startM.toString()  //if day is single digit, prepend 0
    
        const endDate = encodeURIComponent(`${yr}-${endM}-${day}`) // encodes current date (string) as a valid URl component
        const startDate = encodeURIComponent(`${yr}-${startM}-${fromDay}`) // encodes start date (string) as a valid URl component

        const url = `https://free.currencyconverterapi.com/api/v5/convert?q=${query}&compact=ultra&date=${startDate}&endDate=${endDate}`; //url
        const urlReq = new Request(url, {method: 'GET'}); //creates a new Request object with the url to retrieve currencies from the api and GET method passed into it

        //Fetches the rates within the specified dates from network and updates the IDB.
        fetch(urlReq).then(resp => { 
            return resp.json().then(data => { // Reads the response stream (resp) and  returns a promise that resolves with the result of parsing the JSON body text.
                const entVal = Object.entries(data)[0][1];
                let valArray = Object.entries(entVal);
                console.log("valArr: ", valArray)//array of 7 arrays

                let nArr = [['Date', 'Rate']];
                for (let [k,v] of valArray){
                        nArr.push([k,v])//Inserts date and val rather than index and val to be used in plot
                }
                // **********PLOT GRAPH*************
                plot(nArr, graphTitle);

                //*** THEN ADD TO DATABASE FOR SUBSEQUENT OFFLINE FETCH *****/
                let graphObj = {
                    id: query,
                    data:  nArr,
                    date: new Date().getTime(), //milliseconds
                };
                //Adding graph objects to the object store
                addDB('graph', graphObj);
                //Delete record from database after 1hour
                setTimeout(() => {
                    deleteDB('graph', exchRateObj.id);
                }, 60*60000);
            }).catch(jsonErr => {console.log("Error in parsing JSON data: ", jsonErr);})
        }).catch(() => { //if fetch fails to retrieve from network:
            console.log("Error in fetching Graph from network, Waiting for next connection to network to update IDB... ");
            //Attempt to fetch from IDB again incase the first IDB fetch failed for inexplicable reasons
            getDB('graph', query).then(val => {
                console.log("SUCCESSFULLY RETRIEVED GRAPH FROM DATABASE AFTER NETWORK FAILURE!!, valArray: ", val);
                plot(val, graphTitle);
                return;
        	})
        });
    })
}

function plot(arr, titl){
    google.charts.load('current', {'packages':['corechart']});
    google.charts.setOnLoadCallback(drawChart);

      function drawChart() {
        const data = google.visualization.arrayToDataTable(arr);
        const options = {
            backgroundColor: {fill: '#353637'},
            colors : ['red'],
            crosshair: {trigger: 'both', color:'black', opacity: 0.3},
            hAxis : {
                title: 'Dates',
                titleTextStyle: {color: '#FFFFFF'},
                textStyle: {color: '#32a0c2'},
                baselineColor: '#32a0c2',
                gridlines: {color: 'white', count: 7},
                // slantedText: true, slantedTextAngle: 20
            },  
            vAxis : {
                title: 'Rates',
                titleTextStyle: {color: '#FFFFFF'},
                baselineColor: '#32a0c2',
                gridlines: {color: '#32a0c2', count: 5},
                textStyle: {color: '#32a0c2'},
            },        
            selectionMode: 'multiple',
            // title:titl,
            // titleTextStyle: {color: '#FFFFFF', fontSize: 16},
            tooltip: {textStyle: {color: 'green'}, showColorCode: true},
            // legend: { position: 'bottom' }
        };
        const chart = new google.visualization.LineChart(document.getElementById('graph'));
        document.getElementById('initTitle').innerHTML = '';
        document.getElementById('graphTitle').innerHTML = titl;
    
        chart.draw(data, options);
      }
}

// function plot(arr, title){
//     let myChart = new JSChart('graph', 'line'); //initializes the chart by providing the container ID, the chart type (possible values are line, bar and pie).
                    
//             myChart.setDataArray(arr); //introduces the data to the JSChart object
//             myChart.setAxisNameFontSize(11);
//             myChart.setAxisNameX('Dates');
//             myChart.setAxisNameY('Rates', true);
//             myChart.setAxisValuesDecimalsY(2)
//             myChart.setAxisNameColor('#FFFFFF');
//             myChart.setAxisValuesNumberX(7);
//             myChart.setAxisValuesNumberY(5);
//             myChart.setAxisValuesColor('#38a4d9');
//             myChart.setAxisValuesAngle(45);
//             myChart.setAxisColor('#38a4d9');
//             myChart.setLineColor('#C71112');
//             myChart.setTitle(title);
//             myChart.setTitleColor('#FFFFFF');
//             myChart.setGraphExtend(true);
//             myChart.setGridColor('#38a4d9');
//             myChart.setGridOpacity(0.3);
//             myChart.setSize(700, 300);
//             myChart.setAxisPaddingLeft(60);
//             // myChart.setAxisPaddingRight(200);
//             myChart.setAxisPaddingTop(60);
//             myChart.setAxisPaddingBottom(65);

//             // arr.forEach(a => {
//             //         a[1] = Number((a[1]).toFixed(2)); //rounding number to 2 decimal places. Solves all rounding problems (eg 1.005 to 2 dec places being rounded to 1 instead of 1.01)
//             //         if (a[1].toString().length <=7){
//             //             myChart.setTextPaddingLeft(30);
//             //         }else{
//             //         myChart.setTextPaddingLeft(0);
//             //     }
//             // })        
//             // myChart.setTextPaddingBottom(1);
//             myChart.setBackgroundImage('../img/chart_bg.jpg');
            
//             myChart.draw(); //executes the chart drawing
// }