
const arrayToObj = (array) =>
    array.reduce((obj, item) => {
        obj[item.symbol] = item;
        return obj;
    }, {});

function getTotalInUSD(currencies, marketData) {
    let marketDataObj = arrayToObj(marketData);
    let converted = currencies
        .map(item => {
            if(item.name === 'USD') {
                return item.quantity * 1;
            } else {
                return item.quantity * marketDataObj[item.name].quote.USD.price;
            }
        })
        .reduce((total, item) =>  total + item)
        .toFixed(2);
    return parseFloat(converted);
}


module.exports = { 
    getTotalInUSD
};

