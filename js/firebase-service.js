// ================= FIREBASE SERVICE MODULE =================
// Provides unified Auth, Firestore Database, and Storage (PDFs & Images) integration.
// Gracefully falls back to local server & localStorage if Firebase is not yet configured.

let firebaseApp = null;
let fbAuth = null;
let fbDb = null;
let fbStorage = null;

function initFirebase() {
  if (typeof firebase === 'undefined') {
    return false;
  }

  if (window.isFirebaseConfigured && window.isFirebaseConfigured()) {
    try {
      if (!firebase.apps.length) {
        firebaseApp = firebase.initializeApp(window.firebaseConfig);
      } else {
        firebaseApp = firebase.app();
      }
      fbAuth = firebase.auth();
      fbDb = firebase.firestore();
      fbStorage = firebase.storage();
      return true;
    } catch (e) {
      console.warn('Firebase initialization error:', e);
      return false;
    }
  } else {
    return false;
  }
}

// 1. AUTHENTICATION: SIGN UP
async function firebaseSignUp(email, password, displayName) {
  if (initFirebase() && fbAuth) {
    try {
      const cred = await fbAuth.createUserWithEmailAndPassword(email, password);
      if (displayName) {
        await cred.user.updateProfile({ displayName: displayName });
      }
      const user = {
        uid: cred.user.uid,
        email: cred.user.email,
        displayName: displayName || cred.user.displayName || email.split('@')[0],
        photoURL: cred.user.photoURL || 'images/default_avatar.svg',
        isGuest: false,
        lastLogin: new Date().toISOString()
      };
      localStorage.setItem('comrade_user', JSON.stringify(user));
      return user;
    } catch (err) {
      if (err.code === 'auth/operation-not-allowed') {
        throw new Error('Firebase Authentication me "Email/Password" enable karein (Firebase Console > Auth > Sign-in method).');
      } else if (err.code === 'auth/email-already-in-use') {
        throw new Error('Yeh email already registered hai. Kripya "Sign In" karein.');
      } else if (err.code === 'auth/weak-password') {
        throw new Error('Password kam se kam 6 characters ka hona chahiye.');
      }
      throw err;
    }
  } else {
    // Fallback Mock Local User
    const uid = 'user_' + btoa(email.toLowerCase()).replace(/=/g, '').substring(0, 16);
    const user = {
      uid: uid,
      email: email,
      displayName: displayName || email.split('@')[0],
      photoURL: 'images/default_avatar.svg',
      isGuest: false,
      lastLogin: new Date().toISOString()
    };
    localStorage.setItem('comrade_user', JSON.stringify(user));
    return user;
  }
}

// 2. AUTHENTICATION: SIGN IN
async function firebaseSignIn(email, password) {
  if (initFirebase() && fbAuth) {
    try {
      const cred = await fbAuth.signInWithEmailAndPassword(email, password);
      const user = {
        uid: cred.user.uid,
        email: cred.user.email,
        displayName: cred.user.displayName || email.split('@')[0],
        photoURL: cred.user.photoURL || 'images/default_avatar.svg',
        isGuest: false,
        lastLogin: new Date().toISOString()
      };
      localStorage.setItem('comrade_user', JSON.stringify(user));
      return user;
    } catch (err) {
      if (err.code === 'auth/user-not-found') {
        throw new Error('Is email se koi account nahi mila. Pehle "Sign Up" karein!');
      } else if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        throw new Error('Galat password daala hai. Kripya dobara check karein.');
      } else if (err.code === 'auth/operation-not-allowed') {
        throw new Error('Firebase Authentication me "Email/Password" enable karein (Firebase Console > Auth > Sign-in method).');
      }
      throw err;
    }
  } else {
    // Fallback Mock Local User
    const uid = 'user_' + btoa(email.toLowerCase()).replace(/=/g, '').substring(0, 16);
    const user = {
      uid: uid,
      email: email,
      displayName: email.split('@')[0],
      photoURL: 'images/default_avatar.svg',
      isGuest: false,
      lastLogin: new Date().toISOString()
    };
    localStorage.setItem('comrade_user', JSON.stringify(user));
    return user;
  }
}

