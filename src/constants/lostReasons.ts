import { LostReasonOption } from '@/types';

export const LOST_REASONS: LostReasonOption[] = [
  {
    id: 'price',
    label: 'Preço',
    description: 'Nosso preço estava acima do orçamento ou da concorrência',
    requiresDetails: true,
  },
  {
    id: 'competitor',
    label: 'Concorrência',
    description: 'Cliente escolheu um concorrente',
    requiresCompetitor: true,
    requiresDetails: true,
  },
  {
    id: 'timing',
    label: 'Timing',
    description: 'Momento não era adequado para o cliente',
    requiresDetails: true,
  },
  {
    id: 'no-budget',
    label: 'Sem Orçamento',
    description: 'Cliente não tinha orçamento disponível',
    requiresDetails: false,
  },
  {
    id: 'bad-fit',
    label: 'Falta de Fit',
    description: 'Nossa solução não atendia as necessidades do cliente',
    requiresDetails: true,
  },
  {
    id: 'no-decision',
    label: 'Sem Decisão',
    description: 'Cliente não conseguiu tomar uma decisão',
    requiresDetails: true,
  },
  {
    id: 'internal-decision',
    label: 'Decisão Interna',
    description: 'Decisão interna do cliente (política, mudança de prioridade, etc)',
    requiresDetails: true,
  },
  {
    id: 'no-response',
    label: 'Sem Resposta',
    description: 'Cliente parou de responder/ghosting',
    requiresDetails: false,
  },
  {
    id: 'project-cancelled',
    label: 'Projeto Cancelado',
    description: 'Cliente cancelou o projeto/iniciativa',
    requiresDetails: true,
  },
  {
    id: 'other',
    label: 'Outro',
    description: 'Outro motivo não listado',
    requiresDetails: true,
  },
];

// Helper para obter label do motivo
export const getLostReasonLabel = (reasonId: string): string => {
  const reason = LOST_REASONS.find(r => r.id === reasonId);
  return reason?.label || reasonId;
};

// Helper para obter descrição do motivo
export const getLostReasonDescription = (reasonId: string): string => {
  const reason = LOST_REASONS.find(r => r.id === reasonId);
  return reason?.description || '';
};

// Cores para visualização
export const LOST_REASON_COLORS: Record<string, string> = {
  price: 'bg-red-100 text-red-800',
  competitor: 'bg-orange-100 text-orange-800',
  timing: 'bg-yellow-100 text-yellow-800',
  'no-budget': 'bg-purple-100 text-purple-800',
  'bad-fit': 'bg-pink-100 text-pink-800',
  'no-decision': 'bg-indigo-100 text-indigo-800',
  'internal-decision': 'bg-blue-100 text-blue-800',
  'no-response': 'bg-gray-100 text-gray-800',
  'project-cancelled': 'bg-red-100 text-red-800',
  other: 'bg-gray-100 text-gray-800',
};