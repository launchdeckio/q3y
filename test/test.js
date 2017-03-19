'use strict';

const {pickBy, get} = require('lodash');

const expect = require('./support/index');

const {NoDataAtPathError, getStrict, components, resolve, mergeOrSet} = require('./../');

describe('sync (support)', () => {

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

    describe('dig', () => {

        let apps = {
            coolApp:  {userId: 0},
            greatApp: {userId: 1},
            bestApp:  {userId: 1},
        };

        let resolver = {
            user: {
                apps:        (userId, {path}) => {
                    if (!path) return pickBy(apps, app => app.userId === userId);
                    else {
                        let app = get(apps, path);
                        if (app && app.userId === userId) return app;
                    }
                },
                id:          (userId, {path}) => userId,
                staticValue: 'foobarstatic',
            }
        };

        it('should resolve the value at the given object path', () => {

            return Promise.all([

                expect(resolve(resolver, {path: 'user.apps'}, 0)).to.eventually.deep.equal({
                    coolApp: {userId: 0},
                }),

                expect(resolve(resolver, {path: 'user.apps'}, 1)).to.eventually.deep.equal({
                    greatApp: {userId: 1},
                    bestApp:  {userId: 1},
                }),

            ]);
        });

        it('should invoke functions with the remainder of the path', () => {

            return Promise.all([

                expect(resolve(resolver, {path: 'user.id'}, 1)).to.eventually.equal(1),
                expect(resolve(resolver, {path: 'user.apps.greatApp'}, 1)).to.eventually.deep.equal({userId: 1}),
                expect(resolve(resolver, {path: 'user.apps.greatApp'}, 0)).to.eventually.not.be.ok,
                expect(resolve(resolver, {path: 'user.apps.nonExistentApp'}, 1)).to.eventually.not.be.ok,

            ]);
        });

        it('should return static values as well', () => {

            return expect(resolve(resolver, {path: 'user.staticValue'}, 1)).to.eventually.equal('foobarstatic');
        });

        it('should throw when digging too deep', () => {

            return expect(resolve(resolver, {path: 'user.some.non.existent.path'}, 0))
                .to.be.rejectedWith(/user\.some\.non\.existent\.path/);
        });

        it('should resolve all properties on the object when not digging deep enough', () => {

            return expect(resolve(resolver, {path: 'user'}, 0)).to.eventually.deep.equal({
                apps:        {
                    coolApp: {userId: 0},
                },
                id:          0,
                staticValue: 'foobarstatic',
            });
        });

        describe('deep', () => {

            let resolver;

            let makeAppResolver = appName => (_, {path}) => {
                if (!path) return {name: appName};
                if (path === 'name') return appName;
                // else return Promise.reject(new NoDataAtPathError(path));
                throw new NoDataAtPathError(path);
            };

            let apps = {
                'some-app':  makeAppResolver('some-app'),
                'other-app': makeAppResolver('other-app'),
            };

            beforeEach(() => {

                resolver = {
                    user: {
                        apps: path => {
                            if (path) return getStrict(apps, path);
                            return apps;
                        },
                    },
                };
            });

            it('should individually resolve values if an object is returned and no path was given', () => {

                return expect(resolve(resolver, {path: 'user.apps'})).to.eventually.deep.equal({
                    'some-app':  {name: 'some-app'},
                    'other-app': {name: 'other-app'},
                });
            });

            it('should resolve the value if an object is returned and a one-deep path was given', () => {

                return expect(resolve(resolver, {path: 'user.apps.some-app'})).to.eventually.deep.equal({
                    name: 'some-app',
                });
            });

            it('should invoke the returned function with the remainder of the path is a two-or-more-deep path was given', () => {

                return expect(resolve(resolver, {path: 'user.apps.some-app.name'})).to.eventually.equal('some-app');
            });

            it('should throw the appropriate error with a full path when digging too deep into the deep resolver', () => {

                return (expect(resolve(resolver, {path: 'user.apps.some-app.name.stuff'}))).to.be.rejectedWith(/user\.apps\.some-app\.name\.stuff/);
            });
        });

    })
});