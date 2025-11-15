import bcrypt from 'bcryptjs';
import { v4 as uuid } from 'uuid';
import { authSchemas, RegisterInput } from '../models/auth.model';
import { tokenService } from '../utils/token.service';
import { usersStore } from '../utils/stores';
import { HttpError } from '../utils/http-error';

export class AuthService {
  async register(payload: RegisterInput) {
    const data = authSchemas.register.parse(payload);
    const existing = usersStore.findByEmail(data.email);
    if (existing) {
      throw new HttpError(409, 'Email already in use');
    }

    const hashed = await bcrypt.hash(data.password, 10);
    const user = usersStore.create({
      id: uuid(),
      email: data.email,
      passwordHash: hashed,
      role: 'user',
      credits: 0
    });

    return { id: user.id, email: user.email, role: user.role };
  }

  async login(email: string, password: string) {
    const user = usersStore.findByEmail(email);
    if (!user) {
      throw new HttpError(401, 'Invalid credentials');
    }
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      throw new HttpError(401, 'Invalid credentials');
    }

    return tokenService.generateAuthTokens(user);
  }

  async refreshToken(refreshToken: string) {
    const { userId } = tokenService.verifyRefreshToken(refreshToken);
    const user = usersStore.findById(userId);
    if (!user) {
      throw new HttpError(401, 'Invalid token');
    }
    return tokenService.generateAuthTokens(user);
  }
}
