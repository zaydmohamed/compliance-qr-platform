import { asyncHandler } from '../utils/asyncHandler.js';
import * as paymentService from '../services/payment.service.js';
import { Payment } from '../models/Payment.js';
import { ApiError } from '../utils/ApiError.js';

export const recordPayment = asyncHandler(async (req, res) => {
  const payment = await paymentService.recordManualPayment(req.body, req.user);
  res.status(201).json({
    success: true,
    message: 'Manual payment recorded successfully and service period extended.',
    data: { payment },
  });
});

export const getPayments = asyncHandler(async (req, res) => {
  const result = await paymentService.getPaymentsList(req.query);
  res.status(200).json({
    success: true,
    data: result,
  });
});

export const getPaymentById = asyncHandler(async (req, res) => {
  const payment = await Payment.findById(req.params.id)
    .populate('organizationId', 'name displayTitle phone')
    .populate('recordedBy', 'fullName username');

  if (!payment) {
    throw new ApiError(404, 'Payment record not found');
  }

  res.status(200).json({
    success: true,
    data: { payment },
  });
});
