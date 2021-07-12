process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const express = require('express');
const router = express.Router();
//const router = require('express').Router({ mergeParams: true });
const db = require('../config/database');
const User = require('../models/users');
const Movie = require('../models/movie');
const Activation = require('../models/accountActivation')
const Favorites = require('../models/favorites');
const bcrypt = require('bcrypt');
const passport = require('passport');
const nodemailer= require("nodemailer")




var transporter = nodemailer.createTransport({ // cria o trasportador do mail, ou seja acede ao mail de origem
    service: "gmail",
    auth: {
        user: "hollywoodgrupo6@gmail.com",
        pass:"Grupo6ual",
    }
});


//Change Password

router.post('/auth', (req, res, next) => {
   
    passport.authenticate("changeoldpwd", (error, password, info) => {
        if (error) {
            console.log(error);
        }
        if (req.session && req.session.user) {
            User.findOne({ where: { email: req.session.user.email } })
                .then(user => {

                        let oldPassword = req.body.oldPassword;
                        let name;
                        let message;
                        let errors = [];
                        let { email } = req.body;

                        if (!user) {
                            req.session.destroy();
                            res.redirect('/login');
                        } else {
                            name = user.name;

                            if (oldPassword == undefined) {
                                errors.push['Introduza a password atual'];
                            } else if (info != undefined) {
                                 message = `${info.message}`
                                 
                                res.render('profile', {
                                    layout: 'landing',
                                    name,
                                    message,
                                    email,
                                    title: 'Profile - Hollywood'
                                    
                                    
                                })
                            } else if (errors.length > 0) {

                                res.render('profile', {
                                    layout: 'landing',
                                    name,
                                    errors,
                                    title: 'Profile - Hollywood'
                                })


                            } else {
                                
                                res.render('auth', {
                                    layout: 'landing',
                                    email,
                                    name,
                                    title: 'Change Password - Hollywood'

                                })
                            }
                        }

               
                })
        }
    })
        (req, res, next);
});



router.post('/changepwd', (req, res, next) => {

    passport.authenticate("changenewpwd", (error, password, info) => {
        if (error) {
            console.log(error);
        }
        if (req.session && req.session.user) {
            User.findOne({ where: { email: req.session.user.email } })
                .then(user => {
                        let newPassword = req.body.newPassword;
                        let newPassword2 = req.body.newPassword2;
                        let name;
                        let message;
                        let errors;
                        let { email } = req.body;
                        let change;
                       
                        if (!user) {
                            req.session.destroy();
                            res.redirect('/login');
                        } else {
                            name = user.name;

                           
                            if (newPassword !== newPassword2) {
                                change = false;
                            }
                            
                            if (change == false) {

                                console.log(errors)

                                res.render('profile', {
                                    layout: 'landing',
                                    name,
                                    errors
                                })
                            } else if (info != undefined) {
                                 change = false;
                                message = `${info.message}`
                               res.render('profile', {
                                   layout: 'landing',
                                   name,
                                   message,
                                   email
                               })
                           } else if (change != false){
                                User.update({ password: password }, { where: { id: user.id } });
                                res.render('profile', {
                                    layout: 'landing',
                                    name,
                                    ok: 'Password alterada com sucesso.'

                                })
                            }
                        }
                })
        }
    })
        (req, res, next);
});




//GET Register
router.get('/register', (req, res) => {
    res.render('register', {
        title: 'Register - Hollywood'
    });
});

