var express = require('express');
var app = express();
var mongoose = require('mongoose');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
var server = app.listen(3000);
var io = require('socket.io').listen(server);
var routerFile = require('./routes/router');

mongoose.connect('mongodb://localhost/users');
var db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));

db.once('open', function () {

});


app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(express.static(__dirname + '/template'));

var sessionMiddleware = session({
  secret: 'work hard',
  resave: true,
  saveUninitialized: false,
  store: new MongoStore({
    mongooseConnection: db
  })
});

app.use(sessionMiddleware);

io.use(function(socket, next) {
  sessionMiddleware(socket.request, socket.request.res, next);
});

io.on('connection', function(socket){
  var nameClient;
  var id = socket.request.session.userId;
  console.log("ID: " + id);
  routerFile.getNameById(id, function(name){
    nameClient = name;
  })
  socket.on('chat message', function(msg){
    io.emit('chat message', nameClient + ": " + msg);
  });
});

var routes = routerFile.router;

app.use('/', routes);

app.use(function (req, res, next) {
  var err = new Error('File Not Found');
  err.status = 404;
  next(err);
});

app.use(function (err, req, res, next) {
  res.status(err.status || 500);
  res.send(err.message);
});
