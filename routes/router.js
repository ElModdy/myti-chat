var express = require('express');
var router = express.Router();
var User = require('../models/user');
var hogan = require('hogan.js');
var fs = require('fs');
var path = require('path');



function login(req, callback){
  var file = "login.html";
  try {
    if(req.session.userId){
      file = "chat.html";
    }
  } catch (e) {}
  fs.readFile("./template/" + file, "utf8", function(err, content){
    callback(content);
  });
}



function loginComplete(req, callback){
  var classes = "main-box col-sm-8 col-sm-offset-2 col-lg-4 col-lg-offset-4";
  var file = "login.html";
  try {
    if(req.session.userId){
      file = "chat.html";
      classes = "main-box";
    }
  } catch (e) {}
  fs.readFile("./template/" + file, "utf8", function(err, content){
    fs.readFile('./template/wrapper.html', "utf8", function(err, wrapperData) {
      var settings = {
        classes: classes,
        content: content
      };
      var template = hogan.compile(wrapperData);
      var output = template.render(settings);
      callback(output);
    });
  });
}

router.get('/login', function (req, res, next) {
  login(req, function(data){
    res.send(data);
  })
});

router.get('/', function (req, res, next) {
  console.log("sdiaiuui");
  loginComplete(req, function(data){
    res.send(data);
  })
});

router.post('/', function (req, res, next) {
  console.log("SONO DENTRO LA REGISTRAZIONE");
  if (req.body.password !== req.body.passwordConf) {
    var err = new Error('Passwords do not match.');
    err.status = 400;
    res.send("passwords dont match");
    return next(err);
  }

  if (req.body.email &&
    req.body.username &&
    req.body.password &&
    req.body.passwordConf) {
      console.log("I CAMPI CI SONO TUTTU");

    var userData = {
      email: req.body.email,
      username: req.body.username,
      password: req.body.password,
      passwordConf: req.body.passwordConf,
    }

    User.create(userData, function (error, user) {
      if (error) {
        console.log("UN ERRORE DI MERDA CI HA ROVINATO");
        return next(error);
      } else {
        console.log("IL DATABASE NON È COSÌ BASTARDO");
        req.session.userId = user._id;


        fs.readFile('./template/confreg.html', "utf8", function(err, data) {


          var settings = {
            user: req.body.username,
            email: req.body.email
          };

          var template = hogan.compile(data);
          var output = template.render(settings);

          return res.send(output);
        });
      }
    });

  } else if (req.body.logemail && req.body.logpassword) {
    User.authenticate(req.body.logemail, req.body.logpassword, function (error, user) {
      if (error || !user) {
        return res.send("Login failed")
      } else {
        req.session.userId = user._id;
        return login(req, function(data){
          res.send(data);
        });
      }
    });
  }else {
    console.log("SCHERZAVO, È UN FIGLIO DI PUTTANA");
    var err = new Error('All fields required.');
    err.status = 400;
    return next(err);
  }
})

router.get('/logout', function (req, res, next) {

  if (req.session) {
    req.session.destroy(function (err) {
      if (err) {
        return next(err);
      } else {
        login(req, function(data){

          res.send(data);
        });
      }
    });
  }
});

function getNameById(id, callback){
  User.findOne({_id: id}, function(err, user){
    callback(user.username);
  })
}
module.exports.router = router;
module.exports.getNameById = getNameById;
