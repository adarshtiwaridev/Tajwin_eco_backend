export class AdminDTO {
  static admin(data) {
    if (!data) return null;
    return {
      id: data._id,
      name: data.name,
      email: data.email,
      role: data.roleId ? {
        id: data.roleId._id,
        name: data.roleId.name
      } : null,
      isDeleted: data.isDeleted,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };
  }
}
