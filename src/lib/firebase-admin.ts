import * as admin from 'firebase-admin';

function initializeAdmin() {
  if (admin.apps.length) return;

  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (!projectId || !clientEmail || !privateKey) {
    // Only log error if not in build phase to avoid polluting build logs or causing build failures
    if (process.env.NODE_ENV === 'production' && process.env.NEXT_PHASE !== 'phase-production-build') {
      console.error('❌ Firebase Admin missing required environment variables:', {
        projectId: !!projectId,
        clientEmail: !!clientEmail,
        privateKey: !!privateKey
      });
    }
    return;
  }

  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        // Handle both literal newlines and escaped \n from different environment managers
        privateKey: privateKey.replace(/\\n/g, '\n'),
      }),
    });
    console.log('✅ Firebase Admin initialized successfully');
  } catch (error) {
    console.error('❌ Firebase admin initialization error:', error);
  }
}

// Export properties that initialize on demand
export const adminAuth = new Proxy({} as admin.auth.Auth, {
  get(_, prop) {
    initializeAdmin();
    if (!admin.apps.length) {
      throw new Error('Firebase Admin Auth accessed before initialization and required environment variables are missing.');
    }
    return (admin.auth() as any)[prop];
  }
});

export const adminDb = new Proxy({} as admin.firestore.Firestore, {
  get(_, prop) {
    initializeAdmin();
    if (!admin.apps.length) {
      throw new Error('Firebase Admin Firestore accessed before initialization and required environment variables are missing.');
    }
    return (admin.firestore() as any)[prop];
  }
});
