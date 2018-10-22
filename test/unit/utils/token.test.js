const { sign, verify } = require('../../../lib/util/tokenizer');

describe('tokenizer', () => {
    it('creates a token for a payload', () => {
        const token = sign({ name: 'ryan' });
        expect(token).toEqual(expect.any(String));
    });

    it('decodes a token with payload', () => {
        const token = sign({ name: 'ryan' });
        const decodedToken = verify(token);
        expect(decodedToken).toEqual({ name: 'ryan' });
    });
});
