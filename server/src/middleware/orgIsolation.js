import { ROLES } from '../constants/roles.js';
import { ApiError } from '../utils/ApiError.js';

export const enforceOrgIsolation = (req, res, next) => {
  if (!req.user) {
    return next(new ApiError(401, 'Authentication required'));
  }

  // If Organization User, force req.organizationId to their verified organization ID
  if (req.user.role === ROLES.ORGANIZATION_USER) {
    if (!req.user.organizationId) {
      return next(new ApiError(403, 'No organization associated with this account'));
    }
    req.organizationId = req.user.organizationId;
  } else if (req.user.role === ROLES.PLATFORM_ADMIN) {
    // Admin can specify organizationId in params or query if needed
    req.organizationId = req.params.organizationId || req.query.organizationId || req.body.organizationId || null;
  }

  next();
};
