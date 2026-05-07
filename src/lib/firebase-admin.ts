import * as admin from 'firebase-admin';

if (!admin.apps.length) {
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (!projectId || !clientEmail || !privateKey) {
    console.error('❌ Firebase Admin missing required environment variables:', {
      projectId: !!projectId,
      clientEmail: !!clientEmail,
      privateKey: !!privateKey
    });
  } else {
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
}

// Export getters to avoid immediate initialization failure during build
export const adminAuth = admin.apps.length ? admin.auth() : null as any;
export const adminDb = admin.apps.length ? admin.firestore() : null as any;
