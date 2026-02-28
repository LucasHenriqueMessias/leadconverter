'use client';

import { useState, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Client, Deal, Interaction, ScoringRule } from '@/types';
import { calculateBulkScoresByRules, DEFAULT_SCORING_RULES } from '@/utils/ruleBasedScoring';
import { ScoringRuleForm } from './ScoringRuleForm';
import { 
  TrendingUp, TrendingDown, Minus, Award, Plus, Edit2, Trash2, Power, Lightbulb, Settings
} from 'lucide-react';

interface LeadScoringViewProps {
  clients: Client[];
  deals: Deal[];
}

export const LeadScoringView = ({ clients, deals }: LeadScoringViewProps) => {
  const { organization } = useAuth();
  const [activeTab, setActiveTab] = useState<'scores' | 'rules'>('scores');
  const [isRuleFormOpen, setIsRuleFormOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<ScoringRule | null>(null);

  // Mock de interações - em produção viria do Firestore
  const interactions: Interaction[] = [];

  // Regras de pontuação - em produção viria do Firestore
  // Por enquanto usando estado local, depois salvar no Firestore
  const [scoringRules, setScoringRules] = useState<ScoringRule[]>(DEFAULT_SCORING_RULES);

  // Calcular scores reais baseado nas REGRAS configuradas
  const leadScores = useMemo(() => {
    const scores = calculateBulkScoresByRules(clients, deals, interactions, scoringRules);
    
    // Ordenar por score (maior primeiro)
    return scores
      .sort((a, b) => b.score - a.score)
      .map(score => {
        const client = clients.find(c => c.id === score.clientId);
        return {
          ...score,
          clientName: client?.name || 'Cliente Desconhecido'
        };
      });
  }, [clients, deals, interactions, scoringRules]);

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A': return 'bg-green-100 text-green-800 border-green-300';
      case 'B': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'C': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'D': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'F': return 'bg-red-100 text-red-800 border-red-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'down': return <TrendingDown className="h-4 w-4 text-red-600" />;
      default: return <Minus className="h-4 w-4 text-gray-600" />;
    }
  };

  // Se não há clientes, mostrar mensagem
  if (clients.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Lead Scoring</h2>
            <p className="text-gray-600 mt-1">
              Priorize leads com pontuação baseada em regras
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-12 text-center">
          <Award className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Nenhum cliente cadastrado
          </h3>
          <p className="text-gray-600">
            Cadastre clientes para ver a pontuação de leads automaticamente.
          </p>
        </div>
      </div>
    );
  }

  // Funções de gerenciamento de regras
  const handleAddRule = (ruleData: Omit<ScoringRule, 'id' | 'organizationId' | 'createdAt' | 'updatedAt'>) => {
    const newRule: ScoringRule = {
      ...ruleData,
      id: `rule-${Date.now()}`,
      organizationId: organization?.id || '',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    setScoringRules([...scoringRules, newRule]);
    setIsRuleFormOpen(false);
    setEditingRule(null);
  };

  const handleUpdateRule = (ruleData: Omit<ScoringRule, 'id' | 'organizationId' | 'createdAt' | 'updatedAt'>) => {
    if (!editingRule) return;
    
    setScoringRules(scoringRules.map(rule =>
      rule.id === editingRule.id
        ? { ...rule, ...ruleData, updatedAt: new Date() }
        : rule
    ));
    
    setIsRuleFormOpen(false);
    setEditingRule(null);
  };

  const handleDeleteRule = (ruleId: string) => {
    if (!confirm('Tem certeza que deseja excluir esta regra?')) return;
    setScoringRules(scoringRules.filter(rule => rule.id !== ruleId));
  };

  const handleToggleRule = (ruleId: string) => {
    setScoringRules(scoringRules.map(rule =>
      rule.id === ruleId
        ? { ...rule, active: !rule.active, updatedAt: new Date() }
        : rule
    ));
  };

  const openEditForm = (rule: ScoringRule) => {
    setEditingRule(rule);
    setIsRuleFormOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Lead Scoring</h2>
          <p className="text-gray-600 mt-1">
            Priorize leads com pontuação baseada em regras
          </p>
        </div>
        {activeTab === 'rules' && (
          <button
            onClick={() => {
              setEditingRule(null);
              setIsRuleFormOpen(true);
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            <span>Nova Regra</span>
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('scores')}
            className={`
              py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2
              ${activeTab === 'scores'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }
            `}
          >
            <Award className="h-5 w-5" />
            <span>Scores</span>
          </button>
          <button
            onClick={() => setActiveTab('rules')}
            className={`
              py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2
              ${activeTab === 'rules'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }
            `}
          >
            <Lightbulb className="h-5 w-5" />
            <span>Regras</span>
          </button>
        </nav>
      </div>

      {/* Scores View */}
      {activeTab === 'scores' && (
        <div className="space-y-4">
          {leadScores.map((lead) => (
            <div key={lead.clientId} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <div className={`px-4 py-2 rounded-lg border-2 ${getGradeColor(lead.grade)}`}>
                    <div className="text-3xl font-bold">{lead.grade}</div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-lg">{lead.clientName}</h3>
                    <div className="flex items-center space-x-3 mt-1">
                      <span className="text-2xl font-bold text-gray-900">{lead.score}</span>
                      <span className="text-gray-600">/ 100</span>
                      {getTrendIcon(lead.trend)}
                      {lead.previousScore && (
                        <span className="text-sm text-gray-600">
                          ({lead.trend === 'up' ? '+' : ''}{lead.score - lead.previousScore})
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Score Factors */}
              <div className="space-y-3 mb-4">
                {lead.factors.map((factor, idx) => (
                  <div key={idx}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="font-medium text-gray-700">{factor.name}</span>
                      <span className="text-gray-600">{factor.points}/{factor.maxPoints}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{ width: `${(factor.points / factor.maxPoints) * 100}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{factor.description}</p>
                  </div>
                ))}
              </div>

              {/* Recommendations */}
              {lead.recommendations.length > 0 && (
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2 flex items-center space-x-2">
                    <Lightbulb className="h-4 w-4 text-blue-600" />
                    <span>Recomendações</span>
                  </h4>
                  <ul className="space-y-1">
                    {lead.recommendations.map((rec, idx) => (
                      <li key={idx} className="text-sm text-gray-700 flex items-start space-x-2">
                        <span className="text-blue-600 mt-0.5">•</span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Rules View */}
      {activeTab === 'rules' && (
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Regras de Pontuação</h3>
              <span className="text-sm text-gray-600">
                {scoringRules.filter(r => r.active).length} de {scoringRules.length} ativas
              </span>
            </div>
            
            {scoringRules.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">Nenhuma regra configurada</p>
                <button
                  onClick={() => {
                    setEditingRule(null);
                    setIsRuleFormOpen(true);
                  }}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Criar primeira regra
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {scoringRules.map((rule) => (
                  <div
                    key={rule.id}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="font-medium text-gray-900">{rule.name}</h4>
                          <span className={`px-2 py-1 rounded text-xs ${
                            rule.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {rule.active ? 'Ativa' : 'Inativa'}
                          </span>
                          <span className="px-2 py-1 rounded text-xs bg-blue-100 text-blue-800">
                            {rule.category}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{rule.description}</p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span>Pontos: <strong className="text-gray-900">{rule.points}</strong></span>
                          <span>Peso: <strong className="text-gray-900">{(rule.weight * 100).toFixed(0)}%</strong></span>
                          <span>Condições: <strong className="text-gray-900">{rule.conditions.length}</strong></span>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2 ml-4">
                        <button
                          onClick={() => handleToggleRule(rule.id)}
                          className={`p-2 rounded hover:bg-gray-100 ${
                            rule.active ? 'text-green-600' : 'text-gray-400'
                          }`}
                          title={rule.active ? 'Desativar' : 'Ativar'}
                        >
                          <Power className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => openEditForm(rule)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                          title="Editar"
                        >
                          <Edit2 className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteRule(rule.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded"
                          title="Excluir"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <div className="flex items-start space-x-3">
                <Lightbulb className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-blue-900 mb-1">Como funciona</h4>
                  <p className="text-sm text-blue-800">
                    O score é calculado <strong>SOMENTE</strong> com base nas regras ativas acima. 
                    Cada regra contribui com seus pontos multiplicados pelo peso. 
                    O score final é normalizado para 0-100.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Formulário de Regra */}
      {isRuleFormOpen && (
        <ScoringRuleForm
          rule={editingRule}
          onSubmit={editingRule ? handleUpdateRule : handleAddRule}
          onClose={() => {
            setIsRuleFormOpen(false);
            setEditingRule(null);
          }}
        />
      )}
    </div>
  );
};
