import { asyncHandler } from '../utils/asyncHandler.js';
import * as reportService from '../services/report.service.js';

export const getOverviewStats = asyncHandler(async (req, res) => {
  const stats = await reportService.getAdminOverviewStats();
  res.status(200).json({
    success: true,
    data: stats,
  });
});

export const getAnalytics = asyncHandler(async (req, res) => {
  const analytics = await reportService.getAdminAnalytics();
  res.status(200).json({
    success: true,
    data: analytics,
  });
});

export const exportSubmissionsCsv = asyncHandler(async (req, res) => {
  const csv = await reportService.generateSubmissionsCsv(req.query.organizationId || null);

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="submissions_export.csv"');
  res.status(200).send(csv);
});
