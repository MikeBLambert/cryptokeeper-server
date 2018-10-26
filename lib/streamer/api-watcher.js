const request = require('superagent');

const DEFAULT_INTERVAL = 60 * 1000;

const coinsHistory = {};


const getHistoricalPrice = name => {
    const coinHistory = coinsHistory[name];
    if(coinHistory && coinHistory.length > 0){
        return coinHistory;
    } 
    coinsHistory[name] = [];
    return coinsHistory[name];
};

const getCurrentPrice = name => {
    const coinHistory = getHistoricalPrice(name);
    if(coinHistory.length > 0) return coinHistory[coinHistory.length - 1];
    return null;
};

const getSymbols = () => Object.keys(coinsHistory);

const getCurrentPrices = () => {

    return getSymbols()
        .map(symbol => {
            return { symbol, price: getCurrentPrice(symbol) };
        })
        .reduce((acc, item) => {
            acc[item.symbol] = item.price;
            return acc;
        }, {});
};


const getHistoricalPrices = () => coinsHistory;

const pushPrice = coins => {

    coins.forEach(coin => {

        const priceHistory = getHistoricalPrice(coin.symbol);
        if(priceHistory.length < 1) priceHistory.push({
            updated: coin.last_updated,
            price: coin.quote.USD.price,
            rank: coin.cmc_rank
        });
        else {
            const currentPrice = getCurrentPrice(coin.symbol);
            if(currentPrice.updated !== coin.last_updated) {
                priceHistory.push({
                    updated: coin.last_updated,
                    price: coin.quote.USD.price,
                    rank: coin.cmc_rank
                });
            }
        }
        while(priceHistory.length > 30) {
            priceHistory.unshift();
        }
    });
};

const fetchPrices = apiKey => {

    return request.get('https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest')
        .set({
            'X-CMC_PRO_API_KEY': apiKey,
            'Accept-Encoding': 'gzip, deflate',
            'Content-Type': 'application/json;charset=UTF-8'
        })
        .query({
            start: 1,
            limit: 10,
            convert: 'USD',
            sort: 'market_cap',
            sort_dir: 'desc'
        })
        .type('json')
        .then(({ body }) => {
            pushPrice(body.data);
        });
};

let running = false;
const startWatch = (apiKey, interval = DEFAULT_INTERVAL) => {
    if(running) return;
    running = true;
    fetchPrices(apiKey);
    setInterval(fetchPrices.bind(this, apiKey), interval);
};



module.exports = {
    getCurrentPrice, getHistoricalPrice,
    getCurrentPrices, getHistoricalPrices,
    startWatch
};
