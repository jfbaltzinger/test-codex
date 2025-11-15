import { sessionsStore } from '../utils/stores';
import { HttpError } from '../utils/http-error';

export class SessionsService {
  async listSessions() {
    return sessionsStore.list();
  }

  async getSessionById(id: string) {
    const session = sessionsStore.findById(id);
    if (!session) {
      throw new HttpError(404, 'Session not found');
    }
    return session;
  }
}
