/**
 * User Data Access Repository
 * Handles User persistence, credential security, lockout state, and PII anonymization.
 */

export interface UserRecord {
  id: string;
  mobileNumber: string;
  pinHash: string;
  recoveryCodeHash: string;
  isAgeVerified: boolean;
  role: 'PLAYER' | 'ORGANIZER' | 'ADMIN';
  isActive: boolean;
  failedLoginAttempts: number;
  lockedUntil: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export class InMemoryUserRepository {
  private users: Map<string, UserRecord> = new Map();
  private mobileIndex: Map<string, string> = new Map();

  async create(data: Omit<UserRecord, 'id' | 'createdAt' | 'updatedAt' | 'failedLoginAttempts' | 'lockedUntil'>): Promise<UserRecord> {
    if (this.mobileIndex.has(data.mobileNumber)) {
      throw new Error('MOBILE_ALREADY_REGISTERED');
    }

    const id = `user-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const now = new Date();

    const user: UserRecord = {
      ...data,
      id,
      failedLoginAttempts: 0,
      lockedUntil: null,
      createdAt: now,
      updatedAt: now
    };

    this.users.set(id, user);
    this.mobileIndex.set(data.mobileNumber, id);
    return { ...user };
  }

  async findByMobile(mobileNumber: string): Promise<UserRecord | null> {
    const id = this.mobileIndex.get(mobileNumber);
    if (!id) return null;
    const user = this.users.get(id);
    return user ? { ...user } : null;
  }

  async findById(id: string): Promise<UserRecord | null> {
    const user = this.users.get(id);
    return user ? { ...user } : null;
  }

  async recordFailedAttempt(id: string, maxAttempts: number = 5, lockoutMs: number = 15 * 60 * 1000): Promise<{ isLocked: boolean; lockedUntil: Date | null }> {
    const user = this.users.get(id);
    if (!user) throw new Error('USER_NOT_FOUND');

    user.failedLoginAttempts += 1;
    let isLocked = false;
    let lockedUntil: Date | null = null;

    if (user.failedLoginAttempts >= maxAttempts) {
      lockedUntil = new Date(Date.now() + lockoutMs);
      user.lockedUntil = lockedUntil;
      isLocked = true;
    }

    user.updatedAt = new Date();
    this.users.set(id, user);
    return { isLocked, lockedUntil };
  }

  async resetFailedAttempts(id: string): Promise<void> {
    const user = this.users.get(id);
    if (user) {
      user.failedLoginAttempts = 0;
      user.lockedUntil = null;
      user.updatedAt = new Date();
      this.users.set(id, user);
    }
  }

  async updatePinAndRecovery(id: string, newPinHash: string, newRecoveryCodeHash: string): Promise<void> {
    const user = this.users.get(id);
    if (!user) throw new Error('USER_NOT_FOUND');

    user.pinHash = newPinHash;
    user.recoveryCodeHash = newRecoveryCodeHash;
    user.failedLoginAttempts = 0;
    user.lockedUntil = null;
    user.updatedAt = new Date();
    this.users.set(id, user);
  }

  async deactivateAndScrub(id: string): Promise<void> {
    const user = this.users.get(id);
    if (!user) throw new Error('USER_NOT_FOUND');

    user.isActive = false;
    user.updatedAt = new Date();
    this.users.set(id, user);
  }

  async sweepPiiScrubbing(now: Date = new Date(), daysThreshold: number = 90): Promise<number> {
    let count = 0;
    const thresholdMs = daysThreshold * 24 * 60 * 60 * 1000;
    for (const user of this.users.values()) {
      if (!user.isActive && (now.getTime() - user.updatedAt.getTime() >= thresholdMs)) {
        if (user.mobileNumber !== '0000000000') {
          this.mobileIndex.delete(user.mobileNumber);
          user.mobileNumber = '0000000000';
          user.pinHash = 'SCRUBBED';
          user.recoveryCodeHash = 'SCRUBBED';
          user.updatedAt = now;
          count++;
        }
      }
    }
    return count;
  }

  clear(): void {
    this.users.clear();
    this.mobileIndex.clear();
  }
}

export const userRepository = new InMemoryUserRepository();
