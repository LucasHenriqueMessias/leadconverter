'use client';

import { useState, useEffect } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { SalesFunnel } from '@/types';
import { Plus, Edit2, Trash2, TrendingUp, Users, Handshake, Layers } from 'lucide-react';
import { FunnelForm } from './FunnelForm';

export const FunnelManager = () => {
  const { user, organization } = useAuth();
  const [funnels, setFunnels] = useState<SalesFunnel[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingFunnel, setEditingFunnel] = useState<SalesFunnel | null>(null);

  useEffect(() => {
    if (organization?.settings?.funnels) {
      setFunnels(organization.settings.funnels);
    } else {
      // Criar funis padrão se não existirem
      const defaultFunnels: SalesFunnel[] = [
        {
          id: 'funnel_inbound',
          name: 'Inbound',
          type: 'inbound',
          description: 'Leads que chegam por canais de marketing (site, redes sociais, etc)',
          stages: [
            { id: 'lead', name: 'Lead', color: '#94A3B8', order: 1, probability: 10 },
            { id: 'qualified', name: 'Qualificado', color: '#60A5FA', order: 2, probability: 25 },
            { id: 'proposal', name: 'Proposta', color: '#34D399', order: 3, probability: 50 },
            { id: 'negotiation', name: 'Negociação', color: '#FBBF24', order: 4, probability: 75 },
            { id: 'won', name: 'Ganho', color: '#10B981', order: 5, probability: 100 },
            { id: 'lost', name: 'Perdido', color: '#EF4444', order: 6, probability: 0 },
          ],
          color: '#3B82F6',
          icon: 'trending-up',
          active: true,
          defaultProbabilities: {
            lead: 10,
            qualified: 25,
            proposal: 50,
            negotiation: 75,
            won: 100,
            lost: 0,
          },
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'funnel_outbound',
          name: 'Outbound',
          type: 'outbound',
          description: 'Prospecção ativa (cold calls, emails, LinkedIn)',
          stages: [
            { id: 'prospect', name: 'Prospecção', color: '#94A3B8', order: 1, probability: 5 },
            { id: 'contact', name: 'Contato', color: '#60A5FA', order: 2, probability: 15 },
            { id: 'meeting', name: 'Reunião', color: '#34D399', order: 3, probability: 35 },
            { id: 'proposal', name: 'Proposta', color: '#FBBF24', order: 4, probability: 60 },
            { id: 'negotiation', name: 'Negociação', color: '#F59E0B', order: 5, probability: 80 },
            { id: 'won', name: 'Ganho', color: '#10B981', order: 6, probability: 100 },
            { id: 'lost', name: 'Perdido', color: '#EF4444', order: 7, probability: 0 },
          ],
          color: '#8B5CF6',
          icon: 'users',
          active: true,
          defaultProbabilities: {
            prospect: 5,
            contact: 15,
            meeting: 35,
            proposal: 60,
            negotiation: 80,
            won: 100,
            lost: 0,
          },
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'funnel_partnership',
          name: 'Parcerias',
          type: 'partnership',
          description: 'Negócios vindos de parceiros e indicações',
          stages: [
            { id: 'referral', name: 'Indicação', color: '#94A3B8', order: 1, probability: 20 },
            { id: 'qualified', name: 'Qualificado', color: '#60A5FA', order: 2, probability: 40 },
            { id: 'proposal', name: 'Proposta', color: '#34D399', order: 3, probability: 65 },
            { id: 'negotiation', name: 'Negociação', color: '#FBBF24', order: 4, probability: 85 },
            { id: 'won', name: 'Ganho', color: '#10B981', order: 5, probability: 100 },
            { id: 'lost', name: 'Perdido', color: '#EF4444', order: 6, probability: 0 },
          ],
          color: '#EC4899',
          icon: 'handshake',
          active: true,
          defaultProbabilities: {
            referral: 20,
            qualified: 40,
            proposal: 65,
            negotiation: 85,
            won: 100,
            lost: 0,
          },
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
      setFunnels(defaultFunnels);
    }
  }, [organization]);

  const handleSaveFunnel = async (funnelData: Omit<SalesFunnel, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!user?.organizationId || !db) return;

    try {
      let updatedFunnels: SalesFunnel[];

      if (editingFunnel) {
        updatedFunnels = funnels.map(funnel =>
          funnel.id === editingFunnel.id
            ? { ...funnelData, id: editingFunnel.id, createdAt: editingFunnel.createdAt, updatedAt: new Date() }
            : funnel
        );
      } else {
        const newFunnel: SalesFunnel = {
          ...funnelData,
          id: `funnel_${Date.now()}`,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        updatedFunnels = [...funnels, newFunnel];
      }

      await updateDoc(doc(db, 'organizations', user.organizationId), {
        'settings.funnels': updatedFunnels,
      });

      setFunnels(updatedFunnels);
      setIsFormOpen(false);
      setEditingFunnel(null);
    } catch (error) {
      console.error('Error saving funnel:', error);
      alert('Erro ao salvar funil. Tente novamente.');
    }
  };

  const handleDeleteFunnel = async (funnelId: string) => {
    if (!confirm('Tem certeza que deseja excluir este funil?')) return;
    if (!user?.organizationId || !db) return;

    try {
      const updatedFunnels = funnels.filter(f => f.id !== funnelId);

      await updateDoc(doc(db, 'organizations', user.organizationId), {
        'settings.funnels': updatedFunnels,
      });

      setFunnels(updatedFunnels);
    } catch (error) {
      console.error('Error deleting funnel:', error);
      alert('Erro ao excluir funil. Tente novamente.');
    }
  };

  const handleToggleActive = async (funnelId: string) => {
    if (!user?.organizationId || !db) return;

    try {
      const updatedFunnels = funnels.map(f =>
        f.id === funnelId ? { ...f, active: !f.active, updatedAt: new Date() } : f
      );

      await updateDoc(doc(db, 'organizations', user.organizationId), {
        'settings.funnels': updatedFunnels,
      });

      setFunnels(updatedFunnels);
    } catch (error) {
      console.error('Error toggling funnel:', error);
    }
  };

  const getFunnelIcon = (icon: string) => {
    switch (icon) {
      case 'trending-up':
        return <TrendingUp className="h-5 w-5" />;
      case 'users':
        return <Users className="h-5 w-5" />;
      case 'handshake':
        return <Handshake className="h-5 w-5" />;
      default:
        return <Layers className="h-5 w-5" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Layers className="h-6 w-6" />
            Funis de Vendas
          </h2>
          <p className="text-gray-600 mt-1">
            Gerencie múltiplos funis para diferentes tipos de negócio
          </p>
        </div>
        <button
          onClick={() => {
            setEditingFunnel(null);
            setIsFormOpen(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          <span>Novo Funil</span>
        </button>
      </div>

      {/* Lista de Funis */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {funnels.map((funnel) => (
          <div
            key={funnel.id}
            className={`bg-white rounded-lg shadow p-6 border-l-4 ${
              funnel.active ? 'opacity-100' : 'opacity-50'
            }`}
            style={{ borderLeftColor: funnel.color }}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-white"
                  style={{ backgroundColor: funnel.color }}
                >
                  {getFunnelIcon(funnel.icon)}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{funnel.name}</h3>
                  <span className="text-xs text-gray-500 capitalize">{funnel.type}</span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleToggleActive(funnel.id)}
                  className={`p-1 rounded ${
                    funnel.active ? 'text-green-600' : 'text-gray-400'
                  }`}
                  title={funnel.active ? 'Desativar' : 'Ativar'}
                >
                  <div className={`w-2 h-2 rounded-full ${
                    funnel.active ? 'bg-green-600' : 'bg-gray-400'
                  }`} />
                </button>
                <button
                  onClick={() => {
                    setEditingFunnel(funnel);
                    setIsFormOpen(true);
                  }}
                  className="p-1 text-gray-600 hover:text-blue-600"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDeleteFunnel(funnel.id)}
                  className="p-1 text-gray-600 hover:text-red-600"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            <p className="text-sm text-gray-600 mb-4">{funnel.description}</p>

            <div className="space-y-2">
              <div className="text-xs font-medium text-gray-700">Etapas ({funnel.stages.length})</div>
              <div className="flex flex-wrap gap-1">
                {funnel.stages.slice(0, 4).map((stage) => (
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
                {funnel.stages.length > 4 && (
                  <span className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-600">
                    +{funnel.stages.length - 4}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-blue-900 mb-2">💡 Sobre Múltiplos Funis</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• <strong>Inbound</strong>: Leads que chegam por marketing (site, redes sociais)</li>
          <li>• <strong>Outbound</strong>: Prospecção ativa (cold calls, emails, LinkedIn)</li>
          <li>• <strong>Parcerias</strong>: Negócios vindos de parceiros e indicações</li>
          <li>• Cada funil tem etapas e probabilidades personalizadas</li>
          <li>• Relatórios separados por funil para melhor análise</li>
        </ul>
      </div>

      {/* Formulário */}
      {isFormOpen && (
        <FunnelForm
          funnel={editingFunnel}
          onSubmit={handleSaveFunnel}
          onClose={() => {
            setIsFormOpen(false);
            setEditingFunnel(null);
          }}
        />
      )}
    </div>
  );
};
