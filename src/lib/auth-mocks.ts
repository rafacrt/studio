// src/lib/auth-mocks.ts
import type { User } from '@/types';

export const mockUser: User = {
  id: 'user123',
  name: 'Usuário Comum',
  email: 'usuario@exemplo.com',
  avatarUrl: 'https://picsum.photos/seed/user123/40/40',
  isAdmin: false,
  role: "Usuário",
  status: "Ativo",
  dateJoined: "2023-01-15",
};

export const mockAdminUser: User = {
  id: 'admin456',
  name: 'Admin WeStudy',
  email: 'admin@westudy.com',
  avatarUrl: 'https://picsum.photos/seed/admin456/40/40',
  isAdmin: true,
  role: "Admin",
  status: "Ativo",
  dateJoined: "2022-10-01",
};
