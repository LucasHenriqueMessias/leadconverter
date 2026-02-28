'use client';

import { useState, useMemo, useCallback } from 'react';
import { Client, Deal, Task, Quote } from '@/types';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Target, 
  DollarSign, 
  FileText,
  CheckCircle2,
  Clock,
  Calendar,
  Percent,
  PieChart,
  Filter,
  AlertCircle
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell
} from 'recharts';
import { LossAnalysis } from './LossAnalysis';

interface ReportsViewProps {
  clients: Client[];
  deals: Deal[];
  tasks: Task[];
  quotes: Quote[];
}

export const ReportsView = ({ clients, deals, tasks, quotes }: ReportsViewProps) => {
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d' | '1y'>('30d');

  // Função para filtrar dados por período
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const filterByPeriod = useCallback((data: any[], dateField: string = 'createdAt') => {
    const now = new Date();
    const periodDays = {
      '7d': 7,
      '30d': 30,
      '90d': 90,
      '1y': 365
    };
    
    const startDate = new Date(now.getTime() - periodDays[selectedPeriod] * 24 * 60 * 60 * 1000);
    
    return data.filter(item => {
      const itemDate = new Date(item[dateField]);
      return itemDate >= startDate;
    });
  }, [selectedPeriod]);

  // Métricas principais
  const metrics = useMemo(() => {
    const filteredDeals = filterByPeriod(deals);
    const filteredClients = filterByPeriod(clients);
    const filteredQuotes = filterByPeriod(quotes);
    const filteredTasks = filterByPeriod(tasks);

    const closedWonDeals = filteredDeals.filter(deal => deal.stage === 'closed-won');
    const acceptedQuotes = filteredQuotes.filter(quote => quote.status === 'accepted');
    
    const totalRevenue = closedWonDeals.reduce((sum, deal) => sum + deal.value, 0) + 
                        acceptedQuotes.reduce((sum, quote) => sum + quote.total, 0);
    
    const completedTasks = filteredTasks.filter(task => task.completed).length;
    const totalFilteredTasks = filteredTasks.length;
    const taskCompletionRate = totalFilteredTasks > 0 ? (completedTasks / totalFilteredTasks) * 100 : 0;
    
    const sentQuotes = filteredQuotes.filter(quote => quote.status === 'sent' || quote.status === 'accepted');
    const quoteConversionRate = sentQuotes.length > 0 ? (acceptedQuotes.length / sentQuotes.length) * 100 : 0;

    // Comparação com período anterior
    const previousPeriodStart = new Date(Date.now() - 2 * (selectedPeriod === '7d' ? 7 : selectedPeriod === '30d' ? 30 : selectedPeriod === '90d' ? 90 : 365) * 24 * 60 * 60 * 1000);
    const previousPeriodEnd = new Date(Date.now() - (selectedPeriod === '7d' ? 7 : selectedPeriod === '30d' ? 30 : selectedPeriod === '90d' ? 90 : 365) * 24 * 60 * 60 * 1000);
    
    const previousDeals = deals.filter(deal => {
      const dealDate = new Date(deal.createdAt);
      return dealDate >= previousPeriodStart && dealDate < previousPeriodEnd && deal.stage === 'closed-won';
    });
    
    const previousRevenue = previousDeals.reduce((sum, deal) => sum + deal.value, 0);
    const revenueChange = previousRevenue > 0 ? ((totalRevenue - previousRevenue) / previousRevenue) * 100 : 0;

    return {
      totalRevenue,
      revenueChange,
      newClients: filteredClients.length,
      activeDeals: filteredDeals.filter(deal => deal.stage !== 'closed-won' && deal.stage !== 'closed-lost').length,
      closedDeals: closedWonDeals.length,
      taskCompletionRate,
      quoteConversionRate,
      totalQuotes: filteredQuotes.length,
      acceptedQuotes: acceptedQuotes.length
    };
  }, [deals, clients, quotes, tasks, selectedPeriod, filterByPeriod]);

  // Dados para gráfico de faturamento por mês
  const revenueByMonth = useMemo(() => {
    const monthlyData: { [key: string]: { revenue: number, deals: number, quotes: number } } = {};
    
    // Processar negócios fechados
    deals.filter(deal => deal.stage === 'closed-won').forEach(deal => {
      const date = new Date(deal.createdAt);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!monthlyData[key]) {
        monthlyData[key] = { revenue: 0, deals: 0, quotes: 0 };
      }
      monthlyData[key].revenue += deal.value;
      monthlyData[key].deals += 1;
    });

    // Processar orçamentos aceitos
    quotes.filter(quote => quote.status === 'accepted').forEach(quote => {
      const date = new Date(quote.createdAt);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!monthlyData[key]) {
        monthlyData[key] = { revenue: 0, deals: 0, quotes: 0 };
      }
      monthlyData[key].revenue += quote.total;
      monthlyData[key].quotes += 1;
    });

    return Object.entries(monthlyData)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-12) // Últimos 12 meses
      .map(([month, data]) => ({
        month: new Date(month + '-01').toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }),
        revenue: data.revenue,
        deals: data.deals,
        quotes: data.quotes
      }));
  }, [deals, quotes]);

  // Dados para gráfico de funil de vendas
  const salesFunnelData = useMemo(() => {
    const stageOrder = ['lead', 'qualified', 'proposal', 'negotiation', 'closed-won'];
    const stageNames = {
      'lead': 'Leads',
      'qualified': 'Qualificados',
      'proposal': 'Proposta',
      'negotiation': 'Negociação',
      'closed-won': 'Fechados'
    };

    // Contar deals por estágio (apenas estágios ativos do funil)
    const stageCounts: { [key: string]: number } = {};
    const stageValues: { [key: string]: number } = {};
    
    deals.forEach(deal => {
      if (stageOrder.includes(deal.stage)) {
        stageCounts[deal.stage] = (stageCounts[deal.stage] || 0) + 1;
        stageValues[deal.stage] = (stageValues[deal.stage] || 0) + deal.value;
      }
    });

    // Criar dados do funil com taxa de conversão
    const funnelData = stageOrder.map((stage, index) => {
      const count = stageCounts[stage] || 0;
      const value = stageValues[stage] || 0;
      
      // Calcular taxa de conversão (deals que chegaram neste estágio vs estágio anterior)
      let conversionRate = 100;
      if (index > 0) {
        const previousStageCount = stageCounts[stageOrder[index - 1]] || 0;
        conversionRate = previousStageCount > 0 ? (count / previousStageCount) * 100 : 0;
      }

      return {
        stage: stageNames[stage as keyof typeof stageNames],
        stageId: stage,
        count,
        value,
        conversionRate: Math.round(conversionRate * 10) / 10,
        order: index
      };
    }).filter(item => item.count > 0);

    return funnelData;
  }, [deals]);

  // Dados para análise de deals perdidos
  const lostDealsAnalysis = useMemo(() => {
    const lostDeals = deals.filter(deal => deal.stage === 'closed-lost');
    
    // Para análise mais detalhada, vamos assumir que o deal perdido estava no último estágio antes de perder
    // Em uma implementação real, você manteria histórico dos estágios
    const stageNames = {
      'lead': 'Lead',
      'qualified': 'Qualificado', 
      'proposal': 'Proposta',
      'negotiation': 'Negociação'
    };
    
    // Distribuição simulada baseada em padrões típicos de CRM
    const lostDistribution = {
      'lead': Math.round(lostDeals.length * 0.1), // 10% perdidos em lead
      'qualified': Math.round(lostDeals.length * 0.15), // 15% perdidos em qualificado
      'proposal': Math.round(lostDeals.length * 0.35), // 35% perdidos em proposta  
      'negotiation': Math.round(lostDeals.length * 0.4) // 40% perdidos em negociação
    };
    
    return Object.entries(stageNames).map(([stage, name]) => ({
      stage: name,
      count: lostDistribution[stage as keyof typeof lostDistribution] || 0,
      percentage: lostDeals.length > 0 ? 
        ((lostDistribution[stage as keyof typeof lostDistribution] || 0) / lostDeals.length) * 100 : 0
    })).filter(item => item.count > 0);
  }, [deals]);
  const quotesStatusData = useMemo(() => {
    const statusCounts = {
      draft: quotes.filter(q => q.status === 'draft').length,
      sent: quotes.filter(q => q.status === 'sent').length,
      accepted: quotes.filter(q => q.status === 'accepted').length,
      rejected: quotes.filter(q => q.status === 'rejected').length,
    };

    return [
      { name: 'Rascunhos', value: statusCounts.draft, color: '#6B7280' },
      { name: 'Enviados', value: statusCounts.sent, color: '#3B82F6' },
      { name: 'Aceitos', value: statusCounts.accepted, color: '#10B981' },
      { name: 'Rejeitados', value: statusCounts.rejected, color: '#EF4444' },
    ].filter(item => item.value > 0);
  }, [quotes]);

  // Dados para gráfico de segmentos de clientes
  const clientSegmentsData = useMemo(() => {
    const segments: { [key: string]: number } = {};
    
    clients.forEach(client => {
      const segment = client.segment || 'Não informado';
      segments[segment] = (segments[segment] || 0) + 1;
    });

    return Object.entries(segments).map(([segment, count]) => ({
      segment,
      count,
      percentage: ((count / clients.length) * 100).toFixed(1)
    })).sort((a, b) => b.count - a.count);
  }, [clients]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Relatórios e Análises</h2>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value as '7d' | '30d' | '90d' | '1y')}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
            >
              <option value="7d">Últimos 7 dias</option>
              <option value="30d">Últimos 30 dias</option>
              <option value="90d">Últimos 90 dias</option>
              <option value="1y">Último ano</option>
            </select>
          </div>
        </div>
      </div>

      {/* Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Faturamento</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(metrics.totalRevenue)}</p>
              <div className="flex items-center mt-2">
                {metrics.revenueChange >= 0 ? (
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                )}
                <span className={`text-sm font-medium ${metrics.revenueChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {formatPercentage(metrics.revenueChange)}
                </span>
              </div>
            </div>
            <div className="bg-green-500 p-3 rounded-full">
              <DollarSign className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Novos Clientes</p>
              <p className="text-2xl font-bold text-gray-900">{metrics.newClients}</p>
              <p className="text-sm text-gray-500 mt-2">No período selecionado</p>
            </div>
            <div className="bg-blue-500 p-3 rounded-full">
              <Users className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Taxa de Conversão</p>
              <p className="text-2xl font-bold text-gray-900">{metrics.quoteConversionRate.toFixed(1)}%</p>
              <p className="text-sm text-gray-500 mt-2">Orçamentos aceitos</p>
            </div>
            <div className="bg-purple-500 p-3 rounded-full">
              <Percent className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Produtividade</p>
              <p className="text-2xl font-bold text-gray-900">{metrics.taskCompletionRate.toFixed(1)}%</p>
              <p className="text-sm text-gray-500 mt-2">Tarefas concluídas</p>
            </div>
            <div className="bg-yellow-500 p-3 rounded-full">
              <CheckCircle2 className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Gráficos Principais */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Faturamento por Mês */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Faturamento por Mês</h3>
            <BarChart3 className="h-5 w-5 text-gray-400" />
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueByMonth}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="month" 
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip 
                  formatter={(value: number) => [formatCurrency(value), 'Faturamento']}
                  labelStyle={{ color: '#374151' }}
                />
                <Bar 
                  dataKey="revenue" 
                  fill="#3B82F6"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Funil de Vendas */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Funil de Vendas</h3>
            <Target className="h-5 w-5 text-gray-400" />
          </div>
          {salesFunnelData.length > 0 ? (
            <div className="space-y-4">
              {salesFunnelData.map((stage, index) => {
                const maxCount = Math.max(...salesFunnelData.map(s => s.count));
                const widthPercentage = (stage.count / maxCount) * 100;
                const conversionColor = stage.conversionRate >= 50 ? 'text-green-600' : 
                                       stage.conversionRate >= 25 ? 'text-yellow-600' : 'text-red-600';
                
                return (
                  <div key={stage.stageId} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-900">{stage.stage}</span>
                        {index > 0 && (
                          <span className={`text-xs font-medium px-2 py-1 rounded-full bg-gray-100 ${conversionColor}`}>
                            {stage.conversionRate}% conversão
                          </span>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold text-gray-900">{stage.count} negócios</div>
                        <div className="text-xs text-gray-500">{formatCurrency(stage.value)}</div>
                      </div>
                    </div>
                    <div className="relative">
                      <div className="w-full bg-gray-200 rounded-full h-8 overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-blue-500 to-green-500 rounded-full transition-all duration-300 flex items-center justify-end pr-2"
                          style={{ width: `${Math.max(widthPercentage, 10)}%` }}
                        >
                          <span className="text-white text-xs font-medium">
                            {stage.count}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              
              {/* Estatísticas do Funil */}
              <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <div className="text-lg font-bold text-blue-600">
                      {salesFunnelData.length > 0 ? salesFunnelData[0].count : 0}
                    </div>
                    <div className="text-xs text-blue-700">Leads no Topo</div>
                  </div>
                  <div className="bg-green-50 p-3 rounded-lg">
                    <div className="text-lg font-bold text-green-600">
                      {(() => {
                        const totalLeads = salesFunnelData.length > 0 ? salesFunnelData[0].count : 0;
                        const closedDeals = salesFunnelData.find(s => s.stageId === 'closed-won')?.count || 0;
                        return totalLeads > 0 ? Math.round((closedDeals / totalLeads) * 100) : 0;
                      })()}%
                    </div>
                    <div className="text-xs text-green-700">Taxa de Fechamento</div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Target className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600">Nenhum negócio encontrado no funil</p>
            </div>
          )}
        </div>
      </div>

      {/* Análises Detalhadas */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Análise de Deals Perdidos */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Deals Perdidos</h3>
            <TrendingDown className="h-5 w-5 text-gray-400" />
          </div>
          {lostDealsAnalysis.length > 0 ? (
            <div className="space-y-4">
              {lostDealsAnalysis.map((item) => (
                <div key={item.stage} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900">{item.stage}</span>
                    <span className="text-sm text-gray-500">{item.count} ({item.percentage.toFixed(1)}%)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="h-2 rounded-full bg-red-500"
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
              <div className="mt-4 p-3 bg-red-50 rounded-lg">
                <div className="text-center">
                  <div className="text-lg font-bold text-red-600">
                    {deals.filter(d => d.stage === 'closed-lost').length}
                  </div>
                  <div className="text-xs text-red-700">Total de Deals Perdidos</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <CheckCircle2 className="h-8 w-8 text-green-400 mx-auto mb-2" />
              <p className="text-gray-600">Nenhum deal perdido!</p>
            </div>
          )}
        </div>

        {/* Status dos Orçamentos */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Status dos Orçamentos</h3>
            <PieChart className="h-5 w-5 text-gray-400" />
          </div>
          {quotesStatusData.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={quotesStatusData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                  >
                    {quotesStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="text-center py-8">
              <FileText className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600">Nenhum orçamento encontrado</p>
            </div>
          )}
          
          {quotesStatusData.length > 0 && (
            <div className="mt-4 space-y-2">
              {quotesStatusData.map((item) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm text-gray-600">{item.name}</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">{item.value}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Segmentos de Clientes */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Segmentos de Clientes</h3>
            <Users className="h-5 w-5 text-gray-400" />
          </div>
          {clientSegmentsData.length > 0 ? (
            <div className="space-y-4">
              {clientSegmentsData.slice(0, 5).map((segment, index) => (
                <div key={segment.segment} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900">{segment.segment}</span>
                    <span className="text-sm text-gray-500">{segment.count} ({segment.percentage}%)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="h-2 rounded-full"
                      style={{ 
                        width: `${segment.percentage}%`,
                        backgroundColor: COLORS[index % COLORS.length]
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Users className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600">Nenhum cliente encontrado</p>
            </div>
          )}
        </div>

        {/* Resumo do Período */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Resumo do Período</h3>
            <Calendar className="h-5 w-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <Target className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-gray-900">Negócios Ativos</span>
              </div>
              <span className="text-sm font-bold text-blue-600">{metrics.activeDeals}</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-gray-900">Negócios Fechados</span>
              </div>
              <span className="text-sm font-bold text-green-600">{metrics.closedDeals}</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <FileText className="h-4 w-4 text-purple-600" />
                <span className="text-sm font-medium text-gray-900">Orçamentos</span>
              </div>
              <span className="text-sm font-bold text-purple-600">{metrics.totalQuotes}</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-yellow-600" />
                <span className="text-sm font-medium text-gray-900">Orçamentos Aceitos</span>
              </div>
              <span className="text-sm font-bold text-yellow-600">{metrics.acceptedQuotes}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Análise de Perdas */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-red-600" />
          Análise de Perdas
        </h3>
        <LossAnalysis deals={deals} />
      </div>

      {/* Insights e Recomendações */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">💡 Insights e Recomendações</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Taxa de Conversão de Orçamentos */}
          {metrics.quoteConversionRate < 30 && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start space-x-2">
                <div className="bg-yellow-500 p-1 rounded-full">
                  <FileText className="h-3 w-3 text-white" />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-yellow-800">Taxa de Conversão Baixa</h4>
                  <p className="text-xs text-yellow-700 mt-1">
                    Sua taxa de conversão de orçamentos está em {metrics.quoteConversionRate.toFixed(1)}%. 
                    Considere revisar a qualidade dos orçamentos ou fazer follow-ups mais ativos.
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {/* Produtividade das Tarefas */}
          {metrics.taskCompletionRate < 70 && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start space-x-2">
                <div className="bg-red-500 p-1 rounded-full">
                  <Clock className="h-3 w-3 text-white" />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-red-800">Produtividade Baixa</h4>
                  <p className="text-xs text-red-700 mt-1">
                    Apenas {metrics.taskCompletionRate.toFixed(1)}% das tarefas foram concluídas. 
                    Organize melhor sua agenda e priorize as tarefas mais importantes.
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {/* Crescimento Excelente */}
          {metrics.revenueChange > 20 && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-start space-x-2">
                <div className="bg-green-500 p-1 rounded-full">
                  <TrendingUp className="h-3 w-3 text-white" />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-green-800">Crescimento Excelente!</h4>
                  <p className="text-xs text-green-700 mt-1">
                    Seu faturamento cresceu {metrics.revenueChange.toFixed(1)}% no período. 
                    Continue com as estratégias atuais e considere expandir sua operação.
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {/* Segmentação de Clientes */}
          {clientSegmentsData.length > 0 && clientSegmentsData[0].count / clients.length > 0.6 && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start space-x-2">
                <div className="bg-blue-500 p-1 rounded-full">
                  <Users className="h-3 w-3 text-white" />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-blue-800">Concentração de Clientes</h4>
                  <p className="text-xs text-blue-700 mt-1">
                    {((clientSegmentsData[0].count / clients.length) * 100).toFixed(0)}% dos seus clientes são do segmento &quot;{clientSegmentsData[0].segment}&quot;. 
                    Considere diversificar para reduzir riscos.
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {/* Funil de Vendas */}
          {(() => {
            const totalActiveDeals = deals.filter(d => d.stage !== 'closed-won' && d.stage !== 'closed-lost').length;
            const leadDeals = deals.filter(d => d.stage === 'lead').length;
            const proposalDeals = deals.filter(d => d.stage === 'proposal').length;
            const negotiationDeals = deals.filter(d => d.stage === 'negotiation').length;
            
            const leadPercentage = totalActiveDeals > 0 ? (leadDeals / totalActiveDeals) * 100 : 0;
            const proposalPercentage = totalActiveDeals > 0 ? (proposalDeals / totalActiveDeals) * 100 : 0;
            const stuckInProposal = proposalPercentage > 40 && proposalDeals > 3;
            const tooManyLeads = leadPercentage > 70 && totalActiveDeals > 5;
            const goodDistribution = leadPercentage < 50 && proposalPercentage > 20 && negotiationDeals > 0;
            
            if (goodDistribution) {
              return (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-start space-x-2">
                    <div className="bg-green-500 p-1 rounded-full">
                      <Target className="h-3 w-3 text-white" />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-green-800">Funil Balanceado!</h4>
                      <p className="text-xs text-green-700 mt-1">
                        Seu funil está bem distribuído com {negotiationDeals} negócios em negociação. 
                        Continue mantendo o ritmo de qualificação e follow-up.
                      </p>
                    </div>
                  </div>
                </div>
              );
            } else if (stuckInProposal) {
              return (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-start space-x-2">
                    <div className="bg-yellow-500 p-1 rounded-full">
                      <Clock className="h-3 w-3 text-white" />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-yellow-800">Gargalo em Propostas</h4>
                      <p className="text-xs text-yellow-700 mt-1">
                        {proposalPercentage.toFixed(0)}% dos negócios estão em proposta. 
                        Faça follow-ups mais frequentes e considere ajustar suas propostas.
                      </p>
                    </div>
                  </div>
                </div>
              );
            } else if (tooManyLeads) {
              return (
                <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                  <div className="flex items-start space-x-2">
                    <div className="bg-orange-500 p-1 rounded-full">
                      <Target className="h-3 w-3 text-white" />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-orange-800">Funil Desbalanceado</h4>
                      <p className="text-xs text-orange-700 mt-1">
                        {leadPercentage.toFixed(0)}% dos negócios estão na fase de lead. 
                        Foque em qualificar melhor os prospects e acelerar a movimentação pelo funil.
                      </p>
                    </div>
                  </div>
                </div>
              );
            }
            return null;
          })()}
          
          {/* Taxa de Conversão do Funil */}
          {(() => {
            const totalLeads = deals.filter(d => d.stage === 'lead').length;
            const closedWonDeals = deals.filter(d => d.stage === 'closed-won').length;
            const totalInputDeals = totalLeads + closedWonDeals;
            const conversionRate = totalInputDeals > 0 ? (closedWonDeals / totalInputDeals) * 100 : 0;
            
            if (conversionRate >= 20 && totalInputDeals >= 10) {
              return (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                  <div className="flex items-start space-x-2">
                    <div className="bg-emerald-500 p-1 rounded-full">
                      <TrendingUp className="h-3 w-3 text-white" />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-emerald-800">Excelente Taxa de Conversão!</h4>
                      <p className="text-xs text-emerald-700 mt-1">
                        Sua taxa de conversão de leads para fechamentos é de {conversionRate.toFixed(1)}%! 
                        Isso está acima da média do mercado. Mantenha o processo atual.
                      </p>
                    </div>
                  </div>
                </div>
              );
            } else if (conversionRate < 10 && totalInputDeals >= 10) {
              return (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-start space-x-2">
                    <div className="bg-red-500 p-1 rounded-full">
                      <TrendingDown className="h-3 w-3 text-white" />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-red-800">Taxa de Conversão Baixa</h4>
                      <p className="text-xs text-red-700 mt-1">
                        Apenas {conversionRate.toFixed(1)}% dos leads são convertidos em vendas. 
                        Revise seu processo de qualificação e melhore o follow-up.
                      </p>
                    </div>
                  </div>
                </div>
              );
            }
            return null;
          })()}
          {(() => {
            const closedDeals = deals.filter(d => d.stage === 'closed-won');
            const avgTicket = closedDeals.length > 0 ? closedDeals.reduce((sum, d) => sum + d.value, 0) / closedDeals.length : 0;
            return avgTicket > 0 && avgTicket < 5000;
          })() && (
            <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
              <div className="flex items-start space-x-2">
                <div className="bg-purple-500 p-1 rounded-full">
                  <DollarSign className="h-3 w-3 text-white" />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-purple-800">Oportunidade de Upsell</h4>
                  <p className="text-xs text-purple-700 mt-1">
                    Seu ticket médio é baixo. Considere criar pacotes de serviços mais robustos 
                    ou oferecer serviços complementares aos clientes existentes.
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {/* Base de Clientes Pequena */}
          {clients.length < 10 && (
            <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
              <div className="flex items-start space-x-2">
                <div className="bg-indigo-500 p-1 rounded-full">
                  <Users className="h-3 w-3 text-white" />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-indigo-800">Base de Clientes Limitada</h4>
                  <p className="text-xs text-indigo-700 mt-1">
                    Você tem apenas {clients.length} clientes cadastrados. Invista em marketing digital 
                    e networking para expandir sua base de clientes.
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {/* Sazonalidade */}
          {(() => {
            const lastThreeMonths = revenueByMonth.slice(-3);
            const hasDecreasingTrend = lastThreeMonths.length >= 3 && 
              lastThreeMonths[2].revenue < lastThreeMonths[1].revenue && 
              lastThreeMonths[1].revenue < lastThreeMonths[0].revenue;
            return hasDecreasingTrend;
          })() && (
            <div className="p-4 bg-pink-50 border border-pink-200 rounded-lg">
              <div className="flex items-start space-x-2">
                <div className="bg-pink-500 p-1 rounded-full">
                  <TrendingDown className="h-3 w-3 text-white" />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-pink-800">Queda no Faturamento</h4>
                  <p className="text-xs text-pink-700 mt-1">
                    Há uma tendência de queda nos últimos 3 meses. Analise a sazonalidade do seu negócio 
                    e considere estratégias para períodos mais fracos.
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {/* Orçamentos Pendentes */}
          {quotes.filter(q => q.status === 'sent').length > 5 && (
            <div className="p-4 bg-teal-50 border border-teal-200 rounded-lg">
              <div className="flex items-start space-x-2">
                <div className="bg-teal-500 p-1 rounded-full">
                  <Clock className="h-3 w-3 text-white" />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-teal-800">Muitos Orçamentos Pendentes</h4>
                  <p className="text-xs text-teal-700 mt-1">
                    Você tem {quotes.filter(q => q.status === 'sent').length} orçamentos aguardando resposta. 
                    Faça follow-ups proativos para acelerar as decisões dos clientes.
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {/* Alta Conversão */}
          {metrics.quoteConversionRate >= 50 && quotes.filter(q => q.status !== 'draft').length >= 5 && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
              <div className="flex items-start space-x-2">
                <div className="bg-emerald-500 p-1 rounded-full">
                  <CheckCircle2 className="h-3 w-3 text-white" />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-emerald-800">Excelente Conversão!</h4>
                  <p className="text-xs text-emerald-700 mt-1">
                    Sua taxa de conversão de {metrics.quoteConversionRate.toFixed(1)}% está excelente! 
                    Use este processo como modelo e considere aumentar seus preços.
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {/* Diversificação de Receita */}
          {(() => {
            const dealsRevenue = deals.filter(d => d.stage === 'closed-won').reduce((sum, d) => sum + d.value, 0);
            const quotesRevenue = quotes.filter(q => q.status === 'accepted').reduce((sum, q) => sum + q.total, 0);
            const totalRevenue = dealsRevenue + quotesRevenue;
            const quotesPercentage = totalRevenue > 0 ? (quotesRevenue / totalRevenue) * 100 : 0;
            return quotesPercentage > 70 && totalRevenue > 10000;
          })() && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-start space-x-2">
                <div className="bg-amber-500 p-1 rounded-full">
                  <PieChart className="h-3 w-3 text-white" />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-amber-800">Concentração em Orçamentos</h4>
                  <p className="text-xs text-amber-700 mt-1">
                    Sua receita depende muito dos orçamentos. Considere criar fontes de receita recorrente 
                    como contratos mensais ou assinaturas.
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {/* Sem Insights */}
          {!((metrics.quoteConversionRate < 30) || 
             (metrics.taskCompletionRate < 70) || 
             (metrics.revenueChange > 20) ||
             (clientSegmentsData.length > 0 && clientSegmentsData[0].count / clients.length > 0.6) ||
             (clients.length < 10) ||
             (quotes.filter(q => q.status === 'sent').length > 5) ||
             (metrics.quoteConversionRate >= 50 && quotes.filter(q => q.status !== 'draft').length >= 5)) && (
            <div className="col-span-full p-8 bg-gray-50 border border-gray-200 rounded-lg text-center">
              <div className="flex flex-col items-center space-y-2">
                <div className="bg-gray-400 p-2 rounded-full">
                  <CheckCircle2 className="h-5 w-5 text-white" />
                </div>
                <h4 className="text-sm font-medium text-gray-700">Tudo funcionando bem!</h4>
                <p className="text-xs text-gray-500 max-w-md">
                  Não identificamos oportunidades de melhoria imediatas. Continue acompanhando suas métricas 
                  e mantenha o foco na qualidade do atendimento aos clientes.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
