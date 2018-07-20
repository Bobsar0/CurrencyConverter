//Plots the graph of history of the selected currencies

/**
 * @function plotGraph
 * @description Generates Chart based on 7-day conversion rate history b/w 2 currencies
 * @param required from: Currency to convert from
 * @param required to: Currency to convert to
 * @returns null
 **/
function plotGraph(from, to){
    // *********GET GRAPH DATA*********
    const query = `${from}_${to}`; //query string
    if (query == 'NGN_BTC'){
        alert(`Cannot generate graph of ${from} to ${to} due to insignificant rate value`);
        return;
    }
    const graphTitle=`PLOT of <span style='color: #32a0c2'>${from}</span> to <span style='color: #32a0c2'>${to}</span><i>(7 days.)</i>`;

    //Checking for Graph parameters in IDB to achieve offline first:
    console.log("Checking for Graph params in IDB first... ");
    getDB('graph', query).then(val => {
        console.log("SUCCESSFULLY RETRIEVED GRAPH FROM DATABASE!!");
        plot(val, graphTitle);
        return;
    }) //Otherwise fetch from network
    .catch(() => {
        //Get required Date format
        const d = new Date();
        const yr = d.getFullYear(); //gets current yr as number
        let endM = d.getMonth()+1; //gets current month as number(zero-based index)
        let startM = d.getMonth()+1;
        let startMonthDays = 31; //no of days in the start month
        let day = d.getDate(); //gets current day of the month as number
        let startDay =  day-6; // no of days to range (API allows max 7days so 7 days ago from current day)

        if (day <= 7 || startDay <= 0){
            if (startM == 4 || startM == 6 || startM == 9 || startM == 11){
                startMonthDays = 30;
            }
            startM = startM-1; //set start month as previous month
            startDay = startMonthDays + day - 7; //if day=7, we want startDay to be 31; if day=6, fromDate to be 30 etc (for a 31-day month)
        }   
        day     = day.toString().length < 2 ? `0${day}` : day  //if day is single digit, prepend 0
        startDay = startDay.toString().length < 2 ? `0${startDay}` : startDay  //if startDay is single digit, prepend 0
        endM    = endM.toString().length < 2 ? `0${endM}` : endM.toString()  //if endMonth is single digit, prepend 0
        startM  = startM.toString().length < 2 ? `0${startM}` : startM.toString()  //if startMonth is single digit, prepend 0
    
        const endDate = `${yr}-${endM}-${day}` // current date as (string)
        const startDate = `${yr}-${startM}-${startDay}` // start date as (string)

        const url = `https://free.currencyconverterapi.com/api/v5/convert?q=${query}&compact=ultra&date=${startDate}&endDate=${endDate}`; //url
        const urlReq = new Request(url, {method: 'GET'}); //creates a new Request object with the url to retrieve currencies from the api and GET method passed into it

        //Fetches the rates within the specified dates from network and updates the IDB.
        fetch(urlReq).then(resp => { 
            return resp.json().then(data => { // Reads the response stream (resp) and  returns a promise that resolves with the result of parsing the JSON body text.
                const entVal = Object.entries(data)[0][1];
                let valArray = Object.entries(entVal);
                console.log("valArr: ", valArray)//array of 7 arrays

                let nArr = [['Date', 'Rate']]; //array data to be used in plot
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
        });
    })
}

/**
 * @function plot
 * @description Plots/Customizes the Chart using Google Charts API
 * @param required arr: Plot data
 * @param required caption: Title of Graph
 * @returns null
 **/
function plot(arr, caption){
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
                slantedText: false
            },  
            vAxis : {
                title: 'Rates',
                titleTextStyle: {color: '#FFFFFF'},
                baselineColor: '#32a0c2',
                gridlines: {color: '#32a0c2', count: 4},
                textStyle: {color: '#32a0c2'},
            },        
            selectionMode: 'multiple',
            tooltip: {textStyle: {color: 'green'}, showColorCode: true},
        };
        const chart = new google.visualization.LineChart(document.getElementById('graph'));
        document.getElementById('initTitle').innerHTML = '';
        document.getElementById('graphTitle').innerHTML = caption;
    
        chart.draw(data, options);
      }
}