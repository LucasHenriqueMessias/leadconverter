import { Client, Deal, Interaction, LeadScore, ScoreFactor } from '@/types';

/**
 * Calcula o Lead Score de um cliente baseado em múltiplos fatores
 */
export function calculateLeadScore(
  client: Client,
  deals: Deal[],
  interactions: Interaction[]
): LeadScore {
  const factors: ScoreFactor[] = [];
  let totalScore = 0;

  // 1. ENGAGEMENT (30%) - Interações recentes
  const engagementScore = calculateEngagementScore(client, interactions);
  factors.push(engagementScore);
  totalScore += engagementScore.points;

  // 2. BEHAVIORAL (25%) - Comportamento de compra
  const behavioralScore = calculateBehavioralScore(client, deals);
  factors.push(behavioralScore);
  totalScore += behavioralScore.points;

  // 3. FIRMOGRAPHIC (25%) - Características da empresa
  const firmographicScore = calculateFirmographicScore(client);
  factors.push(firmographicScore);
  totalScore += firmographicScore.points;

  // 4. DEMOGRAPHIC (15%) - Dados demográficos
  const demographicScore = calculateDemographicScore(client);
  factors.push(demographicScore);
  totalScore += demographicScore.points;

  // 5. DEAL VALUE (5%) - Valor dos negócios
  const dealValueScore = calculateDealValueScore(deals);
  factors.push(dealValueScore);
  totalScore += dealValueScore.points;

  // Calcular grade baseado no score
  const grade = getGradeFromScore(totalScore);

  // Calcular tendência (comparar com score anterior se existir)
  const trend = 'stable'; // Por enquanto, pode ser calculado comparando com histórico

  // Gerar recomendações baseadas no score
  const recommendations = generateRecommendations(totalScore, factors, client, deals);

  return {
    clientId: client.id,
    organizationId: client.organizationId,
    score: Math.round(totalScore),
    grade,
    factors,
    lastCalculated: new Date(),
    trend,
    recommendations
  };
}

/**
 * Calcula pontuação de engagement (interações recentes)
 */
function calculateEngagementScore(
  client: Client,
  interactions: Interaction[]
): ScoreFactor {
  const maxPoints = 30;
  const now = new Date();
  
  // Filtrar interações dos últimos 30 dias
  const recentInteractions = interactions.filter(i => {
    const daysDiff = Math.floor((now.getTime() - i.date.getTime()) / (1000 * 60 * 60 * 24));
    return daysDiff <= 30;
  });

  let points = 0;
  let description = '';

  if (recentInteractions.length === 0) {
    points = 0;
    description = 'Sem interações nos últimos 30 dias';
  } else if (recentInteractions.length >= 5) {
    points = maxPoints;
    description = `${recentInteractions.length} interações nos últimos 30 dias - Excelente!`;
  } else if (recentInteractions.length >= 3) {
    points = maxPoints * 0.8;
    description = `${recentInteractions.length} interações nos últimos 30 dias - Bom`;
  } else {
    points = maxPoints * 0.5;
    description = `${recentInteractions.length} interação(ões) nos últimos 30 dias`;
  }

  return {
    category: 'engagement',
    name: 'Interações Recentes',
    points: Math.round(points),
    maxPoints,
    weight: 0.3,
    description
  };
}

/**
 * Calcula pontuação comportamental (deals ativos, histórico)
 */
function calculateBehavioralScore(
  client: Client,
  deals: Deal[]
): ScoreFactor {
  const maxPoints = 25;
  const clientDeals = deals.filter(d => d.clientId === client.id);
  
  let points = 0;
  let description = '';

  // Deals ativos (não fechados)
  const activeDeals = clientDeals.filter(d => 
    d.stage !== 'closed-won' && d.stage !== 'closed-lost'
  );

  // Deals ganhos
  const wonDeals = clientDeals.filter(d => d.stage === 'closed-won');

  if (activeDeals.length >= 2) {
    points += maxPoints * 0.6;
    description = `${activeDeals.length} negócios ativos`;
  } else if (activeDeals.length === 1) {
    points += maxPoints * 0.4;
    description = `${activeDeals.length} negócio ativo`;
  }

  if (wonDeals.length > 0) {
    points += maxPoints * 0.4;
    description += wonDeals.length > 0 ? `, ${wonDeals.length} negócio(s) ganho(s)` : '';
  }

  if (clientDeals.length === 0) {
    points = maxPoints * 0.2;
    description = 'Novo cliente, sem histórico de negócios';
  }

  return {
    category: 'behavioral',
    name: 'Comportamento de Compra',
    points: Math.round(points),
    maxPoints,
    weight: 0.25,
    description: description || 'Sem negócios'
  };
}

/**
 * Calcula pontuação firmográfica (segmento, tamanho)
 */
