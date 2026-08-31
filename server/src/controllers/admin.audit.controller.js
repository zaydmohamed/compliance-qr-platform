import { asyncHandler } from '../utils/asyncHandler.js';
import { AuditLog } from '../models/AuditLog.js';

export const getAuditLogs = asyncHandler(async (req, res) => {
  const { action, resourceType, page = 1, limit = 25 } = req.query;
  const query = {};
  if (action) query.action = action;
  if (resourceType) query.resourceType = resourceType;

  const skip = (page - 1) * limit;
  const [total, logs] = await Promise.all([
    AuditLog.countDocuments(query),
    AuditLog.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
  ]);

  res.status(200).json({
    success: true,
    data: {
      logs,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / limit),
    },
  });
});
