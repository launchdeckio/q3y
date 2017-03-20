# qrry

> Modular hierarchical data querying

[![Build Status][travis-image]][travis-url]
[![Code Quality][codeclimate-image]][codeclimate-url]
[![Code Coverage][coveralls-image]][coveralls-url]
[![NPM Version][npm-image]][npm-url]

### wtf?

This module allows you to define a tree-shaped structure that holds all accessible data.

#### Example

```js
const qrry = require('qrry');
const {byKey} = qrry;
const Post = require('./models/Post');

const $ = qrry({
    me: {
        posts: byKey('slug')(({userId}, {path}) => {
            
            // Works with promises!
            if(!path) return Post.find({userId});
            
            else return Post.find({userId, slug: path});
        }),
    },
});

$('/me/posts', {userId: 1}).then(console.log);

// {me: { 
//    posts: {
//       coolPost: {userId: 1, slug: "coolPost", id: 100, content: "..."}
//    }
// }

```

### Install

```bash
$ npm install qrry
```

## License

MIT © [sgtlambda](http://github.com/sgtlambda)

[![dependency Status][david-image]][david-url]
[![devDependency Status][david-dev-image]][david-dev-url]

[travis-image]: https://img.shields.io/travis/launchdeckio/qrry.svg?style=flat-square
[travis-url]: https://travis-ci.org/launchdeckio/qrry

[codeclimate-image]: https://img.shields.io/codeclimate/github/launchdeckio/qrry.svg?style=flat-square
[codeclimate-url]: https://codeclimate.com/github/launchdeckio/qrry

[david-image]: https://img.shields.io/david/launchdeckio/qrry.svg?style=flat-square
[david-url]: https://david-dm.org/launchdeckio/qrry

[david-dev-image]: https://img.shields.io/david/dev/launchdeckio/qrry.svg?style=flat-square
[david-dev-url]: https://david-dm.org/launchdeckio/qrry#info=devDependencies

[coveralls-image]: https://img.shields.io/coveralls/launchdeckio/qrry.svg?style=flat-square
[coveralls-url]: https://coveralls.io/r/launchdeckio/qrry

[npm-image]: https://img.shields.io/npm/v/qrry.svg?style=flat-square
[npm-url]: https://www.npmjs.com/package/qrry