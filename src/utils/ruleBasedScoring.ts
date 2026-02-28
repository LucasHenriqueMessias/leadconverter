import { Client, Deal, Interaction, LeadScore, ScoreFactor, ScoringRule } from '@/types';

/**
 * Calcula o Lead Score baseado SOMENTE nas regras configuradas
 */
export function calculateScoreByRules(
  client: Client,
  deals: Deal[],
  interactions: Interaction[],
  rules: ScoringRule[]
): LeadScore {
  const factors: ScoreFactor[] = [];
  let totalScore = 0;
  let totalMaxPoints = 0;

  // Filtrar apenas regras ativas
  const activeRules = rules.filter(rule => rule.active);

  // Calcular o máximo possível considerando TODAS as regras ativas
  activeRules.forEach(rule => {
    totalMaxPoints += rule.points * rule.weight;
  });

  // Aplicar cada regra
  activeRules.forEach(rule => {
    const result = evaluateRule(rule, client, deals, interactions);
    
    if (result.applies) {
      factors.push({
        category: rule.category,
        name: rule.name,
        points: result.points,
        maxPoints: rule.points,
        weight: rule.weight,
        description: result.description
      });

      totalScore += result.points * rule.weight;
    } else {
      // Adicionar fator com 0 pontos para mostrar que não se aplicou
      factors.push({
        category: rule.category,
        name: rule.name,
        points: 0,
        maxPoints: rule.points,
        weight: rule.weight,
        description: 'Condição não atendida'
      });
    }
  });

  // Normalizar score para 0-100
  const normalizedScore = totalMaxPoints > 0 
    ? (totalScore / totalMaxPoints) * 100 
    : 0;

  // Calcular grade baseado no score
  const grade = getGradeFromScore(normalizedScore);

  // Gerar recomendações baseadas no score e fatores
  const recommendations = generateRecommendations(normalizedScore, factors, client, deals);

  return {
    clientId: client.id,
    organizationId: client.organizationId,
    score: Math.round(normalizedScore),
    grade,
    factors,
    lastCalculated: new Date(),
    trend: 'stable',
    recommendations
  };
}

/**
 * Avalia se uma regra se aplica e calcula os pontos
 */
function evaluateRule(
  rule: ScoringRule,
  client: Client,
  deals: Deal[],
  interactions: Interaction[]
): { applies: boolean; points: number; description: string } {
  // Verificar todas as condições da regra
  const allConditionsMet = rule.conditions.every((condition, index) => {
    const conditionMet = evaluateCondition(condition, client, deals, interactions);
    
    // Se não é a primeira condição, verificar operador lógico
    if (index > 0 && rule.conditions[index - 1].logicalOperator === 'OR') {
      // Com OR, basta uma condição ser verdadeira
      return true;
    }
    
    return conditionMet;
  });

  if (!allConditionsMet) {
    return { applies: false, points: 0, description: '' };
  }

  // Regra se aplica, calcular pontos e descrição
  const description = generateRuleDescription(rule, client, deals, interactions);
  
  return {
    applies: true,
    points: rule.points,
    description
  };
}

/**
 * Avalia uma condição específica
 */
function evaluateCondition(
  condition: any,
  client: Client,
  deals: Deal[],
  interactions: Interaction[]
): boolean {
  const { field, operator, value } = condition;

  // Obter o valor do campo
  const fieldValue = getFieldValue(field, client, deals, interactions);

  // Avaliar baseado no operador
  switch (operator) {
    case 'equals':
      return fieldValue === value;
    
    case 'not_equals':
      return fieldValue !== value;
    
    case 'greater_than':
      return Number(fieldValue) > Number(value);
    
    case 'less_than':
      return Number(fieldValue) < Number(value);
    
    case 'contains':
      return String(fieldValue).toLowerCase().includes(String(value).toLowerCase());
    
    case 'between':
      if (Array.isArray(value) && value.length === 2) {
        const numValue = Number(fieldValue);
        return numValue >= Number(value[0]) && numValue <= Number(value[1]);
      }
      return false;
    
    default:
      return false;
  }
}

/**
 * Obtém o valor de um campo para avaliação
 */
