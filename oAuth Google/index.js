const express = require('express');
const app = express();
const port = 8081;
const path = require('path');
const session = require('express-session');

const passport = require('passport');
const YandexStrategy = require('passport-yandex').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;

app.use(session({ secret: "supersecret", resave: true, saveUninitialized: true }));

let Users = [{'login': 'admin', 'email':'Aks-fam@yandex.ru'},
            {'login': 'local_js_god', 'email':'ilia-gossoudarev@yandex.ru'},
            {'login': 'kunica', 'email':'skunicyna@yandex.ru'},
            {'login': 'kunica2', 'email':'s.kunica97@gmail.com'}];

const findUserByLogin = (login) => {
    return Users.find((element)=> {
        return element.login == login;
    })
}

const findUserByEmail = (email) => {
    return Users.find((element)=> {
        return element.email.toLowerCase() == email.toLowerCase();
    })
}

app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});

passport.use(new GoogleStrategy({
    clientID: "1026055474736-lsrjq19j6h8lfdmuhhbjto34h2e6n66r.apps.googleusercontent.com",
    clientSecret: "JZbWCkvbjUqa6tpJiI8osQ_Q",
    callbackURL: "http://localhost:8081/auth/google/callback",
    passReqToCallback   : true
  },
  function(request, accessToken, refreshToken, profile, done) {
    if (profile) {
        user = profile;
        return done(null, user);
    }
    else {
        return done(null, false);
        };
    }
));

passport.use(new YandexStrategy({
    clientID: '9ade2e57a4244bb8b3cfdab0cf030eee',
    clientSecret: 'a0027fb7707842bfb1301d35c2482fb8',
    callbackURL: "http://localhost:8081/auth/yandex/callback"
  },
  (accessToken, refreshToken, profile, done) => {
    let user = findUserByEmail(profile.emails[0].value);
    user.profile = profile;
    if (user) return done(null, user);

    done(true, null);
  }
));

const isAuth = (req, res, next)=> {
    if (req.isAuthenticated()) return next();

    res.redirect('/sorry');
}


app.get('/', (req, res)=> {
    res.sendFile(path.join(__dirname, 'main.html'));
});
app.get('/sorry', (req, res)=> {
    res.sendFile(path.join(__dirname, 'sorry.html'));
});
app.get('/auth/yandex', passport.authenticate('yandex'));

app.get('/auth/yandex/callback', passport.authenticate('yandex', { failureRedirect: '/sorry', successRedirect: '/private' }));

app.get('/private', isAuth, (req, res)=>{
    res.send(req.user);
});

app.get('/auth/google',
  passport.authenticate('google', { scope: 
      [ 'https://www.googleapis.com/auth/plus.login',
      , 'https://www.googleapis.com/auth/plus.profile.emails.read' ] }
));

app.get( '/auth/google/callback', 
    passport.authenticate( 'google', { 
        successRedirect: '/private',
        failureRedirect: '/sorry'
}));

app.listen(port, () => console.log(`App listening on port ${port}!`))