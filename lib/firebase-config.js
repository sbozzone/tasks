/* ================================================================
   FIREBASE CONFIGURATION — shared by index.html and myday.html.

   Both pages load this file so the config is defined in exactly
   one place.  Replace the values below with your own Firebase
   project credentials if you are forking this application.

   See SETUP.md for instructions on creating a Firebase project.
   ================================================================ */

/** @type {import('firebase/app').FirebaseOptions} */
var firebaseConfig = {
  apiKey:            "AIzaSyCmZWuIQ6NzvS2Lhzo725Wf6Cnro6NKWzI",
  authDomain:        "todomyway-185c9.firebaseapp.com",
  databaseURL:       "https://todomyway-185c9-default-rtdb.firebaseio.com",
  projectId:         "todomyway-185c9",
  storageBucket:     "todomyway-185c9.firebasestorage.app",
  messagingSenderId: "213165358695",
  appId:             "1:213165358695:web:f166a7cc6772f8a54a1ec2"
};

/**
 * True when the config has been filled in (not left as placeholder).
 * Used by index.html's initFB() to decide whether to attempt a
 * Firebase connection.
 * @type {boolean}
 */
var configured = firebaseConfig.apiKey !== 'YOUR_API_KEY';
