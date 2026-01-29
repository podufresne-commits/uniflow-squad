import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  query,
  where,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db } from './firebase';
import type { Role, Candidate, AssessmentSession, AssessmentQuestion } from './types';

// ================== ROLES ==================

export async function getRoles(): Promise<Role[]> {
  try {
    const rolesCollection = collection(db, 'roles');
    const rolesSnapshot = await getDocs(rolesCollection);
    return rolesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Role));
  } catch (error) {
    console.error('Error fetching roles:', error);
    return [];
  }
}

export async function getRole(id: string): Promise<Role | null> {
  try {
    const roleDoc = doc(db, 'roles', id);
    const roleSnapshot = await getDoc(roleDoc);
    if (roleSnapshot.exists()) {
      return { id: roleSnapshot.id, ...roleSnapshot.data() } as Role;
    }
    return null;
  } catch (error) {
    console.error('Error fetching role:', error);
    return null;
  }
}

export async function createRole(roleData: Omit<Role, 'id'>): Promise<string | null> {
  try {
    const rolesCollection = collection(db, 'roles');
    const docRef = await addDoc(rolesCollection, {
      ...roleData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating role:', error);
    return null;
  }
}

export async function updateRole(id: string, roleData: Partial<Role>): Promise<boolean> {
  try {
    const roleDoc = doc(db, 'roles', id);
    await updateDoc(roleDoc, {
      ...roleData,
      updatedAt: serverTimestamp()
    });
    return true;
  } catch (error) {
    console.error('Error updating role:', error);
    return false;
  }
}

export async function deleteRole(id: string): Promise<boolean> {
  try {
    const roleDoc = doc(db, 'roles', id);
    await deleteDoc(roleDoc);
    return true;
  } catch (error) {
    console.error('Error deleting role:', error);
    return false;
  }
}

// ================== CANDIDATES ==================

export async function getCandidates(): Promise<Candidate[]> {
  try {
    const candidatesCollection = collection(db, 'candidates');
    const candidatesSnapshot = await getDocs(candidatesCollection);
    return candidatesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Candidate));
  } catch (error) {
    console.error('Error fetching candidates:', error);
    return [];
  }
}

export async function getCandidate(id: string): Promise<Candidate | null> {
  try {
    const candidateDoc = doc(db, 'candidates', id);
    const candidateSnapshot = await getDoc(candidateDoc);
    if (candidateSnapshot.exists()) {
      return { id: candidateSnapshot.id, ...candidateSnapshot.data() } as Candidate;
    }
    return null;
  } catch (error) {
    console.error('Error fetching candidate:', error);
    return null;
  }
}

export async function createCandidate(candidateData: Omit<Candidate, 'id'>): Promise<string | null> {
  try {
    const candidatesCollection = collection(db, 'candidates');
    const docRef = await addDoc(candidatesCollection, {
      ...candidateData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating candidate:', error);
    return null;
  }
}

export async function updateCandidate(id: string, candidateData: Partial<Candidate>): Promise<boolean> {
  try {
    const candidateDoc = doc(db, 'candidates', id);
    await updateDoc(candidateDoc, {
      ...candidateData,
      updatedAt: serverTimestamp()
    });
    return true;
  } catch (error) {
    console.error('Error updating candidate:', error);
    return false;
  }
}

// ================== ASSESSMENT SESSIONS ==================

export async function getAssessmentSessions(): Promise<AssessmentSession[]> {
  try {
    const sessionsCollection = collection(db, 'assessmentSessions');
    const sessionsSnapshot = await getDocs(sessionsCollection);
    return sessionsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as AssessmentSession));
  } catch (error) {
    console.error('Error fetching assessment sessions:', error);
    return [];
  }
}

export async function getAssessmentSession(id: string): Promise<AssessmentSession | null> {
  try {
    const sessionDoc = doc(db, 'assessmentSessions', id);
    const sessionSnapshot = await getDoc(sessionDoc);
    if (sessionSnapshot.exists()) {
      return { id: sessionSnapshot.id, ...sessionSnapshot.data() } as AssessmentSession;
    }
    return null;
  } catch (error) {
    console.error('Error fetching assessment session:', error);
    return null;
  }
}

export async function getAssessmentSessionsByCandidate(candidateId: string): Promise<AssessmentSession[]> {
  try {
    const sessionsCollection = collection(db, 'assessmentSessions');
    const q = query(sessionsCollection, where('candidateId', '==', candidateId));
    const sessionsSnapshot = await getDocs(q);
    return sessionsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as AssessmentSession));
  } catch (error) {
    console.error('Error fetching candidate assessment sessions:', error);
    return [];
  }
}

export async function createAssessmentSession(sessionData: Omit<AssessmentSession, 'id'>): Promise<string | null> {
  try {
    const sessionsCollection = collection(db, 'assessmentSessions');
    const docRef = await addDoc(sessionsCollection, {
      ...sessionData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating assessment session:', error);
    return null;
  }
}

export async function updateAssessmentSession(id: string, sessionData: Partial<AssessmentSession>): Promise<boolean> {
  try {
    const sessionDoc = doc(db, 'assessmentSessions', id);
    await updateDoc(sessionDoc, {
      ...sessionData,
      updatedAt: serverTimestamp()
    });
    return true;
  } catch (error) {
    console.error('Error updating assessment session:', error);
    return false;
  }
}

// ================== ASSESSMENT TOKENS ==================

export interface AssessmentToken {
  id?: string;
  token: string;
  candidateId: string;
  roleId: string;
  assessmentSessionId: string;
  expiresAt: Date;
  used: boolean;
  createdAt?: Date;
}

export async function createAssessmentToken(tokenData: Omit<AssessmentToken, 'id'>): Promise<string | null> {
  try {
    const tokensCollection = collection(db, 'assessmentTokens');
    const docRef = await addDoc(tokensCollection, {
      ...tokenData,
      createdAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating assessment token:', error);
    return null;
  }
}

export async function getAssessmentToken(token: string): Promise<AssessmentToken | null> {
  try {
    const tokensCollection = collection(db, 'assessmentTokens');
    const q = query(tokensCollection, where('token', '==', token));
    const tokensSnapshot = await getDocs(q);
    
    if (!tokensSnapshot.empty) {
      const doc = tokensSnapshot.docs[0];
      return { id: doc.id, ...doc.data() } as AssessmentToken;
    }
    return null;
  } catch (error) {
    console.error('Error fetching assessment token:', error);
    return null;
  }
}

export async function markTokenAsUsed(tokenId: string): Promise<boolean> {
  try {
    const tokenDoc = doc(db, 'assessmentTokens', tokenId);
    await updateDoc(tokenDoc, {
      used: true,
      usedAt: serverTimestamp()
    });
    return true;
  } catch (error) {
    console.error('Error marking token as used:', error);
    return false;
  }
}
