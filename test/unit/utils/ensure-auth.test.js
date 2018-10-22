const ensureAuth = require('../../../lib/util/ensure-auth');
const { sign } = require('../../../lib/util/tokenizer');

describe('ensure auth middleware', () => {
    it('checks a bearer token', done => {
        const token = sign({ name: 'me' });
        const req = {
            token
        };

        const next = () => {
            expect(req.user).toEqual({ name: 'me' });
            done();
        };
        ensureAuth(req, null, next);
    });

    it('checks a bearer token and fails when it is bad', done => {
        const req = {
            token: 'anhteountheo'
        };

        const next = (err) => {
            expect(err).toBeDefined();
            done();
        };

        ensureAuth(req, null, next);
    });
});
