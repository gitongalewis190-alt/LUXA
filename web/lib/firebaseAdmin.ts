import { initializeApp, getApps, cert, type App } from 'firebase-admin/app';

let adminApp: App | null = null;

export function initAdmin(): App {
  if (adminApp) return adminApp;
  if (getApps().length > 0) {
    adminApp = getApps()[0]!;
    return adminApp;
  }

  const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (serviceAccount) {
    adminApp = initializeApp({
      credential: cert(JSON.parse(serviceAccount)),
    });
  } else {
    // Fallback: use Application Default Credentials (works on Cloud Run / Vercel with env)
    adminApp = initializeApp({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    });
  }

  return adminApp;
}
