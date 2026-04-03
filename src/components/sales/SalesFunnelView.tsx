'use client';

import { useState, useMemo, useCallback } from 'react';
import { DndContext, DragEndEvent, DragStartEvent, DragOverlay } from '@dnd-kit/core';
import { collection, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { Deal, Client } from '@/types';
import { Target, Plus, ArrowLeft } from 'lucide-react';
import { DEFAULT_STAGES } from '@/constants/salesFunnel';
import { FunnelColumn } from './FunnelColumn';
import { DealForm } from './DealForm';
import { UserFilter } from './UserFilter';
import { LostReasonModal } from './LostReasonModal';
import { FunnelSelector } from './FunnelSelector';
import { LostReason } from '@/types';

interface SalesFunnelViewProps {
  deals: Deal[];
  setDeals: (deals: Deal[]) => void;
  clients: Client[];
}

export const SalesFunnelView = ({ deals, setDeals, clients }: SalesFunnelViewProps) => {
  const { user, isAdmin, isManager, organization } = useAuth();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingDeal, setEditingDeal] = useState<Deal | null>(null);
  const [selectedStage, setSelectedStage] = useState<string>('');
  const [activeId, setActiveId] = useState<string | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedFunnelId, setSelectedFunnelId] = useState<string | null>(null);
  const [lostReasonModalDeal, setLostReasonModalDeal] = useState<{ deal: Deal; newStage: string } | null>(null);

  // Obter funis da organização
  const funnels = organization?.settings?.funnels || [];
  const activeFunnels = funnels.filter(f => f.active);
  
  // Obter funil selecionado
  const selectedFunnel = funnels.find(f => f.id === selectedFunnelId);
  const stages = selectedFunnel?.stages || DEFAULT_STAGES;

  // Filtrar deals baseado no usuário selecionado, funil e permissões
  const filteredDeals = useMemo(() => {
    if (!selectedFunnelId) return [];
    
    let dealsToShow = deals;

    // Filtrar por funil
    dealsToShow = dealsToShow.filter(deal => 
      deal.funnelId === selectedFunnelId || (!deal.funnelId && selectedFunnelId === 'funnel_inbound')
    );

    // Se não é admin nem manager, mostrar apenas próprios deals
    if (!isAdmin && !isManager) {
      dealsToShow = dealsToShow.filter(deal => deal.userId === user?.id);
    } else if (selectedUserId) {
      // Se admin/manager selecionou um usuário específico
      dealsToShow = dealsToShow.filter(deal => deal.userId === selectedUserId);
    }
    // Se admin/manager e não selecionou usuário, mostrar todos

    return dealsToShow;
  }, [deals, selectedUserId, selectedFunnelId, isAdmin, isManager, user?.id]);

  // Filtrar clientes baseado nos deals visíveis
  const filteredClients = useMemo(() => {
    const dealClientIds = new Set(filteredDeals.map(deal => deal.clientId));
    return clients.filter(client => dealClientIds.has(client.id));
  }, [clients, filteredDeals]);

  const handleDragStart = useCallback((event: DragStartEvent) => {
    console.log('Drag started:', event.active.id);
    setActiveId(event.active.id as string);
  }, []);

  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    const { active, over } = event;
    console.log('Drag ended:', { 
      activeId: active.id, 
      overId: over?.id,
      overData: over?.data
    });
    setActiveId(null);

    if (!over || !db) {
      console.log('No drop target or database');
      return;
    }

    const dealId = active.id as string;
    let newStage = over.id as string;

    // Se o drop foi sobre um card (ID longo do Firebase), encontrar o stage do card
    if (newStage.length > 10 && !stages.find(s => s.id === newStage)) {
      const targetDeal = deals.find(d => d.id === newStage);
      if (targetDeal) {
        newStage = targetDeal.stage;
        console.log(`Dropped over deal ${newStage}, using its stage: ${newStage}`);
      } else {
        console.error('Could not determine target stage');
        return;
      }
    }

    // Verificar se o stage é válido usando os stages do funil selecionado
    const validStageIds = stages.map(stage => stage.id);
    if (!validStageIds.includes(newStage)) {
      console.error('Invalid stage:', newStage, 'Valid stages:', validStageIds);
      return;
    }

    const deal = deals.find(d => d.id === dealId);
    if (!deal || deal.stage === newStage) {
      console.log('Deal not found or same stage');
      return;
    }

    console.log(`Moving deal ${dealId} from ${deal.stage} to ${newStage}`);

    // Se está movendo para "closed-lost", mostrar modal de motivo de perda
    if (newStage === 'closed-lost' && deal.stage !== 'closed-lost') {
      setLostReasonModalDeal({ deal, newStage });
      return;
    }

    try {
      // Atualizar no Firebase usando a estrutura organizacional
      if (!user?.organizationId) return;
      
      await updateDoc(doc(db, `organizations/${user.organizationId}/deals`, dealId), {
        stage: newStage,
        updatedAt: new Date(),
      });

      // Atualizar localmente
      setDeals(deals.map(d => 
        d.id === dealId 
          ? { ...d, stage: newStage, updatedAt: new Date() }
          : d
      ));

      console.log('Deal moved successfully');
    } catch (error) {
      console.error('Error updating deal stage:', error);
    }
  }, [deals, setDeals, stages, db, user]);

  const handleAddDeal = async (dealData: Omit<Deal, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!user || !db || !user.organizationId) return;

    try {
      // Para admin/manager, permitir especificar userId, senão usar o próprio
      const finalUserId = (isAdmin || isManager) && selectedUserId ? selectedUserId : user.id;
      const finalFunnelId = selectedFunnelId || dealData.funnelId || 'funnel_inbound';
      
      const docRef = await addDoc(collection(db, `organizations/${user.organizationId}/deals`), {
        ...dealData,
        funnelId: finalFunnelId,
        userId: finalUserId,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const newDeal: Deal = {
        id: docRef.id,
        ...dealData,
        funnelId: finalFunnelId,
        userId: finalUserId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      setDeals([...deals, newDeal]);
      setIsFormOpen(false);
      setSelectedStage('');
    } catch (error) {
      console.error('Error adding deal:', error);
    }
  };

  const handleLostReasonSubmit = async (data: {
    lostReason: LostReason;
    lostReasonDetails?: string;
    lostToCompetitor?: string;
  }) => {
    if (!lostReasonModalDeal || !db || !user) return;

    const { deal, newStage } = lostReasonModalDeal;

    try {
      // Preparar dados para atualização (remover campos undefined)
      const updateData: any = {
        stage: newStage,
        lostReason: data.lostReason,
        lostDate: new Date(),
        closedBy: user.id,
        updatedAt: new Date(),
      };

      // Adicionar campos opcionais apenas se tiverem valor
      if (data.lostReasonDetails) {
        updateData.lostReasonDetails = data.lostReasonDetails;
      }
      if (data.lostToCompetitor) {
        updateData.lostToCompetitor = data.lostToCompetitor;
      }

      // Atualizar no Firebase com motivo de perda
      await updateDoc(doc(db, `organizations/${user.organizationId}/deals`, deal.id), updateData);

      // Atualizar localmente
      setDeals(deals.map(d => {
        if (d.id === deal.id) {
          const localUpdateData: any = {
            ...d,
            stage: newStage, 
            lostReason: data.lostReason,
            lostDate: new Date(),
            closedBy: user.id,
            updatedAt: new Date()
          };

          if (data.lostReasonDetails) {
            localUpdateData.lostReasonDetails = data.lostReasonDetails;
          }
          if (data.lostToCompetitor) {
            localUpdateData.lostToCompetitor = data.lostToCompetitor;
          }

          return localUpdateData;
        }
        return d;
      }));

      setLostReasonModalDeal(null);
      console.log('Deal marked as lost with reason');
    } catch (error) {
      console.error('Error updating deal with lost reason:', error);
      alert('Erro ao marcar negócio como perdido. Tente novamente.');
    }
  };

  const handleUpdateDeal = async (dealData: Omit<Deal, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!editingDeal || !db || !user?.organizationId) return;

    try {
      await updateDoc(doc(db, `organizations/${user.organizationId}/deals`, editingDeal.id), {
        ...dealData,
        updatedAt: new Date(),
      });

      setDeals(deals.map(deal =>
        deal.id === editingDeal.id
          ? { ...deal, ...dealData, updatedAt: new Date() }
          : deal
      ));
      setEditingDeal(null);
      setIsFormOpen(false);
    } catch (error) {
      console.error('Error updating deal:', error);
    }
  };

  const handleDeleteDeal = async (dealId: string) => {
    if (!confirm('Tem certeza que deseja excluir este negócio?') || !db || !user?.organizationId) return;

    try {
      await deleteDoc(doc(db, `organizations/${user.organizationId}/deals`, dealId));
      setDeals(deals.filter(deal => deal.id !== dealId));
    } catch (error) {
      console.error('Error deleting deal:', error);
    }
  };

  const openAddForm = (stageId: string) => {
    setSelectedStage(stageId);
    setEditingDeal(null);
    setIsFormOpen(true);
  };

  const openEditForm = (deal: Deal) => {
    setEditingDeal(deal);
    setIsFormOpen(true);
  };

  const totalValue = filteredDeals.reduce((sum, deal) => sum + deal.value, 0);
  const wonDeals = filteredDeals.filter(deal => deal.stage === 'closed-won');
  const wonValue = wonDeals.reduce((sum, deal) => sum + deal.value, 0);
  const conversionRate = filteredDeals.length > 0 ? (wonDeals.length / filteredDeals.length) * 100 : 0;

  // Se nenhum funil foi selecionado, mostrar o seletor de funis
  if (!selectedFunnelId) {
    return (
      <FunnelSelector
        deals={deals}
        onSelectFunnel={setSelectedFunnelId}
      />
    );
  }

  if (clients.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Funil de Vendas</h2>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-center py-12">
            <Target className="h-12 w-12 text-gray-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Cadastre clientes primeiro
            </h3>
            <p className="text-gray-600">
              Para criar negócios no funil de vendas, você precisa ter pelo menos um cliente cadastrado.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setSelectedFunnelId(null)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Voltar para seleção de funis"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold text-gray-900">{selectedFunnel?.name || 'Funil de Vendas'}</h2>
              {selectedFunnel && (
                <span 
                  className="px-3 py-1 rounded-full text-sm font-medium text-white"
                  style={{ backgroundColor: selectedFunnel.color }}
                >
                  {selectedFunnel.type}
                </span>
              )}
            </div>
            {(isAdmin || isManager) && (
              <p className="text-gray-600 mt-1">
                {selectedUserId 
                  ? `Visualizando deals de um usuário específico`
                  : `Visualizando deals de ${isAdmin ? 'toda a organização' : 'sua equipe'}`
                }
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-4">
          {(isAdmin || isManager) && (
            <UserFilter 
              selectedUserId={selectedUserId}
              onUserChange={setSelectedUserId}
            />
          )}
          <button
            onClick={() => openAddForm(stages[0]?.id || 'lead')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            <span>Novo Negócio</span>
          </button>
        </div>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm font-medium text-gray-600">Total de Negócios</div>
          <div className="text-2xl font-bold text-gray-900">{filteredDeals.length}</div>
          {selectedUserId && (
            <div className="text-xs text-gray-500 mt-1">
              {deals.length} no total da organização
            </div>
          )}
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm font-medium text-gray-600">Valor Total</div>
          <div className="text-2xl font-bold text-gray-900">
            R$ {totalValue.toLocaleString('pt-BR')}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm font-medium text-gray-600">Faturamento</div>
          <div className="text-2xl font-bold text-green-600">
            R$ {wonValue.toLocaleString('pt-BR')}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm font-medium text-gray-600">Taxa de Conversão</div>
          <div className="text-2xl font-bold text-blue-600">
            {conversionRate.toFixed(1)}%
          </div>
        </div>
      </div>

      {/* Funil */}
      <div className="bg-white rounded-lg shadow p-6">
        <DndContext
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="flex space-x-6 overflow-x-auto pb-4">
            {stages.map((stage) => (
              <FunnelColumn
                key={stage.id}
                stage={stage}
                deals={filteredDeals}
                clients={clients}
                onAddDeal={openAddForm}
                onEditDeal={openEditForm}
                onDeleteDeal={handleDeleteDeal}
              />
            ))}
          </div>

          <DragOverlay>
            {activeId ? (() => {
              const activeDeal = filteredDeals.find(deal => deal.id === activeId);
              const activeClient = activeDeal ? clients.find(c => c.id === activeDeal.clientId) : undefined;
              
              return activeDeal ? (
                <div className="bg-white rounded-lg shadow-lg border-2 border-blue-500 p-4 opacity-90 transform rotate-3 w-80">
                  <div className="space-y-2">
                    <div>
                      <h3 className="font-medium text-gray-900 text-sm truncate">
                        {activeDeal.title}
                      </h3>
                      <div className="flex items-center text-xs text-gray-500 mt-1">
                        <span className="truncate">{activeClient?.name || 'Cliente não encontrado'}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center text-green-600">
                        <span className="font-medium">
                          R$ {activeDeal.value.toLocaleString('pt-BR')}
                        </span>
                      </div>
                      <div className="flex items-center text-gray-500">
                        <span>{activeDeal.probability}%</span>
                      </div>
                    </div>
                    
                    <div className="text-xs text-blue-600 font-medium text-center">
                      Arrastando...
                    </div>
                  </div>
                </div>
              ) : null;
            })() : null}
          </DragOverlay>
        </DndContext>
      </div>

      {/* Formulário */}
      {isFormOpen && (
        <DealForm
          deal={editingDeal}
          clients={clients}
          initialStage={selectedStage}
          funnelId={selectedFunnelId || undefined}
          stages={stages}
          onSubmit={editingDeal ? handleUpdateDeal : handleAddDeal}
          onClose={() => {
            setIsFormOpen(false);
            setEditingDeal(null);
            setSelectedStage('');
          }}
        />
      )}

      {/* Modal de Motivo de Perda */}
      {lostReasonModalDeal && (
        <LostReasonModal
          deal={lostReasonModalDeal.deal}
          onSubmit={handleLostReasonSubmit}
          onClose={() => setLostReasonModalDeal(null)}
        />
      )}
    </div>
  );
};
