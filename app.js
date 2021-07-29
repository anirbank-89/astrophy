var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var mongoose = require("mongoose");
var cors = require('cors');

var indexRouter = require('./routes/index');
// var usersRouter = require('./routes/users');
require('dotenv').config();

var app = express();
app.use(cors());
mongoose.connect(process.env.MONGOURL,
{
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false
})
.then(() => {
    console.log('Database connected');
})
.catch((error) => {
    console.log('Error connecting to database');
});

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use('/', indexRouter);
// app.use('/users', usersRouter);

// catch 404 and forward to error handler


app.use("/uploads",express.static(path.join(__dirname, 'uploads')));
// app.use(express.static(path.join(__dirname, 'build')));
// app.use((req, res, next) => {
//     res.sendFile(path.join(__dirname, "build", "index.html"));
// });
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
    res.sendFile(path.join(__dirname, "public"));
});
app.use(function(req, res, next) {
    next(createError(404));
  });

module.exports = app;
