//引入实用node库
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var expressJwt = require('express-jwt');
var logger = require('morgan');
//引入用户模块：主页路由、文件接口
var indexRouter = require('./routes/index');
var fileRouter = require('./routes/file');

const secretKey = 'My azureDream'

var app = express();

// view engine setup
// Optional since express defaults to CWD/views
//D:\DevProject\MyVscode\webProject\AD\views
app.set('views', path.join(__dirname, 'views'));
// Without this you would need to
// supply the extension to res.render()
// ex: res.render('users.html').
app.set('view engine', 'ejs');


app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(expressJwt.expressjwt({secret:secretKey,algorithms: ["HS256"]}).unless({path:[/^\/api\//,'/','/admin','/admin/tologin','/root']}));

app.use(function(req, res, next) {
  if (req.originalUrl === '/root' && !req.get('Referrer')) {
      res.redirect('/admin');
  } else {
      next();
  }
});

app.use('/', indexRouter);
app.use('/api',fileRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  // res.locals.message = err.message;
  // res.locals.error = req.app.get('env') === 'development' ? err : {};
  if(err.name === 'UnauthorizedError'){
    return res.send({
      status:401,
      message:"Invalid token"
    })
  }

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
