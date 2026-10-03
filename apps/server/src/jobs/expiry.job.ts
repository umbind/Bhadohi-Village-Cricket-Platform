/**
 * Automated Background Expiry & Retention Engine
 * Executes nightly maintenance sweeps:
 * 1. 15-day player availability expiration.
 * 2. 5-day / deadline invitation expiration.
 * 3. 30-day post-completion tournament & team archival.
 * 4. 90-day deactivated account PII scrubbing (GDPR / Right-to-be-Forgotten).
 */

import { profileRepository } from '../repositories/profile.repository.js';
import { invitationRepository } from '../repositories/invitation.repository.js';
import { tournamentRepository } from '../repositories/tournament.repository.js';
import { teamRepository } from '../repositories/team.repository.js';
import { userRepository } from '../repositories/user.repository.js';
import { expiryRepository, ExpiryJobRecord } from '../repositories/expiry.repository.js';

export interface SweepResult {
  jobType: string;
  status: 'SUCCESS' | 'FAILED';
  recordsAffected: number;
  durationMs: number;
  timestamp: string;
}

export class ExpiryEngine {
  /**
   * 1. Sweep Player Availability Expiration (15-day default)
   */
  async sweepAvailabilityExpiry(now: Date = new Date()): Promise<SweepResult> {
    const startedAt = new Date();
    try {
      const count = await profileRepository.sweepExpiredAvailability(now);
      const completedAt = new Date();
      await expiryRepository.recordJobRun({
        jobType: 'AVAILABILITY_EXPIRY',
        status: 'SUCCESS',
        recordsAffected: count,
        errorDetails: null,
        startedAt,
        completedAt
      });

      return {
        jobType: 'AVAILABILITY_EXPIRY',
        status: 'SUCCESS',
        recordsAffected: count,
        durationMs: completedAt.getTime() - startedAt.getTime(),
        timestamp: completedAt.toISOString()
      };
    } catch (err: any) {
      await expiryRepository.recordJobRun({
        jobType: 'AVAILABILITY_EXPIRY',
        status: 'FAILED',
        recordsAffected: 0,
        errorDetails: err.message,
        startedAt,
        completedAt: new Date()
      });
      throw err;
    }
  }

  /**
   * 2. Sweep Pending Squad Invitation Expiration (5-day or registration deadline)
   */
  async sweepInvitationExpiry(now: Date = new Date()): Promise<SweepResult> {
    const startedAt = new Date();
    try {
      const count = await invitationRepository.sweepExpiredInvitations(now);
      const completedAt = new Date();
      await expiryRepository.recordJobRun({
        jobType: 'INVITATION_EXPIRY',
        status: 'SUCCESS',
        recordsAffected: count,
        errorDetails: null,
        startedAt,
        completedAt
      });

      return {
        jobType: 'INVITATION_EXPIRY',
        status: 'SUCCESS',
        recordsAffected: count,
        durationMs: completedAt.getTime() - startedAt.getTime(),
        timestamp: completedAt.toISOString()
      };
    } catch (err: any) {
      await expiryRepository.recordJobRun({
        jobType: 'INVITATION_EXPIRY',
        status: 'FAILED',
        recordsAffected: 0,
        errorDetails: err.message,
        startedAt,
        completedAt: new Date()
      });
      throw err;
    }
  }

  /**
   * 3. Sweep Tournaments and Associated Teams for Archival (30 days post completion)
   */
  async sweepTournamentArchival(now: Date = new Date(), daysThreshold: number = 30): Promise<SweepResult> {
    const startedAt = new Date();
    try {
      const allTournaments = await tournamentRepository.list({});
      const thresholdMs = daysThreshold * 24 * 60 * 60 * 1000;
      let archivedTournaments = 0;
      let archivedTeams = 0;

      for (const tour of allTournaments) {
        if (tour.status === 'PUBLISHED' || tour.status === 'COMPLETED') {
          const endDate = new Date(tour.endDate);
          if (now.getTime() - endDate.getTime() >= thresholdMs) {
            // Update tournament status
            await tournamentRepository.update(tour.id, { status: 'COMPLETED' });
            archivedTournaments++;

            // Cascade all associated temporary teams to ARCHIVED
            const teams = await teamRepository.findByTournament(tour.id);
            for (const team of teams) {
              if (team.status !== 'ARCHIVED') {
                await teamRepository.updateStatus(team.id, 'ARCHIVED');
                archivedTeams++;
              }
            }
          }
        }
      }

      const completedAt = new Date();
      const totalAffected = archivedTournaments + archivedTeams;

      await expiryRepository.recordJobRun({
        jobType: 'TOURNAMENT_ARCHIVAL',
        status: 'SUCCESS',
        recordsAffected: totalAffected,
        errorDetails: null,
        startedAt,
        completedAt
      });

      return {
        jobType: 'TOURNAMENT_ARCHIVAL',
        status: 'SUCCESS',
        recordsAffected: totalAffected,
        durationMs: completedAt.getTime() - startedAt.getTime(),
        timestamp: completedAt.toISOString()
      };
    } catch (err: any) {
      await expiryRepository.recordJobRun({
        jobType: 'TOURNAMENT_ARCHIVAL',
        status: 'FAILED',
        recordsAffected: 0,
        errorDetails: err.message,
        startedAt,
        completedAt: new Date()
      });
      throw err;
    }
  }

  /**
   * 4. Sweep Deactivated Accounts for 90-day PII Scrubbing (Right-to-be-Forgotten)
   */
  async sweepPiiScrubbing(now: Date = new Date(), daysThreshold: number = 90): Promise<SweepResult> {
    const startedAt = new Date();
    try {
      const count = await userRepository.sweepPiiScrubbing(now, daysThreshold);
      const completedAt = new Date();

      await expiryRepository.recordJobRun({
        jobType: 'PII_SCRUBBING',
        status: 'SUCCESS',
        recordsAffected: count,
        errorDetails: null,
        startedAt,
        completedAt
      });

      return {
        jobType: 'PII_SCRUBBING',
        status: 'SUCCESS',
        recordsAffected: count,
        durationMs: completedAt.getTime() - startedAt.getTime(),
        timestamp: completedAt.toISOString()
      };
    } catch (err: any) {
      await expiryRepository.recordJobRun({
        jobType: 'PII_SCRUBBING',
        status: 'FAILED',
        recordsAffected: 0,
        errorDetails: err.message,
        startedAt,
        completedAt: new Date()
      });
      throw err;
    }
  }

  /**
   * Run all 4 nightly maintenance jobs in sequence
   */
  async runAllNightlyJobs(now: Date = new Date()): Promise<SweepResult[]> {
    const results: SweepResult[] = [];
    results.push(await this.sweepAvailabilityExpiry(now));
    results.push(await this.sweepInvitationExpiry(now));
    results.push(await this.sweepTournamentArchival(now));
    results.push(await this.sweepPiiScrubbing(now));
    return results;
  }
}

export const expiryEngine = new ExpiryEngine();
