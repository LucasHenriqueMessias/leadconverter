'use client';

import { DashboardView } from './Dashboard';
import { 
  Home, 
  Users, 
  Target, 
  CheckSquare, 
  FileText, 
  BarChart3 
} from 'lucide-react';
import { Logo } from '@/components/ui/Logo';

interface SidebarProps {
  currentView: DashboardView;
  setCurrentView: (view: DashboardView) => void;
}

const menuItems = [
  { id: 'overview', label: 'Visão Geral', icon: Home },
  { id: 'clients', label: 'Clientes', icon: Users },
  { id: 'sales', label: 'Funil de Vendas', icon: Target },
  { id: 'tasks', label: 'Tarefas', icon: CheckSquare },
  { id: 'quotes', label: 'Orçamentos', icon: FileText },
  { id: 'reports', label: 'Relatórios', icon: BarChart3 },
];

export const Sidebar = ({ currentView, setCurrentView }: SidebarProps) => {
  return (
    <div className="bg-gray-900 text-white w-64 space-y-6 py-7 px-2 absolute inset-y-0 left-0 transform -translate-x-full md:relative md:translate-x-0 transition duration-200 ease-in-out">
      <div className="px-4">
        <Logo size="md" variant="dark" />
      </div>
      
      <nav className="space-y-2">
        {menuItems.map((item) => {
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
              <Icon className="h-5 w-5" />
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};
