var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var expressLayouts = require('express-ejs-layouts');
var session = require('client-sessions');

var index = require('./routes/index');
var site = require('./routes/site');
var admin = require('./routes/admin');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, 'public', 'favicon.png')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(expressLayouts);
app.use(session({
    cookieName: 'session',
    secret: 'secret',
    duration: 30 * 60 * 1000,
    activeDuration: 5 * 60 * 1000,
}));
app.use((req, res, next) => {
    res.locals.cart = req.session.cart;
    res.locals.current_user = req.session.current_user;
    next();
})

// Set Layout
app.use('/admin', (req, res, next) => {
    app.set('layout', '_templates/admin');
    next();
});
app.use('/site', (req, res, next) => {
    app.set('layout', '_templates/gamebox');
    next();
});

// Routes
app.use('/', index);
app.use('/site', site);
app.use('/admin', admin);

// catch 404 and forward to error handler
/*app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});*/

// error handler
/*app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});*/

module.exports = app;
