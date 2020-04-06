const express = require('express');
const router = express.Router();

const admin = require('firebase-admin');
const firestore = admin.firestore();

router.get('/demo', async (req, res) => {
  let organization = firestore.collection('organizations').doc('ghxJKxmhi7c5CxpBGVBx');
  const roleName = (await organization.get()).data().role;
  const candidatesQuerySnapshot = await organization.collection('candidates').get();
  const candidateList = candidatesQuerySnapshot.docs
    .map(snapshot => snapshot.data())
    .sort(function (a, b) { return Date.parse(b.expiresOn) - Date.parse(a.expiresOn) });

  res.render('candidates', {
    title: 'Candidate Dashboard',
    displayName: "Frances J. Ruel",
    avatar: "https://secure.gravatar.com/avatar/ae3d5387e16c55b28ea5d3e6bcf8c70b?s=80&d=identicon",
    email: "FrancesJRuel@dayrep.com",
    candidates: candidateList,
    role: roleName
  });
});

module.exports = router;