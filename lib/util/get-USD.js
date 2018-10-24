
const arrayToObj = (array) =>
    array.reduce((obj, item) => {
        obj[item.symbol] = item;
        return obj;
    }, {});

function getTotalInUSD(currencies, marketData) {
    let marketDataObj = arrayToObj(marketData);

    let converted = currencies.map(item => {
        item.value = item.quantity * marketDataObj[item.name].quote.USD.price;
        return item.value;
    });

    let convertedTotal = converted
        .reduce((total, item) => {
            return total + item;
        })
        .toFixed(2);

    return parseFloat(convertedTotal);
}

module.exports = { getTotalInUSD };

