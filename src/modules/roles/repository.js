import { BaseRepository } from '#core/repository.js';
import { Role } from '#modules/auth/model.js';

class Repository extends BaseRepository {
  constructor() {
    super(Role);
  }

  async findByName(name) {
    return await this.findOne({ name: name.toUpperCase() });
  }
}

export const RoleRepository = new Repository();
