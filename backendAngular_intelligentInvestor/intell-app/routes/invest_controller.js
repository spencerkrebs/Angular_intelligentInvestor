
let express = require('express')
let router = express.Router()
var yahooFinance = require('yahoo-finance');
var async = require("async");

const fetch = require("node-fetch");


router.post('/search-redirect', (req, res) => {
    symbol = req.body.symbol.toUpperCase();
    res.redirect(`/invest/${req.body.symbol}`)
})

router.post('/:symbol', (req, res) => {
    console.log(req.body.symbol)
})


router.get('/b/test', (req, res) => {
    const url = 'https://financialmodelingprep.com/api/v3/financials/income-statement/aapl'
    fetch(url)
    .then(data => data.json())
    .then(json => res.send(json));



})

router.get('/:symbol', (req, res) => {

    var  apiRequest1 = yahooFinance.quote({
           symbol: `${req.params.symbol}`,
           modules: ['price', 'summaryDetail', 'earnings', 'financialData'],
         }).then(quotes => {
             return quotes
         })
        
    var apiRequest2 = (
        fetch(`https://financialmodelingprep.com/api/v3/financials/income-statement/${req.params.symbol}`)
        .then(data => data.json())
        .then(json => { return json })
    )

    // var apiRequest2 = yahooFinance.historical({
    //     symbol: `${req.params.symbol}`,
    //     from: `2012-01-01`,
    //     to: `2012-12-31`
    //   }).then(hist => {
    //       return hist
    //   })
   
         var combinedData = {"apiRequest1":{},"apiRequest2":{}};
         processedFinancialData = {};
         Promise.all([apiRequest1,apiRequest2]).then(function(values){
             combinedData["apiRequest1"] = values[0];
             combinedData["apiRequest2"] = values[1];
             assignTickerSymbol(combinedData)
             assignPrice(combinedData)
             marketCap(combinedData)
             yearlyEarningsData(combinedData)
             quarterlyEarningsData(combinedData)
             calculateAveragePriceEarningsFromYearlyData(combinedData)
            // continuedEarnings(combinedData)
            
            // res.render(`../views/analysis`, {combinedData, largeCompany, exportDateArray })
             res.send(processedFinancialData) ;
         })
   
         
    });
   
//CALL 2 APIs at once
router.get('/a/test', (req, res) => {
   
 var  apiRequest1 = yahooFinance.quote({
        symbol: `TSLA`,
        modules: ['price', 'summaryDetail', 'earnings', 'financialData'],
      }).then(quotes => {
          return quotes
      })
      
      var apiRequest2 = (
        fetch(`https://financialmodelingprep.com/api/v3/financials/income-statement/tsla`)
        .then(data => data.json())
        .then(json => { return json })
    )
//  var apiRequest2 = yahooFinance.historical({
//     symbol: `AAPL`,
//     from: `2012-01-01`,
//     to: `2012-12-31`
//   }).then(hist => {
//       return hist
//   })

      var combinedData = {"apiRequest1":{},"apiRequest2":{}};
      Promise.all([apiRequest1,apiRequest2]).then(function(values){
          combinedData["apiRequest1"] = values[0];
          combinedData["apiRequest2"] = values[1];
          res.send(combinedData) ;
      });


 });
  



//pe based on multi year average of past earnings
//steady increase in earnings last 10 years


//large company selling well below its previous average share price and well below average pe at the same time
// - Share price is only an indicator of when to buy and when you are in a bull market and should sell


//at least 10 years of continuous dividend (today)
//unpopular large company with currently disappointing results and neglect or unpopularity

//never buy into a lawsuit
//a way to tell if we're in a bull market - shiller pe index, user must have inclination to buy if market low, less inclination if market too high

//rise or fall - never buy a stock immediately after a substantial rise, never sell immediately after a substantial fall 
//cash
function assignTickerSymbol(data){
    let keyTickerSymbol = 'ticker';
    processedFinancialData[keyTickerSymbol] = data.apiRequest2.symbol;
}

function assignPrice(data){
    let keyTickerPrice = 'price';
    processedFinancialData[keyTickerPrice] = data.apiRequest1.financialData.currentPrice;
}

