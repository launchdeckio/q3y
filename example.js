const q3y = require('.');
// const Post = require('./models/Post');

const {byKey} = q3y;

const $ = q3y({
    me: {
        posts: byKey('slug')(({userId}) => {

            // return Post.find({userId});
            return [{
                userId:  1,
                slug:    'coolPost',
                id:      100,
                content: '...',
            }];
        }),
    },
});

$('/me/posts', {userId: 1}).then(console.log);

//  {"/me/posts": {
//      coolPost: {userId: 1, slug: "coolPost", id: 100, content: "..."}
//  }}