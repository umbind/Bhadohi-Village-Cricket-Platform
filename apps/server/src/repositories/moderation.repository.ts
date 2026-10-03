/**
 * Moderation & Safety Data Access Repository
 * Handles user reports, blocking records, review status transitions, and audit logs.
 */

export type ReportTargetType = 'USER' | 'TEAM' | 'TOURNAMENT';
export type ReportReason = 'UNDERAGE' | 'FAKE_INFO' | 'MISBEHAVIOR' | 'INAPPROPRIATE_CONTENT' | 'OTHER';
export type ReportStatus = 'PENDING' | 'REVIEWED' | 'ACTION_TAKEN' | 'DISMISSED';

export interface ReportRecord {
  id: string;
  reporterUserId: string;
  targetType: ReportTargetType;
  targetId: string;
  reasonCategory: ReportReason;
  description: string;
  status: ReportStatus;
  createdAt: Date;
  reviewedAt: Date | null;
  reviewedBy: string | null;
  adminNotes?: string;
}

export interface BlockRecord {
  id: string;
  blockerUserId: string;
  blockedUserId: string;
  createdAt: Date;
}

export class InMemoryModerationRepository {
  private reports: Map<string, ReportRecord> = new Map();
  private blocks: Map<string, BlockRecord> = new Map();

  // 1. Report Methods
  async createReport(data: Omit<ReportRecord, 'id' | 'status' | 'createdAt' | 'reviewedAt' | 'reviewedBy'>): Promise<ReportRecord> {
    const id = `rep-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const now = new Date();

    const record: ReportRecord = {
      ...data,
      id,
      status: 'PENDING',
      createdAt: now,
      reviewedAt: null,
      reviewedBy: null
    };

    this.reports.set(id, record);
    return { ...record };
  }

  async findReportsByReporterSince(reporterUserId: string, sinceDate: Date): Promise<ReportRecord[]> {
    const results: ReportRecord[] = [];
    for (const report of this.reports.values()) {
      if (report.reporterUserId === reporterUserId && report.createdAt >= sinceDate) {
        results.push({ ...report });
      }
    }
    return results;
  }

  async findPendingByTarget(reporterUserId: string, targetType: ReportTargetType, targetId: string): Promise<ReportRecord | null> {
    for (const report of this.reports.values()) {
      if (
        report.reporterUserId === reporterUserId &&
        report.targetType === targetType &&
        report.targetId === targetId &&
        report.status === 'PENDING'
      ) {
        return { ...report };
      }
    }
    return null;
  }

  async findReportById(id: string): Promise<ReportRecord | null> {
    const report = this.reports.get(id);
    return report ? { ...report } : null;
  }

  async listReports(filter?: { status?: ReportStatus; targetType?: ReportTargetType }): Promise<ReportRecord[]> {
    const results: ReportRecord[] = [];
    for (const report of this.reports.values()) {
      if (filter?.status && report.status !== filter.status) continue;
      if (filter?.targetType && report.targetType !== filter.targetType) continue;
      results.push({ ...report });
    }
    return results.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async updateReportStatus(
    id: string,
    status: ReportStatus,
    reviewedBy: string,
    adminNotes?: string
  ): Promise<ReportRecord> {
    const report = this.reports.get(id);
    if (!report) throw new Error('REPORT_NOT_FOUND');

    report.status = status;
    report.reviewedBy = reviewedBy;
    report.reviewedAt = new Date();
    if (adminNotes) report.adminNotes = adminNotes;

    this.reports.set(id, report);
    return { ...report };
  }

  // 2. Block Methods
  async createBlock(blockerUserId: string, blockedUserId: string): Promise<BlockRecord> {
    const key = `${blockerUserId}:${blockedUserId}`;
    if (this.blocks.has(key)) {
      return { ...this.blocks.get(key)! };
    }

    const id = `blk-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const record: BlockRecord = {
      id,
      blockerUserId,
      blockedUserId,
      createdAt: new Date()
    };

    this.blocks.set(key, record);
    return { ...record };
  }

  async deleteBlock(blockerUserId: string, blockedUserId: string): Promise<boolean> {
    const key = `${blockerUserId}:${blockedUserId}`;
    return this.blocks.delete(key);
  }

  async isBlocked(blockerUserId: string, blockedUserId: string): Promise<boolean> {
    return this.blocks.has(`${blockerUserId}:${blockedUserId}`);
  }

  async getBlockedUserIds(blockerUserId: string): Promise<string[]> {
    const blocked: string[] = [];
    for (const record of this.blocks.values()) {
      if (record.blockerUserId === blockerUserId) {
        blocked.push(record.blockedUserId);
      }
    }
    return blocked;
  }

  clear(): void {
    this.reports.clear();
    this.blocks.clear();
  }
}

export const moderationRepository = new InMemoryModerationRepository();
