export class DelshipDTO {
  static toResponse(delship) {
    if (!delship) return null;
    return {
      id: delship._id,
      businessName: delship.businessName,
      ownerName: delship.ownerName,
      email: delship.email,
      phone: delship.phone,
      gstNumber: delship.gstNumber,
      panNumber: delship.panNumber,
      address: delship.address,
      documents: delship.documents,
      status: delship.status,
      remarks: delship.remarks,
      approvedBy: delship.approvedBy ? {
        id: delship.approvedBy._id,
        name: delship.approvedBy.name,
      } : null,
      createdAt: delship.createdAt,
      updatedAt: delship.updatedAt,
    };
  }

  static toResponseList(delships) {
    return delships.map((d) => this.toResponse(d));
  }
}
