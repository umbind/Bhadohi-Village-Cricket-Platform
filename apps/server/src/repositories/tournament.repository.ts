/**
 * Tournament Data Access Repository
 * Handles tournament notices, publishing lifecycle, and cancellations.
 */

export interface TournamentRecord {
  id: string;
  organizerUserId: string;
  title: string;
  groundLocation: string;
  village: string;
  block: 'GYANPUR' | 'AURAI' | 'BHADOHI' | 'SURIYAWAN' | 'DEEGH' | 'ABHOLI';
  startDate: string;
  endDate: string;
  registrationOpenDate: string;
  registrationCloseDate: string;
  maxTeams: number;
  minSquadSize: number;
  maxSquadSize: number;
  matchFormat: string;
  ballType: 'TENNIS' | 'LEATHER' | 'COSCO';
  entryFeeNote: string;
  rulesText: string;
  disclaimerText: string;
  status: 'DRAFT' | 'PUBLISHED' | 'REGISTRATION_CLOSED' | 'ONGOING' | 'COMPLETED' | 'CANCELLED';
  cancellationReason: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export class InMemoryTournamentRepository {
  private tournaments: Map<string, TournamentRecord> = new Map();

  async create(data: Omit<TournamentRecord, 'id' | 'createdAt' | 'updatedAt' | 'cancellationReason'>): Promise<TournamentRecord> {
    const id = `tour-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const now = new Date();

    const record: TournamentRecord = {
      ...data,
      id,
      cancellationReason: null,
      createdAt: now,
      updatedAt: now
    };

    this.tournaments.set(id, record);
    return { ...record };
  }

  async findById(id: string): Promise<TournamentRecord | null> {
    const tour = this.tournaments.get(id);
    return tour ? { ...tour } : null;
  }

  async list(filter: { block?: string; status?: string }): Promise<TournamentRecord[]> {
    const results: TournamentRecord[] = [];
    for (const tour of this.tournaments.values()) {
      if (filter.block && tour.block !== filter.block) continue;
      if (filter.status && tour.status !== filter.status) continue;
      results.push({ ...tour });
    }
    return results;
  }

  async update(id: string, data: Partial<TournamentRecord>): Promise<TournamentRecord> {
    const tour = this.tournaments.get(id);
    if (!tour) throw new Error('TOURNAMENT_NOT_FOUND');

    const updated = {
      ...tour,
      ...data,
      updatedAt: new Date()
    };
    this.tournaments.set(id, updated);
    return { ...updated };
  }

  async cancel(id: string, reason: string): Promise<TournamentRecord> {
    const tour = this.tournaments.get(id);
    if (!tour) throw new Error('TOURNAMENT_NOT_FOUND');

    tour.status = 'CANCELLED';
    tour.cancellationReason = reason;
    tour.updatedAt = new Date();
    this.tournaments.set(id, tour);
    return { ...tour };
  }

  clear(): void {
    this.tournaments.clear();
  }
}

export const tournamentRepository = new InMemoryTournamentRepository();
