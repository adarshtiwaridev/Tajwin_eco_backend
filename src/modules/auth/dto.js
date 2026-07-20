export class AuthDTO {
  /**
   * Transforms user model into a safe DTO object
   * @param {object} user - User mongoose object
   * @returns {object|null}
   */
  static user(user) {
    if (!user) return null;
    
    return {
      id: user._id ? user._id.toString() : null,
      name: user.name,
      email: user.email,
      role: user.roleId && typeof user.roleId === 'object' && user.roleId.name 
        ? user.roleId.name 
        : (user.roleId ? user.roleId.toString() : null),
      isDeleted: user.isDeleted,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  /**
   * Transforms session model into a DTO object
   * @param {object} session - Session mongoose object
   * @returns {object|null}
   */
  static session(session) {
    if (!session) return null;
    
    return {
      id: session._id ? session._id.toString() : null,
      userId: session.userId ? session.userId.toString() : null,
      expiresAt: session.expiresAt,
      isValid: session.isValid,
      ip: session.ip,
      userAgent: session.userAgent,
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
    };
  }
}
