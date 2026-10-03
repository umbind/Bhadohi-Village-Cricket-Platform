/**
 * Expiry Job Audit Data Access Repository
 * Records execution runs, processed record counts, and status for automated background cron jobs.
 */

export type ExpiryJobType = 'AVAILABILITY_EXPIRY' | 'INVITATION_EXPIRY' | 'TOURNAMENT_ARCHIVAL' | 'PII_SCRUBBING';
export type JobStatus = 'RUNNING' | 'SUCCESS' | 'FAILED';

export interface ExpiryJobRecord {
  id: string;
  jobType: ExpiryJobType;
  status: JobStatus;
  recordsAffected: number;
  errorDetails: string | null;
  startedAt: Date;
  completedAt: Date | null;
}

export class InMemoryExpiryRepository {
  private jobs: ExpiryJobRecord[] = [];

  async recordJobRun(data: Omit<ExpiryJobRecord, 'id'>): Promise<ExpiryJobRecord> {
    const id = `job-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const record: ExpiryJobRecord = {
      ...data,
      id
    };
    this.jobs.push(record);
    return { ...record };
  }

  async listJobRuns(limit: number = 20): Promise<ExpiryJobRecord[]> {
    return [...this.jobs]
      .sort((a, b) => b.startedAt.getTime() - a.startedAt.getTime())
      .slice(0, limit);
  }

  clear(): void {
    this.jobs = [];
  }
}

export const expiryRepository = new InMemoryExpiryRepository();
