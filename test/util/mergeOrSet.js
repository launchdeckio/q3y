const expect = require('./../support');

const mergeOrSet = require('./../../lib/util/mergeOrSet');

describe('mergeOrSet', () => {

    it('should deep-set or replace primitives at the given path', () => {

        expect(mergeOrSet({}, 'foo.bar', 'baz')).to.deep.equal({foo: {bar: 'baz'}});

        expect(mergeOrSet({foo: {bar: 'BOOO'}}, 'foo.bar', 'baz')).to.deep.equal({foo: {bar: 'baz'}});

        expect(mergeOrSet({foo: {biz: 'boz', bar: 'BOOO'}}, 'foo.bar', 'baz')).to.deep.equal({
            foo: {
                biz: 'boz',
                bar: 'baz'
            }
        });

        expect(mergeOrSet({foo: {bar: 'BOOO'}}, 'foo.bar', {fiz: 'foz'})).to.deep.equal({foo: {bar: {fiz: 'foz'}}});
    });

    it('should deep-merge objects', () => {

        expect(mergeOrSet({foo: {biz: 'boz', bar: 'BOOO'}}, 'foo', {bar: 'bonzo'})).to.deep.equal({
            foo: {
                biz: 'boz',
                bar: 'bonzo'
            }
        });
    });
});