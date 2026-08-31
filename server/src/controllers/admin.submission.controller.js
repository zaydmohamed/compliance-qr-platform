import { asyncHandler } from '../utils/asyncHandler.js';
import * as submissionService from '../services/submission.service.js';
import { CustomerSubmission } from '../models/CustomerSubmission.js';
import { ApiError } from '../utils/ApiError.js';

export const getSubmissions = asyncHandler(async (req, res) => {
  const result = await submissionService.getSubmissionsList({
    ...req.query,
    organizationId: req.query.organizationId || null,
  });

  res.status(200).json({
    success: true,
    data: result,
  });
});

export const getSubmissionById = asyncHandler(async (req, res) => {
  const submission = await CustomerSubmission.findById(req.params.id)
    .populate('organizationId', 'name displayTitle phone logo')
    .populate('qrCodeId', 'publicToken');

  if (!submission) {
    throw new ApiError(404, 'Submission not found');
  }

  res.status(200).json({
    success: true,
    data: { submission },
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
    message: 'Submission status updated',
    data: { submission },
  });
});

export const updateSubmissionPriority = asyncHandler(async (req, res) => {
  const submission = await submissionService.updateSubmission(
    req.params.id,
    { priority: req.body.priority },
    req.user
  );

  res.status(200).json({
    success: true,
    message: 'Submission priority updated',
    data: { submission },
  });
});