function calculateFirmographicScore(client: Client): ScoreFactor {
  const maxPoints = 25;
  let points = 0;
  let description = '';

  // Segmentos de alto valor
  const highValueSegments = ['Tecnologia', 'Saúde', 'Indústria', 'Serviços'];
  const mediumValueSegments = ['Varejo', 'Educação', 'Construção'];

  if (highValueSegments.includes(client.segment)) {
    points = maxPoints;
    description = `Segmento de alto valor: ${client.segment}`;
  } else if (mediumValueSegments.includes(client.segment)) {
    points = maxPoints * 0.7;
    description = `Segmento médio: ${client.segment}`;
  } else if (client.segment) {
    points = maxPoints * 0.5;
    description = `Segmento: ${client.segment}`;
  } else {
    points = maxPoints * 0.3;
    description = 'Segmento não informado';
  }

  return {
    category: 'firmographic',
    name: 'Perfil da Empresa',
    points: Math.round(points),
    maxPoints,
    weight: 0.25,
    description
  };
}

/**
 * Calcula pontuação demográfica (dados completos)
 */
function calculateDemographicScore(client: Client): ScoreFactor {
  const maxPoints = 15;
  let points = 0;
  let completeness = 0;

  // Verificar completude dos dados
  if (client.name) completeness++;
  if (client.email) completeness++;
  if (client.phone) completeness++;
  if (client.document) completeness++;
  if (client.segment) completeness++;
  if (client.notes) completeness++;

  points = (completeness / 6) * maxPoints;

  const description = `Dados ${Math.round((completeness / 6) * 100)}% completos (${completeness}/6 campos)`;

  return {
    category: 'demographic',
    name: 'Completude de Dados',
    points: Math.round(points),
    maxPoints,
    weight: 0.15,
    description
  };
}

/**
 * Calcula pontuação baseada no valor dos deals
 */
function calculateDealValueScore(deals: Deal[]): ScoreFactor {
  const maxPoints = 5;
  
  const totalValue = deals.reduce((sum, deal) => {
    if (deal.stage !== 'closed-lost') {
      return sum + deal.value;
    }
    return sum;
  }, 0);

  let points = 0;
  let description = '';

  if (totalValue >= 100000) {
    points = maxPoints;
    description = `Valor total alto: R$ ${totalValue.toLocaleString('pt-BR')}`;
  } else if (totalValue >= 50000) {
    points = maxPoints * 0.8;
    description = `Valor total médio: R$ ${totalValue.toLocaleString('pt-BR')}`;
  } else if (totalValue > 0) {
    points = maxPoints * 0.5;
    description = `Valor total: R$ ${totalValue.toLocaleString('pt-BR')}`;
  } else {
    points = 0;
    description = 'Sem negócios com valor';
  }

  return {
    category: 'custom',
    name: 'Valor dos Negócios',
    points: Math.round(points),
    maxPoints,
    weight: 0.05,
    description
  };
}

/**
 * Converte score numérico em grade (A-F)
 */
function getGradeFromScore(score: number): 'A' | 'B' | 'C' | 'D' | 'F' {
  if (score >= 85) return 'A';
  if (score >= 70) return 'B';
  if (score >= 50) return 'C';
  if (score >= 30) return 'D';
  return 'F';
}

/**
 * Gera recomendações baseadas no score e fatores
 */
function generateRecommendations(
  score: number,
  factors: ScoreFactor[],
  client: Client,
  deals: Deal[]
): string[] {
  const recommendations: string[] = [];

  // Recomendações baseadas no score geral
  if (score >= 85) {
    recommendations.push('🎯 Lead quente! Priorize contato imediato');
    recommendations.push('📞 Agende reunião de fechamento');
    recommendations.push('💰 Prepare proposta comercial detalhada');
  } else if (score >= 70) {
    recommendations.push('✅ Lead qualificado - mantenha contato regular');
    recommendations.push('📧 Envie materiais relevantes');
    recommendations.push('🤝 Agende demonstração do produto');
  } else if (score >= 50) {
    recommendations.push('⚠️ Lead morno - aumente o engajamento');
    recommendations.push('📚 Compartilhe conteúdo educativo');
    recommendations.push('🔄 Faça follow-up semanal');
  } else {
    recommendations.push('❄️ Lead frio - nurturing de longo prazo');
    recommendations.push('📨 Adicione em campanha de email marketing');
    recommendations.push('🔍 Qualifique melhor o interesse');
  }

  // Recomendações específicas por fator
  const engagementFactor = factors.find(f => f.category === 'engagement');
  if (engagementFactor && engagementFactor.points < 15) {
    recommendations.push('📱 Aumente frequência de contato - baixo engagement');
  }

  const demographicFactor = factors.find(f => f.category === 'demographic');
  if (demographicFactor && demographicFactor.points < 10) {
    recommendations.push('📝 Complete dados do cliente para melhor qualificação');
  }

  const activeDeals = deals.filter(d => 
    d.clientId === client.id && 
    d.stage !== 'closed-won' && 
    d.stage !== 'closed-lost'
  );
  
  if (activeDeals.length === 0 && score >= 60) {
    recommendations.push('💼 Cliente qualificado sem negócio ativo - crie oportunidade');
  }

  return recommendations.slice(0, 5); // Máximo 5 recomendações
}

/**
 * Calcula scores para múltiplos clientes
 */
export function calculateBulkLeadScores(
  clients: Client[],
  deals: Deal[],
  interactions: Interaction[]
): LeadScore[] {
  return clients.map(client => {
    const clientDeals = deals.filter(d => d.clientId === client.id);
    const clientInteractions = interactions.filter(i => i.clientId === client.id);
    
    return calculateLeadScore(client, clientDeals, clientInteractions);
  });
}
