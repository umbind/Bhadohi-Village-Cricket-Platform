/**
 * Player Invitation Data Access Repository
 * Handles squad invitations, responses, expiry calculations, and status tracking.
 */

export type InvitationStatus = 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'EXPIRED' | 'CANCELLED';

export interface InvitationRecord {
  id: string;
  teamId: string;
  tournamentId: string;
  inviterUserId: string;
  inviteeUserId: string;
  status: InvitationStatus;
  invitedAt: Date;
  respondedAt: Date | null;
  expiresAt: Date;
}

export class InMemoryInvitationRepository {
  private invitations: Map<string, InvitationRecord> = new Map();

  async create(data: Omit<InvitationRecord, 'id' | 'status' | 'invitedAt' | 'respondedAt'>): Promise<InvitationRecord> {
    const id = `inv-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const now = new Date();

    const record: InvitationRecord = {
      ...data,
      id,
      status: 'PENDING',
      invitedAt: now,
      respondedAt: null
    };

    this.invitations.set(id, record);
    return { ...record };
  }

  async findById(id: string): Promise<InvitationRecord | null> {
    const inv = this.invitations.get(id);
    return inv ? { ...inv } : null;
  }

  async findPendingByTeamAndInvitee(teamId: string, inviteeUserId: string): Promise<InvitationRecord | null> {
    for (const inv of this.invitations.values()) {
      if (inv.teamId === teamId && inv.inviteeUserId === inviteeUserId && inv.status === 'PENDING') {
        return { ...inv };
      }
    }
    return null;
  }

  async findByInvitee(inviteeUserId: string, status?: InvitationStatus): Promise<InvitationRecord[]> {
    const results: InvitationRecord[] = [];
    const now = new Date();

    for (const inv of this.invitations.values()) {
      if (inv.inviteeUserId === inviteeUserId) {
        // Auto-check expiry for pending
        if (inv.status === 'PENDING' && now > inv.expiresAt) {
          inv.status = 'EXPIRED';
        }
        if (!status || inv.status === status) {
          results.push({ ...inv });
        }
      }
    }

    return results.sort((a, b) => b.invitedAt.getTime() - a.invitedAt.getTime());
  }

  async findByTeam(teamId: string): Promise<InvitationRecord[]> {
    const results: InvitationRecord[] = [];
    const now = new Date();

    for (const inv of this.invitations.values()) {
      if (inv.teamId === teamId) {
        if (inv.status === 'PENDING' && now > inv.expiresAt) {
          inv.status = 'EXPIRED';
        }
        results.push({ ...inv });
      }
    }

    return results.sort((a, b) => b.invitedAt.getTime() - a.invitedAt.getTime());
  }

  async updateStatus(id: string, status: InvitationStatus, respondedAt: Date = new Date()): Promise<InvitationRecord> {
    const inv = this.invitations.get(id);
    if (!inv) throw new Error('INVITATION_NOT_FOUND');

    inv.status = status;
    inv.respondedAt = respondedAt;
    this.invitations.set(id, inv);
    return { ...inv };
  }

  async sweepExpiredInvitations(now: Date = new Date()): Promise<number> {
    let count = 0;
    for (const inv of this.invitations.values()) {
      if (inv.status === 'PENDING' && inv.expiresAt <= now) {
        inv.status = 'EXPIRED';
        count++;
      }
    }
    return count;
  }

  clear(): void {
    this.invitations.clear();
  }
}

export const invitationRepository = new InMemoryInvitationRepository();
