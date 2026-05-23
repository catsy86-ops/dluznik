import fc from 'fast-check';
import { UserRepository } from '../../src/repositories/UserRepository';
import { AppDataSource } from '../../src/config/database-init';

/**
 * Property-Based Tests for Authentication - Property 6: Unique Identifier Assignment
 * 
 * **Validates: Requirements 1.1, 1.2**
 * 
 * This test verifies that each new user gets a unique ID. The system uses UUIDs
 * to ensure uniqueness, and this property validates that:
 * 1. Each newly registered user receives a unique identifier
 * 2. No two users can have the same ID
 * 3. IDs are generated in a consistent UUID v4 format
 * 
 * Requirements: 2.6
 */

describe('Authentication Properties', () => {
  let userRepository: UserRepository;

  beforeAll(async () => {
    // Initialize database connection
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }
  });

  beforeEach(async () => {
    // Clear users table and related tables to avoid foreign key constraints
    if (AppDataSource.isInitialized) {
      const queryRunner = AppDataSource.createQueryRunner();
      try {
        // Disable foreign key constraints temporarily
        await queryRunner.query('SET session_replication_role = replica');
        
        // Clear tables in order (only tables that might have data)
        await queryRunner.query('DELETE FROM "transactions" WHERE 1=1');
        await queryRunner.query('DELETE FROM loan WHERE 1=1');
        await queryRunner.query('DELETE FROM obligation WHERE 1=1');
        await queryRunner.query('DELETE FROM "user" WHERE 1=1');
        
        // Re-enable foreign key constraints
        await queryRunner.query('SET session_replication_role = default');
      } finally {
        await queryRunner.release();
      }
    }
    userRepository = new UserRepository();
  });

  afterAll(async () => {
    // Close database connection
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  });

  describe('Property 6: Unique Identifier Assignment', () => {
    /**
     * Test: Every registered user gets a unique ID
     * 
     * For any collection of new users, each one must receive a unique identifier
     * that doesn't conflict with any existing or newly created identifier.
     * 
     * This property holds across all valid inputs (various email addresses and passwords).
     */
    it('should assign unique IDs to multiple new users', async () => {
      // Use property-based testing with fast-check
      await fc.assert(
        fc.asyncProperty(
          fc.array(
            fc.record({
              email: fc.emailAddress().map(email => `${email}.unique-${Date.now()}-${Math.random()}`),
              password: fc.stringMatching(/^.{8,50}$/), // 8-50 chars
            }),
            { minLength: 2, maxLength: 5 }
          ),
          async (users) => {
            const createdIds = new Set<string>();

            for (const user of users) {
              const bcrypt = await import('bcrypt');
              const passwordHash = await bcrypt.hash(user.password, 10);
              const createdUser = await userRepository.create(user.email, passwordHash);

              // Collect the ID
              createdIds.add(createdUser.id);
            }

            // **Validates: Requirements 1.1, 1.2**
            // All IDs must be unique
            expect(createdIds.size).toBe(users.length);
          }
        ),
        { numRuns: 10 } // Run 10 times with different random inputs
      );
    });

    /**
     * Test: No two users share the same ID
     * 
     * For any two distinct user registrations, the IDs must be different.
     * This ensures ID uniqueness even when users register at nearly the same time.
     */
    it('should never assign the same ID to different users (Property 6)', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.tuple(
            fc.emailAddress().map(email => `${email}.test1-${Date.now()}-${Math.random()}`),
            fc.emailAddress().map(email => `${email}.test2-${Date.now()}-${Math.random()}`),
            fc.stringMatching(/^.{8,50}$/)
          ),
          async ([email1, email2, password]) => {
            // Ensure emails are different
            if (email1 === email2) return; // Skip identical emails

            const bcrypt = await import('bcrypt');
            const hash1 = await bcrypt.hash(password, 10);
            const hash2 = await bcrypt.hash(password, 10);

            const user1 = await userRepository.create(email1, hash1);
            const user2 = await userRepository.create(email2, hash2);

            // **Validates: Requirements 1.1, 1.2**
            // IDs must be different
            expect(user1.id).not.toBe(user2.id);
          }
        ),
        { numRuns: 10 }
      );
    });

    /**
     * Test: IDs are valid UUIDs
     * 
     * Every user ID must be a valid UUID v4 format string.
     * This ensures IDs can be reliably stored, transmitted, and indexed.
     */
    it('should generate IDs in valid UUID format', async () => {
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

      await fc.assert(
        fc.asyncProperty(
          fc.record({
            email: fc.emailAddress().map(email => `${email}.uuid-${Date.now()}-${Math.random()}`),
            password: fc.stringMatching(/^.{8,50}$/),
          }),
          async (user) => {
            const bcrypt = await import('bcrypt');
            const passwordHash = await bcrypt.hash(user.password, 10);
            const createdUser = await userRepository.create(user.email, passwordHash);

            // **Validates: Requirements 1.1, 1.2**
            // ID must match UUID format
            expect(createdUser.id).toMatch(uuidRegex);
          }
        ),
        { numRuns: 10 }
      );
    });

    /**
     * Test: IDs are non-empty and non-null
     * 
     * Every created user must have an ID that is a non-empty string.
     * This is a basic invariant that ID generation must maintain.
     */
    it('should generate non-empty IDs for all users', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            email: fc.emailAddress().map(email => `${email}.nonempty-${Date.now()}-${Math.random()}`),
            password: fc.stringMatching(/^.{8,50}$/),
          }),
          async (user) => {
            const bcrypt = await import('bcrypt');
            const passwordHash = await bcrypt.hash(user.password, 10);
            const createdUser = await userRepository.create(user.email, passwordHash);

            // **Validates: Requirements 1.1, 1.2**
            // ID must be a non-empty string
            expect(typeof createdUser.id).toBe('string');
            expect(createdUser.id.length).toBeGreaterThan(0);
          }
        ),
        { numRuns: 10 }
      );
    });

    /**
     * Test: ID generation is deterministic per registration
     * 
     * For a given user registration, the ID should be consistent across
     * database retrieval operations.
     */
    it('should maintain consistent ID after user retrieval', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            email: fc.emailAddress().map(email => `${email}.retrieval-${Date.now()}-${Math.random()}`),
            password: fc.stringMatching(/^.{8,50}$/),
          }),
          async (user) => {
            const bcrypt = await import('bcrypt');
            const passwordHash = await bcrypt.hash(user.password, 10);
            const createdUser = await userRepository.create(user.email, passwordHash);

            // Retrieve the user by email
            const retrievedUser = await userRepository.findByEmail(user.email);

            // **Validates: Requirements 1.1, 1.2**
            // Retrieved user must have the same ID
            expect(retrievedUser).not.toBeNull();
            expect(retrievedUser!.id).toBe(createdUser.id);
          }
        ),
        { numRuns: 10 }
      );
    });
  });
});
