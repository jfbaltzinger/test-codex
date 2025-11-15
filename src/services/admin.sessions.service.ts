import { adminSessionSchemas, AdminSessionInput } from '../models/admin.session.model';
import { sessionsStore } from '../utils/stores';
import { HttpError } from '../utils/http-error';

export class AdminSessionsService {
  async listSessions() {
    return sessionsStore.list();
  }

  async createSession(payload: AdminSessionInput) {
    const data = adminSessionSchemas.create.parse(payload);
    return sessionsStore.create(data);
  }

  async updateSession(id: string, payload: Partial<AdminSessionInput>) {
    const data = adminSessionSchemas.update.parse({ ...payload, id });
    const session = sessionsStore.findById(id);
    if (!session) {
      throw new HttpError(404, 'Session not found');
    }
    return sessionsStore.update(id, data);
  }

  async deleteSession(id: string) {
    const deleted = sessionsStore.delete(id);
    if (!deleted) {
      throw new HttpError(404, 'Session not found');
    }
  }
}
