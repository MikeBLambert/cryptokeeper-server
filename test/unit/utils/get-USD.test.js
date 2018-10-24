require('dotenv').config();
const { getPrices } = require('../../../lib/exchanges/coin-market-cap');
const { getTotalInUSD } = require('../../../lib/util/get-USD');
const { dropCollection } = require('../../util/db');
const app = require('../../../lib/app');
const request = require('supertest');
const Chance = require('chance');
const chance = new Chance();
const { checkStatus, signUp, signIn, applyUsers } = require('../../util/helpers');

describe('get total USD', () => {
    const users = applyUsers(1);
    let createdUsers;
    let createdToken;
    let token;

    beforeEach(async() => {
        await Promise.all([
            dropCollection('users'),
            dropCollection('accounts'),
            dropCollection('transactions')
        ]);
        await Promise.all(users.map(signUp))
            .then(cs => createdUsers = cs);
        await signIn(users[0])
            .then(createdToken => token = createdToken);
    });

    beforeEach(async() => {
        let accountData = {
            user: createdUsers[0]._id,
            exchange: 'Fake Market',
        };

        let holdingsData = { name: 'Bitcoin', quantity: 12 };

        let transactionData = {       
            action: 'buy',
            currency: 'Bitcoin',
            exchange: 'Fake Market',
            price: chance.natural(),
            quantity: 2
        };

        await request(app)
            .post('/users/accounts')
            .set('Authorization', `Bearer ${token}`)            
            .send(accountData);

        await request(app)
            .post('/users/accounts/holdings')
            .set('Authorization', `Bearer ${token}`)            
            .send(holdingsData);
        
        await request(app)
            .post('/users/transactions')
            .set('Authorization', `Bearer ${token}`)            
            .send(transactionData);
    });

    it('takes a user id and market data and returns total value of currencies in USD', () => {
        let userCurrencies;

        let marketData = [{ 'circulating_supply': 17339437, 
            'cmc_rank': 1, 
            'date_added': '2013-04-28T00:00:00.000Z', 
            'id': 1, 
            'last_updated': '2018-10-24T16:50:30.000Z', 
            'max_supply': 21000000, 
            'name': 'Bitcoin', 
            'num_market_pairs': 6461, 
            'quote': { 'USD': { 'last_updated': '2018-10-24T16:50:30.000Z', 
                'market_cap': 112694764843.75227, 
                'percent_change_1h': 0.180097, 
                'percent_change_24h': 0.498449, 
                'percent_change_7d': -0.600313, 
                'price': 6499.33240876, 
                'volume_24h': 3429219996.76878 } }, 
            'slug': 'bitcoin', 
            'symbol': 'BTC', 
            'total_supply': 17339437 
        }];


        return request(app)
            .get('/users/accounts/anyid')
            .set('Authorization', `Bearer ${token}`) 
            .then(res => {
                userCurrencies = res.body.currencies;
                const totalCurrencies = getTotalInUSD(userCurrencies, marketData);
                expect(totalCurrencies).toEqual('dfgdfd');

            });           
            


    });
});