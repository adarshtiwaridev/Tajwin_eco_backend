import { AuthRepository } from './repository.js';
import { comparePassword, generateAccessToken, generateRefreshToken, verifyRefreshToken } from './helper.js';
import { ApiError as AppError } from '#common/ApiError.js';

export class AuthService {
  /**
   * Authenticate a user, generate JWTs, and create a session
   * @param {string} email 
   * @param {string} password 
   * @param {string} ip 
   * @param {string} userAgent 
   * @returns {Promise<object>} { user, accessToken, refreshToken }
   */
  static async loginUser(email, password, ip = '', userAgent = '') {
    const user = await AuthRepository.findUserByEmail(email);
    if (!user) {
      throw new AppError('Invalid email or password', 401);
    }

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      throw new AppError('Invalid email or password', 401);
    }

    const roleName = user.roleId && user.roleId.name ? user.roleId.name : null;

    const accessToken = generateAccessToken({
      userId: user._id.toString(),
      email: user.email,
      role: roleName,
    });

    const refreshToken = generateRefreshToken({
      userId: user._id.toString(),
    });

    // Refresh token expiry is 7 days
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // Save session in DB
    await AuthRepository.createSession({
      userId: user._id,
      refreshToken,
      expiresAt,
      ip,
      userAgent,
    });

