import { AuthRepository } from '#modules/auth/repository.js';
import { ApiError } from '#common/ApiError.js';
import { Delship } from '#modules/delship/model.js';
import { RetailerProfile } from '#modules/retailer/model.js';

export const authorizeRoles = (...allowedRoles) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return next(new ApiError('Authorization check failed. User context is missing.', 401));
      }

      const role = req.user.roleId;
      if (!role) {
        return next(new ApiError('Access denied. No role assigned to user.', 403));
      }

      const roleId = typeof role === 'object' ? role._id || role : role;
      
      const { Role } = await import('#modules/auth/model.js');
      const roleDoc = await Role.findById(roleId);
      
      if (!roleDoc) {
        return next(new ApiError('Role not found for user.', 403));
      }

      const normalizedRoleName = (roleDoc.name || '').toUpperCase().trim();
      
      // Attach the role name to the user object for convenience
      req.user.roleName = normalizedRoleName;

      // ADMIN can bypass everything
      if (normalizedRoleName === 'ADMIN') {
        return next();
      }

      // Check specific roles
      if (allowedRoles.length > 0) {
        const uppercaseAllowedRoles = allowedRoles.map(r => r.toUpperCase());
        if (!uppercaseAllowedRoles.includes(normalizedRoleName)) {
          return next(new ApiError(`Access denied. Requires one of the following roles: ${allowedRoles.join(', ')}.`, 403));
        }
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

// Legacy authorize support, mapped to authorizeRoles
export const authorize = (requiredRole) => {
  return authorizeRoles(requiredRole);
};

export const verifyApprovedDealer = async (req, res, next) => {
  try {
    if (req.user.roleName === 'ADMIN') return next();

    if (req.user.roleName !== 'DEALERSHIP') {
      return next(new ApiError('Access denied. Only dealerships can perform this action.', 403));
    }

    const dealer = await Delship.findOne({ createdBy: req.user._id, isDeleted: false });
    if (!dealer) {
      return next(new ApiError('Dealership profile not found.', 404));
    }

    if (dealer.status !== 'approved') {
      return next(new ApiError(`Dealership account is currently ${dealer.status}. Approval is required.`, 403));
    }

    req.dealerProfile = dealer;
    next();
  } catch (error) {
    next(error);
  }
};

export const verifyVerifiedRetailer = async (req, res, next) => {
  try {
    if (req.user.roleName === 'ADMIN' || req.user.roleName === 'DEALERSHIP') return next();

    if (req.user.roleName !== 'RETAILER') {
      return next(new ApiError('Access denied. Only retailers can perform this action.', 403));
    }

    const retailer = await RetailerProfile.findOne({ userId: req.user._id });
    if (!retailer) {
      return next(new ApiError('Retailer profile not found.', 404));
    }

    if (retailer.status !== 'ACTIVE') {
      return next(new ApiError(`Retailer account is currently ${retailer.status}. Verification is required.`, 403));
    }

    req.retailerProfile = retailer;
    next();
  } catch (error) {
    next(error);
  }
};