function getFieldValue(
  field: string,
  client: Client,
  deals: Deal[],
  interactions: Interaction[]
): any {
  // Campos do cliente
  if (field.startsWith('client.')) {
    const clientField = field.replace('client.', '');
    return (client as any)[clientField];
  }

  // Campos calculados de deals
  if (field === 'activeDealsCount') {
    return deals.filter(d => d.clientId === client.id && 
      d.stage !== 'closed-won' && d.stage !== 'closed-lost').length;
  }

  if (field === 'wonDealsCount') {
    return deals.filter(d => d.clientId === client.id && d.stage === 'closed-won').length;
  }

  if (field === 'totalDealsValue') {
    return deals
      .filter(d => d.clientId === client.id && d.stage !== 'closed-lost')
      .reduce((sum, d) => sum + d.value, 0);
  }

  // Campos calculados de interações
  if (field === 'recentInteractionsCount') {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    return interactions.filter(i => 
      i.clientId === client.id && i.date >= thirtyDaysAgo
    ).length;
  }

  if (field === 'lastInteractionDays') {
    const clientInteractions = interactions
      .filter(i => i.clientId === client.id)
      .sort((a, b) => b.date.getTime() - a.date.getTime());
    
    if (clientInteractions.length === 0) return 999;
    
    const now = new Date();
    const lastInteraction = clientInteractions[0].date;
    return Math.floor((now.getTime() - lastInteraction.getTime()) / (1000 * 60 * 60 * 24));
  }

  // Campos de completude
  if (field === 'dataCompleteness') {
    let filled = 0;
    if (client.name) filled++;
    if (client.email) filled++;
    if (client.phone) filled++;
    if (client.document) filled++;
    if (client.segment) filled++;
    if (client.notes) filled++;
    return (filled / 6) * 100;
  }

  return null;
}

/**
 * Gera descrição legível da regra aplicada
 */
function generateRuleDescription(
  rule: ScoringRule,
  client: Client,
  deals: Deal[],
  interactions: Interaction[]
): string {
  // Usar a descrição da regra como base
  let description = rule.description;

  // Adicionar valores específicos do cliente
  rule.conditions.forEach(condition => {
    const fieldValue = getFieldValue(condition.field, client, deals, interactions);
    
    if (condition.field === 'recentInteractionsCount') {
      description += ` (${fieldValue} interações)`;
    } else if (condition.field === 'activeDealsCount') {
      description += ` (${fieldValue} negócio${fieldValue !== 1 ? 's' : ''})`;
    } else if (condition.field === 'totalDealsValue') {
      description += ` (R$ ${Number(fieldValue).toLocaleString('pt-BR')})`;
    } else if (condition.field === 'client.segment') {
      description += ` (${fieldValue})`;
    }
  });

  return description;
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
 * Gera recomendações baseadas no score
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

  // Recomendações específicas baseadas em fatores com baixa pontuação
  factors.forEach(factor => {
    const percentage = (factor.points / factor.maxPoints) * 100;
    
    if (percentage < 50) {
      if (factor.category === 'engagement') {
        recommendations.push('📱 Aumente frequência de contato - baixo engagement');
      } else if (factor.category === 'demographic') {
        recommendations.push('📝 Complete dados do cliente para melhor qualificação');
      } else if (factor.category === 'behavioral') {
        recommendations.push('💼 Crie oportunidades de negócio');
      }
    }
  });

  return recommendations.slice(0, 5);
}

/**
 * Calcula scores para múltiplos clientes usando regras
 */
export function calculateBulkScoresByRules(
  clients: Client[],
  deals: Deal[],
  interactions: Interaction[],
  rules: ScoringRule[]
): LeadScore[] {
  return clients.map(client => {
    const clientDeals = deals.filter(d => d.clientId === client.id);
    const clientInteractions = interactions.filter(i => i.clientId === client.id);
    
    return calculateScoreByRules(client, clientDeals, clientInteractions, rules);
  });
}

/**
 * Regras padrão do sistema
 */
export const DEFAULT_SCORING_RULES: ScoringRule[] = [
  {
    id: 'rule-1',
    organizationId: '',
    name: 'Interação Recente',
    description: 'Pontos por interações nos últimos 7 dias',
    active: true,
    category: 'engagement',
    conditions: [
      {
        field: 'lastInteractionDays',
        operator: 'less_than',
        value: 7
      }
    ],
    points: 25,
    weight: 0.3,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'rule-2',
    organizationId: '',
    name: 'Empresa Grande',
    description: 'Pontos para empresas com mais de 100 funcionários',
    active: true,
    category: 'firmographic',
    conditions: [
      {
        field: 'client.segment',
        operator: 'equals',
        value: 'Tecnologia'
      }
    ],
    points: 20,
    weight: 0.25,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'rule-3',
    organizationId: '',
    name: 'Múltiplos Produtos',
    description: 'Interesse em mais de 2 produtos',
    active: true,
    category: 'behavioral',
    conditions: [
      {
        field: 'activeDealsCount',
        operator: 'greater_than',
        value: 1
      }
    ],
    points: 15,
    weight: 0.2,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];
