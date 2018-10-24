const { getPrices } = require('../exchanges/coin-market-cap');

function getTotalInUSD(currencies, marketData) {
    let data = marketData[0];
    let converted = currencies.map(item => {
        if(item.name === data.name) {
            item.value = item.quantity * data.quote.USD.price;
            return item.value;
        }
    });
    return converted;
}

module.exports = { getTotalInUSD };