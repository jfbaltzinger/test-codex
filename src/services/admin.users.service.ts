import { adminUserSchemas, AdminUserCreateInput, AdminUserUpdateInput } from '../models/admin.user.model';
import { usersStore } from '../utils/stores';
import { HttpError } from '../utils/http-error';
import bcrypt from 'bcryptjs';

export class AdminUsersService {
  async listUsers() {
    return usersStore.list().map(({ passwordHash, passwordResetExpiresAt, passwordResetTokenHash, tokenVersion, ...rest }) => rest);
  }

  async createUser(payload: AdminUserCreateInput) {
    const data = adminUserSchemas.create.parse(payload);
    const existing = usersStore.findByEmail(data.email);
    if (existing) {
      throw new HttpError(409, 'Email already in use');
    }
    const passwordHash = await bcrypt.hash(data.password, 10);
    const user = usersStore.create({
      id: data.id,
      email: data.email,
      passwordHash,
      role: data.role,
      credits: data.credits ?? 0,
      tokenVersion: 0,
      passwordResetTokenHash: null,
      passwordResetExpiresAt: null
    });
    const { passwordHash: _, passwordResetExpiresAt, passwordResetTokenHash, tokenVersion, ...safeUser } = user;
    return safeUser;
  }

  async updateUser(id: string, payload: Omit<AdminUserUpdateInput, 'id'>) {
    const data = adminUserSchemas.update.parse({ ...payload, id });
    const user = usersStore.findById(id);
    if (!user) {
      throw new HttpError(404, 'User not found');
    }
    const passwordHash = data.password ? await bcrypt.hash(data.password, 10) : undefined;
    const updated = usersStore.update(id, {
      email: data.email ?? user.email,
      role: data.role ?? user.role,
      credits: data.credits ?? user.credits,
      passwordHash: passwordHash ?? user.passwordHash
    });
    const { passwordHash: _, passwordResetExpiresAt, passwordResetTokenHash, tokenVersion, ...safeUser } = updated;
    return safeUser;
  }

  async deleteUser(id: string) {
    const deleted = usersStore.delete(id);
    if (!deleted) {
      throw new HttpError(404, 'User not found');
    }
  }
}
