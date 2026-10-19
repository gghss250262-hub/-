import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  collection,
  getDocs,
  query,
  limit,
  getDocFromServer
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { StudentProfile, LeaderboardEntry } from '../types/game';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid || null,
      email: auth.currentUser?.email || null,
      emailVerified: auth.currentUser?.emailVerified || null,
      isAnonymous: auth.currentUser?.isAnonymous || null,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Test connection on boot as mandated by Firebase skill
export async function testFirestoreConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client is offline, using offline cache & local storage fallback.');
    }
    return false;
  }
}

const LOCAL_STORAGE_KEY_PREFIX = 'alchemist_student_';
const LOCAL_LEADERBOARD_KEY = 'alchemist_local_leaderboard';

// Get student profile by code
export async function getStudentProfile(studentCode: string): Promise<StudentProfile | null> {
  const cleanCode = studentCode.trim().toUpperCase();
  if (!cleanCode) return null;

  // Try Firestore first
  const path = `students/${cleanCode}`;
  try {
    const docRef = doc(db, 'students', cleanCode);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data() as StudentProfile;
    }
  } catch (err) {
    console.warn('Firestore read failed or offline, checking local storage fallback:', err);
  }

  // Fallback to localStorage
  try {
    const local = localStorage.getItem(LOCAL_STORAGE_KEY_PREFIX + cleanCode);
    if (local) {
      return JSON.parse(local) as StudentProfile;
    }
  } catch (e) {
    console.error('Local storage read error:', e);
  }

  return null;
}

// Save student profile
export async function saveStudentProfile(profile: StudentProfile): Promise<void> {
  const cleanCode = profile.studentCode.trim().toUpperCase();
  const sanitizedProfile: StudentProfile = {
    ...profile,
    studentCode: cleanCode,
    updatedAt: new Date().toISOString()
  };

  // Always save locally first for instant offline responsiveness
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY_PREFIX + cleanCode, JSON.stringify(sanitizedProfile));
    localStorage.setItem('alchemist_last_student_code', cleanCode);
  } catch (e) {
    console.error('LocalStorage write error:', e);
  }

  // Save to Firestore
  const path = `students/${cleanCode}`;
  try {
    const docRef = doc(db, 'students', cleanCode);
    await setDoc(docRef, sanitizedProfile, { merge: true });
  } catch (error) {
    console.warn('Firestore write warning:', error);
    // Don't throw to prevent interrupting user play; local persistence is maintained
  }

  // Also update leaderboard entry
  await updateLeaderboardEntry({
    studentCode: cleanCode,
    studentName: profile.studentName,
    totalScore: profile.totalScore,
    totalStars: Object.values(profile.stageStars || {}).reduce((a, b) => a + b, 0),
    stagesCleared: profile.completedStages?.length || 0,
    equippedCostume: profile.equippedCostume,
    updatedAt: new Date().toISOString()
  });
}

// Update leaderboard
export async function updateLeaderboardEntry(entry: LeaderboardEntry): Promise<void> {
  const cleanCode = entry.studentCode.trim().toUpperCase();
  const path = `leaderboard/${cleanCode}`;

  try {
    const docRef = doc(db, 'leaderboard', cleanCode);
    await setDoc(docRef, entry, { merge: true });
  } catch (error) {
    console.warn('Firestore leaderboard write failed:', error);
  }

  // Keep local leaderboard copy
  try {
    const raw = localStorage.getItem(LOCAL_LEADERBOARD_KEY);
    let list: LeaderboardEntry[] = raw ? JSON.parse(raw) : [];
    const idx = list.findIndex(item => item.studentCode === cleanCode);
    if (idx >= 0) {
      list[idx] = entry;
    } else {
      list.push(entry);
    }
    list.sort((a, b) => b.totalScore - a.totalScore);
    localStorage.setItem(LOCAL_LEADERBOARD_KEY, JSON.stringify(list.slice(0, 30)));
  } catch (e) {
    console.error('Local leaderboard error:', e);
  }
}

// Fetch leaderboard entries
export async function getLeaderboard(): Promise<LeaderboardEntry[]> {
  const path = 'leaderboard';
  try {
    const q = query(collection(db, 'leaderboard'), limit(30));
    const querySnapshot = await getDocs(q);
    const list: LeaderboardEntry[] = [];
    querySnapshot.forEach(docSnap => {
      list.push(docSnap.data() as LeaderboardEntry);
    });
    if (list.length > 0) {
      return list.sort((a, b) => b.totalScore - a.totalScore);
    }
  } catch (err) {
    console.warn('Firestore leaderboard fetch error, using fallback:', err);
  }

  // Fallback to local leaderboard
  try {
    const raw = localStorage.getItem(LOCAL_LEADERBOARD_KEY);
    if (raw) {
      const parsed: LeaderboardEntry[] = JSON.parse(raw);
      return parsed.sort((a, b) => b.totalScore - a.totalScore);
    }
  } catch (e) {
    console.error('Failed reading local leaderboard:', e);
  }

  // Default seed leaderboard if brand new classroom
  return [
    { studentCode: 'S201', studentName: '연금술 견습생 민우', totalScore: 2850, totalStars: 16, stagesCleared: 6, equippedCostume: 'master', updatedAt: new Date().toISOString() },
    { studentCode: 'S202', studentName: '화학 마스터 지아', totalScore: 2420, totalStars: 14, stagesCleared: 5, equippedCostume: 'steampunk', updatedAt: new Date().toISOString() },
    { studentCode: 'S203', studentName: '실험왕 준호', totalScore: 1980, totalStars: 11, stagesCleared: 4, equippedCostume: 'cyber', updatedAt: new Date().toISOString() },
    { studentCode: 'S204', studentName: '분리수거 요정 예은', totalScore: 1540, totalStars: 9, stagesCleared: 3, equippedCostume: 'basic', updatedAt: new Date().toISOString() },
  ];
}