router.post("/register", (req, res, next) => {
    passport.authenticate("register", (err, password, info) => {
        let { name, email } = req.body;
        let tooSmall;
        if (err) {
            console.log(err);
        }

        if (name.length < 3) {
            tooSmall = 'Introduza um nome com 3 caracteres no mínimo '
        }
        if (info != undefined || tooSmall != null) {
            let message = `${info.message}`
            res.render('register', {
                message,
                tooSmall,
                name,
                email
            })
        } else {

            let link = Date.now();

            Activation.create({ name, email, password, admin: false, activation_link: link  })
            .then(() => {

                let mailOptions = { // criamos o mail de origem
                    from: "hollywoodgrupo6@gmail.com", // nome de origem que aparece no mail de destino
                    to: email, // este e o meu mail, alterar para o mail de destino
                    subject:  "Confirmação de conta de email", // assunto
                    html: '<h1>Bem vindo ao Hollywood</h1> '+
                    '<p>Click por favor no <a href="http://127.0.0.1/activation/'+link+'">endereço</a> para ativar '+
                    'a sua conta</p>', // corpo do mail - colocar link aqui
                    };
    
    
                    transporter.sendMail(mailOptions, function (error, mailInfo) {// envio de mail
    
                        if(error) {
                            message = 'Falha no envio de email de ativação.'
                            Activation.destroy({ where: {activation_link: link}})
                            res.render('register', {
                                name,
                                email,
                                message
                            })

                          
                        
                    } else { 
                        console.log("mail enviado" + mailInfo.response); }// confirmaçao do estado de envio do mail
                        
                       let message = 'Foi enviado um email de ativação'
                        console.log(error); // caso apareça erro imprime o erro na consola
                        res.render('activation', {
                            email,
                            message
                        })
                    
                    });
               
            })
            .catch(error => console.log(error))


        }
    })
        (req, res, next);
});

//Activation link
router.get("/activation/:id", (req, res, value) => {

        let id = req.params.id;
        let message;
        Activation.findOne({where: {activation_link: id}})
        .then(user => {
            if (user != undefined){
                messageOk = 'Conta ativada com sucesso';
                let {name, email, password, admin } = user;

                User.create({ name, email, password, admin })
                .then(() => {
                    res.render('login', {
                        email,
                        messageOk
                    })
                })
                .catch(error => console.log(error))
            } else {
                message = 'Endereço inválido.'
                res.render('login', {
                    email,
                    message
                })
                
            }
        })      
    
});


//GET login
router.get('/login', (req, res) => {
    res.render('login', {
        title: 'Login - Hollywood'
    });
});


//POST Login 
router.post('/login', (req, res, next) => {

    passport.authenticate("login", (err, user, info) => {
        let { name, email } = user;

        if (err) {
            console.log(err);
        }
        if (info != undefined) {
            let message = `${info.message}`// envia ao cliente a indicação da falha de registo
            res.render('login', {
                message,
                name,
                email
            })
        } else {
            req.session.user = user;
            res.redirect('/home');
        }
    })
        (req, res, next);
});


router.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});


router.get('/home', (req, res) => {

    if (req.session && req.session.user) {
        User.findOne({ where: { email: req.session.user.email } })
            .then(user => {
                if (!user) {

                    req.session.destroy();
                    res.redirect('/');
                } else {
                    let { name } = req.session.user
                    res.render('home', { layout: 'landing', name })
                }

            })
    } else {
        res.redirect('/');
    }
})

//GET Favorites
router.get('/favorites', (req, res) => {

    if (req.session && req.session.user) {
        User.findOne({ where: { email: req.session.user.email } })
            .then(user => {
                if (!user) {

                    req.session.destroy();
                    res.redirect('/');
                } else {
                    let { id, name } = req.session.user
                    let userId = id;
                    Favorites.findAll({ where: { user_id: userId } })
                        .then(fav => {
                            let listMovies = [];
                            for (let obj of fav) {

                                Movie.findOne({ where: { id: obj.movie_id } })
                                    .then(movie => {
                                        listMovies.push({ id: movie.id, movie_title: movie.movie_title });

                                    })
                                    .catch(err => console.log(err))

                            }
                            res.render('favorites', { layout: 'landing', name, listMovies })
                        })
                        .catch(err => console.log(err))
                }
            })
            .catch(err => console.log(err))
    } else {
        res.redirect('/');
    }
});

