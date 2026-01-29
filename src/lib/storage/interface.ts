import type { Role, Candidate, AssessmentSession, AssessmentToken } from '../types';

/**
 * Storage adapter interface for data persistence
 * Implementations: MockStorageAdapter (in-memory), FirestoreStorageAdapter (cloud)
 */
export interface IStorageAdapter {
  // ================== ROLES ==================
  
  /**
   * Get all roles
   */
  getRoles(): Promise<Role[]>;
  
  /**
   * Get a single role by ID
   * @returns Role or null if not found
   */
  getRole(id: string): Promise<Role | null>;
  
  /**
   * Create a new role
   * @returns The created role with generated ID
   */
  createRole(role: Omit<Role, 'id'>): Promise<Role>;
  
  /**
   * Update an existing role
   */
  updateRole(id: string, updates: Partial<Role>): Promise<void>;
  
  /**
   * Delete a role
   */
  deleteRole(id: string): Promise<void>;
  
  // ================== CANDIDATES ==================
  
  /**
   * Get all candidates
   */
  getCandidates(): Promise<Candidate[]>;
  
  /**
   * Get a single candidate by ID
   * @returns Candidate or null if not found
   */
  getCandidate(id: string): Promise<Candidate | null>;
  
  /**
   * Create a new candidate
   * @returns The created candidate with generated ID
   */
  createCandidate(candidate: Omit<Candidate, 'id'>): Promise<Candidate>;
  
  /**
   * Update an existing candidate
   */
  updateCandidate(id: string, updates: Partial<Candidate>): Promise<void>;
  
  // ================== ASSESSMENT SESSIONS ==================
  
  /**
   * Get a single assessment session by ID
   * @returns AssessmentSession or null if not found
   */
  getSession(id: string): Promise<AssessmentSession | null>;
  
  /**
   * Get all assessment sessions
   */
  getSessions(): Promise<AssessmentSession[]>;
  
  /**
   * Create a new assessment session
   * @returns The created session with generated ID
   */
  createSession(session: Omit<AssessmentSession, 'id'>): Promise<AssessmentSession>;
  
  /**
   * Update an existing assessment session
   */
  updateSession(id: string, updates: Partial<AssessmentSession>): Promise<void>;
  
  // ================== ASSESSMENT TOKENS ==================
  
  /**
   * Create a new assessment token
   */
  createAssessmentToken(token: AssessmentToken): Promise<void>;
  
  /**
   * Get an assessment token by its token string
   * @returns AssessmentToken or null if not found
   */
  getAssessmentToken(token: string): Promise<AssessmentToken | null>;
  
  /**
   * Mark an assessment token as used (invalidate it)
   */
  invalidateAssessmentToken(token: string): Promise<void>;
}
