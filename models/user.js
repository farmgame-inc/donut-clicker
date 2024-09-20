/*jshint esversion: 6*/
const Sequelize = require("sequelize");
const connection = require("../database/database");
//bcrypt for passwords
const bcrypt = require("bcryptjs");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;

// const exports = (module.exports = {}); create schemea and turn into model

const user = connection.define("user", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  username: {
    type: Sequelize.STRING,
    unique: true,
    allowNull: false
  },
  email: {
    type: Sequelize.STRING,
    unique: true,
    allowNull: false
  },
  password: {
    type: Sequelize.STRING,
    allowNull: false
  },
  backup: {
    type: Sequelize.STRING,
    allowNull: true
  },
  createdOn: {
    type: Sequelize.DATE,
    default: Date.now()
  }
}, {
  timestamps: false, // Disable timestamps
})

user.sync({ force: false }).then(() => { });

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

module.exports.getUserByUsername = async (usernameIn, callback = null) => {

  console.log("getUserByUsername query: ", usernameIn);
  if (callback != null) {
   try{
    const userDB = user.findOne({ where: { username: usernameIn } });
    if (userDB != null) {
      callback(null, userDB);
    } else {
      callback(new Error("User not found"), null);
    }
  }
  catch (err) {
    callback(err, null);
  }
}
  else {
    var userDB = await user.findOne({ where: { username: usernameIn } });
    return userDB;
  }
};

module.exports.getUserByEmail = async (emailIn, callback = null) => {

  if (callback != null) {
    try {
      const userDB = await user.findOne(
        {
          attributes: [ 'id','username', 'email', 'password', 'backup', 'createdOn'],
          where: { email: emailIn }
        }
      );
      if (userDB != null)
        {callback(null, userDB);}
      else
        {callback(new Error("User not found"), null);}
    } catch (err) {
      callback(err, null);
    }
  } 
  else {
    try {
      var userDB = await user.findOne(
        {
          attributes: ['id','username', 'email', 'password', 'backup', 'createdOn'],
          where: { email: emailIn }
        });
      if (userDB != null)
         {
         return userDB; 
        }
        else
        {
          console.log("User not found");
          return null;
        }
    } catch (err) {
      console.log(err);
      return null;
    }


  }
};

module.exports.getUserById = async (idIn, callback) => {
  try {
    const userDB = await user.findOne({
      attributes: ['id','username', 'email', 'password', 'backup', 'createdOn'],
      where: { id: idIn }
    })
    if(userDB != null) {callback(null, userDB);}
    else {callback(new Error("User not found"), null);} 

  } catch (err) {
    callback(err, null);
  }
};

module.exports.comparePassword = (candidatePassword, hash, callback) => {
  bcrypt.compare(candidatePassword, hash, (err, isMatch) => {
    if (err)
      throw err;
    callback(null, isMatch);
  });
};