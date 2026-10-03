/**
 * Player Profile Data Access Repository
 * Handles Player profile creation, searching, availability updates, and privacy shielding.
 */

export type BhadohiBlock = 'GYANPUR' | 'AURAI' | 'BHADOHI' | 'SURIYAWAN' | 'DEEGH' | 'ABHOLI';
export type CricketRole = 'BATSMAN' | 'BOWLER' | 'ALL_ROUNDER' | 'WICKET_KEEPER';

export interface ProfileRecord {
  id: string;
  userId: string;
  fullName: string;
  village: string;
  block: BhadohiBlock;
  primaryRole: CricketRole;
  battingStyle: string;
  bowlingStyle: string;
  isAvailable: boolean;
  availabilityExpiresAt: Date;
  allowWhatsappContact: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class InMemoryProfileRepository {
  private profiles: Map<string, ProfileRecord> = new Map();
  private userIndex: Map<string, string> = new Map();

  async upsert(userId: string, data: Omit<ProfileRecord, 'id' | 'userId' | 'createdAt' | 'updatedAt' | 'isAvailable' | 'availabilityExpiresAt'>): Promise<ProfileRecord> {
    const existingId = this.userIndex.get(userId);
    const now = new Date();

    if (existingId) {
      const existing = this.profiles.get(existingId)!;
      const updated: ProfileRecord = {
        ...existing,
        ...data,
        updatedAt: now
      };
      this.profiles.set(existingId, updated);
      return { ...updated };
    }

    const id = `prof-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const expiresAt = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000); // 15 days default

    const profile: ProfileRecord = {
      ...data,
      id,
      userId,
      isAvailable: true,
      availabilityExpiresAt: expiresAt,
      createdAt: now,
      updatedAt: now
    };

    this.profiles.set(id, profile);
    this.userIndex.set(userId, id);
    return { ...profile };
  }

  async findByUserId(userId: string): Promise<ProfileRecord | null> {
    const id = this.userIndex.get(userId);
    if (!id) return null;
    const profile = this.profiles.get(id);
    return profile ? { ...profile } : null;
  }

  async findById(profileId: string): Promise<ProfileRecord | null> {
    const profile = this.profiles.get(profileId);
    return profile ? { ...profile } : null;
  }

  async updateAvailability(userId: string, isAvailable: boolean, durationDays: number = 15): Promise<ProfileRecord> {
    const id = this.userIndex.get(userId);
    if (!id) throw new Error('PROFILE_NOT_FOUND');

    const profile = this.profiles.get(id)!;
    profile.isAvailable = isAvailable;
    if (isAvailable) {
      profile.availabilityExpiresAt = new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000);
    }
    profile.updatedAt = new Date();
    this.profiles.set(id, profile);
    return { ...profile };
  }

  async searchRaw(filter: { block?: string; role?: string; availableOnly?: boolean }): Promise<ProfileRecord[]> {
    const results: ProfileRecord[] = [];
    const now = new Date();

    for (const profile of this.profiles.values()) {
      if (filter.block && profile.block !== filter.block) continue;
      if (filter.role && profile.primaryRole !== filter.role) continue;
      
      const isCurrentlyAvailable = profile.isAvailable && profile.availabilityExpiresAt > now;
      if (filter.availableOnly && !isCurrentlyAvailable) continue;

      results.push({ ...profile });
    }

    return results;
  }

  async search(filter: { block?: string; role?: string; availableOnly?: boolean }): Promise<Array<Omit<ProfileRecord, 'userId'>>> {
    const results: Array<Omit<ProfileRecord, 'userId'>> = [];
    const now = new Date();

    for (const profile of this.profiles.values()) {
      if (filter.block && profile.block !== filter.block) continue;
      if (filter.role && profile.primaryRole !== filter.role) continue;
      
      const isCurrentlyAvailable = profile.isAvailable && profile.availabilityExpiresAt > now;
      if (filter.availableOnly && !isCurrentlyAvailable) continue;

      // Exclude raw userId to shield internal identity link in search
      const { userId: _, ...safeProfile } = profile;
      results.push(safeProfile);
    }

    return results;
  }


  async scrub(userId: string): Promise<void> {
    const id = this.userIndex.get(userId);
    if (id) {
      const profile = this.profiles.get(id)!;
      profile.fullName = 'भूतपूर्व खिलाड़ी';
      profile.village = '---';
      profile.isAvailable = false;
      profile.allowWhatsappContact = false;
      profile.updatedAt = new Date();
      this.profiles.set(id, profile);
    }
  }

  async sweepExpiredAvailability(now: Date = new Date()): Promise<number> {
    let count = 0;
    for (const profile of this.profiles.values()) {
      if (profile.isAvailable && profile.availabilityExpiresAt <= now) {
        profile.isAvailable = false;
        profile.updatedAt = now;
        count++;
      }
    }
    return count;
  }

  clear(): void {
    this.profiles.clear();
    this.userIndex.clear();
  }
}

export const profileRepository = new InMemoryProfileRepository();
