
// Function that gets the currencyrate data from Alpha-Vantage API
// #currencyEqual = span tag's id to show the currency rate on screen

async function dataLoad(currencyOne, currencyTwo) {
    $('.loadEffect').fadeIn();
    const url = `https://www.alphavantage.co/query?function=CURRENCY_EXCHANGE_RATE&from_currency=${currencyOne}&to_currency=${currencyTwo}&apikey=P0I3MJY0UNTOV71J`;
    
    const response = await fetch(url);
    const data = await response.json();
    const currencyRate = data["Realtime Currency Exchange Rate"]["5. Exchange Rate"];
    (currencyRate) ? $("#currencyEqual").text(parseFloat(currencyRate).toFixed(5)) :
    alert('No available data for this currency pair..!');
    $('.loadEffect').fadeOut();
};
  
let period;
let alertPrice;
let maxPrice, minPrice;


// Function that gets the data from Alpha-Vantage API to make a chart 
// interval = 5min , 60min, daily, weekly, monthly

async function chartLoad (currencyOne, currencyTwo, period) {
    $('.loadEffect').fadeIn();
    let urlChart, interval, intervalAxisX, intervalTypeAxisX, valueFormatStringAxisX;

    // regarding interval choice defines it some variables
    switch(period) {
        case '5min':
            urlChart= `https://www.alphavantage.co/query?function=FX_INTRADAY&from_symbol=${currencyOne}&to_symbol=${currencyTwo}&interval=5min&apikey=P0I3MJY0UNTOV71J`;
            interval = '5min';
            intervalAxisX = 30;
            intervalTypeAxisX = 'minute';
            valueFormatStringAxisX = 'HH:mm';
            break;

        case '60min':
            urlChart= `https://www.alphavantage.co/query?function=FX_INTRADAY&from_symbol=${currencyOne}&to_symbol=${currencyTwo}&interval=60min&apikey=P0I3MJY0UNTOV71J`;
            interval = '60min';
            intervalAxisX = 5;
            intervalTypeAxisX = 'hour';
            valueFormatStringAxisX = 'HH:mm';
            break;

        case 'daily':
            urlChart = `https://www.alphavantage.co/query?function=FX_DAILY&from_symbol=${currencyOne}&to_symbol=${currencyTwo}&apikey=P0I3MJY0UNTOV71J`;
            interval = 'Daily';
            intervalAxisX = 7;
            intervalTypeAxisX = 'day';
            valueFormatStringAxisX = 'DD MMM';
            break;
        
        case 'weekly':
            urlChart = `https://www.alphavantage.co/query?function=FX_WEEKLY&from_symbol=${currencyOne}&to_symbol=${currencyTwo}&apikey=P0I3MJY0UNTOV71J`;
            interval = 'Weekly';
            intervalAxisX = 75;
            intervalTypeAxisX = 'day';
            valueFormatStringAxisX = 'DD MMM YYYY';
            break;

        case 'monthly':
            urlChart = `https://www.alphavantage.co/query?function=FX_MONTHLY&from_symbol=${currencyOne}&to_symbol=${currencyTwo}&apikey=P0I3MJY0UNTOV71J`;
            interval = 'Monthly';
            intervalAxisX = 6;
            intervalTypeAxisX = 'month';
            valueFormatStringAxisX = 'MMM YYYY';
            break;
    };

    const responseChart = await fetch(urlChart);
    const dataChart = await responseChart.json();
    const dataArrayChart = dataChart[`Time Series FX (${interval})`];
    const keys = Object.keys(dataArrayChart);
    const values = Object.values(dataArrayChart);

    let dataPoints = [];        //for candlestick chart data
    let dataPointsLine = [];    //for alertPrice line chart data
    var lineData = {};          //for alertPrice line chart data
    let i;
    let strDate;
    if (alertPrice) {                                      // it checks whether alert price set up.
        for (i=0; i<keys.length; i++) {
            if (period == '5min' || period == '60min') {
                strDate = new Date(keys[i].substr(0,16));
            } else {
                strDate = new Date(keys[i]);
            };      
            let open = parseFloat(values[i]["1. open"]);
            let high = parseFloat(values[i]["2. high"]);
            let low = parseFloat(values[i]["3. low"]);
            let close = parseFloat(values[i]["4. close"]);
            dataPoints.push({'x':strDate, 'y':[open,high,low,close]});
            dataPointsLine.push({'x':strDate, 'y':alertPrice});
        }; 
        maxPrice = parseFloat(values[0]["2. high"]);           // maxPrice is the high of the last candlestick
        minPrice = parseFloat(values[0]["3. low"]);            // minPrice is the low of the last candlestick
        lineData = {type: "line",                              // Alert price line chart settings.
                    showInLegend: true,
                    name: "Alert Price",
                    yValueFormatString: "##0.00000",
                    xValueFormatString: valueFormatStringAxisX,
                    dataPoints: dataPointsLine
                    }; 
    } else {
        for (i=0; i<keys.length; i++) {
            if (period == '5min' || period == '60min') {
                strDate = new Date(keys[i].substr(0,16));
            } else {
                strDate = new Date(keys[i]);
            };      
            let open = parseFloat(values[i]["1. open"]);
            let high = parseFloat(values[i]["2. high"]);
            let low = parseFloat(values[i]["3. low"]);
            let close = parseFloat(values[i]["4. close"]);
            dataPoints.push({'x':strDate, 'y':[open,high,low,close]});
        };
        lineData = {}; 
    };   

    var chart = new CanvasJS.Chart("chartContainer", {               // chart settings
        animationEnabled: true,
        theme: "light2", // "light1", "light2", "dark1", "dark2"
        exportEnabled: true,
        zoomEnabled:true,
        zoomType: "xy",
        subtitles: [{
            text: `${currencyOne} & ${currencyTwo} - ${interval} Chart`,
            fontColor: 'green',   
            padding:10
        }],
        axisX: {
            title: "( Date - Time )",
            titleFontColor: "green",
            titleFontSize: 16,
            interval: intervalAxisX,                      
            intervalType: intervalTypeAxisX,     
            valueFormatString: valueFormatStringAxisX,    
            labelAngle: -45,
            labelAutoFit: true,
            interlacedColor: "#fcfcfc",
            crosshair:{
                enabled: true,
                snapToDataPoint: true
            },
            margin: 10
        },
        axisY: {
            includeZero: false,
            prefix: "",
            title: `( ${currencyTwo} )`,
            titleFontColor: "green",
            titleFontSize: 16,
            gridDashType: "dot"
        },
        toolTip: {
            shared: true  
        },
        legend: {
            fontColor: 'red',
            fontSize: 12
        },
        data: [{
            type: "candlestick",
            yValueFormatString: "##0.00000",
            dataPoints: dataPoints              // 5min, 60min, daily, weekly, monthly charts data
        },
        lineData]                               // alert price line charts data
    });
    chart.render();

    if ((alertPrice >= minPrice) && (alertPrice <= maxPrice)) {  // it triggers sound alarm, when the alert price is between minPrice and maxPrice
        $('#alarm').attr('autoplay', 'true');
        //$('#alarm').attr('controls', 'true');
        $('#alarm').load();
        $('#bellslash').removeClass('d-none');
    };
    $('.loadEffect').fadeOut();
};

