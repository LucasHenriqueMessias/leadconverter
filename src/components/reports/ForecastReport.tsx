'use client';

import { useState, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Deal } from '@/types';
import { TrendingUp, DollarSign, Target, Award, AlertCircle, TrendingDown } from 'lucide-react';

interface ForecastReportProps {
  deals: Deal[];
}

export const ForecastReport = ({ deals }: ForecastReportProps) => {
  const { organization } = useAuth();
  const [selectedPeriod, setSelectedPeriod] = useState<'month' | 'quarter' | 'year'>('month');
  const [selectedFunnel, setSelectedFunnel] = useState<string>('all');

  // Calcular forecast
  const forecast = useMemo(() => {
    const activeDeals = deals.filter(d => 
      d.stage !== 'won' && d.stage !== 'lost' &&
      (selectedFunnel === 'all' || d.funnelId === selectedFunnel)
    );

    const totalPipeline = activeDeals.reduce((sum, d) => sum + d.value, 0);
    const weightedPipeline = activeDeals.reduce((sum, d) => sum + (d.value * d.probability / 100), 0);

    // Agrupar por etapa
    const byStage: Record<string, { count: number; total: number; weighted: number }> = {};
    activeDeals.forEach(deal => {
      if (!byStage[deal.stage]) {
        byStage[deal.stage] = { count: 0, total: 0, weighted: 0 };
      }
      byStage[deal.stage].count++;
      byStage[deal.stage].total += deal.value;
      byStage[deal.stage].weighted += (deal.value * deal.probability / 100);
    });

    // Calcular confiança
    const avgProbability = activeDeals.length > 0
      ? activeDeals.reduce((sum, d) => sum + d.probability, 0) / activeDeals.length
      : 0;
    
    const confidence = avgProbability > 60 ? 'high' : avgProbability > 30 ? 'medium' : 'low';

    return {
      totalPipeline,
      weightedPipeline,
      expectedRevenue: weightedPipeline,
      dealsCount: activeDeals.length,
      byStage,
      confidence,
      avgProbability,
    };
  }, [deals, selectedFunnel]);

  // Calcular conversão por etapa
  const conversionByStage = useMemo(() => {
    const stages = organization?.settings?.salesStages || [];
    
    return stages.map((stage, index) => {
      const dealsInStage = deals.filter(d => d.stage === stage.id);
      const dealsWon = deals.filter(d => d.stage === 'won' && d.createdAt);
      
      // Calcular conversão para próxima etapa
      const nextStage = stages[index + 1];
      const dealsInNext = nextStage ? deals.filter(d => d.stage === nextStage.id) : [];
      
      const conversionRate = dealsInStage.length > 0
        ? (dealsInNext.length / dealsInStage.length) * 100
        : 0;

      return {
        stage: stage.id,
        name: stage.name,
        color: stage.color,
        dealsCount: dealsInStage.length,
        conversionRate: Math.round(conversionRate),
        isBottleneck: conversionRate < 30 && dealsInStage.length > 5,
      };
    });
  }, [deals, organization]);

  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case 'high': return 'text-green-600 bg-green-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getConfidenceLabel = (confidence: string) => {
    switch (confidence) {
      case 'high': return 'Alta Confiança';
      case 'medium': return 'Média Confiança';
      case 'low': return 'Baixa Confiança';
      default: return 'Sem Dados';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-blue-600" />
            Forecast de Vendas
          </h2>
          <p className="text-gray-600 mt-1">
            Previsão de receita baseada no pipeline atual
          </p>
        </div>
        <div className="flex gap-2">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value as any)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
          >
            <option value="month">Este Mês</option>
            <option value="quarter">Este Trimestre</option>
            <option value="year">Este Ano</option>
          </select>
          <select
            value={selectedFunnel}
            onChange={(e) => setSelectedFunnel(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
          >
            <option value="all">Todos os Funis</option>
            {organization?.settings?.funnels?.map(f => (
              <option key={f.id} value={f.id}>{f.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Pipeline Total</span>
            <DollarSign className="h-5 w-5 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">
            R$ {forecast.totalPipeline.toLocaleString('pt-BR')}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {forecast.dealsCount} negócios ativos
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Receita Esperada</span>
            <Target className="h-5 w-5 text-green-600" />
          </div>
          <div className="text-2xl font-bold text-green-600">
            R$ {forecast.expectedRevenue.toLocaleString('pt-BR')}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Ponderado por probabilidade
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Prob. Média</span>
            <Award className="h-5 w-5 text-purple-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {Math.round(forecast.avgProbability)}%
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Média do pipeline
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Confiança</span>
            <AlertCircle className="h-5 w-5 text-yellow-600" />
          </div>
          <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getConfidenceColor(forecast.confidence)}`}>
            {getConfidenceLabel(forecast.confidence)}
          </div>
          <div className="text-xs text-gray-500 mt-2">
            Baseado em {forecast.dealsCount} negócios
          </div>
        </div>
      </div>

      {/* Forecast por Etapa */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Forecast por Etapa</h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {Object.entries(forecast.byStage).map(([stage, data]) => {
              const stageInfo = organization?.settings?.salesStages?.find(s => s.id === stage);
              return (
                <div key={stage} className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: stageInfo?.color || '#94A3B8' }}
                      />
                      <span className="font-medium text-gray-900">
                        {stageInfo?.name || stage}
                      </span>
                      <span className="text-sm text-gray-500">
                        ({data.count} negócios)
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-gray-600">
                        Total: <strong>R$ {data.total.toLocaleString('pt-BR')}</strong>
                      </span>
                      <span className="text-green-600">
                        Ponderado: <strong>R$ {data.weighted.toLocaleString('pt-BR')}</strong>
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-gray-900">
                      {stageInfo?.probability || 0}%
                    </div>
                    <div className="text-xs text-gray-500">probabilidade</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Conversão por Etapa */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Taxa de Conversão por Etapa</h3>
          <p className="text-sm text-gray-600 mt-1">
            Percentual de negócios que avançam para a próxima etapa
          </p>
        </div>
        <div className="p-6">
          <div className="space-y-3">
            {conversionByStage.map((stage) => (
              <div key={stage.stage} className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: stage.color }}
                    />
                    <span className="font-medium text-gray-900">{stage.name}</span>
                    <span className="text-sm text-gray-500">
                      ({stage.dealsCount} negócios)
                    </span>
                    {stage.isBottleneck && (
                      <span className="inline-flex items-center gap-1 text-xs text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
                        <TrendingDown className="h-3 w-3" />
                        Gargalo
                      </span>
                    )}
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        stage.conversionRate > 50 ? 'bg-green-500' :
                        stage.conversionRate > 30 ? 'bg-yellow-500' :
                        'bg-red-500'
                      }`}
                      style={{ width: `${stage.conversionRate}%` }}
                    />
                  </div>
                </div>
                <div className="text-right min-w-[60px]">
                  <div className={`text-lg font-bold ${
                    stage.conversionRate > 50 ? 'text-green-600' :
                    stage.conversionRate > 30 ? 'text-yellow-600' :
                    'text-red-600'
                  }`}>
                    {stage.conversionRate}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Insights */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">💡 Insights do Forecast</h3>
        <ul className="space-y-2 text-sm text-gray-700">
          <li className="flex items-start gap-2">
            <span className="text-blue-600 mt-0.5">•</span>
            <span>
              Receita esperada de <strong>R$ {forecast.expectedRevenue.toLocaleString('pt-BR')}</strong> baseada
              em {forecast.dealsCount} negócios ativos
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 mt-0.5">•</span>
            <span>
              Confiança <strong>{getConfidenceLabel(forecast.confidence).toLowerCase()}</strong> na previsão
              (probabilidade média de {Math.round(forecast.avgProbability)}%)
            </span>
          </li>
          {conversionByStage.filter(s => s.isBottleneck).length > 0 && (
            <li className="flex items-start gap-2">
              <span className="text-red-600 mt-0.5">•</span>
              <span>
                <strong>Atenção:</strong> {conversionByStage.filter(s => s.isBottleneck).length} etapa(s)
                com baixa conversão identificada(s)
              </span>
            </li>
          )}
        </ul>
      </div>
    </div>
  );
};
