// constants/salesFunnel.ts
export const DEFAULT_STAGES = [
  {
    id: 'lead',
    name: 'Lead',
    color: 'bg-gray-500',
    order: 0,
    probability: 10,
    description: 'Contato inicial recebido',
    requirements: ['Informações de contato coletadas']
  },
  {
    id: 'qualified',
    name: 'Qualificado',
    color: 'bg-blue-500',
    order: 1,
    probability: 25,
    description: 'Lead qualificado com dor identificada',
    requirements: ['Dor validada', 'Decisor identificado', 'Budget confirmado']
  },
  {
    id: 'proposal',
    name: 'Proposta',
    color: 'bg-yellow-500',
    order: 2,
    probability: 50,
    description: 'Proposta enviada e apresentada',
    requirements: ['Escopo definido', 'Valor estimado', 'Proposta apresentada']
  },
  {
    id: 'negotiation',
    name: 'Negociação',
    color: 'bg-orange-500',
    order: 3,
    probability: 75,
    description: 'Em processo de negociação',
    requirements: ['Objeções identificadas', 'Condições negociadas']
  },
  {
    id: 'closed-won',
    name: 'Fechado - Ganho',
    color: 'bg-green-500',
    order: 4,
    probability: 100,
    description: 'Venda realizada com sucesso',
    requirements: ['Contrato assinado', 'Pagamento confirmado']
  },
  {
    id: 'closed-lost',
    name: 'Fechado - Perdido',
    color: 'bg-red-500',
    order: 5,
    probability: 0,
    description: 'Venda perdida',
    requirements: ['Motivo de perda documentado']
  }
];

export const LOSS_REASONS = [
  'Preço muito alto',
  'Timing inadequado',
  'Perdeu para concorrente',
  'Falta de fit com produto',
  'Decisão interna cancelada',
  'Budget insuficiente',
  'Processo muito longo',
  'Falta de urgência',
  'Mudança de prioridades',
  'Outro'
];

export const WIN_REASONS = [
  'Melhor preço',
  'Melhor produto/serviço',
  'Relacionamento',
  'Timing perfeito',
  'Proposta diferenciada',
  'Suporte técnico',
  'Referência/indicação',
  'Urgência do cliente',
  'Outro'
];
