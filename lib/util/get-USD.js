
// marketdata = [{name: BTC, price: 134}]
// marketdata = { BTC: { price: 123, rank: 1, updated: a_date   } }


function getTotalInUSD(currencies, marketData) {
    
    let converted = currencies
        .map(item => item.quantity * marketData[item.name].price)
        .reduce((total, item) =>  total + item)
        .toFixed(2);

    return parseFloat(converted);
}

module.exports = { getTotalInUSD };

