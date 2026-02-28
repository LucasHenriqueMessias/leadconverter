// lib/permissions.ts
import { UserRole, Permission } from '@/types';

// Definição de permissões por role
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  admin: [
    { resource: 'organization', actions: ['create', 'read', 'update', 'delete'], scope: 'organization' },
    { resource: 'users', actions: ['create', 'read', 'update', 'delete'], scope: 'organization' },
    { resource: 'settings', actions: ['create', 'read', 'update', 'delete'], scope: 'organization' },
    { resource: 'deals', actions: ['create', 'read', 'update', 'delete'], scope: 'organization' },
    { resource: 'clients', actions: ['create', 'read', 'update', 'delete'], scope: 'organization' },
    { resource: 'reports', actions: ['read'], scope: 'organization' },
  ],
  manager: [
    { resource: 'users', actions: ['read'], scope: 'team' },
    { resource: 'deals', actions: ['create', 'read', 'update', 'delete'], scope: 'team' },
    { resource: 'clients', actions: ['create', 'read', 'update', 'delete'], scope: 'team' },
    { resource: 'reports', actions: ['read'], scope: 'team' },
    { resource: 'settings', actions: ['read'], scope: 'organization' },
  ],
  sales: [
    { resource: 'deals', actions: ['create', 'read', 'update'], scope: 'own' },
    { resource: 'clients', actions: ['create', 'read', 'update'], scope: 'own' },
    { resource: 'reports', actions: ['read'], scope: 'own' },
  ],
  viewer: [
    { resource: 'deals', actions: ['read'], scope: 'own' },
    { resource: 'clients', actions: ['read'], scope: 'own' },
    { resource: 'reports', actions: ['read'], scope: 'own' },
  ],
};

// Função para verificar se o usuário tem permissão
export const hasPermission = (
  userRole: UserRole,
  resource: Permission['resource'],
  action: Permission['actions'][0],
  scope: Permission['scope'] = 'own'
): boolean => {
  const rolePermissions = ROLE_PERMISSIONS[userRole];
  
  return rolePermissions.some(permission => 
    permission.resource === resource &&
    permission.actions.includes(action) &&
    (permission.scope === scope || 
     (permission.scope === 'organization' && ['team', 'own'].includes(scope)) ||
     (permission.scope === 'team' && scope === 'own'))
  );
};

// Função para obter todas as permissões de um role
export const getRolePermissions = (role: UserRole): Permission[] => {
  return ROLE_PERMISSIONS[role];
};

// Função para verificar se pode acessar dados de outro usuário
export const canAccessUserData = (
  currentUserRole: UserRole,
  currentUserId: string,
  targetUserId: string,
  currentUserTeamId?: string,
  targetUserTeamId?: string
): boolean => {
  // Admin pode acessar tudo na organização
  if (currentUserRole === 'admin') return true;
  
  // Manager pode acessar dados da própria equipe
  if (currentUserRole === 'manager' && currentUserTeamId === targetUserTeamId) return true;
  
  // Usuário só pode acessar próprios dados
  return currentUserId === targetUserId;
};

// Função para filtrar dados baseado nas permissões
export const getDataScope = (
  userRole: UserRole,
  userId: string,
  teamId?: string
): { scope: 'own' | 'team' | 'organization'; filters: Record<string, any> } => {
  switch (userRole) {
    case 'admin':
      return { scope: 'organization', filters: {} };
    
    case 'manager':
      return { 
        scope: 'team', 
        filters: teamId ? { teamId } : { userId } 
      };
    
    case 'sales':
    case 'viewer':
    default:
      return { scope: 'own', filters: { userId } };
  }
};

// Labels para exibição
export const ROLE_LABELS: Record<UserRole, string> = {
  admin: 'Administrador',
  manager: 'Gerente',
  sales: 'Vendedor',
  viewer: 'Visualizador',
};

export const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  admin: 'Acesso total ao sistema, pode gerenciar usuários e configurações',
  manager: 'Pode gerenciar equipe e visualizar relatórios da equipe',
  sales: 'Pode gerenciar próprios clientes e negócios',
  viewer: 'Apenas visualização dos próprios dados',
};