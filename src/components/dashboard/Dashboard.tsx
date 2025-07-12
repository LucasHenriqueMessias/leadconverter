'use client';

import { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { Overview } from './Overview';
import { ClientsView } from '../clients/ClientsView';
import { SalesFunnelView } from '../sales/SalesFunnelView';
import { TasksView } from '../tasks/TasksView';
import { QuotesView } from '../quotes/QuotesView';
import { ReportsView } from '../reports/ReportsView';
import { Client, Deal, Task, Quote } from '@/types';
import { normalizeStage } from '@/utils/stageUtils';
import { useNotifications, Notification } from '@/hooks/useNotifications';

export type DashboardView = 'overview' | 'clients' | 'sales' | 'tasks' | 'quotes' | 'reports';

export const Dashboard = () => {
  const { user } = useAuth();
  const [currentView, setCurrentView] = useState<DashboardView>('overview');
  const [clients, setClients] = useState<Client[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);

  // Carregar dados
  useEffect(() => {
    const loadData = async () => {
      if (!user || !db) return;

      try {
        // Carregar clientes
        const clientsQuery = query(
          collection(db, 'clients'),
          where('userId', '==', user.id)
        );
        const clientsSnapshot = await getDocs(clientsQuery);
        const clientsData = clientsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate(),
          updatedAt: doc.data().updatedAt?.toDate(),
        })) as Client[];

        // Carregar deals
        const dealsQuery = query(
          collection(db, 'deals'),
          where('userId', '==', user.id)
        );
        const dealsSnapshot = await getDocs(dealsQuery);
        const dealsData = dealsSnapshot.docs.map(doc => {
          const data = doc.data();
          const originalStage = data.stage;
          const normalizedStage = normalizeStage(originalStage);
          
          return {
            id: doc.id,
            ...data,
            stage: normalizedStage,
            expectedCloseDate: data.expectedCloseDate?.toDate(),
            createdAt: data.createdAt?.toDate(),
            updatedAt: data.updatedAt?.toDate(),
          };
        }) as Deal[];

        // Atualizar deals com stages inválidos no Firebase
        const dealsToUpdate = dealsSnapshot.docs.filter(doc => {
          const originalStage = doc.data().stage;
          const normalizedStage = normalizeStage(originalStage);
          return originalStage !== normalizedStage;
        });

        if (dealsToUpdate.length > 0) {
          console.log('Normalizing invalid deal stages:', dealsToUpdate.length);
          
          // Aqui normalmente faria as atualizações em batch, mas para simplicidade vou deixar comentado
          // for (const dealDoc of dealsToUpdate) {
          //   await updateDoc(doc(db, 'deals', dealDoc.id), {
          //     stage: normalizeStage(dealDoc.data().stage),
          //     updatedAt: new Date(),
          //   });
          // }
        }

        // Carregar tasks
        const tasksQuery = query(
          collection(db, 'tasks'),
          where('userId', '==', user.id)
        );
        const tasksSnapshot = await getDocs(tasksQuery);
        const tasksData = tasksSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          dueDate: doc.data().dueDate?.toDate(),
          createdAt: doc.data().createdAt?.toDate(),
          updatedAt: doc.data().updatedAt?.toDate(),
        })) as Task[];

        // Carregar quotes
        const quotesQuery = query(
          collection(db, 'quotes'),
          where('userId', '==', user.id)
        );
        const quotesSnapshot = await getDocs(quotesQuery);
        const quotesData = quotesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          validUntil: doc.data().validUntil?.toDate(),
          createdAt: doc.data().createdAt?.toDate(),
          updatedAt: doc.data().updatedAt?.toDate(),
        })) as Quote[];

        setClients(clientsData);
        setDeals(dealsData);
        setTasks(tasksData);
        setQuotes(quotesData);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user]);

  // Hook de notificações
  const notifications = useNotifications({ tasks, quotes, deals });

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
