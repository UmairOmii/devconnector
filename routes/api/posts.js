const express = require('express');
const router = express.Router();
const passport = require('passport');

const Post = require('../../models/Post');

const Profile = require('../../models/Profile')

//validation
const validatePostInput = require('../../validation/post');

// @route   GET api/posts/test
// @desc    Tests post route
// @access  Public
router.get('/test', (req, res) => res.json({ msg: 'Posts Works' }));

// @route   GET api/posts
// @desc    Get Posts
// @access  Public
router.get('/', (req, res) => {
    Post.find()
    .sort({ date: -1 })
    .then(posts => res.json(posts))
    .catch(err => res.status(404).json({ nopostsfound: 'No Post Found' }))
})

// @route   GET api/posts/:id
// @desc    Get Posts by id
// @access  Public
router.get('/:id', (req, res) => {
    Post.findById(req.params.id)
    .then(post => res.json(post))
    .catch(err => 
        res.status(404).json({ nopostsfound: 'No Post Found By with that Id' })
        )
})

// @route   POST api/posts
// @desc    Create Post
// @access  Private
router.post('/', passport.authenticate('jwt', { session: false }), (req, res) => {
    const { errors, isValid } = validatePostInput(req.body);

    if(!isValid) {
        return res.status(400).json(errors);
    }

    const newPost = new Post({
        text: req.body.text,
        name: req.body.name,
        avatar: req.body.avatar,
        user: req.user.id
    })

    newPost.save().then(post => res.json(post))
})

// @route   DELETE api/posts/:id
// @desc    DELETE Posts by id
// @access  Private
router.delete('/:id', passport.authenticate('jwt', {session: false}), (req, res) => {
    Profile.findOne({ user: req.user.id })
    .then(Profile => {
        Post.findById(req.params.id)
        .then(post => {
            // check for post owner
            if(post.user.toString() !== req.user.id) {
                return res.status(401).json({ notauthorized: 'User not authorized' })
            }
            // delete
            post.remove().then(() => res.json({ success: true }))

        })
        .catch(err => res.status(404).json({ nopostsfound: 'No Posts found' }))
    })
})

// @route   POST api/posts/like/:id
// @desc    Like Post
// @access  Private
router.post('/like/:id', passport.authenticate('jwt', {session: false}), (req, res) => {
    Profile.findOne({ user: req.user.id })
    .then(Profile => {
        Post.findById(req.params.id)
        .then(post => {
            if(post.likes.filter(like => like.user.toString() === req.user.id).length > 0) {
                return res.status(400).json({ alreadyliked: 'User Already liked this post' })
            }
            // add user id to lies array
            post.likes.unshift({ user: req.user.id })

            post.save().then(post => res.json(post))

        })
        .catch(err => res.status(404).json({ nopostsfound: 'No Posts found' }))
    })
})

// @route   POST api/posts/unlike/:id
// @desc    UnLike Post
// @access  Private
router.post('/unlike/:id', passport.authenticate('jwt', {session: false}), (req, res) => {
    Profile.findOne({ user: req.user.id })
    .then(Profile => {
        Post.findById(req.params.id)
        .then(post => {
            if(post.likes.filter(like => like.user.toString() === req.user.id).length === 0) {
                return res.status(400).json({ notliked: 'You have not liked this post' })
            }
            // Get remove index
            const removeIndex = post.likes
            .map(item => item.user.toString())
            .indexOf(req.user.id);

            //splice of array
            post.likes.splice(removeIndex, 1);

            post.save().then(post => res.json(post))
        })
        .catch(err => res.status(404).json({ nopostsfound: 'No Posts found' }))
    })
})

// @route   POST api/posts/comment/:id
// @desc    add comment to Post
// @access  Private
router.post('/comment/:id', passport.authenticate('jwt', { session: false }), (req, res) => {
    const { errors, isValid } = validatePostInput(req.body);

    if(!isValid) {
        return res.status(400).json(errors);
    }

    Post.findById(req.params.id)
    .then(post => {
        const newComment = {
            text: req.body.text,
            name: req.body.name,
            avatar: req.body.avatar,
            user: req.user.id
        }
        // Add to comments array
        post.comments.unshift(newComment);

        //save
        post.save().then(post => res.json(post))
    })
    .catch(err => res.status(404).json({ postnotfound: 'No Post Found' }))
})

// @route   POST api/posts/comment/:id/:comment_id
// @desc    Remove comment
// @access  Private
router.delete('/comment/:id/:comment_id', passport.authenticate('jwt', { session: false }), (req, res) => {
    Post.findById(req.params.id)
    .then(post => {
        // check to see comment exists
        if(post.comments.filter(comment => comment._id.toString() === req.params.comment_id ).length === 0 ) {
            return res.status(404).json({ commentnotexists: 'Comment Does not Exist' });
        }
        //Get remove index
        const removeIndex = post.comments
        .map(item => item._id.toString())
        .indexOf(req.params.comment_id)

            //splice of array
            post.comments.splice(removeIndex, 1);

            post.save().then(post => res.json(post))
    })
    .catch(err => res.status(404).json({ postnotfound: 'No Post Found' }))
})




module.exports = router;
