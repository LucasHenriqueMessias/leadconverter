'use client';

import { useState } from 'react';
import { Interaction } from '@/types';
import { 
  Phone, 
  Users, 
  MessageCircle, 
  Mail, 
  FileText,
  Clock,
  User,
  Calendar,
  ThumbsUp,
  ThumbsDown,
  Minus,
  Paperclip,
  Edit,
  Trash2
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface InteractionTimelineProps {
  interactions: Interaction[];
  onEdit?: (interaction: Interaction) => void;
  onDelete?: (interactionId: string) => void;
  canEdit?: boolean;
}

export const InteractionTimeline = ({ 
  interactions, 
  onEdit, 
  onDelete,
  canEdit = false 
}: InteractionTimelineProps) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const getInteractionIcon = (type: Interaction['type']) => {
    switch (type) {
      case 'call':
        return <Phone className="h-5 w-5" />;
      case 'meeting':
        return <Users className="h-5 w-5" />;
      case 'whatsapp':
        return <MessageCircle className="h-5 w-5" />;
      case 'email':
        return <Mail className="h-5 w-5" />;
      case 'note':
        return <FileText className="h-5 w-5" />;
      default:
        return <FileText className="h-5 w-5" />;
    }
  };

  const getInteractionColor = (type: Interaction['type']) => {
    switch (type) {
      case 'call':
        return 'bg-blue-100 text-blue-600';
      case 'meeting':
        return 'bg-purple-100 text-purple-600';
      case 'whatsapp':
        return 'bg-green-100 text-green-600';
      case 'email':
        return 'bg-orange-100 text-orange-600';
      case 'note':
        return 'bg-gray-100 text-gray-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const getInteractionLabel = (type: Interaction['type']) => {
    switch (type) {
      case 'call':
        return 'Ligação';
      case 'meeting':
        return 'Reunião';
      case 'whatsapp':
        return 'WhatsApp';
      case 'email':
        return 'E-mail';
      case 'note':
        return 'Nota';
      default:
        return type;
    }
  };

  const getOutcomeIcon = (outcome?: 'positive' | 'neutral' | 'negative') => {
    switch (outcome) {
      case 'positive':
        return <ThumbsUp className="h-4 w-4 text-green-600" />;
      case 'negative':
        return <ThumbsDown className="h-4 w-4 text-red-600" />;
      case 'neutral':
        return <Minus className="h-4 w-4 text-gray-600" />;
      default:
        return null;
    }
  };

  const sortedInteractions = [...interactions].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  if (interactions.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg">
        <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Nenhuma interação registrada
        </h3>
        <p className="text-gray-600">
          Comece registrando ligações, reuniões ou notas sobre este cliente.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {sortedInteractions.map((interaction, index) => {
        const isExpanded = expandedId === interaction.id;
        const isLast = index === sortedInteractions.length - 1;

        return (
          <div key={interaction.id} className="relative">
            {/* Linha vertical conectando os itens */}
            {!isLast && (
              <div className="absolute left-6 top-12 bottom-0 w-0.5 bg-gray-200" />
            )}

            <div className="flex gap-4">
              {/* Ícone do tipo de interação */}
              <div className={`flex-shrink-0 w-12 h-12 rounded-full ${getInteractionColor(interaction.type)} flex items-center justify-center relative z-10`}>
                {getInteractionIcon(interaction.type)}
              </div>

              {/* Conteúdo da interação */}
              <div className="flex-1 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="p-4">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                          {getInteractionLabel(interaction.type)}
                        </span>
                        {interaction.outcome && getOutcomeIcon(interaction.outcome)}
                      </div>
                      <h4 className="text-base font-semibold text-gray-900">
                        {interaction.subject}
                      </h4>
                    </div>

                    {canEdit && (
                      <div className="flex items-center gap-2 ml-4">
                        {onEdit && (
                          <button
                            onClick={() => onEdit(interaction)}
                            className="p-1 text-gray-400 hover:text-blue-600 rounded"
                            title="Editar"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                        )}
                        {onDelete && (
                          <button
                            onClick={() => {
                              if (confirm('Tem certeza que deseja excluir esta interação?')) {
                                onDelete(interaction.id);
                              }
                            }}
                            className="p-1 text-gray-400 hover:text-red-600 rounded"
                            title="Excluir"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Metadados */}
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-3">
                    <div className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      <span>{interaction.userName}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {new Date(interaction.date).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                    {interaction.duration && (
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{interaction.duration} min</span>
                      </div>
                    )}
                    <div className="text-xs text-gray-500">
                      {formatDistanceToNow(new Date(interaction.date), { 
                        addSuffix: true, 
                        locale: ptBR 
                      })}
                    </div>
                  </div>

                  {/* Descrição */}
                  <div className="text-sm text-gray-700 mb-3">
                    {isExpanded || interaction.description.length < 150 ? (
                      <p className="whitespace-pre-wrap">{interaction.description}</p>
                    ) : (
                      <>
                        <p className="whitespace-pre-wrap">
                          {interaction.description.substring(0, 150)}...
                        </p>
                        <button
                          onClick={() => setExpandedId(interaction.id)}
                          className="text-blue-600 hover:text-blue-700 text-sm font-medium mt-1"
                        >
                          Ver mais
                        </button>
                      </>
                    )}
                    {isExpanded && interaction.description.length > 150 && (
                      <button
                        onClick={() => setExpandedId(null)}
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium mt-1"
                      >
                        Ver menos
                      </button>
                    )}
                  </div>

                  {/* Próxima ação */}
                  {interaction.nextAction && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
                      <div className="flex items-start gap-2">
                        <div className="flex-shrink-0 mt-0.5">
                          <div className="w-2 h-2 bg-blue-600 rounded-full" />
                        </div>
                        <div>
                          <p className="text-xs font-medium text-blue-900 mb-1">
                            Próxima Ação
                          </p>
                          <p className="text-sm text-blue-800">
                            {interaction.nextAction}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Anexos */}
                  {interaction.attachments && interaction.attachments.length > 0 && (
                    <div className="border-t border-gray-200 pt-3">
                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                        <Paperclip className="h-4 w-4" />
                        <span className="font-medium">
                          {interaction.attachments.length} anexo(s)
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {interaction.attachments.map((attachment) => (
                          <a
                            key={attachment.id}
                            href={attachment.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm text-gray-700 border border-gray-200"
                          >
                            <Paperclip className="h-3 w-3" />
                            <span className="truncate max-w-[200px]">
                              {attachment.name}
                            </span>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};