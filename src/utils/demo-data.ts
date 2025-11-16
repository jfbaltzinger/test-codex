import bcrypt from 'bcryptjs';
import { v4 as uuid } from 'uuid';
import { usersStore } from './stores';

type SeedUser = {
  email: string;
  password: string;
  role: 'admin' | 'member';
  firstName?: string;
  lastName?: string;
  credits?: number;
  phone?: string;
  membershipType?: string;
  status?: 'active' | 'inactive';
};

const seedUsers: SeedUser[] = [
  {
    email: process.env.DEFAULT_ADMIN_EMAIL ?? 'admin@studiofit.test',
    password: process.env.DEFAULT_ADMIN_PASSWORD ?? 'AdminSecret1!',
    role: 'admin',
    firstName: 'Amandine',
    lastName: 'Dupont',
    credits: 0
  },
  {
    email: process.env.DEFAULT_MEMBER_EMAIL ?? 'member@studiofit.test',
    password: process.env.DEFAULT_MEMBER_PASSWORD ?? 'MemberSecret1!',
    role: 'member',
    firstName: 'Marion',
    lastName: 'Durand',
    phone: '+33 6 12 34 56 78',
    membershipType: 'standard',
    status: 'active',
    credits: 12
  }
];

const ensureUser = async (seed: SeedUser) => {
  const existing = usersStore.findByEmail(seed.email);
  if (existing) {
    return;
  }

  const passwordHash = await bcrypt.hash(seed.password, 10);
  usersStore.create({
    id: uuid(),
    email: seed.email,
    passwordHash,
    role: seed.role,
    credits: seed.credits ?? 0,
    tokenVersion: 0,
    firstName: seed.firstName,
    lastName: seed.lastName,
    phone: seed.phone,
    membershipType: seed.membershipType,
    status: seed.status,
    joinedAt: new Date().toISOString(),
    passwordResetTokenHash: null,
    passwordResetExpiresAt: null
  });
};

export const seedDemoData = async () => {
  await Promise.all(seedUsers.map(ensureUser));
};
