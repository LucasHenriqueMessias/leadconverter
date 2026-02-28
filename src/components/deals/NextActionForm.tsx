'use client';

import { useState } from 'react';
import { NextAction } from '@/types';
import { Clock, AlertCircle, Phone, Mail, Video, MessageSquare, FileText, Users, Handshake } from 'lucide-react';

interface NextActionFormProps {
  nextAction?: NextAction;
  onChange: (action: Partial<NextAction>) => void;
  required?: boolean;
}

export const NextActionForm = ({ nextAction, onChange, required = false }: NextActionFormProps) => {
  const [type, setType] = useState<NextAction['type']>(nextAction?.type || 'follow-up');
  const [title, setTitle] = useState(nextAction?.title || '');
  const [description, setDescription] = useState(nextAction?.description || '');
  const [dueDate, setDueDate] = useState(
    nextAction?.dueDate ? new Date(nextAction.dueDate).toISOString().slice(0, 16) : ''
  );
  const [priority, setPriority] = useState<NextAction['priority']>(nextAction?.priority || 'medium');

  const handleChange = () => {
    onChange({
      type,
      title,
      description,
      dueDate: dueDate ? new Date(dueDate) : new Date(),
      priority,
      completed: false,
      reminderSent: false,
    });
  };

  const actionTypes = [
    { value: 'call', label: 'Ligação', icon: Phone, color: 'blue' },
    { value: 'meeting', label: 'Reunião', icon: Users, color: 'purple' },
    { value: 'email', label: 'Email', icon: Mail, color: 'green' },
    { value: 'whatsapp', label: 'WhatsApp', icon: MessageSquare, color: 'emerald' },
    { value: 'proposal', label: 'Enviar Proposta', icon: FileText, color: 'yellow' },
    { value: 'follow-up', label: 'Follow-up', icon: Clock, color: 'orange' },
    { value: 'demo', label: 'Demonstração', icon: Video, color: 'pink' },
    { value: 'negotiation', label: 'Negociação', icon: Handshake, color: 'indigo' },
  ];

  return (
    <div className="bg-gradient-to-r from-orange-50 to-red-50 border-2 border-orange-300 rounded-lg p-6">
      <div className="flex items-center gap-2 mb-4">
        <AlertCircle className="h-5 w-5 text-orange-600" />
        <h3 className="text-lg font-semibold text-gray-900">
          Próxima Ação {required && <span className="text-red-500">*</span>}
        </h3>
      </div>
      <p className="text-sm text-gray-600 mb-4">
        Defina a próxima ação para manter o negócio em movimento
      </p>

      <div className="space-y-4">
        {/* Tipo de Ação */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tipo de Ação {required && <span className="text-red-500">*</span>}
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {actionTypes.map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.value}
                  type="button"
                  onClick={() => {
                    setType(action.value as NextAction['type']);
                    handleChange();
                  }}
                  className={`flex items-center gap-2 p-3 rounded-lg border-2 transition-all ${
                    type === action.value
                      ? `border-${action.color}-500 bg-${action.color}-50`
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <Icon className={`h-4 w-4 ${
                    type === action.value ? `text-${action.color}-600` : 'text-gray-400'
                  }`} />
                  <span className={`text-sm font-medium ${
                    type === action.value ? `text-${action.color}-900` : 'text-gray-700'
                  }`}>
                    {action.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Título */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Título {required && <span className="text-red-500">*</span>}
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              handleChange();
            }}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            placeholder="Ex: Ligar para apresentar proposta"
            required={required}
          />
        </div>

        {/* Descrição */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Descrição
          </label>
          <textarea
            value={description}
            onChange={(e) => {
              setDescription(e.target.value);
              handleChange();
            }}
            rows={2}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            placeholder="Detalhes da ação..."
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Data/Hora */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Data e Hora {required && <span className="text-red-500">*</span>}
            </label>
            <input
              type="datetime-local"
              value={dueDate}
              onChange={(e) => {
                setDueDate(e.target.value);
                handleChange();
              }}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              required={required}
            />
          </div>

          {/* Prioridade */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Prioridade
            </label>
            <select
              value={priority}
              onChange={(e) => {
                setPriority(e.target.value as NextAction['priority']);
                handleChange();
              }}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            >
              <option value="low">Baixa</option>
              <option value="medium">Média</option>
              <option value="high">Alta</option>
              <option value="urgent">Urgente</option>
            </select>
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="mt-4 p-3 bg-white rounded-lg border border-orange-200">
        <p className="text-xs text-gray-600">
          💡 <strong>Dica:</strong> Definir a próxima ação garante que nenhum negócio fique parado.
          Você receberá lembretes automáticos quando a ação estiver próxima do prazo.
        </p>
      </div>
    </div>
  );
};
