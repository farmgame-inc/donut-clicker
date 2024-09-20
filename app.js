/*jshint esversion: 6*/
const dotenv = require("dotenv").config();
const express = require("express");
const Session = require("express-session");
const FileStore = require("session-file-store")(Session);
const path = require("path");
const favicon = require("serve-favicon");
const logger = require("morgan");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const sassMiddleware = require("node-sass-middleware");
const flash = require("connect-flash");
const socketio = require('socket.io');

const port = 42103;
const hostname = "idler.farmgame.xyz";

const expressValidator = require("express-validator");

const session = Session({
  store: new FileStore({
    secret: process.env.SESSION_FILE_STORE
  }),
  secret: process.env.SESSION_SECRET,
  saveUninitialized: false,
  resave: false
});

const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;

const connection = require("./database/database.js");
connection
    .authenticate()
    .then(() => {
        console.log("Connected to Database");
    })
    .catch((err) => {
        console.log(err);
    })

const index = require("./routes/index");
const users = require("./routes/users");

const app = express();

const usermodel = require("./models/user");
// db connection

// // create collection app.put("/User", (req, res) =>   new usermodel.user({
// username: "Bob",     email: "bob.sponge@test.com",     password: "test"
// }).save(err => {     if (err) {       res.send(err);     } else {
// res.send("success");     }   }) ); view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

// favicon
app.use(favicon(path.join(__dirname, "public", "favicon.ico")));

app.use(logger("dev"));
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: false
  })
);
app.use(cookieParser());

//node-sass-middleware
app.use(
  sassMiddleware({
    src: path.join(__dirname, "public"),
    dest: path.join(__dirname, "public"),
    indentedSyntax: false,
    sourceMap: true
  })
);
app.use(express.static(path.join(__dirname, "public")));

//express-session
app.use(session);

//init passport
app.use(passport.initialize());
app.use(passport.session());

//express validator
app.use(
  expressValidator({
    errorFormatter(param, msg, value) {
      const namespace = param.split(".");
      const root = namespace.shift();
      let formParam = root;
      while (namespace.length) {
        formParam += `[${namespace.shift()}]`;
      }
      return {
        param: formParam,
        msg,
        value
      };
    },
    customValidators: {
      isUniqueEmail: value => {
        return new Promise((resolve, reject) => {
          usermodel
            .getUserByEmail(value)
            .then(user => {
              console.log(user);
              if (user !== null) {
                return reject(user);
              }
              return resolve(true);
            })
            .catch(err => {
              resolve(err);
              console.log(err);
            });
        });
      },
      isUniqueUsername: value => {
        return new Promise((resolve, reject) => {
          usermodel
            .getUserByUsername(value)
            .then(user => {
              console.log("isUniqueUsername", user);
              if (user !== null) {
                return reject(user);
              }
              return resolve(true);
            })
            .catch(err => {
              resolve(err);
              console.log(err);
            });
        });
      }
    }
  })
);

// use flash
app.use(flash());
// Declare global vars
app.use(function(req, res, next) {
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  res.locals.error = req.flash("error");
  res.locals.user = req.user || null;
  next();
});

// getAllUsers
app.get("/User", (req, res) =>
  usermodel.getAllUsers((err, user) => res.json(user))
);

app.put("/reset", usermodel.resetAllUsers);

app.put("/reset/:id", usermodel.resetUserById);

app.use("/", index);
app.use("/users", users);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  const err = new Error("Not Found");
  err.status = 404;
  next(err);
});

// error handler
app.use((err, req, res, next) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});
module.exports.app = app;
module.exports.session = session;



/* 
const http = require("http");
const server = http.createServer(app);
const io = socketio(server);
server.listen(3000, () => {
    console.log('RPS started on 3000'); 
    //serverController.startSocket(io,server);
}); */
