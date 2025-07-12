'use client';

import { useState } from 'react';
import { DndContext, DragEndEvent, DragStartEvent, DragOverlay } from '@dnd-kit/core';
import { collection, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { Deal, Client } from '@/types';
import { Target, Plus } from 'lucide-react';
import { DEFAULT_STAGES } from '@/constants/salesFunnel';
import { FunnelColumn } from './FunnelColumn';
import { DealForm } from './DealForm';

interface SalesFunnelViewProps {
  deals: Deal[];
  setDeals: (deals: Deal[]) => void;
  clients: Client[];
}

export const SalesFunnelView = ({ deals, setDeals, clients }: SalesFunnelViewProps) => {
  const { user } = useAuth();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingDeal, setEditingDeal] = useState<Deal | null>(null);
  const [selectedStage, setSelectedStage] = useState<string>('');
  const [activeId, setActiveId] = useState<string | null>(null);

  const handleDragStart = (event: DragStartEvent) => {
    console.log('Drag started:', event.active.id);
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
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
    if (newStage.length > 10 && !DEFAULT_STAGES.find(s => s.id === newStage)) {
      const targetDeal = deals.find(d => d.id === newStage);
      if (targetDeal) {
        newStage = targetDeal.stage;
        console.log(`Dropped over deal ${newStage}, using its stage: ${newStage}`);
      } else {
        console.error('Could not determine target stage');
        return;
      }
    }

    // Verificar se o stage é válido usando os DEFAULT_STAGES
    const validStageIds = DEFAULT_STAGES.map(stage => stage.id);
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

    try {
      // Atualizar no Firebase
      await updateDoc(doc(db, 'deals', dealId), {
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
  };

  const handleAddDeal = async (dealData: Omit<Deal, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    if (!user || !db) return;

    try {
      const docRef = await addDoc(collection(db, 'deals'), {
        ...dealData,
        userId: user.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const newDeal: Deal = {
        id: docRef.id,
        ...dealData,
        userId: user.id,
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

  const handleUpdateDeal = async (dealData: Omit<Deal, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    if (!editingDeal || !db) return;

    try {
      await updateDoc(doc(db, 'deals', editingDeal.id), {
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
    if (!confirm('Tem certeza que deseja excluir este negócio?') || !db) return;

    try {
      await deleteDoc(doc(db, 'deals', dealId));
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

  const totalValue = deals.reduce((sum, deal) => sum + deal.value, 0);
  const wonDeals = deals.filter(deal => deal.stage === 'closed-won');
  const wonValue = wonDeals.reduce((sum, deal) => sum + deal.value, 0);
  const conversionRate = deals.length > 0 ? (wonDeals.length / deals.length) * 100 : 0;

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
        <h2 className="text-2xl font-bold text-gray-900">Funil de Vendas</h2>
        <button
          onClick={() => openAddForm('lead')}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          <span>Novo Negócio</span>
        </button>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm font-medium text-gray-600">Total de Negócios</div>
          <div className="text-2xl font-bold text-gray-900">{deals.length}</div>
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
            {DEFAULT_STAGES.map((stage) => (
              <FunnelColumn
                key={stage.id}
                stage={stage}
                deals={deals}
                clients={clients}
                onAddDeal={openAddForm}
                onEditDeal={openEditForm}
                onDeleteDeal={handleDeleteDeal}
              />
            ))}
          </div>

          <DragOverlay>
            {activeId ? (() => {
              const activeDeal = deals.find(deal => deal.id === activeId);
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
          onSubmit={editingDeal ? handleUpdateDeal : handleAddDeal}
          onClose={() => {
            setIsFormOpen(false);
            setEditingDeal(null);
            setSelectedStage('');
          }}
        />
      )}
    </div>
  );
};
