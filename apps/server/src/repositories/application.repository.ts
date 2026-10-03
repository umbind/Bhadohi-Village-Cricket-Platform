/**
 * Tournament Application Data Access Repository
 * Handles formal team entry submissions and organizer review states.
 */

export interface ApplicationRecord {
  id: string;
  tournamentId: string;
  teamId: string;
  captainUserId: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'WITHDRAWN';
  rejectionReason: string | null;
  appliedAt: Date;
  reviewedAt: Date | null;
  reviewedBy: string | null;
}

export class InMemoryApplicationRepository {
  private applications: Map<string, ApplicationRecord> = new Map();

  async create(data: Omit<ApplicationRecord, 'id' | 'appliedAt' | 'reviewedAt' | 'reviewedBy' | 'rejectionReason'>): Promise<ApplicationRecord> {
    for (const app of this.applications.values()) {
      if (app.tournamentId === data.tournamentId && app.teamId === data.teamId && app.status !== 'WITHDRAWN') {
        throw new Error('DUPLICATE_APPLICATION');
      }
    }

    const id = `app-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const now = new Date();

    const record: ApplicationRecord = {
      ...data,
      id,
      rejectionReason: null,
      appliedAt: now,
      reviewedAt: null,
      reviewedBy: null
    };

    this.applications.set(id, record);
    return { ...record };
  }

  async findById(id: string): Promise<ApplicationRecord | null> {
    const app = this.applications.get(id);
    return app ? { ...app } : null;
  }

  async findByTournament(tournamentId: string): Promise<ApplicationRecord[]> {
    const results: ApplicationRecord[] = [];
    for (const app of this.applications.values()) {
      if (app.tournamentId === tournamentId) {
        results.push({ ...app });
      }
    }
    return results;
  }

  async updateStatus(id: string, status: 'ACCEPTED' | 'REJECTED' | 'WITHDRAWN', reason: string | null = null, reviewerId: string | null = null): Promise<ApplicationRecord> {
    const app = this.applications.get(id);
    if (!app) throw new Error('APPLICATION_NOT_FOUND');

    app.status = status;
    app.rejectionReason = reason;
    app.reviewedAt = new Date();
    app.reviewedBy = reviewerId;

    this.applications.set(id, app);
    return { ...app };
  }

  clear(): void {
    this.applications.clear();
  }
}

export const applicationRepository = new InMemoryApplicationRepository();