// 3. AUTHENTICATION: GOOGLE 1-CLICK POPUP
async function firebaseGoogleSignIn() {
  if (initFirebase() && fbAuth) {
    try {
      const provider = new firebase.auth.GoogleAuthProvider();
      const result = await fbAuth.signInWithPopup(provider);
      const user = {
        uid: result.user.uid,
        email: result.user.email,
        displayName: result.user.displayName || result.user.email.split('@')[0],
        photoURL: result.user.photoURL || 'images/default_avatar.svg',
        provider: 'google',
        isGuest: false,
        lastLogin: new Date().toISOString()
      };
      localStorage.setItem('comrade_user', JSON.stringify(user));
      return user;
    } catch (err) {
      if (err.code === 'auth/operation-not-allowed') {
        throw new Error('Firebase Console me "Google" sign-in provider enable karein (Authentication > Sign-in method).');
      } else if (err.code === 'auth/popup-closed-by-user') {
        return null; // user simply closed popup
      }
      throw err;
    }
  } else {
    // Fallback Prompt
    const sampleEmail = prompt('Enter your Google Email to connect:', 'lead.developer@gmail.com');
    if (!sampleEmail) return null;
    const uid = 'goog_' + btoa(sampleEmail.toLowerCase()).replace(/=/g, '').substring(0, 16);
    const user = {
      uid: uid,
      email: sampleEmail,
      displayName: sampleEmail.split('@')[0].toUpperCase(),
      photoURL: 'images/default_avatar.svg',
      provider: 'google',
      isGuest: false,
      lastLogin: new Date().toISOString()
    };
    localStorage.setItem('comrade_user', JSON.stringify(user));
    return user;
  }
}

// 4. AUTHENTICATION: SIGN OUT
async function firebaseSignOut() {
  if (initFirebase() && fbAuth) {
    try {
      await fbAuth.signOut();
    } catch(e){}
  }
  localStorage.removeItem('comrade_user');
  sessionStorage.removeItem('ceo_authenticated');
}

// 4B. AUTHENTICATION STATE OBSERVER
function getFirebaseAuth() {
  if (initFirebase()) return fbAuth;
  return null;
}

function onFirebaseAuthStateChanged(callback) {
  if (initFirebase() && fbAuth) {
    return fbAuth.onAuthStateChanged(callback);
  } else {
    try {
      const u = localStorage.getItem('comrade_user');
      callback(u ? JSON.parse(u) : null);
    } catch(e) {
      callback(null);
    }
    return () => {};
  }
}

