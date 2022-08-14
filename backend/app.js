var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var fileUpload = require('express-fileupload');

var indexRouter = require('./routes/index');
var uploadRouter = require('./routes/upload');

var app = express();

/* Define Cors authorization */

app.use((req, res, next) => {
    if (['http://localhost:8938'].includes(req.headers.origin))
        res.setHeader('Access-Control-Allow-Origin', req.headers.origin);
    res.header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS, DELETE, PUT')
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, X-Websocket-User-Id, X-User-Language, Content-Type, Accept, Authorization');
    res.header('Access-Control-Expose-Headers', 'Content-Disposition');
    next();
});

app.use(fileUpload({
    useTempFiles: true,
    tempFileDir: './tmp/',
    debug: true
}));

app.use(logger('dev'));
app.use(express.json({
    limit: '500mb'
}));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/upload', uploadRouter);

module.exports = app;
