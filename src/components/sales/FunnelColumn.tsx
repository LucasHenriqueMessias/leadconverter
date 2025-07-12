'use client';

import { Deal, Client } from '@/types';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { DealCard } from './DealCard';
import { Plus } from 'lucide-react';

interface FunnelColumnProps {
  stage: {
    id: string;
    name: string;
    color: string;
    order: number;
    description: string;
  };
  deals: Deal[];
  clients: Client[];
  onAddDeal: (stage: string) => void;
  onEditDeal: (deal: Deal) => void;
  onDeleteDeal: (dealId: string) => void;
}

export const FunnelColumn = ({ 
  stage, 
  deals, 
  clients, 
  onAddDeal, 
  onEditDeal,
  onDeleteDeal 
}: FunnelColumnProps) => {
  const { setNodeRef, isOver } = useDroppable({
    id: stage.id,
  });

  const stageDeals = deals.filter(deal => deal.stage === stage.id);
  const totalValue = stageDeals.reduce((sum, deal) => sum + deal.value, 0);

  return (
    <div className={`bg-gray-50 rounded-lg p-4 min-h-[600px] w-80 flex-shrink-0 transition-colors ${
      isOver ? 'bg-blue-50 border-2 border-blue-300' : 'border-2 border-transparent'
    }`}>
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${stage.color}`}></div>
            <h3 className="font-semibold text-gray-900">{stage.name}</h3>
            <span className="bg-gray-200 text-gray-600 text-xs px-2 py-1 rounded-full">
              {stageDeals.length}
            </span>
          </div>
          <button
            onClick={() => onAddDeal(stage.id)}
            className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded"
            title="Adicionar negócio"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
        
        <p className="text-xs text-gray-500 mb-2">{stage.description}</p>
        
        <div className="text-sm font-medium text-gray-700">
          R$ {totalValue.toLocaleString('pt-BR')}
        </div>
      </div>

      <div
        ref={setNodeRef}
        className="space-y-3 min-h-[500px]"
        data-stage-id={stage.id}
      >
        <SortableContext
          items={stageDeals.map(deal => deal.id)}
          strategy={verticalListSortingStrategy}
        >
          {stageDeals.map((deal) => {
            const client = clients.find(c => c.id === deal.clientId);
            return (
              <DealCard
                key={deal.id}
                deal={deal}
                client={client}
                onEdit={onEditDeal}
                onDelete={onDeleteDeal}
              />
            );
          })}
        </SortableContext>

        {/* Área de drop quando a coluna está vazia */}
        {stageDeals.length === 0 && (
          <div className="h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-500 text-sm">
            Arraste negócios aqui
          </div>
        )}
      </div>
    </div>
  );
};
