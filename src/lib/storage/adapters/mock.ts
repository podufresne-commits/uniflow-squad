import type { IStorageAdapter } from '../interface';
import type { Role, Candidate, AssessmentSession, AssessmentToken } from '../../types';
import { roles as seedRoles, candidates as seedCandidates, assessmentSessions as seedSessions } from '../../mock-data';

/**
 * In-memory storage adapter for development and testing
 * Data is not persisted between server restarts
 */
export class MockStorageAdapter implements IStorageAdapter {
  private roles: Map<string, Role>;
  private candidates: Map<string, Candidate>;
  private sessions: Map<string, AssessmentSession>;
  private tokens: Map<string, AssessmentToken>;

  constructor() {
    // Initialize with seed data
    this.roles = new Map(seedRoles.map(role => [role.id, role]));
    this.candidates = new Map(seedCandidates.map(candidate => [candidate.id, candidate]));
    this.sessions = new Map(seedSessions.map(session => [session.id, session]));
    this.tokens = new Map();
    
    console.log('✅ MockStorageAdapter initialized with seed data');
  }

  // ================== ROLES ==================

  async getRoles(): Promise<Role[]> {
    return Array.from(this.roles.values());
  }

  async getRole(id: string): Promise<Role | null> {
    return this.roles.get(id) || null;
  }

  async createRole(roleData: Omit<Role, 'id'>): Promise<Role> {
    const id = crypto.randomUUID();
    const role: Role = { id, ...roleData };
    this.roles.set(id, role);
    return role;
  }

  async updateRole(id: string, updates: Partial<Role>): Promise<void> {
    const existing = this.roles.get(id);
    if (!existing) {
      throw new Error(`Role with id ${id} not found`);
    }
    this.roles.set(id, { ...existing, ...updates });
  }

  async deleteRole(id: string): Promise<void> {
    this.roles.delete(id);
  }

  // ================== CANDIDATES ==================

  async getCandidates(): Promise<Candidate[]> {
    return Array.from(this.candidates.values());
  }

  async getCandidate(id: string): Promise<Candidate | null> {
    return this.candidates.get(id) || null;
  }

  async createCandidate(candidateData: Omit<Candidate, 'id'>): Promise<Candidate> {
    const id = crypto.randomUUID();
    const candidate: Candidate = { id, ...candidateData };
    this.candidates.set(id, candidate);
    return candidate;
  }

  async updateCandidate(id: string, updates: Partial<Candidate>): Promise<void> {
    const existing = this.candidates.get(id);
    if (!existing) {
      throw new Error(`Candidate with id ${id} not found`);
    }
    this.candidates.set(id, { ...existing, ...updates });
  }

  // ================== ASSESSMENT SESSIONS ==================

  async getSession(id: string): Promise<AssessmentSession | null> {
    return this.sessions.get(id) || null;
  }

  async getSessions(): Promise<AssessmentSession[]> {
    return Array.from(this.sessions.values());
  }

  async createSession(sessionData: Omit<AssessmentSession, 'id'>): Promise<AssessmentSession> {
    const id = crypto.randomUUID();
    const session: AssessmentSession = { id, ...sessionData };
    this.sessions.set(id, session);
    return session;
  }

  async updateSession(id: string, updates: Partial<AssessmentSession>): Promise<void> {
    const existing = this.sessions.get(id);
    if (!existing) {
      throw new Error(`Assessment session with id ${id} not found`);
    }
    this.sessions.set(id, { ...existing, ...updates });
  }

  // ================== ASSESSMENT TOKENS ==================

  async createAssessmentToken(tokenData: AssessmentToken): Promise<void> {
    this.tokens.set(tokenData.token, tokenData);
  }

  async getAssessmentToken(token: string): Promise<AssessmentToken | null> {
    return this.tokens.get(token) || null;
  }

  async invalidateAssessmentToken(token: string): Promise<void> {
    const existing = this.tokens.get(token);
    if (existing) {
      this.tokens.set(token, { ...existing, used: true });
    }
  }
}
