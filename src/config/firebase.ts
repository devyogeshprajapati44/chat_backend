
import dotenv from "dotenv";
import { initializeApp, getApps, cert } from "firebase-admin/app";
import {
  getFirestore,
  FieldValue,
  Timestamp
} from "firebase-admin/firestore";

dotenv.config();

const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

if (!projectId || !clientEmail || !privateKey) {
  throw new Error("Firebase environment variables are missing");
}

const firebaseApp = getApps().length
  ? getApps()[0]
  : initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        privateKey
      })
    });

export const db = getFirestore(firebaseApp);
export { FieldValue, Timestamp };
