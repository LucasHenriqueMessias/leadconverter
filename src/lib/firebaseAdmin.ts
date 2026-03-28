import { applicationDefault, cert, getApps, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

let initialized = false;

function initFirebaseAdmin() {
  if (initialized || getApps().length > 0) {
    initialized = true;
    return;
  }

  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (projectId && clientEmail && privateKey) {
    initializeApp({
      credential: cert({ projectId, clientEmail, privateKey }),
    });
    initialized = true;
    return;
  }

  try {
    initializeApp({ credential: applicationDefault() });
    initialized = true;
  } catch {
    initialized = false;
  }
}

export function getAdminDb() {
  initFirebaseAdmin();

  if (!initialized || getApps().length === 0) {
    return null;
  }

  return getFirestore();
}
