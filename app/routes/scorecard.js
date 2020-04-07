const router = require('express').Router();
const firestore = require('firebase-admin').firestore();
const login = require('../actions/auth');

router.get('/new-scorecard/:candidateEmail', async (req, res) => {
  login(req)
    .then(async (decodedClaims) => {
      const userRef = firestore.collection("users").doc(decodedClaims.user_id);
      const user = await userRef.get();
      const organizationRef = user.data().organization;
      const organization = await organizationRef.get();
      const companyName = organization.data().name;
      const roleName = organization.data().role;
      const scorecard = organization.data().scorecard;

      res.render('new-scorecard', {
        title: "New Scorecard",
        organizationId: organizationRef.id,
        company: companyName,
        role: roleName,
        displayName: user.data().displayName,
        avatar: user.data().avatar,
        email: user.data().email,
        scorecard: scorecard,
        candidateEmail: req.params.candidateEmail,
      });
    })
    .catch(error => {
      res.render('login', { title: "Login" });
    });
});

router.post('/createScorecard', async (req, res) => {
  login(req)
    .then(async (decodedClaims) => {
      const userRef = firestore.collection("users").doc(decodedClaims.user_id);
      const user = await userRef.get();
      const organizationRef = user.data().organization;

      const candidateEmail = req.body.candidateEmail.toString();

      const candidatesQuerySnapshot = await organizationRef.collection('candidates').where("email", "==", candidateEmail).get();
      const candidateRef = candidatesQuerySnapshot.docs[0];

      const scorecardData = req.body.scorecardData;

      scorecardData.map(function(req) {
        if (req.result === 'true') {
          req.result = 'passed';
        } else {
          req.result = 'failed';
        }

        req.skills = req.skills.split(',');
        return req;
      });

      firestore.doc(`organizations/${organizationRef.id}/candidates/${candidateRef.id}`)
        .update({scorecard: scorecardData});

      res.end(JSON.stringify({ status: 'success' }));
    })
    .catch(error => {
      res.status(401).end('Unauthorized');
    });
  console.log(req.body);
  res.end(JSON.stringify({ status: 'success' }));
});

// Exports
module.exports = router;

// TODO
// Convert result true/false to passed/failed
// Convert skills from string to array