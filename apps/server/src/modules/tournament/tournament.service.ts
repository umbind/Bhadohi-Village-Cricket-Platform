/**
 * Tournament Domain Service
 * Manages tournament notices, publishing workflows, cancellation cascades, and WhatsApp share formatting.
 */

import { tournamentRepository, TournamentRecord } from '../../repositories/tournament.repository.js';
import { applicationRepository } from '../../repositories/application.repository.js';
import { notificationRepository } from '../../repositories/notification.repository.js';

const VALID_BLOCKS = ['GYANPUR', 'AURAI', 'BHADOHI', 'SURIYAWAN', 'DEEGH', 'ABHOLI'];

export class TournamentService {
  async createTournament(organizerUserId: string, input: Omit<TournamentRecord, 'id' | 'organizerUserId' | 'createdAt' | 'updatedAt' | 'cancellationReason'>): Promise<TournamentRecord> {
    if (!VALID_BLOCKS.includes(input.block.toUpperCase() as any)) {
      throw new Error('INVALID_BHADOHI_BLOCK');
    }
    if (new Date(input.startDate) > new Date(input.endDate)) {
      throw new Error('INVALID_TOURNAMENT_DATES');
    }
    if (new Date(input.registrationOpenDate) > new Date(input.registrationCloseDate)) {
      throw new Error('INVALID_REGISTRATION_DATES');
    }
    if (new Date(input.startDate) < new Date(input.registrationCloseDate)) {
      throw new Error('START_BEFORE_REGISTRATION_CLOSE');
    }
    if (input.minSquadSize < 7 || input.maxSquadSize < input.minSquadSize) {
      throw new Error('INVALID_SQUAD_SIZE_LIMITS');
    }

    return tournamentRepository.create({
      ...input,
      block: input.block.toUpperCase() as any,
      organizerUserId,
      status: input.status || 'DRAFT'
    });
  }

  async publishTournament(organizerUserId: string, tournamentId: string): Promise<TournamentRecord> {
    const tour = await tournamentRepository.findById(tournamentId);
    if (!tour) throw new Error('TOURNAMENT_NOT_FOUND');
    if (tour.organizerUserId !== organizerUserId) throw new Error('FORBIDDEN_NOT_ORGANIZER');
    if (tour.status !== 'DRAFT') throw new Error('CANNOT_PUBLISH_NON_DRAFT');

    return tournamentRepository.update(tournamentId, { status: 'PUBLISHED' });
  }

  async cancelTournament(organizerUserId: string, tournamentId: string, reason: string): Promise<TournamentRecord> {
    if (!reason || reason.trim().length < 10) {
      throw new Error('CANCELLATION_REASON_TOO_SHORT');
    }

    const tour = await tournamentRepository.findById(tournamentId);
    if (!tour) throw new Error('TOURNAMENT_NOT_FOUND');
    if (tour.organizerUserId !== organizerUserId) throw new Error('FORBIDDEN_NOT_ORGANIZER');
    if (['COMPLETED', 'CANCELLED'].includes(tour.status)) {
      throw new Error('TOURNAMENT_ALREADY_CLOSED');
    }

    const cancelledTour = await tournamentRepository.cancel(tournamentId, reason.trim());

    // Cascade in-app notifications to all applied captains
    const applications = await applicationRepository.findByTournament(tournamentId);
    for (const app of applications) {
      await notificationRepository.create({
        userId: app.captainUserId,
        title: `प्रतियोगिता निरस्त: ${tour.title}`,
        message: `आयोजक द्वारा प्रतियोगिता निरस्त कर दी गई है। कारण: ${reason.trim()}`,
        type: 'TOURNAMENT_CANCELLED',
        referenceId: tournamentId
      });
      if (app.status === 'PENDING') {
        await applicationRepository.updateStatus(app.id, 'REJECTED', 'टूर्नामेंट निरस्त हुआ');
      }
    }

    return cancelledTour;
  }

  async listTournaments(filter: { block?: string; status?: string }): Promise<TournamentRecord[]> {
    return tournamentRepository.list({
      block: filter.block?.toUpperCase(),
      status: filter.status?.toUpperCase()
    });
  }

  async getTournamentDetails(id: string): Promise<TournamentRecord> {
    const tour = await tournamentRepository.findById(id);
    if (!tour) throw new Error('TOURNAMENT_NOT_FOUND');
    return tour;
  }

  generateWhatsAppShareText(tour: TournamentRecord): string {
    return `🏏 *${tour.title}*\n` +
      `📍 *स्थान:* ${tour.groundLocation}, ${tour.village} (${tour.block} ब्लॉक, भदोही)\n` +
      `📅 *दिनांक:* ${tour.startDate} से ${tour.endDate}\n` +
      `⏰ *पंजीकरण अंतिम तिथि:* ${tour.registrationCloseDate}\n` +
      `📋 *प्रारूप:* ${tour.matchFormat} (${tour.ballType} गेंद)\n` +
      `💵 *प्रवेश सूचना:* ${tour.entryFeeNote}\n\n` +
      `⚠️ *सूचना:* इस प्लेटफ़ॉर्म पर कोई ऑनलाइन भुगतान नहीं होता। अधिक जानकारी व टीम आवेदन हेतु ऐप देखें।`;
  }
}

export const tournamentService = new TournamentService();