    return { user, accessToken, refreshToken };
  }

  /**
   * Logout user by invalidating their session
   * @param {string} refreshToken 
   * @returns {Promise<boolean>}
   */
  static async logoutUser(refreshToken) {
    if (!refreshToken) {
      throw new AppError('Refresh token is required', 400);
    }
    
    const session = await AuthRepository.findSessionByToken(refreshToken);
    if (session) {
      await AuthRepository.revokeSession(refreshToken);
    }
    
    return true;
  }

  /**
   * Refresh an access token using a valid refresh token
   * @param {string} refreshToken 
   * @returns {Promise<object>} { accessToken }
   */
  static async refreshAccessToken(refreshToken) {
    if (!refreshToken) {
      throw new AppError('Refresh token is required', 400);
    }

    let decoded;
    try {
      decoded = verifyRefreshToken(refreshToken);
    } catch (err) {
      throw new AppError('Invalid or expired refresh token', 401);
    }

    const session = await AuthRepository.findSessionByToken(refreshToken);
    if (!session) {
      throw new AppError('Session not found or already logged out', 401);
    }

    // Check if session is expired
    if (new Date() > session.expiresAt) {
      await AuthRepository.revokeSession(refreshToken);
      throw new AppError('Session has expired, please login again', 401);
    }

    const user = await AuthRepository.findUserById(session.userId);
    if (!user) {
      throw new AppError('User not found', 401);
    }

    const roleName = user.roleId && user.roleId.name ? user.roleId.name : null;

    const accessToken = generateAccessToken({
      userId: user._id.toString(),
      email: user.email,
      role: roleName,
    });

    return { accessToken };
  }

  /**
   * Register a new End User
   * @param {object} data
   * @returns {Promise<object>} { user, accessToken, refreshToken }
   */
  static async registerEndUser(data) {
    const existingUser = await AuthRepository.findUserByEmail(data.email);
    if (existingUser) {
      throw new AppError('Email is already registered', 400);
    }

    const endUserRole = await AuthRepository.findRoleByName('END_USER');
    if (!endUserRole) {
      throw new AppError('END_USER role not found in the system', 500);
    }

    const hashedPassword = await hashPassword(data.password);

    const newUser = await AuthRepository.createUser({
      name: data.name,
      email: data.email,
      mobile: data.mobile,
      password: hashedPassword,
      roleId: endUserRole._id,
      isActive: true,
    });

    // Create EndUserProfile
    const { EndUserProfile } = await import('#modules/enduser/model.js');
    await EndUserProfile.create({
      userId: newUser._id,
      address: {
        street: data.address,
        city: data.city,
        state: data.state,
        zipCode: data.pincode,
      },
      status: 'ACTIVE',
    });

    // Generate tokens automatically so they are logged in
    const accessToken = generateAccessToken({
      userId: newUser._id.toString(),
      email: newUser.email,
      role: 'END_USER',
    });

    const refreshToken = generateRefreshToken({
      userId: newUser._id.toString(),
    });

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await AuthRepository.createSession({
      userId: newUser._id,
      refreshToken,
      expiresAt,
    });

    return { user: newUser, accessToken, refreshToken };
  }

  /**
   * Get Current User Profile
   * @param {string} userId
   * @returns {Promise<object>}
   */
  static async getUserProfile(userId) {
    const user = await AuthRepository.findUserById(userId);
    if (!user) throw new AppError('User not found', 404);

    const profileData = { user };

    // Fetch related profile if applicable
    const roleName = (user.roleId?.name || '').toUpperCase();
    if (roleName === 'END_USER') {
      const { EndUserProfile } = await import('#modules/enduser/model.js');
      profileData.profile = await EndUserProfile.findOne({ userId });
    } else if (roleName === 'RETAILER') {
      const { RetailerProfile } = await import('#modules/retailer/model.js');
      profileData.profile = await RetailerProfile.findOne({ userId });
    } else if (roleName === 'DEALERSHIP') {
      const { Delship } = await import('#modules/delship/model.js');
      profileData.profile = await Delship.findOne({ createdBy: userId });
    }

    return profileData;
  }

  /**
   * Update Current User Profile (Basic User fields)
   * @param {string} userId
   * @param {object} data
   * @returns {Promise<object>}
   */
  static async updateProfile(userId, data) {
    const user = await AuthRepository.findUserById(userId);
    if (!user) throw new AppError('User not found', 404);

    const updateData = {};
    if (data.name) updateData.name = data.name;
    if (data.mobile) updateData.mobile = data.mobile;
    if (data.avatar) updateData.avatar = data.avatar;

    const updatedUser = await AuthRepository.updateUserById(userId, updateData);
    return updatedUser;
  }

  /**
   * Change Password
   * @param {string} userId
   * @param {string} currentPassword
   * @param {string} newPassword
   * @returns {Promise<boolean>}
   */
  static async changePassword(userId, currentPassword, newPassword) {
    const user = await AuthRepository.findUserById(userId);
    if (!user) throw new AppError('User not found', 404);

    const isMatch = await comparePassword(currentPassword, user.password);
    if (!isMatch) throw new AppError('Incorrect current password', 400);

    const hashedPassword = await hashPassword(newPassword);
    await AuthRepository.updateUserById(userId, { password: hashedPassword });
    
    // Revoke all sessions so the user has to login with the new password on other devices
    await AuthRepository.revokeAllUserSessions(userId);

    return true;
  }

  /**
   * Request password reset link (Stubbed)
   * @param {string} email 
   * @returns {Promise<object>}
   */
  static async forgotPassword(email) {
    const user = await AuthRepository.findUserByEmail(email);
    if (!user) {
      throw new AppError('User with this email address does not exist', 404);
    }
    
    // For stubbing, we will just return a fake token. 
    // In a real app, generate a unique token, save it to DB, and send it via email.
    return {
      message: 'Password reset link sent successfully (Stubbed)',
      resetToken: 'stub-reset-token-' + user._id.toString(), 
      email,
    };
  }

  /**
   * Reset user password (Stubbed)
   * @param {string} token 
   * @param {string} newPassword 
   * @returns {Promise<object>}
   */
  static async resetPassword(token, newPassword) {
    if (!token) {
      throw new AppError('Reset token is required', 400);
    }
    
    // Stub implementation: extract userId from token
    if (token.startsWith('stub-reset-token-')) {
      const userId = token.split('stub-reset-token-')[1];
      const hashedPassword = await hashPassword(newPassword);
      await AuthRepository.updateUserById(userId, { password: hashedPassword });
      await AuthRepository.revokeAllUserSessions(userId);
    } else {
      throw new AppError('Invalid or expired reset token', 400);
    }

    return {
      message: 'Password reset successful',
    };
  }
}
