# Storage Abstraction Layer

This directory contains the storage abstraction layer for the Uniflow Assess application, providing a flexible interface for data persistence that works seamlessly in both development (mock storage) and production (Firestore) environments.

## Architecture

```
src/lib/storage/
├── index.ts              # Factory pattern with getStorage()
├── interface.ts          # IStorageAdapter interface definition
└── adapters/
    ├── mock.ts          # In-memory MockStorageAdapter
    └── firestore.ts     # Cloud FirestoreStorageAdapter
```

## Quick Start

### Using Storage in Your Code

```typescript
import { getStorage } from '@/lib/storage';

// Server-side (pages, API routes, server actions)
export default async function MyPage() {
  const storage = getStorage();
  const roles = await storage.getRoles();
  // ...
}
```

### Configuration

Set the `STORAGE_MODE` environment variable to control which adapter is used:

```bash
# .env.local
STORAGE_MODE=auto  # Default: auto-detect based on Firebase config
# STORAGE_MODE=mock      # Force mock storage (development/testing)
# STORAGE_MODE=firestore # Force Firestore (production)
```

## Storage Modes

### 1. Auto Mode (Default)
- **Behavior**: Automatically detects Firebase configuration
- **If Firebase configured**: Uses `FirestoreStorageAdapter`
- **If not configured**: Falls back to `MockStorageAdapter`
- **Best for**: Most use cases - works in both dev and prod

```bash
STORAGE_MODE=auto
```

### 2. Mock Mode
- **Behavior**: Always uses in-memory storage with seed data
- **Data**: Loaded from `src/lib/mock-data.ts`
- **Persistence**: None - resets on server restart
- **Best for**: Development, testing, demos

```bash
STORAGE_MODE=mock
```

### 3. Firestore Mode
- **Behavior**: Always uses Firebase Firestore
- **Requirement**: Valid Firebase configuration required
- **Data**: Persisted to cloud database
- **Best for**: Production deployments

```bash
STORAGE_MODE=firestore

# Required environment variables:
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
# ... (see .env.example for full list)
```

## Interface Methods

The `IStorageAdapter` interface provides the following methods:

### Roles
- `getRoles()` - Get all roles
- `getRole(id)` - Get a single role by ID
- `createRole(roleData)` - Create a new role (returns created Role with ID)
- `updateRole(id, updates)` - Update an existing role
- `deleteRole(id)` - Delete a role

### Candidates
- `getCandidates()` - Get all candidates
- `getCandidate(id)` - Get a single candidate by ID
- `createCandidate(candidateData)` - Create a new candidate (returns created Candidate with ID)
- `updateCandidate(id, updates)` - Update an existing candidate

### Assessment Sessions
- `getSession(id)` - Get a single session by ID
- `getSessions()` - Get all sessions
- `createSession(sessionData)` - Create a new session (returns created Session with ID)
- `updateSession(id, updates)` - Update an existing session

### Assessment Tokens
- `createAssessmentToken(tokenData)` - Create a magic link token
- `getAssessmentToken(token)` - Get token by token string
- `invalidateAssessmentToken(token)` - Mark token as used

## Implementation Details

### MockStorageAdapter

- **Storage**: In-memory `Map` objects
- **IDs**: Generated using `crypto.randomUUID()`
- **Seed Data**: Automatically loaded from `mock-data.ts` on initialization
- **Thread Safety**: Single-instance singleton pattern
- **Logging**: Console output for initialization

```typescript
✅ MockStorageAdapter initialized with seed data
```

### FirestoreStorageAdapter

- **Collections**: 
  - `roles` - Job role definitions
  - `candidates` - Candidate profiles
  - `assessmentSessions` - Assessment session data
  - `assessmentTokens` - Magic link tokens
- **Timestamps**: Automatic `createdAt`/`updatedAt` via `serverTimestamp()`
- **Date Conversion**: Handles Firestore Timestamp to JavaScript Date
- **Error Handling**: Try/catch with console logging and error propagation

```typescript
☁️  Storage: Using FirestoreStorageAdapter (auto-detected)
```

## Migration Guide

### From Direct DB/Mock Usage

**Before:**
```typescript
import { getRoles } from '@/lib/db';
import { roles as mockRoles } from '@/lib/mock-data';

const roles = await getRoles() || mockRoles;
```

**After:**
```typescript
import { getStorage } from '@/lib/storage';

const storage = getStorage();
const roles = await storage.getRoles();
```

### Return Type Changes

Note that adapter methods return the full object with ID (not just the ID):

**Before:**
```typescript
const roleId = await createRole(roleData); // Returns string | null
```

**After:**
```typescript
const role = await storage.createRole(roleData); // Returns Role
// Access ID: role.id
```

## Testing

### Unit Tests (Future)

The abstraction layer is designed for easy testing:

```typescript
import { MockStorageAdapter } from '@/lib/storage/adapters/mock';

describe('MyComponent', () => {
  it('should fetch roles', async () => {
    const storage = new MockStorageAdapter();
    // Test with mock storage
  });
});
```

### Integration Tests

Set `STORAGE_MODE=mock` to test against in-memory storage without requiring Firebase.

## Extending the System

To add a new storage adapter (e.g., PostgreSQL, Supabase):

1. Create a new adapter: `src/lib/storage/adapters/postgres.ts`
2. Implement the `IStorageAdapter` interface
3. Update factory in `src/lib/storage/index.ts`:

```typescript
} else if (mode === 'postgres') {
  storageInstance = new PostgresStorageAdapter();
}
```

## Benefits

✅ **Dev Mode**: Works immediately without Firebase setup  
✅ **Prod Mode**: Real persistence with Firestore  
✅ **Type Safety**: Interface ensures consistency across adapters  
✅ **Testable**: Easy to inject mock adapter for tests  
✅ **Extensible**: Add new storage backends without changing application code  
✅ **Single Source of Truth**: One interface for all data operations  

## Troubleshooting

### "Firebase not configured" warning

This is expected when running in development without Firebase credentials. The app automatically uses MockStorageAdapter as a fallback.

To silence the warning, explicitly set:
```bash
STORAGE_MODE=mock
```

### Firestore errors

If you see Firestore connection errors:
1. Verify Firebase environment variables are set correctly
2. Check Firebase project permissions
3. Ensure Firestore is enabled in your Firebase console
4. Fall back to mock mode for local development

### Data not persisting

- **Mock mode**: Data is in-memory and resets on server restart (expected behavior)
- **Firestore mode**: Check Firebase console for data, verify write permissions

## Console Output

The storage layer logs its initialization:

```bash
# Mock mode
⚠️  Firebase not configured, using MockStorageAdapter
✅ MockStorageAdapter initialized with seed data

# Firestore mode (auto-detected)
☁️  Storage: Using FirestoreStorageAdapter (auto-detected)
✅ FirestoreStorageAdapter initialized

# Firestore mode (explicit)
☁️  Storage: Using FirestoreStorageAdapter (STORAGE_MODE=firestore)
✅ FirestoreStorageAdapter initialized

# Mock mode (explicit)
📦 Storage: Using MockStorageAdapter (STORAGE_MODE=mock)
✅ MockStorageAdapter initialized with seed data
```
