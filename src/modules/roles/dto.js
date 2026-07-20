export class RoleDTO {
  static role(data) {
    if (!data) return null;
    return {
      id: data._id,
      name: data.name,
      description: data.description,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };
  }

  static rolesList(dataList) {
    return dataList.map((role) => this.role(role));
  }
}
