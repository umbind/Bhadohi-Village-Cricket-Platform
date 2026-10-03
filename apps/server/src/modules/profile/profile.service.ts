/**
 * Player Profile Domain Service
 * Coordinates player profiles, Bhadohi block validation, availability windows, and search filtering.
 */

import { profileRepository, ProfileRecord, BhadohiBlock, CricketRole } from '../../repositories/profile.repository.js';

const VALID_BHADOHI_BLOCKS: BhadohiBlock[] = ['GYANPUR', 'AURAI', 'BHADOHI', 'SURIYAWAN', 'DEEGH', 'ABHOLI'];
const VALID_CRICKET_ROLES: CricketRole[] = ['BATSMAN', 'BOWLER', 'ALL_ROUNDER', 'WICKET_KEEPER'];

export class ProfileService {
  async getMyProfile(userId: string): Promise<ProfileRecord | null> {
    return profileRepository.findByUserId(userId);
  }

  async upsertProfile(userId: string, input: {
    fullName: string;
    village: string;
    block: string;
    primaryRole: string;
    battingStyle: string;
    bowlingStyle: string;
    allowWhatsappContact: boolean;
  }): Promise<ProfileRecord> {
    if (!input.fullName || input.fullName.trim().length < 2) {
      throw new Error('INVALID_NAME');
    }
    if (!input.village || input.village.trim().length < 2) {
      throw new Error('INVALID_VILLAGE');
    }
    if (!VALID_BHADOHI_BLOCKS.includes(input.block.toUpperCase() as BhadohiBlock)) {
      throw new Error('INVALID_BHADOHI_BLOCK');
    }
    if (!VALID_CRICKET_ROLES.includes(input.primaryRole.toUpperCase() as CricketRole)) {
      throw new Error('INVALID_CRICKET_ROLE');
    }

    return profileRepository.upsert(userId, {
      fullName: input.fullName.trim(),
      village: input.village.trim(),
      block: input.block.toUpperCase() as BhadohiBlock,
      primaryRole: input.primaryRole.toUpperCase() as CricketRole,
      battingStyle: input.battingStyle.trim(),
      bowlingStyle: input.bowlingStyle.trim(),
      allowWhatsappContact: Boolean(input.allowWhatsappContact)
    });
  }

  async updateAvailability(userId: string, isAvailable: boolean, durationDays: number = 15): Promise<ProfileRecord> {
    const validDays = [15, 30].includes(durationDays) ? durationDays : 15;
    return profileRepository.updateAvailability(userId, isAvailable, validDays);
  }

  async searchPlayers(filter: { block?: string; role?: string; availableOnly?: boolean }): Promise<Array<Omit<ProfileRecord, 'userId'>>> {
    return profileRepository.search({
      block: filter.block?.toUpperCase(),
      role: filter.role?.toUpperCase(),
      availableOnly: filter.availableOnly !== false
    });
  }
}

export const profileService = new ProfileService();
