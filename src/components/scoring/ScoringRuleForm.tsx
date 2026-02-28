'use client';

import { useState } from 'react';
import { ScoringRule, ScoringCondition } from '@/types';
import { X, Plus, Trash2 } from 'lucide-react';

interface ScoringRuleFormProps {
  rule: ScoringRule | null;
  onSubmit: (ruleData: Omit<ScoringRule, 'id' | 'organizationId' | 'createdAt' | 'updatedAt'>) => void;
  onClose: () => void;
}

const AVAILABLE_FIELDS = [
  { value: 'client.name', label: 'Nome do Cliente', type: 'text' },
  { value: 'client.email', label: 'Email', type: 'text' },
  { value: 'client.phone', label: 'Telefone', type: 'text' },
  { value: 'client.segment', label: 'Segmento', type: 'text' },
  { value: 'client.document', label: 'CPF/CNPJ', type: 'text' },
  { value: 'activeDealsCount', label: 'Número de Negócios Ativos', type: 'number' },
  { value: 'wonDealsCount', label: 'Número de Negócios Ganhos', type: 'number' },
  { value: 'totalDealsValue', label: 'Valor Total dos Negócios', type: 'number' },
  { value: 'recentInteractionsCount', label: 'Interações nos Últimos 30 Dias', type: 'number' },
  { value: 'lastInteractionDays', label: 'Dias Desde Última Interação', type: 'number' },
  { value: 'dataCompleteness', label: 'Completude de Dados (%)', type: 'number' }
];

const OPERATORS = [
  { value: 'equals', label: 'Igual a', types: ['text', 'number'] },
  { value: 'not_equals', label: 'Diferente de', types: ['text', 'number'] },
  { value: 'greater_than', label: 'Maior que', types: ['number'] },
  { value: 'less_than', label: 'Menor que', types: ['number'] },
  { value: 'contains', label: 'Contém', types: ['text'] },
  { value: 'between', label: 'Entre', types: ['number'] }
];

const CATEGORIES = [
  { value: 'engagement', label: 'Engajamento' },
  { value: 'behavioral', label: 'Comportamental' },
  { value: 'firmographic', label: 'Firmográfico' },
  { value: 'demographic', label: 'Demográfico' },
  { value: 'custom', label: 'Personalizado' }
];

export const ScoringRuleForm = ({ rule, onSubmit, onClose }: ScoringRuleFormProps) => {
  const [formData, setFormData] = useState({
    name: rule?.name || '',
    description: rule?.description || '',
    active: rule?.active ?? true,
    category: rule?.category || 'custom',
    points: rule?.points || 10,
    weight: rule?.weight || 0.1,
    conditions: rule?.conditions || [
      { field: 'activeDealsCount', operator: 'greater_than', value: 0 }
    ] as ScoringCondition[]
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleAddCondition = () => {
    setFormData({
      ...formData,
      conditions: [
        ...formData.conditions,
        { field: 'activeDealsCount', operator: 'greater_than', value: 0 }
      ]
    });
  };

  const handleRemoveCondition = (index: number) => {
    setFormData({
      ...formData,
      conditions: formData.conditions.filter((_, i) => i !== index)
    });
  };

  const handleConditionChange = (index: number, field: keyof ScoringCondition, value: any) => {
    const newConditions = [...formData.conditions];
    newConditions[index] = { ...newConditions[index], [field]: value };
    setFormData({ ...formData, conditions: newConditions });
  };

  const getFieldType = (fieldValue: string): string => {
    const field = AVAILABLE_FIELDS.find(f => f.value === fieldValue);
    return field?.type || 'text';
  };

  const getAvailableOperators = (fieldValue: string) => {
    const fieldType = getFieldType(fieldValue);
    return OPERATORS.filter(op => op.types.includes(fieldType));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-6 border-b border-gray-200 flex-shrink-0">
          <h3 className="text-lg font-semibold text-gray-900">
            {rule ? 'Editar Regra' : 'Nova Regra de Pontuação'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Informações Básicas */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Informações Básicas</h4>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome da Regra *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ex: Cliente VIP"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descrição
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Descreva quando esta regra se aplica..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Categoria
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.active}
                      onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Regra Ativa</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Pontuação */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Pontuação</h4>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pontos *
                  </label>
                  <input
                    type="number"
                    value={formData.points}
                    onChange={(e) => setFormData({ ...formData, points: Number(e.target.value) })}
                    required
                    min="1"
                    max="100"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">Pontos concedidos quando a regra se aplica</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Peso (0-1) *
                  </label>
                  <input
                    type="number"
                    value={formData.weight}
                    onChange={(e) => setFormData({ ...formData, weight: Number(e.target.value) })}
                    required
                    min="0"
                    max="1"
                    step="0.05"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Importância da regra (ex: 0.3 = 30%)
                  </p>
                </div>
              </div>
            </div>

            {/* Condições */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-gray-900">Condições</h4>
                <button
                  type="button"
                  onClick={handleAddCondition}
                  className="text-sm text-blue-600 hover:text-blue-700 flex items-center space-x-1"
                >
                  <Plus className="h-4 w-4" />
                  <span>Adicionar Condição</span>
                </button>
              </div>

              {formData.conditions.map((condition, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">
                      Condição {index + 1}
                    </span>
                    {formData.conditions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveCondition(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Campo
                      </label>
                      <select
                        value={condition.field}
                        onChange={(e) => handleConditionChange(index, 'field', e.target.value)}
                        className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        {AVAILABLE_FIELDS.map(field => (
                          <option key={field.value} value={field.value}>
                            {field.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Operador
                      </label>
                      <select
                        value={condition.operator}
                        onChange={(e) => handleConditionChange(index, 'operator', e.target.value)}
                        className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        {getAvailableOperators(condition.field).map(op => (
                          <option key={op.value} value={op.value}>
                            {op.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Valor
                      </label>
                      <input
                        type={getFieldType(condition.field) === 'number' ? 'number' : 'text'}
                        value={condition.value}
                        onChange={(e) => handleConditionChange(index, 'value', 
                          getFieldType(condition.field) === 'number' ? Number(e.target.value) : e.target.value
                        )}
                        className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  {index < formData.conditions.length - 1 && (
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Operador Lógico
                      </label>
                      <select
                        value={condition.logicalOperator || 'AND'}
                        onChange={(e) => handleConditionChange(index, 'logicalOperator', e.target.value)}
                        className="w-32 px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="AND">E (AND)</option>
                        <option value="OR">OU (OR)</option>
                      </select>
                    </div>
                  )}
                </div>
              ))}

              <div className="bg-blue-50 rounded-lg p-3">
                <p className="text-xs text-blue-800">
                  <strong>Dica:</strong> Use múltiplas condições para criar regras mais específicas. 
                  Com AND, todas as condições devem ser verdadeiras. Com OR, apenas uma precisa ser verdadeira.
                </p>
              </div>
            </div>
          </div>

          <div className="flex space-x-3 p-6 border-t border-gray-200 flex-shrink-0 bg-white">
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500"
            >
              {rule ? 'Atualizar Regra' : 'Criar Regra'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 focus:ring-2 focus:ring-gray-500"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
