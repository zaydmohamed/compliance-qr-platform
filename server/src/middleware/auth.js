import jwt from 'jsonwebtoken';
import { ENV } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';
import { AdminUser } from '../models/AdminUser.js';
import { OrganizationUser } from '../models/OrganizationUser.js';
import { ROLES } from '../constants/roles.js';

export const authenticate = async (req, res, next) => {
  try {
    let token = null;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer ')
    ) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      throw new ApiError(401, 'Authentication required. Please log in.');
    }

    const decoded = jwt.verify(token, ENV.JWT_SECRET);

    if (decoded.role === ROLES.PLATFORM_ADMIN) {
      const admin = await AdminUser.findById(decoded.id).select('-passwordHash');
      if (!admin || !admin.isActive) {
        throw new ApiError(401, 'Admin account not found or deactivated.');
      }
      req.user = {
        id: admin._id,
        _id: admin._id,
        fullName: admin.fullName,
        username: admin.username,
        role: ROLES.PLATFORM_ADMIN,
      };
    } else if (decoded.role === ROLES.ORGANIZATION_USER) {
      const orgUser = await OrganizationUser.findById(decoded.id)
        .select('-passwordHash')
        .populate('organizationId', 'name status displayTitle logo');

      if (!orgUser || orgUser.status !== 'ACTIVE') {
        throw new ApiError(401, 'Organization account not found or inactive.');
      }

      req.user = {
        id: orgUser._id,
        _id: orgUser._id,
        fullName: orgUser.fullName,
        username: orgUser.username,
        phone: orgUser.phone,
        role: ROLES.ORGANIZATION_USER,
        organizationId: orgUser.organizationId._id,
        organization: orgUser.organizationId,
        mustChangePassword: orgUser.mustChangePassword,
      };
    } else {
      throw new ApiError(401, 'Invalid user role.');
    }

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      next(new ApiError(401, 'Session expired or invalid token. Please log in again.'));
    } else {
      next(error);
    }
  }
};
