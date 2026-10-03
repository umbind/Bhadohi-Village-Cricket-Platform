/**
 * Player Invitation Domain Service
 * Coordinates player scouting, squad invitations, expiry rules, mutual WhatsApp contact reveal,
 * and roster inclusion upon explicit acceptance.
 */

import { invitationRepository, InvitationRecord, InvitationStatus } from '../../repositories/invitation.repository.js';
import { teamRepository } from '../../repositories/team.repository.js';
import { tournamentRepository } from '../../repositories/tournament.repository.js';
import { userRepository } from '../../repositories/user.repository.js';
import { profileRepository, ProfileRecord } from '../../repositories/profile.repository.js';
import { notificationRepository } from '../../repositories/notification.repository.js';
import { safetyService } from '../safety/safety.service.js';

export interface EnrichedReceivedInvitation extends InvitationRecord {
  teamName: string;
  village: string;
  tournamentTitle: string;
  groundLocation: string;
  block: string;
  inviterName: string;
  isExpired: boolean;
}

export class InvitationService {
  /**
   * Scout available players across Bhadohi district
   * Privacy Invariant: Mobile numbers are strictly omitted.
   */
  async scoutPlayers(filter: {
    scouterUserId?: string;
    block?: string;
    role?: string;
    battingStyle?: string;
    bowlingStyle?: string;
    availableOnly?: boolean;
  }): Promise<Array<Omit<ProfileRecord, 'userId'>>> {
    const rawProfiles = await profileRepository.searchRaw({
      block: filter.block,
      role: filter.role,
      availableOnly: filter.availableOnly !== false
    });

    const results: Array<Omit<ProfileRecord, 'userId'>> = [];
    for (const p of rawProfiles) {
      if (filter.scouterUserId) {
        const isBlocked = await safetyService.isBlocked(filter.scouterUserId, p.userId);
        if (isBlocked) continue;
      }
      if (filter.battingStyle && p.battingStyle !== filter.battingStyle) continue;
      if (filter.bowlingStyle && p.bowlingStyle !== filter.bowlingStyle) continue;

      const { userId: _, ...safeProfile } = p;
      results.push(safeProfile);
    }
    return results;
  }

  /**
   * Captain sends invitation to an available player for their temporary squad
   */
  async sendInvitation(captainUserId: string, teamId: string, inviteeIdentifier: string): Promise<InvitationRecord> {
    const team = await teamRepository.findById(teamId);
    if (!team) {
      throw new Error('TEAM_NOT_FOUND');
    }

    if (team.captainUserId !== captainUserId) {
      throw new Error('FORBIDDEN_NOT_CAPTAIN');
    }

    if (team.status !== 'FORMING') {
      throw new Error('TEAM_NOT_FORMING');
    }

    const tournament = await tournamentRepository.findById(team.tournamentId);
    if (!tournament) {
      throw new Error('TOURNAMENT_NOT_FOUND');
    }

    if (tournament.status === 'CANCELLED') {
      throw new Error('TOURNAMENT_CANCELLED');
    }

    if (tournament.status !== 'PUBLISHED') {
      throw new Error('TOURNAMENT_NOT_PUBLISHED');
    }

    const now = new Date();
    const regClose = new Date(tournament.registrationCloseDate);
    if (now > regClose) {
      throw new Error('REGISTRATION_CLOSED');
    }

    // Squad capacity check
    const members = await teamRepository.getMembers(teamId);
    const confirmedCount = members.filter(m => m.status === 'CONFIRMED').length;
    if (confirmedCount >= tournament.maxSquadSize) {
      throw new Error('SQUAD_CAPACITY_REACHED');
    }

    // Resolve invitee profile and user ID
    let profile = await profileRepository.findByUserId(inviteeIdentifier);
    if (!profile) {
      profile = await profileRepository.findById(inviteeIdentifier);
    }
    if (!profile) {
      throw new Error('INVITEE_NOT_FOUND');
    }

    const inviteeUserId = profile.userId;

    if (inviteeUserId === captainUserId) {
      throw new Error('CANNOT_INVITE_SELF');
    }

    // Bidirectional block check (SEC-08)
    const isBlocked = await safetyService.isBlocked(captainUserId, inviteeUserId);
    if (isBlocked) {
      throw new Error('BLOCKED_INTERACTION');
    }

    // Verify player availability
    if (!profile.isAvailable || profile.availabilityExpiresAt <= now) {
      throw new Error('PLAYER_NOT_AVAILABLE');
    }

    // Verify player is not already in the squad
    if (members.some(m => m.playerUserId === inviteeUserId && m.status === 'CONFIRMED')) {
      throw new Error('PLAYER_ALREADY_IN_TEAM');
    }

    // Verify no pending invitation already exists for this team
    const existing = await invitationRepository.findPendingByTeamAndInvitee(teamId, inviteeUserId);
    if (existing) {
      throw new Error('DUPLICATE_INVITATION');
    }

    // Expiry calculation: min(now + 5 days, tournament registration close date)
    const fiveDaysFromNow = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000);
    const expiresAt = fiveDaysFromNow < regClose ? fiveDaysFromNow : regClose;

