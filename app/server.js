// ExpressJS
const express = require('express');
const app = express();
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');

// Handlebars
const exphbs = require('express-handlebars');
const hbs = exphbs.create({
  helpers: {
    isCompleted: (status) => {
      return status === "Assignment Completed";
    },
    isDroppedOut: (status) => {
      return status === "Dropped out";
    },
    isPassed: (result) => {
      return result === "passed";
    },
    isGreen: (score) => {
      return score >= 80;
    },
    isYellow: (score) => {
      return score >= 60 && score < 80;
    },
    isOrange: (score) => {
      return score >= 40 && score < 60;
    },
    isRed: (score) => {
      return score < 40;
    }
  }
});

// Firebase
const admin = require('firebase-admin');
admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  databaseURL: "https://coreskills-d99ea.firebaseio.com"
});

// Setting up Express
app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');
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