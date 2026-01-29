import type { IStorageAdapter } from '../interface';
import type { Role, Candidate, AssessmentSession, AssessmentToken } from '../../types';
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
import { db } from '../../firebase';

/**
 * Firestore storage adapter for production use
 * Persists data to Firebase Cloud Firestore
 */
export class FirestoreStorageAdapter implements IStorageAdapter {
  constructor() {
    console.log('✅ FirestoreStorageAdapter initialized');
  }

  /**
   * Helper to convert Firestore Timestamp to Date
   */
  private toDate(value: any): Date {
    if (value instanceof Date) return value;
    if (value?.toDate && typeof value.toDate === 'function') return value.toDate();
    if (typeof value === 'string') return new Date(value);
    return new Date();
  }

  // ================== ROLES ==================

  async getRoles(): Promise<Role[]> {
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

  async getRole(id: string): Promise<Role | null> {
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

  async createRole(roleData: Omit<Role, 'id'>): Promise<Role> {
    try {
      const rolesCollection = collection(db, 'roles');
      const docRef = await addDoc(rolesCollection, {
        ...roleData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return { id: docRef.id, ...roleData };
    } catch (error) {
      console.error('Error creating role:', error);
      throw new Error('Failed to create role');
    }
  }

  async updateRole(id: string, updates: Partial<Role>): Promise<void> {
    try {
      const roleDoc = doc(db, 'roles', id);
      await updateDoc(roleDoc, {
        ...updates,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating role:', error);
      throw new Error('Failed to update role');
    }
  }

  async deleteRole(id: string): Promise<void> {
    try {
      const roleDoc = doc(db, 'roles', id);
      await deleteDoc(roleDoc);
    } catch (error) {
      console.error('Error deleting role:', error);
      throw new Error('Failed to delete role');
    }
  }

  // ================== CANDIDATES ==================

  async getCandidates(): Promise<Candidate[]> {
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

  async getCandidate(id: string): Promise<Candidate | null> {
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

  async createCandidate(candidateData: Omit<Candidate, 'id'>): Promise<Candidate> {
    try {
      const candidatesCollection = collection(db, 'candidates');
      const docRef = await addDoc(candidatesCollection, {
        ...candidateData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return { id: docRef.id, ...candidateData };
    } catch (error) {
      console.error('Error creating candidate:', error);
      throw new Error('Failed to create candidate');
    }
  }

  async updateCandidate(id: string, updates: Partial<Candidate>): Promise<void> {
    try {
      const candidateDoc = doc(db, 'candidates', id);
      await updateDoc(candidateDoc, {
        ...updates,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating candidate:', error);
      throw new Error('Failed to update candidate');
    }
  }

  // ================== ASSESSMENT SESSIONS ==================

  async getSession(id: string): Promise<AssessmentSession | null> {
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

  async getSessions(): Promise<AssessmentSession[]> {
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

  async createSession(sessionData: Omit<AssessmentSession, 'id'>): Promise<AssessmentSession> {
    try {
      const sessionsCollection = collection(db, 'assessmentSessions');
      const docRef = await addDoc(sessionsCollection, {
        ...sessionData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return { id: docRef.id, ...sessionData };
    } catch (error) {
      console.error('Error creating assessment session:', error);
      throw new Error('Failed to create assessment session');
    }
  }

  async updateSession(id: string, updates: Partial<AssessmentSession>): Promise<void> {
    try {
      const sessionDoc = doc(db, 'assessmentSessions', id);
      await updateDoc(sessionDoc, {
        ...updates,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating assessment session:', error);
      throw new Error('Failed to update assessment session');
    }
  }

  // ================== ASSESSMENT TOKENS ==================

  async createAssessmentToken(tokenData: AssessmentToken): Promise<void> {
    try {
      const tokensCollection = collection(db, 'assessmentTokens');
      await addDoc(tokensCollection, {
        ...tokenData,
        createdAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error creating assessment token:', error);
      throw new Error('Failed to create assessment token');
    }
  }

  async getAssessmentToken(token: string): Promise<AssessmentToken | null> {
    try {
      const tokensCollection = collection(db, 'assessmentTokens');
      const q = query(tokensCollection, where('token', '==', token));
      const tokensSnapshot = await getDocs(q);
      
      if (!tokensSnapshot.empty) {
        const docData = tokensSnapshot.docs[0];
        const data = docData.data();
        
        // Convert Firestore Timestamp to Date
        return {
          id: docData.id,
          token: data.token,
          candidateId: data.candidateId,
          roleId: data.roleId,
          assessmentSessionId: data.assessmentSessionId,
          expiresAt: this.toDate(data.expiresAt),
          used: data.used,
          createdAt: data.createdAt ? this.toDate(data.createdAt) : undefined
        } as AssessmentToken;
      }
      return null;
    } catch (error) {
      console.error('Error fetching assessment token:', error);
      return null;
    }
  }

  async invalidateAssessmentToken(token: string): Promise<void> {
    try {
      const tokensCollection = collection(db, 'assessmentTokens');
      const q = query(tokensCollection, where('token', '==', token));
      const tokensSnapshot = await getDocs(q);
      
      if (!tokensSnapshot.empty) {
        const tokenDoc = tokensSnapshot.docs[0];
        await updateDoc(doc(db, 'assessmentTokens', tokenDoc.id), {
          used: true,
          usedAt: serverTimestamp()
        });
      }
    } catch (error) {
      console.error('Error invalidating assessment token:', error);
      throw new Error('Failed to invalidate assessment token');
    }
  }
}
