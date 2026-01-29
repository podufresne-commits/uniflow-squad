import type { IStorageAdapter } from './interface';
import { MockStorageAdapter } from './adapters/mock';
import { FirestoreStorageAdapter } from './adapters/firestore';

let storageInstance: IStorageAdapter | null = null;

/**
 * Check if Firebase is properly configured
 */
function isFirebaseConfigured(): boolean {
  return !!(
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
  );
}

/**
 * Get the storage adapter instance (singleton pattern)
 * 
 * Storage mode is determined by STORAGE_MODE environment variable:
 * - 'mock': Always use in-memory mock storage
 * - 'firestore': Always use Firestore (requires Firebase config)
 * - 'auto' (default): Use Firestore if configured, otherwise mock
 * 
 * @returns IStorageAdapter instance
 */
export function getStorage(): IStorageAdapter {
  if (storageInstance) {
    return storageInstance;
  }
  
  const mode = process.env.STORAGE_MODE || 'auto';
  
  if (mode === 'mock') {
    console.log('📦 Storage: Using MockStorageAdapter (STORAGE_MODE=mock)');
    storageInstance = new MockStorageAdapter();
  } else if (mode === 'firestore') {
    if (!isFirebaseConfigured()) {
      throw new Error('Firebase is not configured but STORAGE_MODE=firestore. Please set Firebase environment variables.');
    }
    console.log('☁️  Storage: Using FirestoreStorageAdapter (STORAGE_MODE=firestore)');
    storageInstance = new FirestoreStorageAdapter();
  } else {
    // Auto mode
    if (isFirebaseConfigured()) {
      console.log('☁️  Storage: Using FirestoreStorageAdapter (auto-detected)');
      storageInstance = new FirestoreStorageAdapter();
    } else {
      console.warn('⚠️  Firebase not configured, using MockStorageAdapter');
      storageInstance = new MockStorageAdapter();
    }
  }
  
  return storageInstance;
}

/**
 * Reset the storage instance (useful for testing)
 */
export function resetStorage(): void {
  storageInstance = null;
}

// Re-export types and interface for convenience
export type { IStorageAdapter } from './interface';