function marketCap(data) {
    let keyLargeCompany = 'largeCompany';
    let keyMarketCapitalization = 'marketCapitalization'
if (data.apiRequest1.price.marketCap > 10000000000) {
    largeCompany = true; 
} else {
    largeCompany = false;
}
processedFinancialData[keyLargeCompany]=largeCompany;

let marketCapWithCommas = numberWithCommas(data.apiRequest1.price.marketCap)
processedFinancialData[keyMarketCapitalization]=marketCapWithCommas;
}

function numberWithCommas(number) {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function yearlyEarningsData(data){
    let yearlyEarningsArrayFromAPI =data.apiRequest2.financials;
    let formattedYearlyEarnings = [];
    buyBackCount = 0;
    for (let y=0; y < yearlyEarningsArrayFromAPI.length; y++){
        let date = yearlyEarningsArrayFromAPI[y].date.slice(0, 4);
        let formattedEarnings = numberWithCommas(yearlyEarningsArrayFromAPI[y]['Net Income'])
        let eps = yearlyEarningsArrayFromAPI[y].EPS;
        let outstandingShares = yearlyEarningsArrayFromAPI[y]["Weighted Average Shs Out"];
        let previousYearPosition = y+1;
        if (previousYearPosition < yearlyEarningsArrayFromAPI.length){
        outstandingSharesPreviousYear = yearlyEarningsArrayFromAPI[previousYearPosition]["Weighted Average Shs Out"];
        }
        let outstandingSharesWithCommas = numberWithCommas(outstandingShares);
        checkBuybacks = checkForBuybacks(outstandingShares, outstandingSharesPreviousYear)
        formattedYearlyEarnings[y] = {'date': date, 'earnings': formattedEarnings, 'eps': eps, 'outstandingShares':outstandingSharesWithCommas, 'checkBuybacks': checkBuybacks};
        if (checkBuybacks == true){
            buyBackCount += 1;
        }
    }
    let keyYearlyEarningsArray = 'yearlyEarnings';
    let keyBuyBackCount = 'buyBackCount';
    processedFinancialData[keyYearlyEarningsArray]=formattedYearlyEarnings;
    processedFinancialData[keyBuyBackCount]=buyBackCount;
}

function checkForBuybacks(currentShares, previousYearShares){
    if (currentShares < previousYearShares){
        return true;
    }else if (currentShares > previousYearShares){
        return false;
    }else{
        return null; 
    }
}

function quarterlyEarningsData(data){
    let quarterlyEarningsArrayFromAPI = data.apiRequest1.earnings.financialsChart.quarterly;
    let quarterlyEPSArrayFromAPI = data.apiRequest1.earnings.earningsChart.quarterly;
    let formattedQuarterlyEarnings = [];
    
    for (let q = 0; q < quarterlyEarningsArrayFromAPI.length; q++){
        let date = quarterlyEarningsArrayFromAPI[q].date;
       let formattedEarnings = numberWithCommas(quarterlyEarningsArrayFromAPI[q].earnings);
       formattedQuarterlyEarnings[q] = {'date': date, 'earnings': formattedEarnings, 'eps': 'null'};
    }
    for (let x = 0; x < quarterlyEPSArrayFromAPI.length; x++){
        let eps = quarterlyEPSArrayFromAPI[x].actual;
        formattedQuarterlyEarnings[x].eps = eps;
    }

    let keyQuarterlyEarningsArray = 'quarterlyEarnings'
    processedFinancialData[keyQuarterlyEarningsArray]=formattedQuarterlyEarnings;
}

function calculateAveragePriceEarningsFromYearlyData(data){
    let yearlyEarningsArrayFromAPI =data.apiRequest2.financials;
    let price = data.apiRequest1.financialData.currentPrice;
    let sumEPS = 0;
    for (let x = 0; x < yearlyEarningsArrayFromAPI.length; x++){
        let eps = parseInt(yearlyEarningsArrayFromAPI[x].EPS);
        sumEPS += eps;
    }
    let averageEPS = sumEPS/(yearlyEarningsArrayFromAPI.length);
    let averagePE = (price/averageEPS).toFixed(2);
    let keyAveragePE = 'averagePE'
    processedFinancialData[keyAveragePE]=averagePE;

}






    
module.exports = router; 