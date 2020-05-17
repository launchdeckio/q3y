# q3y

> Nested lazily evaluated data. Somewhat like GraphQL, but without the explicit spec part.

[![NPM Version][npm-image]][npm-url]

### Cool. Wait, what?

This module allows you to define a tree-shaped structure that holds all accessible data,
and query the data at different levels. By using on-demand resolvers (just functions, really),
only the requested data will be computed.

#### Example

```js
const q3y  = require('q3y');
const Post = require('./models/Post');

const {byKey} = q3y;

const $ = q3y({
    me: {
        posts: byKey('slug')(({userId}) => {
            
            return Post.find({userId});
        }),
    },
});

$('/me/posts', {userId: 1}).then(console.log);

//  {"/me/posts": {
//      coolPost: {userId: 1, slug: "coolPost", id: 100, content: "..."}
//  }}

```

### Install

```bash
$ npm install q3y
```

## License

MIT © [sgtlambda](http://github.com/sgtlambda)

[![dependency Status][david-image]][david-url]
[![devDependency Status][david-dev-image]][david-dev-url]

[david-image]: https://img.shields.io/david/launchdeckio/q3y.svg?style=flat-square
[david-url]: https://david-dm.org/launchdeckio/q3y

[david-dev-image]: https://img.shields.io/david/dev/launchdeckio/q3y.svg?style=flat-square
[david-dev-url]: https://david-dm.org/launchdeckio/q3y#info=devDependencies

[npm-image]: https://img.shields.io/npm/v/q3y.svg?style=flat-square
[npm-url]: https://www.npmjs.com/package/q3y
