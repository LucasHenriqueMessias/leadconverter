// constants/salesFunnel.ts
export const DEFAULT_STAGES = [
  {
    id: 'lead',
    name: 'Lead',
    color: 'bg-gray-500',
    order: 0,
    description: 'Contato inicial'
  },
  {
    id: 'qualified',
    name: 'Qualificado',
    color: 'bg-blue-500',
    order: 1,
    description: 'Lead qualificado'
  },
  {
    id: 'proposal',
    name: 'Proposta',
    color: 'bg-yellow-500',
    order: 2,
    description: 'Proposta enviada'
  },
  {
    id: 'negotiation',
    name: 'Negociação',
    color: 'bg-orange-500',
    order: 3,
    description: 'Em negociação'
  },
  {
    id: 'closed-won',
    name: 'Fechado - Ganho',
    color: 'bg-green-500',
    order: 4,
    description: 'Venda realizada'
  },
  {
    id: 'closed-lost',
    name: 'Fechado - Perdido',
    color: 'bg-red-500',
    order: 5,
    description: 'Venda perdida'
  }
];
