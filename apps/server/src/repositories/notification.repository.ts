/**
 * In-App Notification Data Access Repository
 */

export interface NotificationRecord {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'INVITE_RECEIVED' | 'INVITE_ACCEPTED' | 'INVITE_DECLINED' | 'APPLICATION_ACCEPTED' | 'APPLICATION_REJECTED' | 'TOURNAMENT_ANNOUNCEMENT' | 'TOURNAMENT_CANCELLED' | 'SYSTEM';
  referenceId: string | null;
  isRead: boolean;
  createdAt: Date;
}

export class InMemoryNotificationRepository {
  private notifications: NotificationRecord[] = [];

  async create(data: Omit<NotificationRecord, 'id' | 'isRead' | 'createdAt'>): Promise<NotificationRecord> {
    const record: NotificationRecord = {
      ...data,
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      isRead: false,
      createdAt: new Date()
    };
    this.notifications.push(record);
    return { ...record };
  }

  async findByUserId(userId: string): Promise<NotificationRecord[]> {
    return this.notifications
      .filter(n => n.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async markAsRead(id: string): Promise<void> {
    const notif = this.notifications.find(n => n.id === id);
    if (notif) notif.isRead = true;
  }

  clear(): void {
    this.notifications = [];
  }
}

export const notificationRepository = new InMemoryNotificationRepository();
