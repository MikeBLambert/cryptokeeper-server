const router = require('express').Router();
const { getPrices } = require('../exchanges/coin-market-cap');

module.exports = router
    .get('/', getPrices, (req, res, next) => {
        
        const prices = req.marketData
            .slice(0, 10)
            .reduce((acc, curr) => {
                acc.push({ 
                    name: curr.name,
                    price: parseFloat(curr.quote.USD.price.toFixed(2))
                });
                return acc;
            }, []);

        
        res.json(prices);
        next();
    });
