'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { Overview } from './Overview';
import { ClientsView } from '../clients/ClientsView';
import { SalesFunnelView } from '../sales/SalesFunnelView';
import { TasksView } from '../tasks/TasksView';
import { QuotesView } from '../quotes/QuotesView';
import { ReportsView } from '../reports/ReportsView';
import { UsersView } from '../users/UsersView';
import { CustomFieldsManager } from '../customFields/CustomFieldsManager';
import { FunnelManager } from '../funnels/FunnelManager';
import { ForecastReport } from '../reports/ForecastReport';
import { TagsManager } from '../tags/TagsManager';
import { LeadScoringView } from '../scoring/LeadScoringView';
import { ApiKeysManager } from '../integrations';
import { useNotifications, Notification } from '@/hooks/useNotifications';
import { useRealtimeClients, useRealtimeDeals, useRealtimeTasks, useRealtimeQuotes } from '@/hooks/useRealtimeData';

export type DashboardView = 'overview' | 'clients' | 'sales' | 'tasks' | 'quotes' | 'reports' | 'users' | 'customFields' | 'funnels' | 'forecast' | 'tags' | 'scoring' | 'api-keys';

export const Dashboard = () => {
  const { user } = useAuth();
  const [currentView, setCurrentView] = useState<DashboardView>('overview');
  const [loading, setLoading] = useState(true);

  // Usar hooks de tempo real para todos os dados
  const { data: clients, setData: setClients } = useRealtimeClients();
  const { data: deals, setData: setDeals } = useRealtimeDeals();
  const { data: tasks, setData: setTasks } = useRealtimeTasks();
  const { data: quotes, setData: setQuotes } = useRealtimeQuotes();

  // Hook de notificações
  const notifications = useNotifications({ tasks, quotes, deals });

  // Controlar loading baseado nos hooks de tempo real
  useEffect(() => {
    // Considerar carregado quando pelo menos um dos hooks terminou de carregar
    // ou quando não há organizationId (usuário não logado)
    if (!user?.organizationId) {
      setLoading(false);
    } else {
      // Aguardar um pouco para os hooks carregarem
      const timer = setTimeout(() => setLoading(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [user?.organizationId]);

  const handleNotificationClick = (notification: Notification) => {
    // Navegar para a view correspondente ao tipo de notificação
    switch (notification.entityType) {
      case 'task':
        setCurrentView('tasks');
        break;
      case 'quote':
        setCurrentView('quotes');
        break;
      case 'deal':
        setCurrentView('sales');
        break;
    }
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'overview':
        return <Overview clients={clients} deals={deals} tasks={tasks} quotes={quotes} />;
      case 'clients':
        return <ClientsView clients={clients} setClients={setClients} />;
      case 'sales':
        return <SalesFunnelView deals={deals} setDeals={setDeals} clients={clients} />;
      case 'tasks':
        return <TasksView tasks={tasks} setTasks={setTasks} clients={clients} deals={deals} />;
      case 'quotes':
        return <QuotesView quotes={quotes} setQuotes={setQuotes} clients={clients} />;
      case 'reports':
        return <ReportsView clients={clients} deals={deals} tasks={tasks} quotes={quotes} />;
      case 'users':
        return <UsersView />;
      case 'api-keys':
        return <ApiKeysManager />;
      case 'customFields':
        return <CustomFieldsManager />;
      case 'funnels':
        return <FunnelManager />;
      case 'forecast':
        return <ForecastReport deals={deals} />;
      case 'tags':
        return <TagsManager />;
      case 'scoring':
        return <LeadScoringView clients={clients} deals={deals} />;
      default:
        return <Overview clients={clients} deals={deals} tasks={tasks} quotes={quotes} />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar currentView={currentView} setCurrentView={setCurrentView} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          notifications={notifications.notifications}
          unreadCount={notifications.getUnreadCount()}
          onMarkAsRead={notifications.markAsRead}
          onMarkAllAsRead={notifications.markAllAsRead}
          onNotificationClick={handleNotificationClick}
        />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50">
          <div className="container mx-auto px-6 py-8">
            {renderCurrentView()}
          </div>
        </main>
        <footer className="bg-white border-t border-gray-200 py-3 text-center text-sm text-gray-500">
          
        </footer>
      </div>
    </div>
  );
};
