import api from './client';

export interface DashboardMetrics {
  totalBookings: number;
  revenue: number;
  creditsSold: number;
  occupancyRate: number;
  activeMembers: number;
  upcomingSessions: number;
}

export interface OccupancySnapshot {
  id: string;
  courseName: string;
  sessionDate: string;
  bookedSpots: number;
  capacity: number;
}

export interface AdminMember {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  status: 'active' | 'inactive';
  credits: number;
  membershipType: string;
  joinedAt: string;
}

export interface MemberPayload {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  status: 'active' | 'inactive';
  credits: number;
  membershipType: string;
}

export interface AdminCreditPack {
  id: string;
  name: string;
  credits: number;
  price: number;
  description?: string;
  isActive: boolean;
}

export interface CreditPackPayload {
  name: string;
  credits: number;
  price: number;
  description?: string;
  isActive: boolean;
}

export interface AdminCourse {
  id: string;
  name: string;
  coach: string;
  category: string;
  capacity: number;
}

export interface AdminSession {
  id: string;
  courseId: string;
  start: string;
  end: string;
  enrolled: number;
  capacity: number;
  status: 'scheduled' | 'cancelled' | 'completed';
}

export interface SessionPayload {
  courseId: string;
  start: string;
  end: string;
  capacity: number;
}

export const getDashboardMetrics = async (): Promise<DashboardMetrics> => {
  const { data } = await api.get<DashboardMetrics>('/admin/dashboard');
  return data;
};

export const getOccupancySnapshots = async (): Promise<OccupancySnapshot[]> => {
  const { data } = await api.get<OccupancySnapshot[]>('/admin/occupancy');
  return data;
};

export const getMembers = async (): Promise<AdminMember[]> => {
  const { data } = await api.get<AdminMember[]>('/admin/members');
  return data;
};

export const createMember = async (payload: MemberPayload): Promise<AdminMember> => {
  const { data } = await api.post<AdminMember>('/admin/members', payload);
  return data;
};

export const updateMember = async (id: string, payload: MemberPayload): Promise<AdminMember> => {
  const { data } = await api.put<AdminMember>(`/admin/members/${id}`, payload);
  return data;
};

export const deleteMember = async (id: string): Promise<void> => {
  await api.delete(`/admin/members/${id}`);
};

export const getCreditPacks = async (): Promise<AdminCreditPack[]> => {
  const { data } = await api.get<AdminCreditPack[]>('/admin/credit-packs');
  return data;
};

export const createCreditPack = async (payload: CreditPackPayload): Promise<AdminCreditPack> => {
  const { data } = await api.post<AdminCreditPack>('/admin/credit-packs', payload);
  return data;
};

export const updateCreditPack = async (
  id: string,
  payload: CreditPackPayload
): Promise<AdminCreditPack> => {
  const { data } = await api.put<AdminCreditPack>(`/admin/credit-packs/${id}`, payload);
  return data;
};

export const deleteCreditPack = async (id: string): Promise<void> => {
  await api.delete(`/admin/credit-packs/${id}`);
};

export const getCourses = async (): Promise<AdminCourse[]> => {
  const { data } = await api.get<AdminCourse[]>('/admin/courses');
  return data;
};

export const getSessions = async (): Promise<AdminSession[]> => {
  const { data } = await api.get<AdminSession[]>('/admin/sessions');
  return data;
};

export const createSession = async (payload: SessionPayload): Promise<AdminSession> => {
  const { data } = await api.post<AdminSession>('/admin/sessions', payload);
  return data;
};

export const cancelSession = async (sessionId: string): Promise<void> => {
  await api.post(`/admin/sessions/${sessionId}/cancel`);
};

export const exportBookings = async (format: 'csv' | 'xlsx'): Promise<Blob> => {
  const { data } = await api.get(`/admin/bookings/export`, {
    params: { format },
    responseType: 'blob',
  });
  return data;
};
