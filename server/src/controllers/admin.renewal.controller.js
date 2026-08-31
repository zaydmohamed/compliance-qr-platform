import { asyncHandler } from '../utils/asyncHandler.js';
import * as renewalService from '../services/renewal.service.js';
import { RenewalRequest } from '../models/RenewalRequest.js';
import { ApiError } from '../utils/ApiError.js';

export const getRenewalRequests = asyncHandler(async (req, res) => {
  const result = await renewalService.getRenewalRequestsList(req.query);
  res.status(200).json({
    success: true,
    data: result,
  });
});

export const getRenewalRequestById = asyncHandler(async (req, res) => {
  const request = await RenewalRequest.findById(req.params.id)
    .populate('organizationId', 'name displayTitle phone logo')
    .populate('requestedBy', 'fullName username phone')
    .populate('reviewedBy', 'fullName username')
    .populate('paymentId');

  if (!request) {
    throw new ApiError(404, 'Renewal request not found');
  }

  res.status(200).json({
    success: true,
    data: { request },
  });
});

export const approveRenewal = asyncHandler(async (req, res) => {
  const result = await renewalService.approveRenewalRequest(
    req.params.id,
    req.body,
    req.user
  );

  res.status(200).json({
    success: true,
    message: 'Renewal request approved. Payment recorded and 30-day service period started.',
    data: result,
  });
});

export const rejectRenewal = asyncHandler(async (req, res) => {
  const request = await renewalService.rejectRenewalRequest(
    req.params.id,
    req.body.rejectionReason,
    req.user
  );

  res.status(200).json({
    success: true,
    message: 'Renewal request rejected.',
    data: { request },
  });
});
