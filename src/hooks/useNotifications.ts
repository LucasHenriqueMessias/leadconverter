'use client';

import { useState, useEffect } from 'react';
import { Task, Quote, Deal } from '@/types';

export interface Notification {
  id: string;
  type: 'overdue_task' | 'expired_quote' | 'stale_deal';
  title: string;
  message: string;
  entityId: string;
  entityType: 'task' | 'quote' | 'deal';
  createdAt: Date;
  severity: 'high' | 'medium' | 'low';
}

interface UseNotificationsProps {
  tasks: Task[];
  quotes: Quote[];
  deals: Deal[];
}

export const useNotifications = ({ tasks, quotes, deals }: UseNotificationsProps) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    const generateNotifications = () => {
      const newNotifications: Notification[] = [];
      const now = new Date();

      // Verificar tarefas atrasadas
      tasks.forEach(task => {
        if (!task.completed && task.dueDate) {
          const dueDate = new Date(task.dueDate);
          if (dueDate < now) {
            const daysDiff = Math.floor((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
            newNotifications.push({
              id: `task-${task.id}`,
              type: 'overdue_task',
              title: 'Tarefa Atrasada',
              message: `"${task.title}" está atrasada há ${daysDiff} dia${daysDiff > 1 ? 's' : ''}`,
              entityId: task.id,
              entityType: 'task',
              createdAt: now,
              severity: daysDiff > 7 ? 'high' : daysDiff > 3 ? 'medium' : 'low'
            });
          }
        }
      });

      // Verificar orçamentos vencidos
      quotes.forEach(quote => {
        if (quote.status === 'sent' && quote.validUntil) {
          const validUntil = new Date(quote.validUntil);
          if (validUntil < now) {
            const daysDiff = Math.floor((now.getTime() - validUntil.getTime()) / (1000 * 60 * 60 * 24));
            newNotifications.push({
              id: `quote-${quote.id}`,
              type: 'expired_quote',
              title: 'Orçamento Vencido',
              message: `Orçamento "${quote.title}" venceu há ${daysDiff} dia${daysDiff > 1 ? 's' : ''}`,
              entityId: quote.id,
              entityType: 'quote',
              createdAt: now,
              severity: daysDiff > 14 ? 'high' : daysDiff > 7 ? 'medium' : 'low'
            });
          }
        }
      });

      // Verificar negócios sem atualização há mais de 2 dias
      deals.forEach(deal => {
        if (deal.stage !== 'won' && deal.stage !== 'lost' && deal.updatedAt) {
          const updatedAt = new Date(deal.updatedAt);
          const daysDiff = Math.floor((now.getTime() - updatedAt.getTime()) / (1000 * 60 * 60 * 24));
          
          if (daysDiff >= 2) {
            newNotifications.push({
              id: `deal-${deal.id}`,
              type: 'stale_deal',
              title: 'Negócio Parado',
              message: `"${deal.title}" sem atualização há ${daysDiff} dia${daysDiff > 1 ? 's' : ''}`,
              entityId: deal.id,
              entityType: 'deal',
              createdAt: now,
              severity: daysDiff > 7 ? 'high' : daysDiff > 5 ? 'medium' : 'low'
            });
          }
        }
      });

      // Ordenar por severidade e data
      newNotifications.sort((a, b) => {
        const severityOrder = { high: 3, medium: 2, low: 1 };
        if (severityOrder[a.severity] !== severityOrder[b.severity]) {
          return severityOrder[b.severity] - severityOrder[a.severity];
        }
        return b.createdAt.getTime() - a.createdAt.getTime();
      });

      setNotifications(newNotifications);
    };

    generateNotifications();
    
    // Atualizar notificações a cada minuto
    const interval = setInterval(generateNotifications, 60000);
    
    return () => clearInterval(interval);
  }, [tasks, quotes, deals]);

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  const markAllAsRead = () => {
    setNotifications([]);
  };

  const getUnreadCount = () => notifications.length;

  const getNotificationsByType = (type: Notification['type']) => {
    return notifications.filter(n => n.type === type);
  };

  const getNotificationsBySeverity = (severity: Notification['severity']) => {
    return notifications.filter(n => n.severity === severity);
  };

  return {
    notifications,
    markAsRead,
    markAllAsRead,
    getUnreadCount,
    getNotificationsByType,
    getNotificationsBySeverity
  };
};
