export class RetailerDTO {
  static profile(profile) {
    if (!profile) return null;
    return {
      id: profile._id,
      userId: profile.userId?._id || profile.userId,
      email: profile.userId?.email,
      name: profile.userId?.name,
      dealershipId: profile.dealershipId,
      storeName: profile.storeName,
      status: profile.status,
      phone: profile.phone,
      createdAt: profile.createdAt,
    };
  }

  static profileList(profiles) {
    return profiles.map((p) => this.profile(p));
  }
}
