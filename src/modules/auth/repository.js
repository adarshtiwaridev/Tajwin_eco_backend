import { User, Session, Role, RolePermission } from './model.js';

export class AuthRepository {
  /**
   * Finds an active user by email and populates their role
   * @param {string} email 
   * @returns {Promise<object|null>}
   */
  static async findUserByEmail(email) {
    return User.findOne({ email, isDeleted: false }).populate('roleId');
  }

  /**
   * Finds an active user by ID and populates their role
   * @param {string} id 
   * @returns {Promise<object|null>}
   */
  static async findUserById(id) {
    return User.findOne({ _id: id, isDeleted: false }).populate('roleId');
  }

  /**
   * Saves a new session in the database
   * @param {object} sessionData 
   * @returns {Promise<object>}
   */
  static async createSession(sessionData) {
    return Session.create(sessionData);
  }

  /**
   * Finds a valid session by refresh token
   * @param {string} refreshToken 
   * @returns {Promise<object|null>}
   */
  static async findSessionByToken(refreshToken) {
    return Session.findOne({ refreshToken, isValid: true });
  }

  /**
   * Revokes a specific session by invalidating the refresh token
   * @param {string} refreshToken 
   * @returns {Promise<object|null>}
   */
  static async revokeSession(refreshToken) {
    return Session.findOneAndUpdate(
      { refreshToken },
      { isValid: false },
      { new: true }
    );
  }

  /**
   * Revokes all active sessions for a specific user (e.g. force logout from all devices)
   * @param {string} userId 
   * @returns {Promise<object>}
   */
  static async revokeAllUserSessions(userId) {
    return Session.updateMany(
      { userId, isValid: true },
      { isValid: false }
    );
  }

  /**
   * Finds all granular permission keys assigned to a specific role ID
   * @param {string} roleId 
   * @returns {Promise<string[]>} List of permission keys
   */
  static async findRolePermissions(roleId) {
    // Populate permission details from RolePermission join collection
    const rolePermissions = await RolePermission.find({ roleId }).populate('permissionId');
    
    // Extract and filter valid permission keys
    return rolePermissions
      .filter(rp => rp.permissionId && rp.permissionId.key)
      .map(rp => rp.permissionId.key);
  }

  /**
   * Finds a role by name
   * @param {string} name 
   * @returns {Promise<object|null>}
   */
  static async findRoleByName(name) {
    return Role.findOne({ name });
  }

  /**
   * Finds a role by ID
   * @param {string} id 
   * @returns {Promise<object|null>}
   */
  static async findRoleById(id) {
    return Role.findById(id);
  }

  /**
   * Soft deletes a user by setting isDeleted to true
   * @param {string} userId 
   * @returns {Promise<object|null>}
   */
  static async softDeleteUser(userId) {
    return User.findByIdAndUpdate(
      userId,
      { isDeleted: true, deletedAt: new Date() },
      { new: true }
    );
  }

  /**
   * Creates a new user
   * @param {object} userData 
   * @returns {Promise<object>}
   */
  static async createUser(userData) {
    return User.create(userData);
  }

  /**
   * Updates a user by ID
   * @param {string} userId 
   * @param {object} updateData 
   * @returns {Promise<object|null>}
   */
  static async updateUserById(userId, updateData) {
    return User.findByIdAndUpdate(userId, updateData, { new: true }).populate('roleId');
  }
}
