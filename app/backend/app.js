const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const app = express();

const userRoutes = require('./routes/user');
const postRoutes = require('./routes/posts');


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false}));

mongoose.connect('mongodb+srv://isha:j5FZzBULGH9qk3xo@cluster0-5qped.mongodb.net/node-angular?retryWrites=true&w=majority')
    .then(() => {
        console.log("Connected to database")
    })
    .catch(() => {
        console.log("Connection failed")
    });

app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE, OPTIONS");
    next();
});



app.use("/api/user", userRoutes);
app.use("/api/posts", postRoutes);

module.exports = app;