router.post('/:id', (req, res) => {

    let id = req.params.id * 1;
    let message;
    let user_id;
    let back;

    if (req.session && req.session.user) {
        User.findOne({ where: { email: req.session.user.email } })
            .then(user => {
                user_id = user.id;
                if (!user) {
                    req.session.destroy();
                    res.redirect('/login');
                } else {
                    return Favorites.findOne({ where: { user_id: user_id, movie_id: id } })
                        .then(favorite => {
                            Movie.findOne({ where: { id: id } })
                                .then(movie => {
                                    if (favorite == undefined) {
                                        Favorites.create({ user_id: user_id, movie_id: id })
                                        message = '<div class="favSuccess"><p>Filme adiconado com sucesso.</p></div>'
                                        //req.session.message = message;

                                        res.render('user_movie', {
                                            message,
                                            fav: true,

                                            id,
                                            trailer: movie.trailer,
                                            title: movie.movie_title + ' - Hollywood',
                                            movie_title: movie.movie_title,
                                            description: movie.description,
                                            actors: movie.actors,
                                            year: movie.year,
                                            director: movie.director
                                        })
                                    } else {

                                        res.render('user_movie', {
                                            message,
                                            fav: false,

                                            id,
                                            trailer: movie.trailer,
                                            title: movie.movie_title + ' - Hollywood',
                                            movie_title: movie.movie_title,
                                            description: movie.description,
                                            actors: movie.actors,
                                            year: movie.year,
                                            director: movie.director
                                        })


                                    }
                                }).catch(err => console.log(err))
                        }).catch(err => console.log(err))
                }
            }).catch(err => console.log(err))
    } else {
        res.redirect('login');
    }
});



//GET Profile
router.get('/profile', (req, res) => {
    let name;
    if (req.session && req.session.user) {
        User.findOne({ where: { email: req.session.user.email } })
            .then(user => {
                name = user.name;
                if (!user) {
                    req.session.destroy();
                    res.redirect('/login');
                } else {
                    res.render('profile', {
                        layout: 'landing', name,
                        title: 'Profile - Hollywood'
                    })
                }
            })
    }
});




//GET Movie
router.get('/:id', function (req, res) {
    let id = req.params.id;
    let message = req.session.message;
    let fav;
    if (req.session && req.session.user) {
        User.findOne({ where: { email: req.session.user.email } })
            .then(user => {
                if (!user) {
                    req.session.destroy();
                    Movie.findOne({ where: { id: id } })
                        .then(movie => {
                            res.render('anony_movie', {
                                //url: post.URL,
                                trailer: movie.trailer,
                                title: movie.movie_title + ' - Hollywood',
                                movie_title: movie.movie_title,
                                description: movie.description,
                                actors: movie.actors,
                                year: movie.year,
                                director: movie.director
                            })
                        })
                } else {
                    let { name } = user;
                    Movie.findOne({ where: { id: id } })
                        .then(movie => {
                            Favorites.findOne({ where: { movie_id: id, user_id: user.id } })
                                .then(favorite => {
                                    if (movie != undefined) {

                                        if (favorite != undefined) {
                                            fav = true;
                                        } else {
                                            fav = false;
                                        }
                                        res.render('user_movie', {
                                            //url: post.URL,
                                            fav,
                                            message,
                                            name,
                                            id,
                                            trailer: movie.trailer,
                                            title: movie.movie_title + ' - Hollywood',
                                            movie_title: movie.movie_title,
                                            description: movie.description,
                                            actors: movie.actors,
                                            year: movie.year,
                                            director: movie.director
                                        })
                                    }
                                }).catch(err => console.log(err))
                        }).catch(err => console.log(err))
                }
            }).catch(err => console.log(err))

    } else {
        Movie.findOne({ where: { id: id } })
            .then(movie => {
                res.render('anony_movie', {
                    //url: post.URL,
                    trailer: movie.trailer,
                    title: movie.movie_title + ' - Hollywood',
                    movie_title: movie.movie_title,
                    description: movie.description,
                    actors: movie.actors,
                    year: movie.year,
                    director: movie.director
                })
            }).catch(err => console.log(err))
    }
})




router.post('/remove/:id', (req, res) => {

    let id = req.params.id * 1;
    let message;
    let user_id;
    if (req.session && req.session.user) {
        User.findOne({ where: { email: req.session.user.email } })
            .then(user => {
                user_id = user.id;
                if (!user) {
                    req.session.destroy();
                    res.redirect('/login');
                } else {
                    return Favorites.findOne({ where: { user_id: user_id, movie_id: id } })
                        .then(fav => {

                            if (fav != undefined) {

                                Favorites.destroy({ where: { user_id: user_id, movie_id: id } })

                                req.session.message = message;
                                res.redirect('/' + id)
                            } else {
                                message = '<div class="favError"><p>O filme não existe nos favoritos.</p></div>';
                                res.redirect('/' + id)
                            }

                        }).catch(err => console.log(err))
                }
            }).catch(err => console.log(err))
    } else {
        res.redirect('login');
    }
});


module.exports = router; 