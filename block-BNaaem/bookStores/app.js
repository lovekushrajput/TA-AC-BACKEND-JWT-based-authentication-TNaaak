var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var mongoose = require('mongoose')
require('dotenv').config()
var auth = require('../bookStores/middlewares/auth')

//mongoose connect
mongoose.connect('mongodb://localhost/bookStores', (err) => {
  console.log('connected', err ? err : 'true')
})

var indexRouter = require('./routes/index');
let usersRouter = require('./routes/users')
var BooksRouter = require('./routes/book');
var v2CommentRouter = require('./routes/comment')


var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api', indexRouter);
app.use('/api/users', usersRouter);

app.use(auth.varifyToken)
app.use('/api/Books', BooksRouter);
app.use('/api/Comments', v2CommentRouter);


module.exports = app;
