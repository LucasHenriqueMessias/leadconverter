'use client';

import { useState } from 'react';
import { Zap, Plus, Play, Pause, Edit2, Trash2, Clock, Bell, Mail, CheckCircle } from 'lucide-react';

export const AutomationManager = () => {
  const [automations] = useState([
    {
      id: '1',
      name: 'Lembrete de Follow-up',
      description: 'Cria tarefa automática 3 dias após negócio ficar parado',
      active: true,
      trigger: 'Negócio sem atividade por 3 dias',
      action: 'Criar tarefa de follow-up',
      executions: 45,
    },
    {
      id: '2',
      name: 'Notificar Manager - SLA',
      description: 'Notifica gerente quando negócio está próximo do SLA',
      active: true,
      trigger: 'SLA em 80% do tempo limite',
      action: 'Enviar notificação para gerente',
      executions: 12,
    },
    {
      id: '3',
      name: 'Email de Boas-vindas',
      description: 'Envia email automático quando lead entra no funil',
      active: false,
      trigger: 'Novo negócio criado',
      action: 'Enviar email personalizado',
      executions: 0,
    },
  ]);

  const getActionIcon = (action: string) => {
    if (action.includes('tarefa')) return <CheckCircle className="h-4 w-4" />;
    if (action.includes('notificação')) return <Bell className="h-4 w-4" />;
    if (action.includes('email')) return <Mail className="h-4 w-4" />;
    return <Zap className="h-4 w-4" />;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Zap className="h-6 w-6 text-yellow-500" />
            Automações
          </h2>
          <p className="text-gray-600 mt-1">
            Configure ações automáticas para economizar tempo
          </p>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700">
          <Plus className="h-4 w-4" />
          <span>Nova Automação</span>
        </button>
      </div>

      {/* Lista de Automações */}
      <div className="space-y-3">
        {automations.map((automation) => (
          <div
            key={automation.id}
            className="bg-white rounded-lg shadow p-6 border-l-4"
            style={{ borderLeftColor: automation.active ? '#10B981' : '#94A3B8' }}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-semibold text-gray-900">{automation.name}</h3>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      automation.active
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {automation.active ? 'Ativa' : 'Pausada'}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-4">{automation.description}</p>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-start gap-2">
                    <Clock className="h-4 w-4 text-gray-400 mt-0.5" />
                    <div>
                      <div className="text-xs font-medium text-gray-700">Gatilho</div>
                      <div className="text-sm text-gray-900">{automation.trigger}</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    {getActionIcon(automation.action)}
                    <div>
                      <div className="text-xs font-medium text-gray-700">Ação</div>
                      <div className="text-sm text-gray-900">{automation.action}</div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 text-xs text-gray-500">
                  Executada {automation.executions} vezes
                </div>
              </div>

              <div className="flex items-center gap-2 ml-4">
                <button
                  className={`p-2 rounded-lg ${
                    automation.active
                      ? 'text-yellow-600 hover:bg-yellow-50'
                      : 'text-green-600 hover:bg-green-50'
                  }`}
                  title={automation.active ? 'Pausar' : 'Ativar'}
                >
                  {automation.active ? (
                    <Pause className="h-4 w-4" />
                  ) : (
                    <Play className="h-4 w-4" />
                  )}
                </button>
                <button className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg">
                  <Edit2 className="h-4 w-4" />
                </button>
                <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Templates de Automação */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">
          ⚡ Templates de Automação Prontos
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="h-4 w-4 text-blue-600" />
              <span className="font-medium text-sm">Follow-up Automático</span>
            </div>
            <p className="text-xs text-gray-600">
              Cria tarefa quando negócio fica 3+ dias sem atividade
            </p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-center gap-2 mb-2">
              <Bell className="h-4 w-4 text-yellow-600" />
              <span className="font-medium text-sm">Alerta de SLA</span>
            </div>
            <p className="text-xs text-gray-600">
              Notifica quando negócio está próximo do prazo limite
            </p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-center gap-2 mb-2">
              <Mail className="h-4 w-4 text-green-600" />
              <span className="font-medium text-sm">Email de Boas-vindas</span>
            </div>
            <p className="text-xs text-gray-600">
              Envia email automático para novos leads
            </p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="h-4 w-4 text-purple-600" />
              <span className="font-medium text-sm">Atribuição Inteligente</span>
            </div>
            <p className="text-xs text-gray-600">
              Distribui leads automaticamente entre vendedores
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
