var moment = require('moment');

var config = require('../config');
var utils = require('../utils/utils');
var User = require('../models/user');

var UserController = module.exports = {};

UserController.account = function(req, res) {
  var user = req.session.user;
  var lastSeen = user.lastSeen ? moment().to(lastSeen) : 'never';
  res.render('account', {
    username: user.username,
    realName: user.realName,
    isAdmin: user.isAdmin,
    lastSeen: lastSeen,
  });
};

UserController.create = function(req, res) {
  res.render('create');
};

UserController.register = function(req, res) {
  if (!utils.constantTimeStringEquals(req.body.key, config.SIGNUP_KEY)) {
    // TODO nicer error message / page
    return res.status(401).send('Invalid signup key');
  }
  if (!req.body.username || req.body.username.length < config.MIN_USERNAME_LENGTH) {
    // TODO nicer error message
    return res
      .status(400)
      .send('Username too short, min length ' + config.MIN_USERNAME_LENGTH);
  }
  if (!req.body.password || req.body.password.length < config.MIN_PASSWORD_LENGTH) {
    // TODO nicer error message
    return res
      .status(400)
      .send('Password too short, min length ' + config.MIN_PASSWORD_LENGTH);
  }
  User.register(req.body.username, req.body.password, req.body.realName, function(err, user) {
    if (err) {
      // TODO more helpful error messages like "user is already registered"
      // TODO don't leak debug info by just sending along err
      return res.status(500).send('Something went wrong, try again? ' + err);
    }
    // start user session
    req.session.user = user;
    // and go to the homepage
    res.redirect('/');
  });
};

UserController.login = function(req, res) {
  User.authenticate(req.body.username, req.body.password, function(err, user) {
    if (err || !user) {
      // TODO separate out errors from invalid login credentials
      // and send appropriate status code and a descriptive error message
      return res.status(401).send('Bad login');
    }
    // start user session
    req.session.user = user;
    // and go to the homepage
    res.redirect('/');
  });
};