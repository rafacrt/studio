// src/lib/auth-mocks.ts
// Este arquivo pode ser removido ou mantido para testes de unidade no futuro,
// mas não é mais usado pela lógica principal da aplicação.
import type { User } from '@/lib/types';

export const mockUser: User = {
  id: 'user123',
  name: 'Usuário Comum',
  email: 'usuario@exemplo.com',
  avatarUrl: 'https://picsum.photos/seed/user123/40/40',
  isAdmin: false,
};

export const mockAdminUser: User = {
  id: 'admin456',
  name: 'Admin WeStudy',
  email: 'admin@westudy.com',
  avatarUrl: 'https://picsum.photos/seed/admin456/40/40',
  isAdmin: true,
};
