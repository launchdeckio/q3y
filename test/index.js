'use strict';

const {pickBy, get} = require('lodash');

const expect = require('./support/index');

const NoDataAtPathError = require('./../lib/errors/NoDataAtPathError');

const deep = require('./../lib/higherOrder/deep');
const qrry = require('./../');

const resolve = (resolver, query, context) => {

    return qrry(resolver).resolve(query, context);
};

describe('qrry', () => {

    let apps = {
        coolApp:  {userId: 0},
        greatApp: {userId: 1},
        bestApp:  {userId: 1},
    };

    let resolver = {
        user: {
            apps:        deep(1)((userId, {path}) => {
                if (!path.length) return pickBy(apps, app => app.userId === userId);
                else {
                    let app = get(apps, path[0]);
                    if (app && app.userId === userId) return app;
                }
            }),
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
            if (!path.length) return {name: appName};
            if (path[0] === 'name') return appName;
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

});