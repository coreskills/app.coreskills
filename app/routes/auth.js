const express = require('express');
const router = express.Router();

const admin = require('firebase-admin');
const auth = admin.auth();

router.post('/sessionLogin', async (req, res) => {
  const idToken = req.body.idToken.toString();
  const csrfToken = req.body.csrfToken.toString();

  if (csrfToken !== req.cookies.csrfToken) {
    res.status(401).send('UNAUTHORIZED REQUEST!');
    return;
  }

  const expiresIn = 60 * 60 * 24 * 5 * 1000;
  auth.createSessionCookie(idToken, { expiresIn })
    .then((sessionCookie) => {
      const options = { maxAge: expiresIn, httpOnly: true, secure: false };
      res.cookie('session', sessionCookie, options);
      res.end(JSON.stringify({ status: 'success' }));
    }, () => {
      res.status(401).send('UNAUTHORIZED REQUEST!');
    })
});

router.get('/forgot-password', (req, res) => {
  res.render("forgot-password");
});

router.get('/reset-email-sent', (req, res) => {
  res.render("reset-email-sent");
});

router.get('/sessionLogout', (req, res) => {
  res.clearCookie('session');
  res.render('login', { title: "Login" });
});

module.exports = router;