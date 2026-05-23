import { AppDataSource } from '../config/database-init';
import { AuditLog, AuditAction } from '../models/AuditLog';

export class AuditService {
  private auditLogRepo = AppDataSource.getRepository(AuditLog);

  async log(
    userId: string,
    action: AuditAction,
    entityType: 'loan' | 'obligation' | 'transaction',
    entityId: string,
    field?: string,
    oldValue?: any,
    newValue?: any,
    reason?: string
  ): Promise<AuditLog> {
    const log = this.auditLogRepo.create({
      userId,
      action,
      entityType,
      entityId,
      field,
      oldValue: oldValue != null ? JSON.stringify(oldValue) : null,
      newValue: newValue != null ? JSON.stringify(newValue) : null,
      reason,
    });
    return await this.auditLogRepo.save(log);
  }

  async getLogsForEntity(
    entityType: 'loan' | 'obligation' | 'transaction',
    entityId: string
  ): Promise<AuditLog[]> {
    return await this.auditLogRepo.find({
      where: { entityType, entityId },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  async getLogsForUser(userId: string): Promise<AuditLog[]> {
    return await this.auditLogRepo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: 100,
    });
  }

  async deleteLogsForEntity(
    entityType: 'loan' | 'obligation' | 'transaction',
    entityId: string
  ): Promise<void> {
    await this.auditLogRepo.delete({ entityType, entityId });
  }
}

export const auditService = new AuditService();
