import { Client, Deal, AIInsight, LeadScore } from '@/types';

/**
 * Gera insights de IA baseados em dados reais
 */
export function generateAIInsights(
  clients: Client[],
  deals: Deal[],
  leadScores: LeadScore[],
  organizationId: string
): AIInsight[] {
  const insights: AIInsight[] = [];

  // 1. Identificar oportunidades (leads com score alto)
  const highScoreLeads = leadScores.filter(score => score.score >= 80);
  highScoreLeads.forEach(score => {
    const client = clients.find(c => c.id === score.clientId);
    const clientDeals = deals.filter(d => d.clientId === score.clientId);
    const activeDeals = clientDeals.filter(d => 
      d.stage !== 'closed-won' && d.stage !== 'closed-lost'
    );

    if (client && activeDeals.length > 0) {
      insights.push({
        id: `opportunity-${score.clientId}`,
        organizationId,
        entityType: 'client',
        entityId: score.clientId,
        type: 'opportunity',
        title: 'Alta probabilidade de conversão',
        description: `${client.name} tem score ${score.score} (Grade ${score.grade}). ${activeDeals.length} negócio(s) ativo(s) com alto potencial de fechamento.`,
        confidence: score.score / 100,
        priority: 'high',
        actionable: true,
        suggestedActions: [
          'Agendar reunião de fechamento esta semana',
          'Preparar proposta comercial detalhada',
          'Oferecer condições especiais para fechamento rápido'
        ],
        dismissed: false,
        createdAt: new Date()
      });
    }
  });

  // 2. Identificar riscos (deals parados há muito tempo)
  const now = new Date();
  deals.forEach(deal => {
    if (deal.stage !== 'closed-won' && deal.stage !== 'closed-lost') {
      const daysSinceUpdate = Math.floor(
        (now.getTime() - deal.updatedAt.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (daysSinceUpdate >= 7) {
        const client = clients.find(c => c.id === deal.clientId);
        const riskLevel = daysSinceUpdate >= 14 ? 'critical' : 'high';
        
        insights.push({
          id: `risk-${deal.id}`,
          organizationId,
          entityType: 'deal',
          entityId: deal.id,
          type: 'risk',
          title: 'Negócio sem atividade',
          description: `Negócio "${deal.title}" com ${client?.name || 'cliente'} está ${daysSinceUpdate} dias sem atualização. Risco de perda aumenta significativamente.`,
          confidence: Math.min(0.9, daysSinceUpdate / 20),
          priority: riskLevel,
          actionable: true,
          suggestedActions: [
            'Entrar em contato imediatamente',
            'Verificar se há objeções não resolvidas',
            'Oferecer suporte adicional',
            'Revisar proposta e condições'
          ],
          dismissed: false,
          createdAt: new Date()
        });
      }
    }
  });

  // 3. Identificar clientes inativos com potencial
  const inactiveHighValueClients = leadScores.filter(score => {
    const client = clients.find(c => c.id === score.clientId);
    const clientDeals = deals.filter(d => d.clientId === score.clientId);
    const activeDeals = clientDeals.filter(d => 
      d.stage !== 'closed-won' && d.stage !== 'closed-lost'
    );
    
    // Cliente com score médio/alto mas sem deals ativos
    return score.score >= 50 && activeDeals.length === 0 && client;
  });

  inactiveHighValueClients.forEach(score => {
    const client = clients.find(c => c.id === score.clientId);
    if (!client) return;

    insights.push({
      id: `inactive-${score.clientId}`,
      organizationId,
      entityType: 'client',
      entityId: score.clientId,
      type: 'opportunity',
      title: 'Cliente qualificado sem negócio ativo',
      description: `${client.name} tem score ${score.score} (Grade ${score.grade}) mas não possui negócios ativos. Oportunidade de criar nova proposta.`,
      confidence: 0.75,
      priority: 'medium',
      actionable: true,
      suggestedActions: [
        'Criar novo negócio/oportunidade',
        'Agendar reunião para entender necessidades atuais',
        'Apresentar novos produtos ou serviços',
        'Verificar se há projetos futuros'
      ],
      dismissed: false,
      createdAt: new Date()
    });
  });

  // 4. Análise de pipeline (recomendações gerais)
  const totalDeals = deals.length;
  const activeDeals = deals.filter(d => 
    d.stage !== 'closed-won' && d.stage !== 'closed-lost'
  );
  const wonDeals = deals.filter(d => d.stage === 'closed-won');
  const lostDeals = deals.filter(d => d.stage === 'closed-lost');

  if (totalDeals > 0) {
    const conversionRate = wonDeals.length / totalDeals;
    
    if (conversionRate < 0.3 && totalDeals >= 10) {
      insights.push({
        id: 'pipeline-conversion',
        organizationId,
        entityType: 'organization',
        entityId: organizationId,
        type: 'recommendation',
        title: 'Taxa de conversão abaixo do ideal',
        description: `Sua taxa de conversão está em ${(conversionRate * 100).toFixed(1)}%. A média do mercado é 30-40%. Há oportunidade de melhoria no processo de vendas.`,
        confidence: 0.85,
        priority: 'medium',
        actionable: true,
        suggestedActions: [
          'Revisar critérios de qualificação de leads',
          'Treinar equipe em técnicas de fechamento',
          'Analisar motivos de perda mais comuns',
          'Implementar follow-up mais estruturado'
        ],
        dismissed: false,
        createdAt: new Date()
      });
    }

    // Análise de tempo de resposta
    const dealsWithoutActivity = activeDeals.filter(deal => {
      const daysSinceUpdate = Math.floor(
        (now.getTime() - deal.updatedAt.getTime()) / (1000 * 60 * 60 * 24)
      );
      return daysSinceUpdate >= 3;
    });

    if (dealsWithoutActivity.length >= 3) {
      insights.push({
        id: 'response-time',
        organizationId,
        entityType: 'organization',
        entityId: organizationId,
        type: 'recommendation',
        title: 'Múltiplos negócios precisam de atenção',
        description: `${dealsWithoutActivity.length} negócios ativos estão há 3+ dias sem atualização. Follow-up rápido aumenta conversão em até 40%.`,
        confidence: 0.92,
        priority: 'high',
        actionable: true,
        suggestedActions: [
          'Criar regra de automação para lembretes',
          'Definir SLA de resposta (ex: 24h)',
          'Distribuir negócios entre equipe',
          'Implementar rotina diária de follow-up'
        ],
        dismissed: false,
        createdAt: new Date()
      });
    }
  }

  // 5. Identificar clientes com dados incompletos mas alto potencial
  const incompleteHighValueClients = leadScores.filter(score => {
    const demographicFactor = score.factors.find(f => f.category === 'demographic');
    return score.score >= 60 && demographicFactor && demographicFactor.points < 12;
  });

  if (incompleteHighValueClients.length >= 3) {
    insights.push({
      id: 'data-quality',
      organizationId,
      entityType: 'organization',
      entityId: organizationId,
      type: 'recommendation',
      title: 'Oportunidade de melhorar qualificação',
      description: `${incompleteHighValueClients.length} clientes com bom potencial têm dados incompletos. Completar cadastros pode revelar mais oportunidades.`,
      confidence: 0.80,
      priority: 'low',
      actionable: true,
      suggestedActions: [
        'Solicitar informações faltantes por email',
        'Completar dados durante próximas interações',
        'Criar checklist de qualificação',
        'Usar formulários mais completos'
      ],
      dismissed: false,
      createdAt: new Date()
    });
  }

  // Ordenar por prioridade e confiança
  return insights.sort((a, b) => {
    const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
    const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
    if (priorityDiff !== 0) return priorityDiff;
    return b.confidence - a.confidence;
  });
}

/**
 * Filtra insights não descartados
 */
export function getActiveInsights(insights: AIInsight[]): AIInsight[] {
  return insights.filter(i => !i.dismissed);
}

/**
 * Conta insights por prioridade
 */
export function countInsightsByPriority(insights: AIInsight[]): {
  critical: number;
  high: number;
  medium: number;
  low: number;
} {
  return {
    critical: insights.filter(i => i.priority === 'critical').length,
    high: insights.filter(i => i.priority === 'high').length,
    medium: insights.filter(i => i.priority === 'medium').length,
    low: insights.filter(i => i.priority === 'low').length
  };
}
