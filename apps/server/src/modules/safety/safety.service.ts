/**
 * Safety & Moderation Domain Service
 * Coordinates user reports with 5/day rate-limits, blocking, and admin review workflows.
 */

import {
  moderationRepository,
  ReportRecord,
  ReportTargetType,
  ReportReason,
  ReportStatus,
  BlockRecord
} from '../../repositories/moderation.repository.js';
import { userRepository } from '../../repositories/user.repository.js';
import { teamRepository } from '../../repositories/team.repository.js';
import { tournamentRepository } from '../../repositories/tournament.repository.js';

export const VALID_TARGET_TYPES: ReportTargetType[] = ['USER', 'TEAM', 'TOURNAMENT'];
export const VALID_REASONS: ReportReason[] = ['UNDERAGE', 'FAKE_INFO', 'MISBEHAVIOR', 'INAPPROPRIATE_CONTENT', 'OTHER'];
export const VALID_REVIEW_ACTIONS: ReportStatus[] = ['REVIEWED', 'ACTION_TAKEN', 'DISMISSED'];

export class SafetyService {
  /**
   * Submit a safety / violation report
   * Enforces 5 reports per 24-hour sliding window rate limit
   */
  async submitReport(
    reporterUserId: string,
    input: {
      targetType: ReportTargetType;
      targetId: string;
      reasonCategory: ReportReason;
      description: string;
    }
  ): Promise<ReportRecord> {
    if (!VALID_TARGET_TYPES.includes(input.targetType)) {
      throw new Error('INVALID_TARGET_TYPE');
    }

    if (!VALID_REASONS.includes(input.reasonCategory)) {
      throw new Error('INVALID_REASON_CATEGORY');
    }

    if (!input.description || input.description.trim().length < 10) {
      throw new Error('DESCRIPTION_TOO_SHORT');
    }

    // 1. Sliding 24-hour rate limit check (max 5 reports per day)
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentReports = await moderationRepository.findReportsByReporterSince(reporterUserId, twentyFourHoursAgo);
    if (recentReports.length >= 5) {
      throw new Error('REPORT_RATE_LIMIT_EXCEEDED');
    }

    // 2. Duplicate Pending Report Check
    const existingPending = await moderationRepository.findPendingByTarget(
      reporterUserId,
      input.targetType,
      input.targetId
    );
    if (existingPending) {
      throw new Error('DUPLICATE_REPORT_PENDING');
    }

    // 3. Target Verification
    if (input.targetType === 'USER') {
      const user = await userRepository.findById(input.targetId);
      if (!user) throw new Error('TARGET_USER_NOT_FOUND');
    } else if (input.targetType === 'TEAM') {
      const team = await teamRepository.findById(input.targetId);
      if (!team) throw new Error('TARGET_TEAM_NOT_FOUND');
    } else if (input.targetType === 'TOURNAMENT') {
      const tour = await tournamentRepository.findById(input.targetId);
      if (!tour) throw new Error('TARGET_TOURNAMENT_NOT_FOUND');
    }

    return moderationRepository.createReport({
      reporterUserId,
      targetType: input.targetType,
      targetId: input.targetId,
      reasonCategory: input.reasonCategory,
      description: input.description.trim()
    });
  }

  /**
   * Block a user to shield communications
   */
  async blockUser(blockerUserId: string, blockedUserId: string): Promise<BlockRecord> {
    if (blockerUserId === blockedUserId) {
      throw new Error('CANNOT_BLOCK_SELF');
    }

    const targetUser = await userRepository.findById(blockedUserId);
    if (!targetUser) {
      throw new Error('TARGET_USER_NOT_FOUND');
    }

    return moderationRepository.createBlock(blockerUserId, blockedUserId);
  }

  /**
   * Unblock a user
   */
  async unblockUser(blockerUserId: string, blockedUserId: string): Promise<boolean> {
    return moderationRepository.deleteBlock(blockerUserId, blockedUserId);
  }

  /**
   * Check if interaction between two users is blocked in either direction
   */
  async isInteractionBlocked(userA: string, userB: string): Promise<boolean> {
    const blockedByA = await moderationRepository.isBlocked(userA, userB);
    if (blockedByA) return true;
    return moderationRepository.isBlocked(userB, userA);
  }

  async isBlocked(userA: string, userB: string): Promise<boolean> {
    return this.isInteractionBlocked(userA, userB);
  }


  /**
   * Get all user IDs blocked by a user
   */
  async getBlockedUsers(blockerUserId: string): Promise<string[]> {
    return moderationRepository.getBlockedUserIds(blockerUserId);
  }

  /**
   * Admin reviews a report in the moderation queue
   */
  async reviewReport(
    adminUserId: string,
    reportId: string,
    action: ReportStatus,
    adminNotes?: string
  ): Promise<ReportRecord> {
    if (!VALID_REVIEW_ACTIONS.includes(action)) {
      throw new Error('INVALID_REVIEW_ACTION');
    }

    return moderationRepository.updateReportStatus(reportId, action, adminUserId, adminNotes);
  }

  /**
   * List reports for admin moderation
   */
  async getModerationQueue(filter?: { status?: ReportStatus; targetType?: ReportTargetType }): Promise<ReportRecord[]> {
    return moderationRepository.listReports(filter);
  }
}

export const safetyService = new SafetyService();
