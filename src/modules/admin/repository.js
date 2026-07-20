import { BaseRepository } from '#core/repository.js';
import { User, Role } from '#modules/auth/model.js';

class Repository extends BaseRepository {
  constructor() {
    super(User);
  }

  async findByEmail(email) {
    return await this.findOne({ email });
  }

  // Override findMany to only return Admins (role = SUPER_ADMIN or other admin roles)
  // Or we can let the service pass the filter.
  // Actually, let's keep BaseRepository methods generic, and the service handles filtering.
}

export const AdminRepository = new Repository();
