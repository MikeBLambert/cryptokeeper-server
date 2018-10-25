
const getCurrentPrices = () => {

    return {
        BTC: { price: 6000, rank: 1, updated: new Date().toISOString() },
        ETH: { price: 200, rank: 2, updated: new Date().toISOString() },
        LTC: { price: 150, rank: 3, updated: new Date().toISOString() },
        XRP: { price: 0.20, rank: 4, updated: new Date().toISOString() },
        BCH: { price: 1000, rank: 5, updated: new Date().toISOString() },
        EOS: { price: 5.37, rank: 6, updated: new Date().toISOString() },
        XLM: { price: 0.20, rank: 7, updated: new Date().toISOString() },
        USDT: { price: 1, rank: 8, updated: new Date().toISOString() },
        ADA: { price: .07, rank: 9, updated: new Date().toISOString() },
        XMR: { price: 100, rank: 10, updated: new Date().toISOString() }
    };

};

module.exports = {
    getCurrentPrices
};
