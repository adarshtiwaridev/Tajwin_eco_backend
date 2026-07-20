import { BaseRepository } from '#core/repository.js';
import { Delship } from './model.js';

class DelshipRepositoryClass extends BaseRepository {
  constructor() {
    super(Delship);
  }

  async findByGstOrEmail(gstNumber, email) {
    return await this.model.findOne({
      $or: [{ gstNumber }, { email }],
      isDeleted: false
    });
  }
}

export const DelshipRepository = new DelshipRepositoryClass();
