/*jshint esversion: 6*/
const Sequelize = require("sequelize");
const connection = require("../database/database");
//bcrypt for passwords
const bcrypt = require("bcryptjs");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;

// const exports = (module.exports = {}); create schemea and turn into model

const user = connection.define("user",{
  username: {
    type: String,
    index: {
      unique: true
    }
  },
  email: {
    type: String,
    index: {
      unique: true
    }
  },
  password: {
    type: String
  },
  backup: {
    type: JSON,
    default: null
  },
  createdOn: {
    type: Date,
    default: Date.now()
  }
}, {
  timestamps: false, // Disable timestamps
})

user.sync({force:false}).then(() => {});

module.exports = user;

module.exports.getAllUsers = callback => {
  user.find({}, callback);
};

module.exports.resetAllUsers = (req, res) => {

  user
    .find({}, function (err, users) {
      if (err)
        throw err;
      users.forEach(user => {

        user.backup = null;

        // save the user
        user.save(function (err) {
          if (err)
            throw err;
          console.log('User successfully updated!');
        });
      });
    });

  res.redirect('/user');
};

module.exports.resetUserById = (req, res) => {

  user
    .findById(req.params.id, function (err, user) {
      if (err)
        throw err;

      user.backup = null;

      // save the user
      user.save(function (err) {
        if (err)
          throw err;
        console.log(req.params.id + ' : User successfully updated!');
      });
    });

  res.redirect('/user');
};

module.exports.createUser = (newUser, callback) => {
  bcrypt.genSalt(10, (err, salt) => {
    bcrypt.hash(newUser.password, salt, (err, hash) => {
      newUser.password = hash;
      newUser.save(callback);
    });
  });
};

module.exports.getUserByUsername = (username, callback = null) => {
  const query = {
    username
  };
  if (callback != null)
    User.findOne(query, callback);
  else
    return User.findOne(query);  
};

module.exports.getUserByEmail = (email, callback = null) => {
  const query = {
    email
  };
  if (callback != null)
    User.findOne(query, callback);
  else
    return User.findOne(query);
};

module.exports.getUserById = (id, callback) => {
  user.findById(id, callback);
};

module.exports.comparePassword = (candidatePassword, hash, callback) => {
  bcrypt.compare(candidatePassword, hash, (err, isMatch) => {
    if (err)
      throw err;
    callback(null, isMatch);
  });
};