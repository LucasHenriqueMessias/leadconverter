'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { IntegrationConfig } from '@/types';
import { MessageSquare, Mail, Phone, Zap, Plus, Settings, Power, AlertCircle, CheckCircle } from 'lucide-react';

export const IntegrationsManager = () => {
  const [activeTab, setActiveTab] = useState<'whatsapp' | 'email' | 'telephony' | 'webhooks'>('whatsapp');

  // Mock data - em produção viria do Firestore
  const integrations: IntegrationConfig[] = [];

  const integrationTypes = [
    {
      id: 'whatsapp',
      name: 'WhatsApp',
      icon: MessageSquare,
      description: 'Conecte seu WhatsApp Business para enviar e receber mensagens',
      color: 'bg-green-500',
      providers: ['Evolution API', 'Twilio', 'Baileys', 'WPPConnect']
    },
    {
      id: 'email',
      name: 'Email',
      icon: Mail,
      description: 'Sincronize emails e envie campanhas automatizadas',
      color: 'bg-blue-500',
      providers: ['Gmail', 'Outlook', 'SMTP', 'SendGrid']
    },
    {
      id: 'telephony',
      name: 'Telefonia',
      icon: Phone,
      description: 'Integre com sistemas de telefonia para gravar e transcrever ligações',
      color: 'bg-purple-500',
      providers: ['Twilio', 'Vonage', 'Plivo', 'Asterisk']
    },
    {
      id: 'webhooks',
      name: 'Webhooks',
      icon: Zap,
      description: 'Configure webhooks para integrar com outras ferramentas',
      color: 'bg-orange-500',
      providers: ['Zapier', 'Make', 'n8n', 'Custom']
    }
  ];

  const activeIntegration = integrationTypes.find(i => i.id === activeTab);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Integrações</h2>
          <p className="text-gray-600 mt-1">
            Conecte suas ferramentas favoritas para automatizar seu fluxo de trabalho
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {integrationTypes.map((type) => {
            const Icon = type.icon;
            return (
              <button
                key={type.id}
                onClick={() => setActiveTab(type.id as any)}
                className={`
                  py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2
                  ${activeTab === type.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                <Icon className="h-5 w-5" />
                <span>{type.name}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Content */}
      <div className="bg-white rounded-lg shadow">
        {/* Header */}
        <div className={`${activeIntegration?.color} text-white p-6 rounded-t-lg`}>
          {activeIntegration && (
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-4">
                <div className="bg-white bg-opacity-20 p-3 rounded-lg">
                  <activeIntegration.icon className="h-8 w-8" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">{activeIntegration.name}</h3>
                  <p className="text-white text-opacity-90 mt-1">
                    {activeIntegration.description}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Providers */}
        <div className="p-6">
          <h4 className="font-semibold text-gray-900 mb-4">Provedores Disponíveis</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeIntegration?.providers.map((provider) => (
              <div
                key={provider}
                className="border border-gray-200 rounded-lg p-4 hover:border-blue-500 hover:shadow-md transition-all cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="font-medium text-gray-900">{provider}</h5>
                    <p className="text-sm text-gray-600 mt-1">
                      Configure sua conta {provider}
                    </p>
                  </div>
                  <button className="text-blue-600 hover:text-blue-700">
                    <Settings className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Integrations List */}
          <div className="mt-8">
            <h4 className="font-semibold text-gray-900 mb-4">Integrações Configuradas</h4>
            {integrations.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <Zap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Nenhuma integração configurada ainda</p>
              </div>
            ) : (
              <div className="space-y-3">
                {integrations
                  .filter(i => i.type === activeTab)
                  .map((integration) => (
                    <div
                      key={integration.id}
                      className="border border-gray-200 rounded-lg p-4 flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-4">
                        <div className={`p-2 rounded-lg ${
                          integration.status === 'active' ? 'bg-green-100' :
                          integration.status === 'error' ? 'bg-red-100' : 'bg-gray-100'
                        }`}>
                          {integration.status === 'active' ? (
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          ) : integration.status === 'error' ? (
                            <AlertCircle className="h-5 w-5 text-red-600" />
                          ) : (
                            <Power className="h-5 w-5 text-gray-600" />
                          )}
                        </div>
                        <div>
                          <h5 className="font-medium text-gray-900">{integration.name}</h5>
                          <p className="text-sm text-gray-600">
                            {integration.status === 'active' && 'Ativo'}
                            {integration.status === 'error' && `Erro: ${integration.errorMessage}`}
                            {integration.status === 'disabled' && 'Desativado'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button className="p-2 text-gray-600 hover:text-gray-900">
                          <Settings className="h-5 w-5" />
                        </button>
                        <button className="p-2 text-gray-600 hover:text-gray-900">
                          <Power className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="bg-blue-100 p-3 rounded-lg w-fit mb-4">
            <MessageSquare className="h-6 w-6 text-blue-600" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">Comunicação Unificada</h3>
          <p className="text-sm text-gray-600">
            Centralize todas as conversas com clientes em um só lugar
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="bg-green-100 p-3 rounded-lg w-fit mb-4">
            <Zap className="h-6 w-6 text-green-600" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">Automação Inteligente</h3>
          <p className="text-sm text-gray-600">
            Crie fluxos automáticos baseados em eventos e ações
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="bg-purple-100 p-3 rounded-lg w-fit mb-4">
            <Phone className="h-6 w-6 text-purple-600" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">Histórico Completo</h3>
          <p className="text-sm text-gray-600">
            Registre automaticamente todas as interações com clientes
          </p>
        </div>
      </div>
    </div>
  );
};
