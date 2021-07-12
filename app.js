
const { req, res } = require('express');
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const exphbs = require('express-handlebars');
const path = require('path');
const passport = require('passport');
const User = require('./models/users');

//const flash = require('express-flash');
const session = require('express-session');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));


const routes = require('./routes/handlers');
const db = require('./config/database');
 
//const { appendFile } = require('fs');

//db.sync({ force: 1, syncOnAssociation: 0 });
//Test DB
db.authenticate()
   .then(() => console.log("DB OK!"))
   .catch(err => console.log("Erro DB: " + err))

// Handlebars
app.engine('handlebars', exphbs({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');

//Stactic folder
app.use(express.static(path.join(__dirname, 'public')));

require('./config/passport');

//Flash
//app.use(flash());

//Express Session
app.use(session({
   cookieName: 'Hollywood',
   secret: '0Iydyy4lWiDmFMt5$HWYAADMYtkewsGjbQzVILrJKPjWsAzyMf87S1yP2EmaBIQjN9m2Jo0DBrQNZf',
   duration: 30 * 60 * 1000,
   activeDuration: 5 * 60 * 1000,
   resave: false,
   saveUninitialized: false
 }));


//Passport init
app.use(passport.initialize());
app.use(passport.session());


// Index 

app.get('/favicon.ico', (req, res) => res.status(204).end());
app.get('/', (req, res) => { 

   if (req.session && req.session.user) {
      User.findOne({where: { email: req.session.user.email }})
          .then(user => {
              if (!user) {
                  req.session.destroy();
                  res.render('index', { layout: 'landing'});
              } else {
                  
                  res.redirect('home')
              }

          })
  }  else {
      res.render('index',{ layout: 'landing'});
  } 
   
});

(app.use('/', routes));

//const PORT = process.env.PORT || 80;
const PORT = 80;
app.listen(PORT, () => console.log(`Servidor iniciado porto: ${PORT}`));

module.exports = app;





