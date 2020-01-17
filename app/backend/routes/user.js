const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const router = express.Router();

const User = require('../models/user');

router.post("/register", (req, res, next) => {
    bcrypt.hash(req.body.password, 10)
    .then(hash => {
        const user = new User({
            email: req.body.email,
            password: hash,
            username: req.body.username,
            userphonenumber: req.body.userphonenumber,
            useraddress: req.body.useraddress,
            usertype: req.body.usertype
    });
    user.save()
        .then(result => {
            res.status(201).json({
                message: "User created successfully",
                result: result
            });
        })
        .catch(err => {
            res.status(500).json({
                error: err
            });
        });
    });
});

router.post("/login", (req, res, next) => {
    let fetchedUser;
    User.findOne({ email: req.body.email }).then(user => {
        if(!user) {
            return res.status(401).json({
                message: "Auth failed !"
            });
        }
        fetchedUser = user;
        
        return bcrypt.compare(req.body.password, user.password);
    })
    .then(result => {
        if(!result) {
            return res.status(401).json({
                message: "Auth failed !"
        });
    }
    const token = jwt.sign({email: fetchedUser.email, userId: fetchedUser._id, userType: fetchedUser.usertype},
         "secret_short_only_for_development",
          { expiresIn: "1h"}
          );
          res.status(200).json({
              token: token,
              expiresIn: 3600,
              userType: fetchedUser.usertype 
          });
})
    .catch(err => {
        console.log(err);
        return res.status(401).json({
            message: "Auth failed !"
        });
    });        
});

module.exports = router;