'use client';

import { useState, useEffect } from 'react';
import { Interaction } from '@/types';
import { 
  X, 
  Phone, 
  Users, 
  MessageCircle, 
  Mail, 
  FileText,
  Clock,
  ThumbsUp,
  ThumbsDown,
  Minus
} from 'lucide-react';

interface InteractionFormProps {
  interaction?: Interaction | null;
  clientId: string;
  dealId?: string;
  onSubmit: (data: Omit<Interaction, 'id' | 'organizationId' | 'userId' | 'userName' | 'createdAt' | 'updatedAt'>) => void;
  onClose: () => void;
}

export const InteractionForm = ({ 
  interaction, 
  clientId,
  dealId,
  onSubmit, 
  onClose 
}: InteractionFormProps) => {
  const [formData, setFormData] = useState({
    type: 'note' as Interaction['type'],
    subject: '',
    description: '',
    date: new Date().toISOString().slice(0, 16),
    duration: '',
    outcome: '' as '' | 'positive' | 'neutral' | 'negative',
    nextAction: '',
  });

  useEffect(() => {
    if (interaction) {
      setFormData({
        type: interaction.type,
        subject: interaction.subject,
        description: interaction.description,
        date: new Date(interaction.date).toISOString().slice(0, 16),
        duration: interaction.duration?.toString() || '',
        outcome: interaction.outcome || '',
        nextAction: interaction.nextAction || '',
      });
    }
  }, [interaction]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.subject.trim() || !formData.description.trim()) {
      alert('Por favor, preencha o assunto e a descrição.');
      return;
    }

    const interactionData: Omit<Interaction, 'id' | 'organizationId' | 'userId' | 'userName' | 'createdAt' | 'updatedAt'> = {
      clientId,
      dealId,
      type: formData.type,
      subject: formData.subject.trim(),
      description: formData.description.trim(),
      date: new Date(formData.date),
      duration: formData.duration ? parseInt(formData.duration) : undefined,
      outcome: formData.outcome || undefined,
      nextAction: formData.nextAction.trim() || undefined,
    };

    onSubmit(interactionData);
  };

  const interactionTypes = [
    { value: 'call', label: 'Ligação', icon: Phone, color: 'text-blue-600' },
    { value: 'meeting', label: 'Reunião', icon: Users, color: 'text-purple-600' },
    { value: 'whatsapp', label: 'WhatsApp', icon: MessageCircle, color: 'text-green-600' },
    { value: 'email', label: 'E-mail', icon: Mail, color: 'text-orange-600' },
    { value: 'note', label: 'Nota', icon: FileText, color: 'text-gray-600' },
  ];

  const outcomes = [
    { value: 'positive', label: 'Positivo', icon: ThumbsUp, color: 'text-green-600' },
    { value: 'neutral', label: 'Neutro', icon: Minus, color: 'text-gray-600' },
    { value: 'negative', label: 'Negativo', icon: ThumbsDown, color: 'text-red-600' },
  ];

  const showDuration = formData.type === 'call' || formData.type === 'meeting';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {interaction ? 'Editar Interação' : 'Nova Interação'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Tipo de Interação */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Tipo de Interação *
            </label>
            <div className="grid grid-cols-5 gap-2">
              {interactionTypes.map((type) => {
                const Icon = type.icon;
                const isSelected = formData.type === type.value;
                return (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, type: type.value as Interaction['type'] }))}
                    className={`flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Icon className={`h-6 w-6 ${isSelected ? 'text-blue-600' : type.color}`} />
                    <span className={`text-xs font-medium ${isSelected ? 'text-blue-900' : 'text-gray-700'}`}>
                      {type.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Assunto */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Assunto *
            </label>
            <input
              type="text"
              value={formData.subject}
              onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Ex: Apresentação da proposta comercial"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Data e Hora */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data e Hora *
              </label>
              <input
                type="datetime-local"
                value={formData.date}
                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            {/* Duração (apenas para ligações e reuniões) */}
            {showDuration && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duração (minutos)
                </label>
                <div className="relative">
                  <Clock className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                  <input
                    type="number"
                    value={formData.duration}
                    onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg pl-10 pr-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="30"
                    min="1"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Descrição */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descrição *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={5}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Descreva o que foi discutido, acordado ou observado..."
              required
            />
          </div>

          {/* Resultado */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Resultado da Interação
            </label>
            <div className="grid grid-cols-3 gap-3">
              {outcomes.map((outcome) => {
                const Icon = outcome.icon;
                const isSelected = formData.outcome === outcome.value;
                return (
                  <button
                    key={outcome.value}
                    type="button"
                    onClick={() => setFormData(prev => ({ 
                      ...prev, 
                      outcome: prev.outcome === outcome.value ? '' : outcome.value as any
                    }))}
                    className={`flex items-center justify-center gap-2 p-3 rounded-lg border-2 transition-all ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Icon className={`h-5 w-5 ${isSelected ? 'text-blue-600' : outcome.color}`} />
                    <span className={`text-sm font-medium ${isSelected ? 'text-blue-900' : 'text-gray-700'}`}>
                      {outcome.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Próxima Ação */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Próxima Ação
            </label>
            <input
              type="text"
              value={formData.nextAction}
              onChange={(e) => setFormData(prev => ({ ...prev, nextAction: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Ex: Enviar proposta por e-mail até sexta-feira"
            />
          </div>

          {/* Botões */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              {interaction ? 'Salvar' : 'Registrar Interação'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};