const admin = require('firebase-admin');

function login(req) {
  return admin.auth().verifySessionCookie(req.cookies.session || '', true);
}

module.exports = login;