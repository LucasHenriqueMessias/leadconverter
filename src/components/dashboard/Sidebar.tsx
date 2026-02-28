'use client';

import { DashboardView } from './Dashboard';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Home, 
  Users, 
  Target, 
  CheckSquare, 
  FileText, 
  BarChart3,
  UserCog,
  Settings,
  Sliders,
  Layers,
  TrendingUp,
  Tags,
  Brain
} from 'lucide-react';
import { Logo } from '@/components/ui/Logo';

interface SidebarProps {
  currentView: DashboardView;
  setCurrentView: (view: DashboardView) => void;
}

export const Sidebar = ({ currentView, setCurrentView }: SidebarProps) => {
  const { user, canManageUsers, canViewReports } = useAuth();

  const menuItems = [
    { id: 'overview', label: 'Visão Geral', icon: Home, show: true },
    { id: 'clients', label: 'Clientes', icon: Users, show: true },
    { id: 'sales', label: 'Funil de Vendas', icon: Target, show: true },
    { id: 'tasks', label: 'Tarefas', icon: CheckSquare, show: true },
    { id: 'quotes', label: 'Orçamentos', icon: FileText, show: true },
    { id: 'reports', label: 'Relatórios', icon: BarChart3, show: canViewReports },
    { id: 'forecast', label: 'Forecast', icon: TrendingUp, show: canViewReports },
    { id: 'scoring', label: 'Lead Scoring', icon: Brain, show: canViewReports },
    { id: 'users', label: 'Usuários', icon: UserCog, show: canManageUsers },
    { id: 'funnels', label: 'Funis de Vendas', icon: Layers, show: canManageUsers },
    { id: 'tags', label: 'Tags', icon: Tags, show: true },
    { id: 'customFields', label: 'Campos Personalizados', icon: Sliders, show: canManageUsers },
  ];

  const visibleMenuItems = menuItems.filter(item => item.show);

  return (
    <div className="bg-gray-900 text-white w-64 flex flex-col absolute inset-y-0 left-0 transform -translate-x-full md:relative md:translate-x-0 transition duration-200 ease-in-out">
      {/* Logo - Fixo no topo */}
      <div className="flex-shrink-0 px-4 py-7">
        <Logo size="md" variant="dark" />
      </div>
      
      {/* Informações do usuário - Fixo */}
      <div className="flex-shrink-0 px-4 py-3 border-t border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
            <span className="text-sm font-medium">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">
              {user?.name || 'Usuário'}
            </p>
            <p className="text-xs text-gray-400 truncate">
              {user?.role === 'admin' && 'Administrador'}
              {user?.role === 'manager' && 'Gerente'}
              {user?.role === 'sales' && 'Vendedor'}
              {user?.role === 'viewer' && 'Visualizador'}
            </p>
          </div>
        </div>
      </div>
      
      {/* Menu - Com scroll */}
      <nav className="flex-1 overflow-y-auto px-2 py-6 space-y-2 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-800">
        {visibleMenuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id as DashboardView)}
              className={`
                w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors
                ${isActive 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }
              `}
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Rodapé - Fixo no fundo */}
      <div className="flex-shrink-0 px-4 py-3 border-t border-gray-700">
        <div className="text-xs text-gray-400">
          <div className="flex items-center space-x-1 mb-1">
            <Settings className="h-3 w-3" />
            <span>Plano: {user?.role === 'admin' ? 'Administrador' : 'Usuário'}</span>
          </div>
          <div className="text-gray-500">
            Versão 1.0.0
          </div>
        </div>
      </div>
    </div>
  );
};
