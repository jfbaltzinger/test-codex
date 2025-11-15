import { adminPackSchemas, AdminPackInput } from '../models/admin.pack.model';
import { packsStore } from '../utils/stores';
import { HttpError } from '../utils/http-error';

export class AdminPacksService {
  async listPacks() {
    return packsStore.list();
  }

  async createPack(payload: AdminPackInput) {
    const data = adminPackSchemas.create.parse(payload);
    const pack = packsStore.create(data);
    return pack;
  }

  async updatePack(id: string, payload: Partial<AdminPackInput>) {
    const data = adminPackSchemas.update.parse({ ...payload, id });
    const pack = packsStore.findById(id);
    if (!pack) {
      throw new HttpError(404, 'Pack not found');
    }
    return packsStore.update(id, data);
  }

  async deletePack(id: string) {
    const deleted = packsStore.delete(id);
    if (!deleted) {
      throw new HttpError(404, 'Pack not found');
    }
  }
}
