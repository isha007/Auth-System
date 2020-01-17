const express = require('express');

const Post = require('../models/post');
const checkAuth = require('../middleware/check-auth');

const router = express.Router();

router.post('', checkAuth, ( req, res, next) => {
    const post = new Post({
        title: req.body.title,
        content: req.body.content
    });
    post.save().then(createdPost => {
        res.status(201).json({
            messages: "Post added",
            postId: createdPost._id
        });
    });
});

router.get('', (req, res, next)=>{
    Post.find()
    .then(documents => {
        res.status(200).json({
            messages: 'post fetched successfully',
            posts: documents
        });
    });
    
});

router.delete('/:id', checkAuth, (req, res, next) => {
    Post.deleteOne({_id: req.params.id}).then(result => {
        console.log(result);
        res.status(200).json({ message: "Post deleted !" });
    });
    
});

module.exports = router;

