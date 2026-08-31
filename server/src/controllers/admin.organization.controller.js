import { asyncHandler } from '../utils/asyncHandler.js';
import * as orgService from '../services/organization.service.js';

export const createOrganization = asyncHandler(async (req, res) => {
  const logoPath = req.file ? `/uploads/logos/${req.file.filename}` : '';
  const organization = await orgService.createOrganization(req.body, logoPath, req.user);

  res.status(201).json({
    success: true,
    message: 'Organization created successfully',
    data: { organization },
  });
});

export const createCompleteOrganization = asyncHandler(async (req, res) => {
  const logoPath = req.file ? `/uploads/logos/${req.file.filename}` : '';
  
  // Parse JSON payloads if sent as multipart form
  let orgData = req.body.orgData ? JSON.parse(req.body.orgData) : req.body;
  let userData = req.body.userData ? JSON.parse(req.body.userData) : req.body.user;

  const result = await orgService.createCompleteOrganization(
    { orgData, userData, logoPath },
    req.user
  );

  res.status(201).json({
    success: true,
    message: 'Organization, user, QR code, and 30-day service initialized successfully',
    data: result,
  });
});

export const getOrganizations = asyncHandler(async (req, res) => {
  const result = await orgService.getOrganizationsList(req.query);
  res.status(200).json({
    success: true,
    data: result,
  });
});

export const getOrganizationById = asyncHandler(async (req, res) => {
  const result = await orgService.getOrganizationById(req.params.id);
  res.status(200).json({
    success: true,
    data: result,
  });
});

export const updateOrganization = asyncHandler(async (req, res) => {
  const logoPath = req.file ? `/uploads/logos/${req.file.filename}` : null;
  const organization = await orgService.updateOrganization(req.params.id, req.body, logoPath, req.user);

  res.status(200).json({
    success: true,
    message: 'Organization updated successfully',
    data: { organization },
  });
});

export const updateOrganizationStatus = asyncHandler(async (req, res) => {
  const organization = await orgService.updateOrganization(
    req.params.id,
    { status: req.body.status },
    null,
    req.user
  );

  res.status(200).json({
    success: true,
    message: `Organization status updated to ${req.body.status}`,
    data: { organization },
  });
});

export const deleteOrganization = asyncHandler(async (req, res) => {
  const result = await orgService.deleteOrganization(req.params.id, req.user);
  res.status(200).json({
    success: true,
    message: 'Organization and all associated data deleted successfully',
    data: result,
  });
});

