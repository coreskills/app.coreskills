const express = require('express');
const router = express.Router();

const admin = require('firebase-admin');
const firestore = admin.firestore();
const auth = admin.auth();

const md5 = require('js-md5');

const demoEmails = new Set([
  'DanaSShaw@armyspy.com',
  'PatrickBDodd@jourrapide.com',
  'CharlesJDegennaro@rhyta.com',
  'LindsayNGrimmett@rhyta.com',
  'TeresaJThomas@rhyta.com',
  'MarthaRMcCartney@jourrapide.com',
]);

router.post('/sendAssignment', async (req, res) => {
  const organizationId = req.body.organizationId.toString();
  const company = req.body.company.toString();
  const role = req.body.role.toString();
  const fullName = req.body.fullName.toString();
  const emailAddress = req.body.emailAddress.toString();
  admin.firestore().collection('mail').add({
    to: 'anton@coreskills.dev',
    message: {
      subject: '✅ Coreskills: New Candidate',
      html: `
            <ul>
              <li>Company: ${company}</li>
              <li>Role: ${role}</li>
              <li>Full Name: ${fullName}</li>
              <li>Email: ${emailAddress}</li>
            </ul>
          `,
    },
  });
  let md5Email = md5(emailAddress);
  firestore.collection('organizations').doc(organizationId).collection('candidates').add({
    avatar: `https://www.gravatar.com/avatar/${md5Email}?s=128&d=identicon&r=PG`,
    email: emailAddress,
    fullName: fullName,
    expiresOn: '(pending)',
    status: "Sending assignment"
  });
  res.end(JSON.stringify({ status: 'success' }));
});

router.get('/candidate/:email', async function (req, res) {
  if (demoEmails.has(req.params.email)) {
    const organization = admin.firestore().collection('organizations').doc('ghxJKxmhi7c5CxpBGVBx');
    const roleName = (await organization.get()).data().role;
    const candidatesQuerySnapshot = await organization.collection('candidates').where("email", "==", req.params.email).get();
    const candidateList = candidatesQuerySnapshot.docs.map(snapshot => snapshot.data());

    res.render('candidate', {
      title: 'Candidate Information',
      role: roleName,
      candidate: candidateList[0],
      displayName: "Frances J. Ruel",
      avatar: "https://secure.gravatar.com/avatar/ae3d5387e16c55b28ea5d3e6bcf8c70b?s=80&d=identicon",
      email: "FrancesJRuel@dayrep.com",
    });
  } else {
    const sessionCookie = req.cookies.session || '';
    auth.verifySessionCookie(
      sessionCookie, true /** checkRevoked */)
      .then(async (decodedClaims) => {
        const userRef = firestore.collection("users").doc(decodedClaims.user_id);
        const user = await userRef.get();
        const organizationRef = user.data().organization;
        const organization = await organizationRef.get();
        const roleName = organization.data().role;
        const candidatesQuerySnapshot = await organizationRef.collection('candidates').where("email", "==", req.params.email).get();
        const candidateList = candidatesQuerySnapshot.docs.map(snapshot => snapshot.data());

        res.render('candidate', {
          title: 'Candidate Information',
          role: roleName,
          candidate: candidateList[0],
          displayName: user.data().displayName,
          avatar: user.data().avatar,
          email: user.data().email,
        });
      })
      .catch(() => {
        res.render('login', { title: "Login" });
      });
  }
});
router.get('/challenge-breakdown/:email/:task', function (req, res) {
  const sessionCookie = req.cookies.session || '';
  auth.verifySessionCookie(
    sessionCookie, true /** checkRevoked */)
    .then(async (decodedClaims) => {
      const userRef = firestore.collection("users").doc(decodedClaims.user_id);
      const user = await userRef.get();
      const organizationRef = user.data().organization;
      const organization = await organizationRef.get();
      const roleName = organization.data().role;
      const candidatesQuerySnapshot = await organizationRef.collection('candidates').where("email", "==", req.params.email).get();
      const candidateList = candidatesQuerySnapshot.docs.map(snapshot => snapshot.data());

      res.render('candidate', {
        title: 'Candidate Information',
        role: roleName,
        candidate: candidateList[0],
        displayName: user.data().displayName,
        avatar: user.data().avatar,
        email: user.data().email,
      });
    })
    .catch(() => {
      res.render('login', { title: "Login" });
    });
});

router.get("/new-candidate", (req, res) => {
  const sessionCookie = req.cookies.session || '';
  auth.verifySessionCookie(
    sessionCookie, true /** checkRevoked */)
    .then(async (decodedClaims) => {
      const userRef = firestore.collection("users").doc(decodedClaims.user_id);
      const user = await userRef.get();
      const organizationRef = user.data().organization;
      const organization = await organizationRef.get();
      const companyName = organization.data().name;
      const roleName = organization.data().role;

      res.render('new-candidate', {
        title: "Invite Candidate",
        organizationId: organizationRef.id,
        company: companyName,
        role: roleName,
        displayName: user.data().displayName,
        avatar: user.data().avatar,
        email: user.data().email,
      });
    })
    .catch(() => {
      res.render('login', { title: "Login" });
    });
});

module.exports = router;