'use client';

import { useAuth } from '@/contexts/AuthContext';
import { Deal } from '@/types';
import { TrendingUp, Users, Handshake, Layers, ArrowRight } from 'lucide-react';

interface FunnelSelectorProps {
  deals: Deal[];
  onSelectFunnel: (funnelId: string) => void;
}

export const FunnelSelector = ({ deals, onSelectFunnel }: FunnelSelectorProps) => {
  const { organization } = useAuth();

  const funnels = organization?.settings?.funnels || [];
  const activeFunnels = funnels.filter(f => f.active);

  const getFunnelIcon = (icon: string) => {
    switch (icon) {
      case 'trending-up':
        return <TrendingUp className="h-8 w-8" />;
      case 'users':
        return <Users className="h-8 w-8" />;
      case 'handshake':
        return <Handshake className="h-8 w-8" />;
      default:
        return <Layers className="h-8 w-8" />;
    }
  };

  const getDealsCountByFunnel = (funnelId: string) => {
    return deals.filter(d => 
      d.funnelId === funnelId || (!d.funnelId && funnelId === 'funnel_inbound')
    ).length;
  };

  const getDealsValueByFunnel = (funnelId: string) => {
    return deals
      .filter(d => d.funnelId === funnelId || (!d.funnelId && funnelId === 'funnel_inbound'))
      .reduce((sum, d) => sum + d.value, 0);
  };

  if (activeFunnels.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Funil de Vendas</h2>
          <p className="text-gray-600 mt-1">Selecione um funil para começar</p>
        </div>

        <div className="bg-white rounded-lg shadow p-12 text-center">
          <Layers className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Nenhum funil configurado
          </h3>
          <p className="text-gray-600 mb-4">
            Configure funis de vendas para começar a gerenciar seus negócios
          </p>
          <p className="text-sm text-gray-500">
            Administradores podem criar funis em: Menu → Funis de Vendas
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Funil de Vendas</h2>
        <p className="text-gray-600 mt-1">Selecione um funil para visualizar seus negócios</p>
      </div>

      {/* Cards de Funis */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {activeFunnels.map((funnel) => {
          const dealsCount = getDealsCountByFunnel(funnel.id);
          const dealsValue = getDealsValueByFunnel(funnel.id);

          return (
            <button
              key={funnel.id}
              onClick={() => onSelectFunnel(funnel.id)}
              className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 p-6 text-left border-l-4 hover:scale-105 group"
              style={{ borderLeftColor: funnel.color }}
            >
              {/* Header do Card */}
              <div className="flex items-start justify-between mb-4">
                <div
                  className="w-14 h-14 rounded-lg flex items-center justify-center text-white"
                  style={{ backgroundColor: funnel.color }}
                >
                  {getFunnelIcon(funnel.icon)}
                </div>
                <ArrowRight className="h-6 w-6 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all" />
              </div>

              {/* Nome e Tipo */}
              <h3 className="text-xl font-bold text-gray-900 mb-1">{funnel.name}</h3>
              <p className="text-sm text-gray-500 capitalize mb-4">{funnel.type}</p>

              {/* Descrição */}
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                {funnel.description}
              </p>

              {/* Métricas */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                <div>
                  <div className="text-xs text-gray-500 mb-1">Negócios</div>
                  <div className="text-2xl font-bold text-gray-900">{dealsCount}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">Valor Total</div>
                  <div className="text-lg font-bold" style={{ color: funnel.color }}>
                    R$ {(dealsValue / 1000).toFixed(0)}k
                  </div>
                </div>
              </div>

              {/* Etapas */}
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="text-xs text-gray-500 mb-2">
                  {funnel.stages.length} etapas
                </div>
                <div className="flex flex-wrap gap-1">
                  {funnel.stages.slice(0, 3).map((stage) => (
                    <span
                      key={stage.id}
                      className="text-xs px-2 py-1 rounded"
                      style={{
                        backgroundColor: `${stage.color}20`,
                        color: stage.color,
                      }}
                    >
                      {stage.name}
                    </span>
                  ))}
                  {funnel.stages.length > 3 && (
                    <span className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-600">
                      +{funnel.stages.length - 3}
                    </span>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-blue-900 mb-2">💡 Sobre os Funis</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• <strong>Inbound</strong>: Leads que chegam por marketing (site, redes sociais)</li>
          <li>• <strong>Outbound</strong>: Prospecção ativa (cold calls, emails, LinkedIn)</li>
          <li>• <strong>Parcerias</strong>: Negócios vindos de parceiros e indicações</li>
          <li>• Clique em um funil para visualizar e gerenciar seus negócios</li>
        </ul>
      </div>
    </div>
  );
};
