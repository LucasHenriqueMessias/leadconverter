'use client';

import { Deal } from '@/types';
import { LOST_REASONS, getLostReasonLabel, LOST_REASON_COLORS } from '@/constants/lostReasons';
import { TrendingDown, DollarSign, Users, AlertCircle, BarChart3 } from 'lucide-react';
import { useMemo } from 'react';

interface LossAnalysisProps {
  deals: Deal[];
}

export const LossAnalysis = ({ deals }: LossAnalysisProps) => {
  const lostDeals = useMemo(() => {
    return deals.filter(deal => deal.stage === 'closed-lost' && deal.lostReason);
  }, [deals]);

  const analysis = useMemo(() => {
    if (lostDeals.length === 0) {
      return {
        totalLost: 0,
        totalValue: 0,
        byReason: [],
        topCompetitors: [],
        avgDealValue: 0,
      };
    }

    // Análise por motivo
    const reasonCounts: Record<string, { count: number; value: number; deals: Deal[] }> = {};
    
    lostDeals.forEach(deal => {
      const reason = deal.lostReason || 'other';
      if (!reasonCounts[reason]) {
        reasonCounts[reason] = { count: 0, value: 0, deals: [] };
      }
      reasonCounts[reason].count++;
      reasonCounts[reason].value += deal.value;
      reasonCounts[reason].deals.push(deal);
    });

    const byReason = Object.entries(reasonCounts)
      .map(([reason, data]) => ({
        reason,
        label: getLostReasonLabel(reason),
        count: data.count,
        value: data.value,
        percentage: (data.count / lostDeals.length) * 100,
        deals: data.deals,
      }))
      .sort((a, b) => b.count - a.count);

    // Análise de concorrentes
    const competitorCounts: Record<string, { count: number; value: number }> = {};
    
    lostDeals.forEach(deal => {
      if (deal.lostToCompetitor) {
        const competitor = deal.lostToCompetitor;
        if (!competitorCounts[competitor]) {
          competitorCounts[competitor] = { count: 0, value: 0 };
        }
        competitorCounts[competitor].count++;
        competitorCounts[competitor].value += deal.value;
      }
    });

    const topCompetitors = Object.entries(competitorCounts)
      .map(([name, data]) => ({
        name,
        count: data.count,
        value: data.value,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const totalValue = lostDeals.reduce((sum, deal) => sum + deal.value, 0);
    const avgDealValue = totalValue / lostDeals.length;

    return {
      totalLost: lostDeals.length,
      totalValue,
      byReason,
      topCompetitors,
      avgDealValue,
    };
  }, [lostDeals]);

  if (lostDeals.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center py-12">
          <TrendingDown className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Nenhuma perda registrada
          </h3>
          <p className="text-gray-600">
            Quando negócios forem marcados como perdidos, a análise aparecerá aqui.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Métricas Gerais */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <TrendingDown className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <div className="text-sm text-gray-600">Negócios Perdidos</div>
              <div className="text-2xl font-bold text-gray-900">{analysis.totalLost}</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <DollarSign className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <div className="text-sm text-gray-600">Valor Total Perdido</div>
              <div className="text-2xl font-bold text-red-600">
                R$ {analysis.totalValue.toLocaleString('pt-BR')}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <BarChart3 className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <div className="text-sm text-gray-600">Ticket Médio</div>
              <div className="text-2xl font-bold text-gray-900">
                R$ {analysis.avgDealValue.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Análise por Motivo */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-600" />
            Motivos de Perda
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Entenda por que estamos perdendo negócios
          </p>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {analysis.byReason.map((item) => (
              <div key={item.reason} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      LOST_REASON_COLORS[item.reason] || 'bg-gray-100 text-gray-800'
                    }`}>
                      {item.label}
                    </span>
                    <span className="text-sm text-gray-600">
                      {item.count} {item.count === 1 ? 'negócio' : 'negócios'}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">
                      {item.percentage.toFixed(1)}%
                    </div>
                    <div className="text-xs text-gray-600">
                      R$ {item.value.toLocaleString('pt-BR')}
                    </div>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-red-600 h-2 rounded-full transition-all"
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Concorrentes */}
      {analysis.topCompetitors.length > 0 && (
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Users className="h-5 w-5 text-orange-600" />
              Principais Concorrentes
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Quem está ganhando nossos negócios
            </p>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {analysis.topCompetitors.map((competitor, index) => (
                <div key={competitor.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-orange-600">
                        {index + 1}
                      </span>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{competitor.name}</div>
                      <div className="text-sm text-gray-600">
                        {competitor.count} {competitor.count === 1 ? 'vitória' : 'vitórias'}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">
                      R$ {competitor.value.toLocaleString('pt-BR')}
                    </div>
                    <div className="text-xs text-gray-600">valor total</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Insights */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-sm font-semibold text-blue-900 mb-3 flex items-center gap-2">
          <AlertCircle className="h-4 w-4" />
          Insights e Recomendações
        </h3>
        <div className="space-y-2 text-sm text-blue-800">
          {analysis.byReason[0] && (
            <p>
              • <strong>{analysis.byReason[0].label}</strong> é o principal motivo de perda 
              ({analysis.byReason[0].percentage.toFixed(1)}% dos casos). 
              Foque em melhorar este aspecto.
            </p>
          )}
          {analysis.topCompetitors[0] && (
            <p>
              • <strong>{analysis.topCompetitors[0].name}</strong> é nosso principal concorrente 
              ({analysis.topCompetitors[0].count} vitórias). 
              Analise seus diferenciais.
            </p>
          )}
          {analysis.totalValue > 0 && (
            <p>
              • Recuperar apenas <strong>20%</strong> das perdas representaria 
              <strong> R$ {(analysis.totalValue * 0.2).toLocaleString('pt-BR')}</strong> em receita adicional.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};