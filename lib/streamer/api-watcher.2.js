require('dotenv').config();
const request = require('superagent');

module.exports = class Prices {

    constructor() {
        this.coinsHistory = {};
        this.DEFAULT_INTERVAL = 60 * 1000;
        this.running = false;
    }

    getSymbols() { Object.keys(this.coinsHistory); }
    
    getCurrentPrice(name) {
        const coinHistory = this.getHistoricalPrice(name);
        if(coinHistory.length > 0) return coinHistory[coinHistory.length - 1];
        return null;
    }
    getCurrentPrices() {
        return this.getSymbols()
            .map(symbol => {
                return { symbol, price: this.getCurrentPrice(symbol) };
            })
            .reduce((acc, item) => {
                acc[item.symbol] = item.price;
                return acc;
            }, {});
    }


    getHistoricalPrice(name) {
        const coinHistory = this.coinsHistory[name];
        if(coinHistory && coinHistory.length > 0) return coinHistory;
        return [];
    }
    getHistoricalPrices() { return this.coinsHistory; }

    pushPrice(coins) {

        coins.forEach(coin => {

            const priceHistory = this.getHistoricalPrice(coin.symbol);
            console.log('price history:', priceHistory);
            console.log('coin', coin);
            // eslint-disable-next-line
            if (!!priceHistory) {
                this.coinsHistory[coin.symbol].push({
                    updated: coin.last_updated,
                    price: coin.quote.USD.price,
                    rank: coin.cmc_rank
                });
            }
            else {
                const currentPrice = this.getCurrentPrice(coin.symbol);
                console.log('current price', currentPrice);
                if(currentPrice.updated !== coin.last_updated) {
                    this.coinsHistory[coin.symbol].push({
                        updated: coin.last_updated,
                        price: coin.quote.USD.price,
                        rank: coin.cmc_rank
                    });
                }
            }
            while(this.coinsHistory[coin.symbol].length > 30) {
                this.coinsHistory[coin.symbol].unshift();
            }
        });
    }

    fetchPrices(apiKey) {

        console.log('fetch prices just ran');
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
                console.log('this is fetch prices');
                // console.log(body.data);
                this.pushPrice(body.data);
            });
    }

    startWatch(apiKey, interval = this.DEFAULT_INTERVAL) {
        if(this.running) return;
        this.running = true;
        this.fetchPrices.bind(this, apiKey);
        setInterval(this.fetchPrices.bind(this, apiKey), interval);
    }
};

