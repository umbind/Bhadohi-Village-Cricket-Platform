/**
 * Team & Squad Member Data Access Repository
 * Handles temporary tournament-bound teams and squad memberships.
 */

export interface TeamRecord {
  id: string;
  tournamentId: string;
  captainUserId: string;
  teamName: string;
  village: string;
  status: 'FORMING' | 'APPLIED' | 'ACCEPTED' | 'ARCHIVED';
  createdAt: Date;
  updatedAt: Date;
}

export interface TeamMemberRecord {
  id: string;
  teamId: string;
  playerUserId: string;
  memberRole: 'CAPTAIN' | 'VICE_CAPTAIN' | 'PLAYER';
  status: 'CONFIRMED' | 'REMOVED';
  joinedAt: Date;
}

export class InMemoryTeamRepository {
  private teams: Map<string, TeamRecord> = new Map();
  private members: Map<string, TeamMemberRecord[]> = new Map();

  async createTeam(data: Omit<TeamRecord, 'id' | 'createdAt' | 'updatedAt' | 'status'>): Promise<TeamRecord> {
    // Check unique team name per tournament
    for (const team of this.teams.values()) {
      if (team.tournamentId === data.tournamentId && team.teamName.toLowerCase() === data.teamName.toLowerCase()) {
        throw new Error('DUPLICATE_TEAM_NAME_FOR_TOURNAMENT');
      }
    }

    const id = `team-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const now = new Date();

    const team: TeamRecord = {
      ...data,
      id,
      status: 'FORMING',
      createdAt: now,
      updatedAt: now
    };

    this.teams.set(id, team);

    // Automatically add creator as CAPTAIN
    const captainMember: TeamMemberRecord = {
      id: `mem-${Date.now()}-1`,
      teamId: id,
      playerUserId: data.captainUserId,
      memberRole: 'CAPTAIN',
      status: 'CONFIRMED',
      joinedAt: now
    };
    this.members.set(id, [captainMember]);

    return { ...team };
  }

  async findById(id: string): Promise<TeamRecord | null> {
    const team = this.teams.get(id);
    return team ? { ...team } : null;
  }

  async findByCaptain(captainUserId: string): Promise<TeamRecord[]> {
    const results: TeamRecord[] = [];
    for (const team of this.teams.values()) {
      if (team.captainUserId === captainUserId) {
        results.push({ ...team });
      }
    }
    return results;
  }

  async findByTournament(tournamentId: string): Promise<TeamRecord[]> {
    const results: TeamRecord[] = [];
    for (const team of this.teams.values()) {
      if (team.tournamentId === tournamentId) {
        results.push({ ...team });
      }
    }
    return results;
  }

  async addMember(teamId: string, playerUserId: string, role: 'PLAYER' | 'VICE_CAPTAIN' = 'PLAYER'): Promise<TeamMemberRecord> {
    const membersList = this.members.get(teamId) || [];
    if (membersList.some(m => m.playerUserId === playerUserId && m.status === 'CONFIRMED')) {
      throw new Error('PLAYER_ALREADY_IN_TEAM');
    }

    const member: TeamMemberRecord = {
      id: `mem-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      teamId,
      playerUserId,
      memberRole: role,
      status: 'CONFIRMED',
      joinedAt: new Date()
    };

    membersList.push(member);
    this.members.set(teamId, membersList);
    return { ...member };
  }

  async getMembers(teamId: string): Promise<TeamMemberRecord[]> {
    return this.members.get(teamId) || [];
  }

  async removeMember(teamId: string, playerUserId: string): Promise<boolean> {
    const membersList = this.members.get(teamId) || [];
    const index = membersList.findIndex(m => m.playerUserId === playerUserId && m.status === 'CONFIRMED');
    if (index === -1) {
      throw new Error('MEMBER_NOT_FOUND_IN_TEAM');
    }
    membersList.splice(index, 1);
    this.members.set(teamId, membersList);
    return true;
  }

  async updateStatus(id: string, status: 'FORMING' | 'APPLIED' | 'ACCEPTED' | 'ARCHIVED'): Promise<TeamRecord> {
    const team = this.teams.get(id);
    if (!team) throw new Error('TEAM_NOT_FOUND');

    team.status = status;
    team.updatedAt = new Date();
    this.teams.set(id, team);
    return { ...team };
  }

  clear(): void {
    this.teams.clear();
    this.members.clear();
  }
}

export const teamRepository = new InMemoryTeamRepository();
