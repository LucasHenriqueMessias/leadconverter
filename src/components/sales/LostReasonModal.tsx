'use client';

import { useState } from 'react';
import { Deal, LostReason } from '@/types';
import { LOST_REASONS } from '@/constants/lostReasons';
import { 
  X, 
  AlertCircle, 
  DollarSign, 
  Users, 
  Clock, 
  TrendingDown,
  XCircle,
  MessageSquare,
  FileX,
  HelpCircle
} from 'lucide-react';

interface LostReasonModalProps {
  deal: Deal;
  onSubmit: (data: {
    lostReason: LostReason;
    lostReasonDetails?: string;
    lostToCompetitor?: string;
  }) => void;
  onClose: () => void;
}

export const LostReasonModal = ({ deal, onSubmit, onClose }: LostReasonModalProps) => {
  const [selectedReason, setSelectedReason] = useState<LostReason | null>(null);
  const [details, setDetails] = useState('');
  const [competitor, setCompetitor] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedReason) {
      alert('Por favor, selecione um motivo de perda.');
      return;
    }

    const reasonConfig = LOST_REASONS.find(r => r.id === selectedReason);
    
    if (reasonConfig?.requiresDetails && !details.trim()) {
      alert('Por favor, forneça detalhes sobre o motivo da perda.');
      return;
    }

    if (reasonConfig?.requiresCompetitor && !competitor.trim()) {
      alert('Por favor, informe qual concorrente ganhou.');
      return;
    }

    onSubmit({
      lostReason: selectedReason,
      lostReasonDetails: details.trim() || undefined,
      lostToCompetitor: competitor.trim() || undefined,
    });
  };

  const getReasonIcon = (reasonId: LostReason) => {
    switch (reasonId) {
      case 'price':
        return <DollarSign className="h-5 w-5" />;
      case 'competitor':
        return <Users className="h-5 w-5" />;
      case 'timing':
        return <Clock className="h-5 w-5" />;
      case 'no-budget':
        return <TrendingDown className="h-5 w-5" />;
      case 'bad-fit':
        return <XCircle className="h-5 w-5" />;
      case 'no-decision':
        return <MessageSquare className="h-5 w-5" />;
      case 'internal-decision':
        return <AlertCircle className="h-5 w-5" />;
      case 'no-response':
        return <MessageSquare className="h-5 w-5" />;
      case 'project-cancelled':
        return <FileX className="h-5 w-5" />;
      case 'other':
        return <HelpCircle className="h-5 w-5" />;
      default:
        return <AlertCircle className="h-5 w-5" />;
    }
  };

  const selectedReasonConfig = selectedReason 
    ? LOST_REASONS.find(r => r.id === selectedReason)
    : null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-start p-6 border-b border-gray-200 bg-red-50">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="h-6 w-6 text-red-600" />
              <h2 className="text-xl font-semibold text-gray-900">
                Marcar Negócio como Perdido
              </h2>
            </div>
            <p className="text-sm text-gray-600">
              <span className="font-medium">{deal.title}</span> • R$ {deal.value.toLocaleString('pt-BR')}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Alerta */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex gap-3">
              <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-yellow-900 mb-1">
                  Por que isso é importante?
                </h3>
                <p className="text-sm text-yellow-800">
                  Entender por que perdemos negócios nos ajuda a melhorar. 
                  Seja honesto e específico - isso se torna inteligência comercial valiosa.
                </p>
              </div>
            </div>
          </div>

          {/* Seleção de Motivo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Por que perdemos este negócio? *
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {LOST_REASONS.map((reason) => {
                const Icon = getReasonIcon(reason.id);
                const isSelected = selectedReason === reason.id;
                
                return (
                  <button
                    key={reason.id}
                    type="button"
                    onClick={() => setSelectedReason(reason.id)}
                    className={`flex items-start gap-3 p-4 rounded-lg border-2 transition-all text-left ${
                      isSelected
                        ? 'border-red-500 bg-red-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className={`flex-shrink-0 ${isSelected ? 'text-red-600' : 'text-gray-600'}`}>
                      {Icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={`text-sm font-medium mb-1 ${isSelected ? 'text-red-900' : 'text-gray-900'}`}>
                        {reason.label}
                      </div>
                      <div className={`text-xs ${isSelected ? 'text-red-700' : 'text-gray-600'}`}>
                        {reason.description}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Campo de Concorrente (se necessário) */}
          {selectedReasonConfig?.requiresCompetitor && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Qual concorrente ganhou? *
              </label>
              <input
                type="text"
                value={competitor}
                onChange={(e) => setCompetitor(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="Ex: Empresa XYZ, Concorrente ABC..."
                required
              />
              <p className="text-xs text-gray-600 mt-2">
                Saber quem está ganhando nos ajuda a entender nossos pontos fracos.
              </p>
            </div>
          )}

          {/* Detalhes (se necessário) */}
          {selectedReasonConfig?.requiresDetails && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Detalhes adicionais {selectedReasonConfig.requiresDetails ? '*' : '(opcional)'}
              </label>
              <textarea
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                rows={4}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="Explique com mais detalhes o que aconteceu..."
                required={selectedReasonConfig.requiresDetails}
              />
              <p className="text-xs text-gray-600 mt-2">
                Quanto mais específico, mais útil para análise futura.
              </p>
            </div>
          )}

          {/* Detalhes opcionais para outros motivos */}
          {selectedReason && !selectedReasonConfig?.requiresDetails && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Detalhes adicionais (opcional)
              </label>
              <textarea
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="Adicione qualquer informação relevante..."
              />
            </div>
          )}

          {/* Resumo */}
          {selectedReason && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-900 mb-2">Resumo</h3>
              <div className="space-y-2 text-sm text-gray-700">
                <div>
                  <span className="font-medium">Negócio:</span> {deal.title}
                </div>
                <div>
                  <span className="font-medium">Valor:</span> R$ {deal.value.toLocaleString('pt-BR')}
                </div>
                <div>
                  <span className="font-medium">Motivo:</span> {selectedReasonConfig?.label}
                </div>
                {competitor && (
                  <div>
                    <span className="font-medium">Concorrente:</span> {competitor}
                  </div>
                )}
              </div>
            </div>
          )}

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
              disabled={!selectedReason}
              className={`px-4 py-2 rounded-lg font-medium ${
                selectedReason
                  ? 'bg-red-600 text-white hover:bg-red-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              Confirmar Perda
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};