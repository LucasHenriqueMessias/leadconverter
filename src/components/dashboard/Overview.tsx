'use client';

import { Client, Deal, Task, Quote } from '@/types';
import { 
  Users, 
  Target, 
  CheckSquare, 
  FileText, 
  DollarSign, 
  TrendingUp,
  AlertCircle 
} from 'lucide-react';

interface OverviewProps {
  clients: Client[];
  deals: Deal[];
  tasks: Task[];
  quotes: Quote[];
}

export const Overview = ({ clients, deals, tasks, quotes }: OverviewProps) => {
  // Função para calcular variação percentual entre períodos
  const calculatePercentageChange = (current: number, previous: number): { percentage: number, isPositive: boolean } => {
    if (previous === 0) {
      return { percentage: current > 0 ? 100 : 0, isPositive: current >= 0 };
    }
    const change = ((current - previous) / previous) * 100;
    return { percentage: Math.abs(change), isPositive: change >= 0 };
  };

  // Datas para comparação (últimos 30 dias vs 30 dias anteriores)
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

  // Dados do período atual (últimos 30 dias)
  const currentPeriodClients = clients.filter(client => 
    new Date(client.createdAt) >= thirtyDaysAgo
  ).length;

  const currentPeriodDeals = deals.filter(deal => 
    new Date(deal.createdAt) >= thirtyDaysAgo && 
    deal.stage !== 'closed-won' && deal.stage !== 'closed-lost'
  ).length;

  const currentPeriodTasks = tasks.filter(task => 
    new Date(task.createdAt) >= thirtyDaysAgo && 
    !task.completed && new Date(task.dueDate) <= now
  ).length;

  const currentPeriodQuotes = quotes.filter(quote => 
    new Date(quote.createdAt) >= thirtyDaysAgo && 
    quote.status === 'sent'
  ).length;

  const currentPeriodRevenue = deals
    .filter(deal => 
      deal.stage === 'closed-won' && 
      new Date(deal.createdAt) >= thirtyDaysAgo
    )
    .reduce((sum, deal) => sum + deal.value, 0) + 
    quotes
      .filter(quote => 
        quote.status === 'accepted' && 
        new Date(quote.createdAt) >= thirtyDaysAgo
      )
      .reduce((sum, quote) => sum + quote.total, 0);

  // Dados do período anterior (30-60 dias atrás)
  const previousPeriodClients = clients.filter(client => {
    const clientDate = new Date(client.createdAt);
    return clientDate >= sixtyDaysAgo && clientDate < thirtyDaysAgo;
  }).length;

  const previousPeriodDeals = deals.filter(deal => {
    const dealDate = new Date(deal.createdAt);
    return dealDate >= sixtyDaysAgo && dealDate < thirtyDaysAgo && 
           deal.stage !== 'closed-won' && deal.stage !== 'closed-lost';
  }).length;

  const previousPeriodTasks = tasks.filter(task => {
    const taskDate = new Date(task.createdAt);
    return taskDate >= sixtyDaysAgo && taskDate < thirtyDaysAgo && 
           !task.completed && new Date(task.dueDate) <= now;
  }).length;

  const previousPeriodQuotes = quotes.filter(quote => {
    const quoteDate = new Date(quote.createdAt);
    return quoteDate >= sixtyDaysAgo && quoteDate < thirtyDaysAgo && 
           quote.status === 'sent';
  }).length;

  const previousPeriodRevenue = deals
    .filter(deal => {
      const dealDate = new Date(deal.createdAt);
      return deal.stage === 'closed-won' && 
             dealDate >= sixtyDaysAgo && dealDate < thirtyDaysAgo;
    })
    .reduce((sum, deal) => sum + deal.value, 0) + 
    quotes
      .filter(quote => {
        const quoteDate = new Date(quote.createdAt);
        return quote.status === 'accepted' && 
               quoteDate >= sixtyDaysAgo && quoteDate < thirtyDaysAgo;
      })
      .reduce((sum, quote) => sum + quote.total, 0);

  // Calcular variações
  const clientsChange = calculatePercentageChange(currentPeriodClients, previousPeriodClients);
  const dealsChange = calculatePercentageChange(currentPeriodDeals, previousPeriodDeals);
  const tasksChange = calculatePercentageChange(currentPeriodTasks, previousPeriodTasks);
  const quotesChange = calculatePercentageChange(currentPeriodQuotes, previousPeriodQuotes);
  const revenueChange = calculatePercentageChange(currentPeriodRevenue, previousPeriodRevenue);

  // Dados atuais totais
  const totalRevenue = deals
    .filter(deal => deal.stage === 'closed-won')
    .reduce((sum, deal) => sum + deal.value, 0);

  const pendingTasks = tasks.filter(task => 
    !task.completed && new Date(task.dueDate) <= new Date()
  ).length;

  const activeDeals = deals.filter(deal => 
    deal.stage !== 'closed-won' && deal.stage !== 'closed-lost'
  ).length;

  const acceptedQuotes = quotes.filter(quote => quote.status === 'accepted');
  const quotesRevenue = acceptedQuotes.reduce((sum, quote) => sum + quote.total, 0);
  const pendingQuotes = quotes.filter(quote => quote.status === 'sent').length;

  const stats = [
    {
      title: 'Total de Clientes',
      value: clients.length,
      icon: Users,
      color: 'bg-blue-500',
      change: clientsChange,
      currentPeriod: currentPeriodClients,
    },
    {
      title: 'Negócios Ativos',
      value: activeDeals,
      icon: Target,
      color: 'bg-green-500',
      change: dealsChange,
      currentPeriod: currentPeriodDeals,
    },
    {
      title: 'Tarefas Pendentes',
      value: pendingTasks,
      icon: AlertCircle,
      color: 'bg-yellow-500',
      change: tasksChange,
      currentPeriod: currentPeriodTasks,
    },
    {
      title: 'Orçamentos Pendentes',
      value: pendingQuotes,
      icon: FileText,
      color: 'bg-orange-500',
      change: quotesChange,
      currentPeriod: currentPeriodQuotes,
    },
    {
      title: 'Faturamento',
      value: `R$ ${(totalRevenue + quotesRevenue).toLocaleString('pt-BR')}`,
      icon: DollarSign,
      color: 'bg-purple-500',
      change: revenueChange,
      currentPeriod: currentPeriodRevenue,
    },
  ];

  const recentTasks = tasks
    .filter(task => !task.completed)
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 5);

  const recentDeals = deals
    .filter(deal => deal.stage !== 'closed-won' && deal.stage !== 'closed-lost')
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const recentQuotes = quotes
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Visão Geral</h2>
        
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => {
            const Icon = stat.icon;
            const isPositive = stat.change.isPositive;
            const percentage = stat.change.percentage;
            
            // Determinar ícone baseado no tipo de métrica e se é positivo/negativo
            const getTrendIcon = () => {
              if (stat.title === 'Tarefas Pendentes') {
                // Para tarefas pendentes, menos é melhor
                return isPositive ? 
                  <TrendingUp className="h-4 w-4 text-red-500 mr-1" /> : 
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1 rotate-180" />;
              } else {
                // Para outras métricas, mais é melhor
                return isPositive ? 
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" /> : 
                  <TrendingUp className="h-4 w-4 text-red-500 mr-1 rotate-180" />;
              }
            };
            
            const getTrendColor = () => {
              if (stat.title === 'Tarefas Pendentes') {
                return isPositive ? 'text-red-500' : 'text-green-500';
              } else {
                return isPositive ? 'text-green-500' : 'text-red-500';
              }
            };
            
            const formatChange = () => {
              if (percentage === 0) return '0%';
              const sign = isPositive ? '+' : '-';
              return `${sign}${percentage.toFixed(1)}%`;
            };
            
            return (
              <div key={stat.title} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                  <div className={`${stat.color} p-3 rounded-full`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  {getTrendIcon()}
                  <span className={`font-medium ${getTrendColor()}`}>
                    {formatChange()}
                  </span>
                  <span className="text-gray-500 ml-1">últimos 30 dias</span>
                </div>
                {stat.currentPeriod !== undefined && (
                  <div className="mt-1 text-xs text-gray-400">
                    {stat.title === 'Faturamento' 
                      ? `R$ ${stat.currentPeriod.toLocaleString('pt-BR')} no período`
                      : `${stat.currentPeriod} no período`
                    }
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tarefas Recentes */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <CheckSquare className="h-5 w-5 mr-2 text-blue-600" />
              Próximas Tarefas
            </h3>
          </div>
          <div className="p-6">
            {recentTasks.length === 0 ? (
              <p className="text-gray-500 text-center py-4">Nenhuma tarefa pendente</p>
            ) : (
              <div className="space-y-4">
                {recentTasks.map((task) => (
                  <div key={task.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{task.title}</p>
                      <p className="text-sm text-gray-500">{task.description}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {new Date(task.dueDate).toLocaleDateString('pt-BR')}
                      </p>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        task.priority === 'high' 
                          ? 'bg-red-100 text-red-800'
                          : task.priority === 'medium'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {task.priority === 'high' ? 'Alta' : task.priority === 'medium' ? 'Média' : 'Baixa'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Negócios Recentes */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Target className="h-5 w-5 mr-2 text-green-600" />
              Negócios Ativos
            </h3>
          </div>
          <div className="p-6">
            {recentDeals.length === 0 ? (
              <p className="text-gray-500 text-center py-4">Nenhum negócio ativo</p>
            ) : (
              <div className="space-y-4">
                {recentDeals.map((deal) => {
                  const client = clients.find(c => c.id === deal.clientId);
                  return (
                    <div key={deal.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{deal.title}</p>
                        <p className="text-sm text-gray-500">{client?.name}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">
                          R$ {deal.value.toLocaleString('pt-BR')}
                        </p>
                        <p className="text-xs text-gray-500">
                          {deal.probability}% de chance
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Orçamentos Recentes */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <FileText className="h-5 w-5 mr-2 text-orange-600" />
              Orçamentos Recentes
            </h3>
          </div>
          <div className="p-6">
            {recentQuotes.length === 0 ? (
              <p className="text-gray-500 text-center py-4">Nenhum orçamento criado</p>
            ) : (
              <div className="space-y-4">
                {recentQuotes.map((quote) => {
                  const client = clients.find(c => c.id === quote.clientId);
                  const getStatusColor = (status: string) => {
                    switch (status) {
                      case 'draft': return 'bg-gray-100 text-gray-800';
                      case 'sent': return 'bg-blue-100 text-blue-800';
                      case 'accepted': return 'bg-green-100 text-green-800';
                      case 'rejected': return 'bg-red-100 text-red-800';
                      default: return 'bg-gray-100 text-gray-800';
                    }
                  };
                  const getStatusLabel = (status: string) => {
                    switch (status) {
                      case 'draft': return 'Rascunho';
                      case 'sent': return 'Enviado';
                      case 'accepted': return 'Aceito';
                      case 'rejected': return 'Rejeitado';
                      default: return status;
                    }
                  };
                  return (
                    <div key={quote.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{quote.title}</p>
                        <p className="text-sm text-gray-500">{client?.name}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">
                          R$ {quote.total.toLocaleString('pt-BR')}
                        </p>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(quote.status)}`}>
                          {getStatusLabel(quote.status)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