    const invitation = await invitationRepository.create({
      teamId,
      tournamentId: tournament.id,
      inviterUserId: captainUserId,
      inviteeUserId,
      expiresAt
    });

    // Dispatch in-app notification to invited player
    await notificationRepository.create({
      userId: inviteeUserId,
      title: 'टीम में शामिल होने का निमंत्रण',
      message: `आपको "${team.teamName}" (${tournament.title}) टीम में शामिल होने का निमंत्रण मिला है।`,
      type: 'INVITE_RECEIVED',
      referenceId: invitation.id
    });

    return invitation;
  }

  /**
   * Get all invitations received by a player
   */
  async getReceivedInvitations(userId: string, status?: InvitationStatus): Promise<EnrichedReceivedInvitation[]> {
    const invitations = await invitationRepository.findByInvitee(userId, status);
    const enriched: EnrichedReceivedInvitation[] = [];
    const now = new Date();

    for (const inv of invitations) {
      const team = await teamRepository.findById(inv.teamId);
      const tournament = team ? await tournamentRepository.findById(team.tournamentId) : null;
      const inviterProfile = await profileRepository.findByUserId(inv.inviterUserId);

      enriched.push({
        ...inv,
        teamName: team ? team.teamName : 'अज्ञात टीम',
        village: team ? team.village : '',
        tournamentTitle: tournament ? tournament.title : '',
        groundLocation: tournament ? tournament.groundLocation : '',
        block: tournament ? tournament.block : '',
        inviterName: inviterProfile ? inviterProfile.fullName : 'कप्तान',
        isExpired: inv.status === 'EXPIRED' || (inv.status === 'PENDING' && now > inv.expiresAt)
      });
    }

    return enriched;
  }

  /**
   * Get all invitations sent by a team captain
   */
  async getSentInvitations(captainUserId: string, teamId: string): Promise<Array<InvitationRecord & { inviteeName: string; inviteeVillage: string; inviteeRole: string }>> {
    const team = await teamRepository.findById(teamId);
    if (!team) {
      throw new Error('TEAM_NOT_FOUND');
    }
    if (team.captainUserId !== captainUserId) {
      throw new Error('FORBIDDEN_NOT_CAPTAIN');
    }

    const invitations = await invitationRepository.findByTeam(teamId);
    const enriched = [];

    for (const inv of invitations) {
      const profile = await profileRepository.findByUserId(inv.inviteeUserId);
      enriched.push({
        ...inv,
        inviteeName: profile ? profile.fullName : 'खिलाड़ी',
        inviteeVillage: profile ? profile.village : '',
        inviteeRole: profile ? profile.primaryRole : ''
      });
    }

    return enriched;
  }

  /**
   * Invited player responds to invitation (ACCEPT or DECLINE)
   * Only upon ACCEPT is the player added to the squad and mutual WhatsApp contact unlocked.
   */
  async respondToInvitation(userId: string, invitationId: string, action: 'ACCEPT' | 'DECLINE'): Promise<{
    invitation: InvitationRecord;
    whatsappLink?: string;
  }> {
    const invitation = await invitationRepository.findById(invitationId);
    if (!invitation) {
      throw new Error('INVITATION_NOT_FOUND');
    }

    if (invitation.inviteeUserId !== userId) {
      throw new Error('FORBIDDEN_NOT_INVITED_PLAYER');
    }

    if (invitation.status !== 'PENDING') {
      throw new Error('INVITATION_ALREADY_RESPONDED');
    }

    const now = new Date();
    if (now > invitation.expiresAt) {
      await invitationRepository.updateStatus(invitationId, 'EXPIRED', now);
      throw new Error('INVITATION_EXPIRED');
    }

    const team = await teamRepository.findById(invitation.teamId);
    if (!team) {
      throw new Error('TEAM_NOT_FOUND');
    }

    if (action === 'ACCEPT') {
      if (team.status !== 'FORMING') {
        throw new Error('TEAM_NOT_FORMING');
      }

      const tournament = await tournamentRepository.findById(invitation.tournamentId);
      const members = await teamRepository.getMembers(team.id);
      const maxSquad = tournament ? tournament.maxSquadSize : 16;
      if (members.filter(m => m.status === 'CONFIRMED').length >= maxSquad) {
        throw new Error('SQUAD_CAPACITY_REACHED');
      }

      // Update status to ACCEPTED
      const updatedInv = await invitationRepository.updateStatus(invitationId, 'ACCEPTED', now);

      // Add to squad roster
      await teamRepository.addMember(team.id, userId, 'PLAYER');

      // Dispatch notification to Captain
      const playerProfile = await profileRepository.findByUserId(userId);
      const playerName = playerProfile ? playerProfile.fullName : 'खिलाड़ी';

      await notificationRepository.create({
        userId: team.captainUserId,
        title: 'खिलाड़ी ने निमंत्रण स्वीकार किया',
        message: `${playerName} ने आपकी टीम "${team.teamName}" का निमंत्रण स्वीकार कर लिया है।`,
        type: 'INVITE_ACCEPTED',
        referenceId: invitation.id
      });

      // Construct mutual WhatsApp contact link for the player to reach captain
      const captainUser = await userRepository.findById(team.captainUserId);
      let whatsappLink: string | undefined;
      if (captainUser && captainUser.mobileNumber) {
        const textMsg = encodeURIComponent(`नमस्ते कप्तान जी, मैंने आपकी टीम "${team.teamName}" का निमंत्रण स्वीकार कर लिया है।`);
        whatsappLink = `https://wa.me/91${captainUser.mobileNumber}?text=${textMsg}`;
      }

      return {
        invitation: updatedInv,
        whatsappLink
      };
    } else {
      // DECLINE
      const updatedInv = await invitationRepository.updateStatus(invitationId, 'DECLINED', now);

      const playerProfile = await profileRepository.findByUserId(userId);
      const playerName = playerProfile ? playerProfile.fullName : 'खिलाड़ी';

      await notificationRepository.create({
        userId: team.captainUserId,
        title: 'खिलाड़ी ने निमंत्रण अस्वीकार किया',
        message: `${playerName} ने आपकी टीम "${team.teamName}" का निमंत्रण अस्वीकार कर दिया।`,
        type: 'INVITE_DECLINED',
        referenceId: invitation.id
      });

      return {
        invitation: updatedInv
      };
    }
  }

  /**
   * Captain cancels a pending invitation
   */
  async cancelInvitation(captainUserId: string, invitationId: string): Promise<InvitationRecord> {
    const invitation = await invitationRepository.findById(invitationId);
    if (!invitation) {
      throw new Error('INVITATION_NOT_FOUND');
    }

    const team = await teamRepository.findById(invitation.teamId);
    if (!team || team.captainUserId !== captainUserId) {
      throw new Error('FORBIDDEN_NOT_CAPTAIN');
    }

    if (invitation.status !== 'PENDING') {
      throw new Error('CANNOT_CANCEL_NON_PENDING_INVITATION');
    }

    return invitationRepository.updateStatus(invitationId, 'CANCELLED');
  }
}

export const invitationService = new InvitationService();
