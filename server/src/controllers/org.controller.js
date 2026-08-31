import { asyncHandler } from '../utils/asyncHandler.js';
import * as orgService from '../services/organization.service.js';
import * as submissionService from '../services/submission.service.js';
import * as qrService from '../services/qr.service.js';
import * as renewalService from '../services/renewal.service.js';
import * as reportService from '../services/report.service.js';
import { QRCode } from '../models/QRCode.js';
import { Organization } from '../models/Organization.js';
import { QR_STATUS } from '../constants/statuses.js';
import { ApiError } from '../utils/ApiError.js';

export const getOverview = asyncHandler(async (req, res) => {
  const stats = await reportService.getOrganizationOverviewStats(req.organizationId);
  const orgDetails = await orgService.getOrganizationById(req.organizationId);

  res.status(200).json({
    success: true,
    data: {
      stats,
      organization: orgDetails.organization,
    },
  });
});

export const updateProfile = asyncHandler(async (req, res) => {
  const updatedOrg = await orgService.updateOrganization(
    req.organizationId,
    req.body,
    null,
    req.user
  );

  res.status(200).json({
    success: true,
    message: 'Organization profile and email updated successfully',
    data: { organization: updatedOrg },
  });
});

export const getSubmissions = asyncHandler(async (req, res) => {
  const result = await submissionService.getSubmissionsList({
    ...req.query,
    organizationId: req.organizationId,
  });

  res.status(200).json({
    success: true,
    data: result,
  });
});

export const getSubmissionById = asyncHandler(async (req, res) => {
  const submission = await submissionService.getSubmissionsList({
    organizationId: req.organizationId,
  });
  // Find specific
  const single = await submissionService.updateSubmission(req.params.id, {}, req.user);
  res.status(200).json({
    success: true,
    data: { submission: single },
  });
});

export const updateSubmissionStatus = asyncHandler(async (req, res) => {
  const submission = await submissionService.updateSubmission(
    req.params.id,
    { status: req.body.status, notes: req.body.notes },
    req.user
  );

  res.status(200).json({
    success: true,
    message: 'Submission updated',
    data: { submission },
  });
});

export const getQrCode = asyncHandler(async (req, res) => {
  const qr = await QRCode.findOne({
    organizationId: req.organizationId,
    status: { $ne: QR_STATUS.REVOKED },
  });

  if (!qr) {
    throw new ApiError(404, 'Active QR Code not found for your organization');
  }

  const org = await orgService.getOrganizationById(req.organizationId);
  const dataUrl = await qrService.generateQrDataUrl(qr.publicToken);
  const publicUrl = qrService.buildPublicQrUrl(qr.publicToken);

  res.status(200).json({
    success: true,
    data: {
      qr,
      dataUrl,
      publicUrl,
      organization: org.organization,
    },
  });
});

export const requestRenewal = asyncHandler(async (req, res) => {
  const renewal = await renewalService.createRenewalRequest(
    req.organizationId,
    req.user,
    req.body.notes
  );

  res.status(201).json({
    success: true,
    message: 'Service renewal request submitted successfully. Awaiting Platform Admin review.',
    data: { renewal },
  });
});

export const getRenewalHistory = asyncHandler(async (req, res) => {
  const result = await renewalService.getRenewalRequestsList({
    organizationId: req.organizationId,
    ...req.query,
  });

  res.status(200).json({
    success: true,
    data: result,
  });
});

import * as chatbotService from '../services/chatbot.service.js';

export const exportCsv = asyncHandler(async (req, res) => {
  const csv = await reportService.generateSubmissionsCsv(req.organizationId);
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="my_organization_submissions.csv"');
  res.status(200).send(csv);
});

export const handleOrgChatbot = asyncHandler(async (req, res) => {
  const result = await chatbotService.handleChatbotMessage({
    message: req.body.message,
    history: req.body.history || [],
    mode: 'ORGANIZATION',
    orgId: req.organizationId,
  });

  res.status(200).json({
    success: true,
    data: result,
  });
});
