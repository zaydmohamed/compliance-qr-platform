import { AuditLog } from '../models/AuditLog.js';

export const logAudit = async ({
  actorId = null,
  actorName = 'System',
  actorRole = 'SYSTEM',
  action,
  resourceType,
  resourceId = null,
  ipAddress = '',
  userAgent = '',
  metadata = {},
}) => {
  try {
    await AuditLog.create({
      actorId,
      actorName,
      actorRole,
      action,
      resourceType,
      resourceId,
      ipAddress,
      userAgent,
      metadata,
    });
  } catch (error) {
    console.error('[AuditLog Error] Failed to write audit log:', error.message);
  }
};
