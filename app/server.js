// ExpressJS
const express = require('express');
const app = express();
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');

// Firebase
const admin = require('firebase-admin');
admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  databaseURL: "https://coreskills-d99ea.firebaseio.com"
});

// Setting up Express
app.set('view engine', 'ejs');
app.use('/static', express.static('public'));
app.use(cookieParser());
app.use(attachCsrfToken('/', 'csrfToken', (Math.random() * 100000000000000000).toString()));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

// Routes
const indexRouter = require('./routes/index');
const demoRouter = require('./routes/demo');
const authRouter = require('./routes/auth');
const candidatesRouter = require('./routes/candidates');
const scorecardRouter = require('./routes/scorecard');

app.use(indexRouter);
app.use(demoRouter);
app.use(authRouter);
app.use(candidatesRouter);
app.use(scorecardRouter);

app.listen(8080);

// Utils
function attachCsrfToken(url, cookie, value) {
  return (req, res, next) => {
    if (req.url === url) res.cookie(cookie, value);
    next();
  }
}

// Exports
module.exports = app;