const expect = require('./../support');

const components = require('./../../lib/util/components');

describe('components', () => {

    it('should extract the components (parents) of an object path', () => {

        expect(components('user.account', '.')).to.deep.equal(['user', 'user.account']);
    });

    it('should handle a leading separator as expected depending on what separator is given', () => {

        expect(components('/user/account', '/')).to.deep.equal(['/', '/user', '/user/account']);
        expect(components('\\user\\account', '\\')).to.deep.equal(['\\', '\\user', '\\user\\account']);
        expect(components('.user.account', '.')).to.deep.equal(['', '.user', '.user.account']);
    });
});