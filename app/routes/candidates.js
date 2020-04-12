// Imports
const router = require('express').Router();
const md5 = require('js-md5');
const firestore = require('firebase-admin').firestore();
const login = require('../actions/auth');
const demoEmails = new Set([
  'DanaSShaw@armyspy.com',
  'PatrickBDodd@jourrapide.com',
  'CharlesJDegennaro@rhyta.com',
  'LindsayNGrimmett@rhyta.com',
  'TeresaJThomas@rhyta.com',
  'MarthaRMcCartney@jourrapide.com',
]);

// Firestore
const MAIL_COLLECTION = 'mail';
const ORGANIZATIONS_COLLECTION = 'organizations';
const CANDIDATES_COLLECTION = 'candidates';
const USERS_COLLECTION = 'users';

// Commands
router.post('/sendAssignment', async (req, res) => {
  login(req)
    .then(async (decodedClaims) => {
      const { organizationId, company, role, fullName, emailAddress } = req.body;
      sendEmail(company, role, fullName, emailAddress);
      addCandidate(organizationId, emailAddress, fullName);
      res.end(JSON.stringify({ status: 'success' }));
    })
    .catch(() => {
      res.status(401).end('Unauthorized');
    });
});

// Routes
router.get('/candidate/:email', async function (req, res) {
  if (demoEmails.has(req.params.email)) {
    await renderDemoProfile(req, res);
  } else {
    login(req)
      .then(async (decodedClaims) => {
        const userRef = firestore.collection(USERS_COLLECTION).doc(decodedClaims.user_id);
        const user = await userRef.get();
        const organizationRef = user.data().organization;
        const organization = await organizationRef.get();
        const roleName = organization.data().role;
        const candidatesQuerySnapshot = await organizationRef.collection(CANDIDATES_COLLECTION).where("email", "==", req.params.email).get();
        const candidateList = candidatesQuerySnapshot.docs.map(snapshot => snapshot.data());

        if (candidateList.length === 0) {
          res.status(404).end('Not Found');
        } else {
          res.render('candidate', {
            title: 'Candidate Information',
            role: roleName,
            candidate: candidateList[0],
            displayName: user.data().displayName,
            avatar: user.data().avatar,
            email: user.data().email,
            isInterviewer: user.data().role === 'interviewer',
          });
        }
      })
      .catch(() => {
        res.render('login', { title: "Login" });
      });
  }
});

router.get("/new-candidate", (req, res) => {
  login(req)
    .then(async (decodedClaims) => {
      const userRef = firestore.collection(USERS_COLLECTION).doc(decodedClaims.user_id);
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

router.get("/edit-candidate-info/:email", (req, res) => {
  login(req)
    .then(async (decodedClaims) => {
      // Get logged-in user
      const userRef = firestore.collection(USERS_COLLECTION).doc(decodedClaims.user_id);
      const user = await userRef.get();

      // Get user's org
      const organizationRef = user.data().organization;
      const organization = await organizationRef.get();
      const roleName = organization.data().role;

      const candidatesQuerySnapshot = await organizationRef.collection(CANDIDATES_COLLECTION).where("email", "==", req.params.email).get();
      const candidate = candidatesQuerySnapshot.docs.map(snapshot => snapshot.data())[0];

      res.render('edit-candidate-info', {
        title: 'Edit Candidate Information',
        role: roleName,
        displayName: user.data().displayName,
        avatar: user.data().avatar,
        email: user.data().email,
        candidateEmail: candidate.email,
        fullName: candidate.fullName,
        status: candidate.status,
        repository: candidate.repository,
        pullRequest: candidate.pullRequest,
        totalScore: candidate.totalScore,

      });
    })
    .catch(() => {
      res.render('login', { title: "Login" });
    });
});

router.post("/updateCandidateInfo", (req, res) => {
  login(req)
    .then(async (decodedClaims) => {
      const { status, repository, pullRequest, totalScore } = req.body;
      updateCandidateInfo(email, status, repository, pullRequest, totalScore);
      res.end(JSON.stringify({ status: 'success' }));
    })
    .catch(() => {
      res.status(401).end('Unauthorized');
    });
})

// Utils
async function renderDemoProfile(req, res) {
  const organization = firestore.collection(ORGANIZATIONS_COLLECTION).doc('ghxJKxmhi7c5CxpBGVBx');
  const roleName = (await organization.get()).data().role;
  const candidatesQuerySnapshot = await organization.collection(CANDIDATES_COLLECTION).where("email", "==", req.params.email).get();
  const candidateList = candidatesQuerySnapshot.docs.map(snapshot => snapshot.data());

  res.render('candidate', {
    title: 'Candidate Information',
    role: roleName,
    candidate: candidateList[0],
    displayName: "Frances J. Ruel",
    avatar: "https://secure.gravatar.com/avatar/ae3d5387e16c55b28ea5d3e6bcf8c70b?s=80&d=identicon",
    email: "FrancesJRuel@dayrep.com",
  });
}

function sendEmail(company, role, fullName, emailAddress) {
  firestore.collection(MAIL_COLLECTION).add({
    to: 'anton@coreskills.dev',
    message: {
      subject: '✅ CoreSkills App: New Candidate',
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
}

function addCandidate(organizationId, emailAddress, fullName) {
  let md5Email = md5(emailAddress);
  firestore.collection(ORGANIZATIONS_COLLECTION).doc(organizationId).collection(CANDIDATES_COLLECTION).add({
    avatar: `https://www.gravatar.com/avatar/${md5Email}?s=128&d=identicon&r=PG`,
    email: emailAddress,
    fullName: fullName,
    expiresOn: '(pending)',
    status: "Sending assignment"
  });
}

async function updateCandidateInfo(email, status, repository, pullRequest, totalScore) {
  const candidatesQuerySnapshot = await organization.collection(CANDIDATES_COLLECTION).where("email", "==", req.params.email).get();
  const candidate = candidatesQuerySnapshot.docs[0];
  candidate.ref.update({
    status: status,
    repository: repository,
    pullRequest: pullRequest,
    totalScore: totalScore,
  });
}

// Exports
module.exports = router;

// TODO
// - encapsulate rendering most used pages with data
// - simplify firestore data access with utility methods
// - Return 404 when no such candidate exists instead of unfilled candidate page.