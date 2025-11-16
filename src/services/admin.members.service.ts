import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { v4 as uuid } from 'uuid';
import { adminMemberSchemas, AdminMemberCreateInput, AdminMemberUpdateInput } from '../models/admin.member.model';
import { usersStore } from '../utils/stores';
import { HttpError } from '../utils/http-error';

type AdminMember = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  status: 'active' | 'inactive';
  credits: number;
  membershipType: string;
  joinedAt: string;
};

const toAdminMember = (user: (typeof usersStore)['data'][number]): AdminMember => ({
  id: user.id,
  firstName: user.firstName ?? '',
  lastName: user.lastName ?? '',
  email: user.email,
  phone: user.phone ?? '',
  status: user.status ?? 'active',
  credits: user.credits,
  membershipType: user.membershipType ?? 'standard',
  joinedAt: user.joinedAt ?? new Date().toISOString()
});

export class AdminMembersService {
  async listMembers(): Promise<AdminMember[]> {
    return usersStore
      .list()
      .filter(user => user.role === 'member')
      .map(toAdminMember);
  }

  async createMember(payload: AdminMemberCreateInput): Promise<AdminMember> {
    const data = adminMemberSchemas.create.parse(payload);
    const existing = usersStore.findByEmail(data.email);
    if (existing) {
      throw new HttpError(409, 'Email already in use');
    }

    const passwordHash = await bcrypt.hash(crypto.randomUUID(), 10);
    const created = usersStore.create({
      id: uuid(),
      email: data.email,
      passwordHash,
      role: 'member',
      credits: data.credits,
      tokenVersion: 0,
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone,
      membershipType: data.membershipType,
      status: data.status,
      joinedAt: new Date().toISOString(),
      passwordResetTokenHash: null,
      passwordResetExpiresAt: null
    });

    return toAdminMember(created);
  }

  async updateMember(id: string, payload: Omit<AdminMemberUpdateInput, 'id'>): Promise<AdminMember> {
    const data = adminMemberSchemas.update.parse({ ...payload, id });
    const user = usersStore.findById(id);
    if (!user || user.role !== 'member') {
      throw new HttpError(404, 'Member not found');
    }

    const updated = usersStore.update(id, {
      firstName: data.firstName ?? user.firstName,
      lastName: data.lastName ?? user.lastName,
      email: data.email ?? user.email,
      phone: data.phone ?? user.phone,
      status: data.status ?? user.status,
      credits: data.credits ?? user.credits,
      membershipType: data.membershipType ?? user.membershipType
    });

    return toAdminMember(updated);
  }

  async deleteMember(id: string): Promise<void> {
    const user = usersStore.findById(id);
    if (!user || user.role !== 'member') {
      throw new HttpError(404, 'Member not found');
    }
    usersStore.delete(id);
  }
}
