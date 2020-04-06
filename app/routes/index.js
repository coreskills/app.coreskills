const express = require('express');
const router = express.Router();

const admin = require('firebase-admin');
const firestore = admin.firestore();
const login = require('../actions/auth');
const auth = admin.auth();

router.get('/', (req, res) => {
  const sessionCookie = req.cookies.session || '';
  login(req)
    .then(async (decodedClaims) => {
      const userRef = firestore.collection("users").doc(decodedClaims.user_id);
      const user = await userRef.get();
      const organizationRef = user.data().organization;
      const organization = await organizationRef.get();
      const roleName = organization.data().role;
      const candidatesQuerySnapshot = await organizationRef.collection('candidates').get();
      const candidateList = candidatesQuerySnapshot.docs
        .map(snapshot => snapshot.data())
        .sort(function (a, b) { return Date.parse(b.expiresOn) - Date.parse(a.expiresOn) });

      res.render('candidates', {
        title: 'Candidate Dashboard',
        displayName: user.data().displayName,
        avatar: user.data().avatar,
        email: user.data().email,
        candidates: candidateList,
        role: roleName
      });
    })
    .catch(() => {
      res.render('login', { title: "Login" });
    });
});

module.exports = router;