/**
 * Team & Application Domain Service
 * Manages temporary tournament-bound teams, roster limits, and application reviews.
 */

import { teamRepository, TeamRecord, TeamMemberRecord } from '../../repositories/team.repository.js';
import { tournamentRepository } from '../../repositories/tournament.repository.js';
import { applicationRepository, ApplicationRecord } from '../../repositories/application.repository.js';
import { notificationRepository } from '../../repositories/notification.repository.js';

export class TeamService {
  async createTeam(captainUserId: string, tournamentId: string, input: { teamName: string; village: string }): Promise<TeamRecord> {
    const tour = await tournamentRepository.findById(tournamentId);
    if (!tour) throw new Error('TOURNAMENT_NOT_FOUND');
    if (tour.status !== 'PUBLISHED') {
      throw new Error('TOURNAMENT_NOT_ACCEPTING_TEAMS');
    }

    if (!input.teamName || input.teamName.trim().length < 3) {
      throw new Error('INVALID_TEAM_NAME');
    }

    return teamRepository.createTeam({
      tournamentId,
      captainUserId,
      teamName: input.teamName.trim(),
      village: input.village.trim()
    });
  }

  async addPlayerToTeam(captainUserId: string, teamId: string, playerUserId: string): Promise<TeamMemberRecord> {
    const team = await teamRepository.findById(teamId);
    if (!team) throw new Error('TEAM_NOT_FOUND');
    if (team.captainUserId !== captainUserId) throw new Error('FORBIDDEN_NOT_CAPTAIN');

    const tour = await tournamentRepository.findById(team.tournamentId);
    if (!tour) throw new Error('TOURNAMENT_NOT_FOUND');

    const members = await teamRepository.getMembers(teamId);
    if (members.length >= tour.maxSquadSize) {
      throw new Error('SQUAD_CAPACITY_EXCEEDED');
    }

    return teamRepository.addMember(teamId, playerUserId, 'PLAYER');
  }

  async removePlayerFromTeam(captainUserId: string, teamId: string, playerUserId: string): Promise<boolean> {
    const team = await teamRepository.findById(teamId);
    if (!team) throw new Error('TEAM_NOT_FOUND');
    if (team.captainUserId !== captainUserId) throw new Error('FORBIDDEN_NOT_CAPTAIN');
    if (team.captainUserId === playerUserId) throw new Error('CANNOT_REMOVE_CAPTAIN');

    return teamRepository.removeMember(teamId, playerUserId);
  }

  async getTeamDetails(teamId: string): Promise<{ team: TeamRecord; members: TeamMemberRecord[] }> {
    const team = await teamRepository.findById(teamId);
    if (!team) throw new Error('TEAM_NOT_FOUND');
    const members = await teamRepository.getMembers(teamId);
    return { team, members };
  }

  async getMyTeams(captainUserId: string): Promise<TeamRecord[]> {
    return teamRepository.findByCaptain(captainUserId);
  }

  async submitApplication(captainUserId: string, tournamentId: string, teamId: string): Promise<ApplicationRecord> {
    const tour = await tournamentRepository.findById(tournamentId);
    if (!tour) throw new Error('TOURNAMENT_NOT_FOUND');
    if (tour.status !== 'PUBLISHED') {
      throw new Error('TOURNAMENT_NOT_ACCEPTING_APPLICATIONS');
    }

    const team = await teamRepository.findById(teamId);
    if (!team) throw new Error('TEAM_NOT_FOUND');
    if (team.captainUserId !== captainUserId) throw new Error('FORBIDDEN_NOT_CAPTAIN');
    if (team.tournamentId !== tournamentId) throw new Error('TEAM_TOURNAMENT_MISMATCH');

    const app = await applicationRepository.create({
      tournamentId,
      teamId,
      captainUserId,
      status: 'PENDING'
    });

    await teamRepository.updateStatus(teamId, 'APPLIED');
    return app;
  }

  async withdrawApplication(captainUserId: string, applicationId: string): Promise<ApplicationRecord> {
    const app = await applicationRepository.findById(applicationId);
    if (!app) throw new Error('APPLICATION_NOT_FOUND');
    if (app.captainUserId !== captainUserId) throw new Error('FORBIDDEN_NOT_CAPTAIN');
    if (app.status !== 'PENDING') throw new Error('CANNOT_WITHDRAW_REVIEWED_APPLICATION');

    const updated = await applicationRepository.updateStatus(applicationId, 'WITHDRAWN');
    await teamRepository.updateStatus(app.teamId, 'FORMING');
    return updated;
  }

  async reviewApplication(organizerUserId: string, applicationId: string, status: 'ACCEPTED' | 'REJECTED', reason: string | null = null): Promise<ApplicationRecord> {
    const app = await applicationRepository.findById(applicationId);
    if (!app) throw new Error('APPLICATION_NOT_FOUND');

    const tour = await tournamentRepository.findById(app.tournamentId);
    if (!tour) throw new Error('TOURNAMENT_NOT_FOUND');
    if (tour.organizerUserId !== organizerUserId) throw new Error('FORBIDDEN_NOT_ORGANIZER');

    const reviewed = await applicationRepository.updateStatus(applicationId, status, reason, organizerUserId);

    if (status === 'ACCEPTED') {
      await teamRepository.updateStatus(app.teamId, 'ACCEPTED');
      await notificationRepository.create({
        userId: app.captainUserId,
        title: `आवेदन स्वीकृत! ${tour.title}`,
        message: `आपकी टीम का आवेदन सफलतापूर्वक स्वीकार कर लिया गया है।`,
        type: 'APPLICATION_ACCEPTED',
        referenceId: app.tournamentId
      });
    } else {
      await teamRepository.updateStatus(app.teamId, 'FORMING');
      await notificationRepository.create({
        userId: app.captainUserId,
        title: `आवेदन अस्वीकृत: ${tour.title}`,
        message: `कारण: ${reason || 'आयोजक द्वारा अस्वीकृत'}`,
        type: 'APPLICATION_REJECTED',
        referenceId: app.tournamentId
      });
    }

    return reviewed;
  }
}

export const teamService = new TeamService();
