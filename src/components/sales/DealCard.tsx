'use client';

import { Deal, Client } from '@/types';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { User, DollarSign, Calendar, Percent, Trash2, Edit } from 'lucide-react';

interface DealCardProps {
  deal: Deal;
  client: Client | undefined;
  onEdit: (deal: Deal) => void;
  onDelete: (dealId: string) => void;
}

export const DealCard = ({ deal, client, onEdit, onDelete }: DealCardProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: deal.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onEdit(deal);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onDelete(deal.id);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`
        bg-white rounded-lg shadow-sm border border-gray-200 p-4 relative group
        hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing
        ${isDragging ? 'opacity-50 cursor-grabbing' : 'opacity-100'}
      `}
    >
      {/* Botões de ação - com eventos que param a propagação */}
      <div 
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10"
        onPointerDown={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex space-x-1">
          <button
            onClick={handleEdit}
            className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded cursor-pointer"
            title="Editar"
          >
            <Edit className="h-3 w-3" />
          </button>
          <button
            onClick={handleDelete}
            className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded cursor-pointer"
            title="Excluir"
          >
            <Trash2 className="h-3 w-3" />
          </button>
        </div>
      </div>

      {/* Conteúdo do card */}
      <div className="space-y-3">
        <div>
          <h3 className="font-medium text-gray-900 text-sm truncate pr-8">
            {deal.title}
          </h3>
          <div className="flex items-center text-xs text-gray-500 mt-1">
            <User className="h-3 w-3 mr-1" />
            <span className="truncate">{client?.name || 'Cliente não encontrado'}</span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center text-green-600">
              <DollarSign className="h-3 w-3 mr-1" />
              <span className="font-medium">
                R$ {deal.value.toLocaleString('pt-BR')}
              </span>
            </div>
            <div className="flex items-center text-gray-500">
              <Percent className="h-3 w-3 mr-1" />
              <span>{deal.probability}%</span>
            </div>
          </div>

          <div className="flex items-center text-xs text-gray-500">
            <Calendar className="h-3 w-3 mr-1" />
            <span>
              {new Date(deal.expectedCloseDate).toLocaleDateString('pt-BR')}
            </span>
          </div>
        </div>

        {deal.notes && (
          <div className="text-xs text-gray-600 truncate">
            {deal.notes}
          </div>
        )}
      </div>
    </div>
  );
};