// Jquery part
$(document).ready( function(){
    let currencyValue;
    let selectedCurrency1 = 'USD - United States Dollar';
    let selectedCurrency2 = 'EUR - Euro';
    let curr1Short = selectedCurrency1.substr(0,3);
    let curr2Short = selectedCurrency2.substr(0,3);

    dataLoad(curr1Short, curr2Short);
    chartLoad(curr1Short, curr2Short, '5min');

    period = '5min';
    let input1Value;
    let result;


    $("#currency1").text(curr1Short);    
    $("#currency2").text(curr2Short);
    

    $("#select1").change(function(){
        selectedCurrency1 = $(this).children("option:selected").val();
        curr1Short = selectedCurrency1.substr(0,3);
        $("#currency1").text(curr1Short);
        dataLoad(curr1Short,curr2Short);
        chartLoad(curr1Short, curr2Short, '5min');
        alertPrice = null;
    });

    $("#select2").change(function(){
        selectedCurrency2 = $(this).children("option:selected").val();
        curr2Short = selectedCurrency2.substr(0,3);
        $("#currency2").text(curr2Short);
        dataLoad(curr1Short,curr2Short);
        chartLoad(curr1Short, curr2Short, '5min');
        alertPrice = null;
    });

    // Currency pairs reverse part

    $("#btnChng").click(function(){
        curr1Short = selectedCurrency2.substr(0,3);
        curr2Short = selectedCurrency1.substr(0,3);
        $("#currency1").text(curr1Short);
        $("#currency2").text(curr2Short);
        $('#select1').val(selectedCurrency2);
        $('#select2').val(selectedCurrency1);
        dataLoad(curr1Short,curr2Short);
        chartLoad(curr1Short, curr2Short, '5min');
        alertPrice = null;
    });

    // Currency converter calculation part 

    $("#input1").keyup(function(){
        input1Value = $(this).val();
        currencyValue = parseFloat($('#currencyEqual').text());
        result = (input1Value * currencyValue).toFixed(2);
        $("#input2").val(result);
    });

    // Chart type selection click functions  part
    $(".btn0").click(function(){
        period = '5min';
        chartLoad(curr1Short, curr2Short, period);
    });

    $(".btn1").click(function(){
        period = '60min';
        chartLoad(curr1Short, curr2Short, period);
    });

    $(".btn2").click(function(){
        period = 'daily';
        chartLoad(curr1Short, curr2Short, period);
    });

    $(".btn3").click(function(){
        period = 'weekly';
        chartLoad(curr1Short, curr2Short, period);
    });

    $(".btn4").click(function(){
        period = 'monthly';
        chartLoad(curr1Short, curr2Short, period);
    });

    // set alert part
    $("#setAlertBtn").click(function(){
        var price = $('#setAlertPriceInput').val();
        alertPrice = Number(price);
        console.log(alertPrice);
        chartLoad(curr1Short, curr2Short, period);       
    }); 

    $("#bellslash").click(function(){
        $("#alarm")[0].pause();   
        $(this).addClass('d-none');
    });
    
    // repeat the chart every 5 min 
    $('input[type="checkbox"]').click(function(){
        let repeat = setInterval(startInterval, 300000);
        
        function startInterval () {
            if($('#repeatCheck').prop("checked") == true){
                chartLoad(curr1Short, curr2Short, period);
            } else {
                stopInterval ();
            };
        };
        function stopInterval () {
            clearInterval(repeat);
        };
    });
        
    // modal of alert part 
    $('#setAlertPrice').on('shown.bs.modal', function () {
        $('#myInput').trigger('focus')
    });
});