// 5. STORAGE: UPLOAD PDF RESUME OR IMAGE TO FIREBASE STORAGE
async function firebaseUploadFile(file, customPath) {
  if (!file) return null;

  if (initFirebase() && fbStorage) {
    try {
      const sanitizedName = file.name.replace(/[^a-zA-Z0-9_.-]/g, '_');
      const storagePath = customPath || `portfolio_files/${Date.now()}_${sanitizedName}`;
      const fileRef = fbStorage.ref().child(storagePath);
      
      const snapshot = await fileRef.put(file);
      const downloadURL = await snapshot.ref.getDownloadURL();
      return downloadURL;
    } catch (err) {
      console.warn('Firebase Storage upload error, falling back to local /api/upload:', err);
    }
  }

  // Fallback to local /api/upload server endpoint
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const res = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ filename: file.name, data: reader.result })
        });
        if (res.ok) {
          const json = await res.json();
          resolve(json.url || reader.result);
        } else {
          resolve(reader.result);
        }
      } catch (err) {
        resolve(reader.result);
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Helper to recursively strip undefined and function values which crash Firestore
function sanitizeForFirestore(val) {
  if (val === undefined || val === null) return null;
  if (Array.isArray(val)) {
    return val.map(item => item === undefined ? null : sanitizeForFirestore(item));
  }
  if (typeof val === 'object' && !(val instanceof Date)) {
    const res = {};
    for (const k of Object.keys(val)) {
      const v = val[k];
      if (v !== undefined) {
        res[k] = sanitizeForFirestore(v);
      }
    }
    return res;
  }
  return val;
}

// 6. FIRESTORE DATABASE: SAVE USER PORTFOLIO
async function firebaseSavePortfolio(userId, portfolioData) {
  if (!userId || !portfolioData) return false;

  const nowIso = new Date().toISOString();
  const cleanPayload = sanitizeForFirestore({
    ...portfolioData,
    updatedAt: nowIso
  });

  if (initFirebase() && fbDb) {
    try {
      // 1. Save directly under User's UID in portfolios
      await fbDb.collection('portfolios').doc(userId).set(cleanPayload, { merge: true });

      // 2. Keep username registry & username-based direct route synced
      const rawUser = portfolioData.username || (cleanPayload.username);
      if (rawUser) {
        const cleanU = sanitizeUsernameInput(rawUser);
        if (cleanU) {
          try {
            await fbDb.collection('portfolios').doc('username_' + cleanU).set({
              ...cleanPayload,
              uid: userId,
              username: cleanU,
              isUsernameRecord: true,
              updatedAt: nowIso
            }, { merge: true });

            await fbDb.collection('usernames').doc(cleanU).set({
              uid: userId,
              username: cleanU,
              updatedAt: nowIso
            }, { merge: true });
          } catch (syncErr) {
            console.warn('Username sync on portfolio save:', syncErr);
          }
        }
      }

      return true;
    } catch (e) {
      console.error('CRITICAL Firestore save error:', e);
      throw e;
    }
  }
  return false;
}

// 7. FIRESTORE DATABASE: FETCH USER PORTFOLIO BY ID (FOR SHAREABLE LINK)
async function firebaseGetPortfolio(userId) {
  if (!userId) return null;

  if (initFirebase() && fbDb) {
    try {
      const doc = await fbDb.collection('portfolios').doc(userId).get();
      if (doc.exists) {
        return doc.data();
      }
    } catch (e) {
      console.warn('Firestore fetch error:', e);
    }
  }
  return null;
}

// 8. UNIQUE USERNAME / USER ID REGISTRY & ROUTING ENGINE
const RESERVED_USERNAMES = [
  'ceo', 'admin', 'login', 'signin', 'auth', 'home', 'demo', 'profiles',
  'api', 'images', 'css', 'js', 'u', 'user', 'portfolio', 'portfolio_lead',
  'index', 'terms', 'privacy', 'help', 'settings', 'studio', 'signup'
];

function sanitizeUsernameInput(raw) {
  if (!raw) return '';
  return raw.trim().toLowerCase()
    .replace(/^@+/, '')
    .replace(/[^a-z0-9_-]/g, '')
    .substring(0, 24);
}

function validateUsernameFormat(username) {
  const clean = sanitizeUsernameInput(username);
  if (!clean || clean.length < 3) {
    return { valid: false, error: 'User ID must be at least 3 characters long.' };
  }
  if (clean.length > 24) {
    return { valid: false, error: 'User ID cannot exceed 24 characters.' };
  }
  if (!/^[a-z0-9][a-z0-9_-]*[a-z0-9]$/.test(clean)) {
    return { valid: false, error: 'User ID can only contain letters, numbers, hyphens, and underscores.' };
  }
  if (RESERVED_USERNAMES.includes(clean)) {
    return { valid: false, error: 'This User ID is reserved for system routes.' };
  }
  return { valid: true, clean };
}

async function firebaseCheckUsernameAvailable(rawUsername, currentUid) {
  const validation = validateUsernameFormat(rawUsername);
  if (!validation.valid) {
    return { available: false, error: validation.error };
  }
  const clean = validation.clean;

  if (initFirebase() && fbDb) {
    try {
      let isTaken = false;
      let ownerUid = null;

      // 1. Authoritative check: 'usernames' collection
      try {
        const uDoc = await fbDb.collection('usernames').doc(clean).get();
        if (uDoc.exists) {
          isTaken = true;
          const uData = uDoc.data();
          ownerUid = (uData && uData.uid) ? uData.uid : true;
        }
      } catch (errU) {
        console.warn('Error reading usernames collection:', errU);
      }

      // 2. Secondary check: 'portfolios' collection under 'username_' alias
      if (!isTaken) {
        try {
          const pDoc = await fbDb.collection('portfolios').doc('username_' + clean).get();
          if (pDoc.exists) {
            isTaken = true;
            const pData = pDoc.data();
            ownerUid = (pData && pData.uid) ? pData.uid : true;
          }
        } catch (errP) {
          console.warn('Error reading portfolios alias:', errP);
        }
      }

      // 3. Fallback query: check if any portfolio doc has this username
      if (!isTaken) {
        try {
          const snap = await fbDb.collection('portfolios').where('username', '==', clean).limit(1).get();
          if (!snap.empty) {
            isTaken = true;
            ownerUid = snap.docs[0].id;
          }
        } catch (errQ) {
          console.warn('Error querying portfolios username:', errQ);
        }
      }

      if (isTaken) {
        if (currentUid && ownerUid && String(ownerUid) === String(currentUid)) {
          return { available: true, username: clean, isOwner: true };
        }
        return { available: false, error: `"${clean}" is already taken by another user.` };
      }

      return { available: true, username: clean };
    } catch (err) {
      console.error('Check username root error:', err);
      return { available: false, error: 'Could not verify User ID. Please try again.' };
    }
  } else {
    // Local fallback check
    try {
      const stored = localStorage.getItem('comrade_usernames_map');
      const map = stored ? JSON.parse(stored) : {};
      if (map[clean]) {
        if (currentUid && String(map[clean]) === String(currentUid)) {
          return { available: true, username: clean, isOwner: true };
        }
        return { available: false, error: `"${clean}" is already taken.` };
      }
      return { available: true, username: clean };
    } catch (e) {
      return { available: true, username: clean };
    }
  }
}

async function firebaseClaimUsername(userId, rawUsername) {
  if (!userId) throw new Error('User authentication required.');
  const check = await firebaseCheckUsernameAvailable(rawUsername, userId);
  if (!check.available && !check.isOwner) {
    throw new Error(check.error || 'Username not available.');
  }

  const username = check.username;

  if (initFirebase() && fbDb) {
    // 1. Authoritative registry in 'usernames' collection
    try {
      await fbDb.collection('usernames').doc(username).set({
        uid: userId,
        username: username,
        updatedAt: new Date().toISOString()
      });
    } catch (uErr) {
      console.warn('Error setting usernames doc:', uErr);
    }

    // 2. Direct portfolio route alias in 'portfolios' collection
    try {
      await fbDb.collection('portfolios').doc('username_' + username).set({
        uid: userId,
        username: username,
        isUsernameRecord: true,
        updatedAt: new Date().toISOString()
      });
    } catch (pErr) {
      console.warn('Error setting portfolio alias:', pErr);
    }

    // 3. Link inside user's portfolio doc
    try {
      await fbDb.collection('portfolios').doc(userId).set({
        username: username,
        updatedAt: new Date().toISOString()
      }, { merge: true });
    } catch (mErr) {
      console.warn('Error linking username in user doc:', mErr);
    }
  }

  // Update local session & map
  try {
    const stored = localStorage.getItem('comrade_user');
    if (stored) {
      const u = JSON.parse(stored);
      u.username = username;
      localStorage.setItem('comrade_user', JSON.stringify(u));
    }
    const mapStr = localStorage.getItem('comrade_usernames_map');
    const map = mapStr ? JSON.parse(mapStr) : {};
    map[username] = userId;
    localStorage.setItem('comrade_usernames_map', JSON.stringify(map));
  } catch (e) {}

  return { success: true, username };
}

async function firebaseResolveUsername(identifier) {
  if (!identifier) return null;
  const clean = sanitizeUsernameInput(identifier);

  // 1. Check authoritative 'usernames' collection
  if (initFirebase() && fbDb) {
    try {
      const uDoc = await fbDb.collection('usernames').doc(clean).get();
      if (uDoc.exists && uDoc.data().uid) {
        return { uid: uDoc.data().uid, username: clean };
      }
    } catch (e1) {}
  }

  // 2. Check 'portfolios' under 'username_' alias
  if (initFirebase() && fbDb) {
    try {
      const userDoc = await fbDb.collection('portfolios').doc('username_' + clean).get();
      if (userDoc.exists && userDoc.data().uid) {
        return { uid: userDoc.data().uid, username: clean };
      }
    } catch (err) {}
  }

  // 3. Check query by username in 'portfolios'
  if (initFirebase() && fbDb) {
    try {
      const snap = await fbDb.collection('portfolios').where('username', '==', clean).limit(1).get();
      if (!snap.empty) {
        return { uid: snap.docs[0].id, username: clean };
      }
    } catch (e3) {}
  }

  // 4. Local storage map
  try {
    const map = JSON.parse(localStorage.getItem('comrade_usernames_map') || '{}');
    if (map[clean]) return { uid: map[clean], username: clean };
  } catch(e){}

  // 5. Fallback: Check if identifier is already a direct UID in portfolios
  if (initFirebase() && fbDb) {
    try {
      const portDoc = await fbDb.collection('portfolios').doc(identifier).get();
      if (portDoc.exists) {
        const portData = portDoc.data();
        return { uid: identifier, username: portData.username || null };
      }
    } catch(err){}
  }

  return { uid: identifier, username: null };
}

async function firebaseGetUserUsername(userId) {
  if (!userId) return null;

  // Check cached user first
  try {
    const stored = localStorage.getItem('comrade_user');
    if (stored) {
      const u = JSON.parse(stored);
      if (u.uid === userId && u.username) return u.username;
    }
  } catch(e){}

  if (initFirebase() && fbDb) {
    try {
      // 1. Check user's portfolio doc
      const doc = await fbDb.collection('portfolios').doc(userId).get();
      if (doc.exists && doc.data().username) {
        const un = doc.data().username;
        try {
          const stored = localStorage.getItem('comrade_user');
          if (stored) {
            const u = JSON.parse(stored);
            if (u.uid === userId) {
              u.username = un;
              localStorage.setItem('comrade_user', JSON.stringify(u));
            }
          }
        } catch(e){}
        return un;
      }

      // 2. Check usernames collection by uid query
      const snap = await fbDb.collection('usernames').where('uid', '==', userId).limit(1).get();
      if (!snap.empty) {
        const un = snap.docs[0].data().username || snap.docs[0].id;
        return un;
      }
    } catch(e){}
  }
  return null;
}

// Auto-initialize on window load
if (typeof window !== 'undefined') {
  window.initFirebase = initFirebase;
  window.firebaseSignUp = firebaseSignUp;
  window.firebaseSignIn = firebaseSignIn;
  window.firebaseGoogleSignIn = firebaseGoogleSignIn;
  window.firebaseSignOut = firebaseSignOut;
  window.getFirebaseAuth = getFirebaseAuth;
  window.onFirebaseAuthStateChanged = onFirebaseAuthStateChanged;
  window.firebaseUploadFile = firebaseUploadFile;
  window.firebaseSavePortfolio = firebaseSavePortfolio;
  window.firebaseGetPortfolio = firebaseGetPortfolio;
  window.firebaseCheckUsernameAvailable = firebaseCheckUsernameAvailable;
  window.firebaseClaimUsername = firebaseClaimUsername;
  window.firebaseResolveUsername = firebaseResolveUsername;
  window.firebaseGetUserUsername = firebaseGetUserUsername;
  window.sanitizeUsernameInput = sanitizeUsernameInput;
  window.validateUsernameFormat = validateUsernameFormat;

  window.addEventListener('DOMContentLoaded', () => {
    initFirebase();
  });
}
