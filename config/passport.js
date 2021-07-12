const { req, res } = require('express');
const express = require('express');
const bcrypt = require("bcrypt");
const BCRYPT_SALT_ROUNDS = 12;
const passport = require("passport");
const localStrategy = require("passport-local").Strategy;

const bodyParser = require('body-parser');
passport.use(express());
passport.use(bodyParser.json());
passport.use(bodyParser.urlencoded({ extended: false }));

const User = require('../models/users');

passport.use("register", new localStrategy({

  usernameField: 'email',
  passwordField: 'password',
  session: false
},
  (email, password, done) => {
    try {

      User.findOne({ where: { email: email } })
        .then(user => {
          if (user != undefined) {

            return done(null, false, { message: "O e-mail introduzido já existe." });
          }
          if (password.length < 6) {
            return done(null, false, { message: "Introduza uma password de 6 caracteres no mínimo." });

          } else {
            bcrypt.hash(password, BCRYPT_SALT_ROUNDS)
              .then((hashedPassword) => {
                return done(null, hashedPassword);
              });
          }
        });
    } catch (err) {
      done(err);
    }
  }));

passport.use("login", new localStrategy({ 
  usernameField: "email", 
  passwordField: "password", 
  session: false },
  (email, password, done) => {
    try {
      User.findOne({ where: { email: email } })
        .then((user) => {
          if (user == undefined) {
            return done(null, false, { message: "O e-mail introduzido não existe." });

          } else {
            bcrypt.compare(password, user.password).then((response) => {
              if (response != true) {
                return done(null, false, { message: "A password introduzida está incorrecta." });
              } else {
                return done(null, user);
              }
            });
          }
        });
    } catch (err) {
      done(err);
    }
  }));



passport.use("changeoldpwd", new localStrategy({
  usernameField: 'email',
  passwordField: 'oldPassword',
  session: false
},
  (email, oldPassword, done) => {
    
    try {
      
      User.findOne({ where: { email: email } })
        .then(user => {
          
          if (user == undefined) {
            return done(null, false, { message: "O e-mail introduzido não existe." });
          }
          if (oldPassword.length < 6) {
            return done(null, false, { message: "A password atual não tem 6 caracteres no mínimo." });
          } else {
           
            bcrypt.compare(oldPassword, user.password)
              .then(response => {
                if (response != true) {
                  
                  return done(null, false, { message: "A password actual está incorrecta." });
                } else {
                  return done(null, true, undefined)
                }
              })
            }
          
        })
     } catch (err) {
      done(err);
     }
  }));



  passport.use("changenewpwd", new localStrategy({
    usernameField: 'email',
    passwordField: 'newPassword',
    session: false
  },
    (email, newPassword, done) => {
      
      try {
        
        User.findOne({ where: { email: email } })
          .then(user => {
            if (user == undefined) {
              return done(null, false, { message: "O e-mail introduzido não existe." });
            }
            if (newPassword.length < 6) {
              return done(null, false, { message: "A nova password não tem 6 caracteres no mínimo." });
            } else {
                    bcrypt.hash(newPassword, BCRYPT_SALT_ROUNDS)
                      .then(hashedPassword => {
                        return done(null, hashedPassword);
                      })
                  }
          })
      } catch (err) {
        done(err);
      }

    }));
  

