#!/usr/local/bin/bash
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://coreskills-d99ea.firebaseio.com"
});

const query = admin.firestore().collection('organizations/2Z2oMBuO8Y6DMCoOmRb2/candidates');
let collectionRef = admin.firestore().collection('organizations/ghxJKxmhi7c5CxpBGVBx/candidates');
query.get().then(querySnapshot => {
  querySnapshot.forEach(documentSnapshot => {
    collectionRef.add(documentSnapshot.data());
  });
});