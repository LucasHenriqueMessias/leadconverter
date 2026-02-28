'use client';

import { Client } from '@/types';
import { X, User, Mail, Phone, FileText, Building, Calendar, History } from 'lucide-react';
import { ClientInteractions } from '../interactions/ClientInteractions';
import { WhatsAppButton } from '../integrations/WhatsAppButton';
import { useState } from 'react';

interface ClientDetailsModalProps {
  client: Client;
  onClose: () => void;
  onEdit: () => void;
}

export const ClientDetailsModal = ({ client, onClose, onEdit }: ClientDetailsModalProps) => {
  const [activeTab, setActiveTab] = useState<'info' | 'history'>('info');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
              <User className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{client.name}</h2>
              <p className="text-sm text-gray-600">{client.segment}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <WhatsAppButton
              phoneNumber={client.phone}
              clientName={client.name}
            />
            <button
              onClick={onEdit}
              className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg"
            >
              Editar
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <div className="flex px-6">
            <button
              onClick={() => setActiveTab('info')}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'info'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                <span>Informações</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'history'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center gap-2">
                <History className="h-4 w-4" />
                <span>Histórico</span>
              </div>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'info' ? (
            <div className="space-y-6">
              {/* Informações de Contato */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-4">Informações de Contato</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3">
                    <Mail className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-600">E-mail</p>
                      <p className="text-sm text-gray-900">{client.email}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Phone className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-600">Telefone</p>
                      <p className="text-sm text-gray-900">{client.phone}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Informações da Empresa */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-4">Informações da Empresa</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3">
                    <Building className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-600">Segmento</p>
                      <p className="text-sm text-gray-900">{client.segment}</p>
                    </div>
                  </div>
                  {client.document && (
                    <div className="flex items-start gap-3">
                      <FileText className="h-5 w-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-xs text-gray-600">CPF/CNPJ</p>
                        <p className="text-sm text-gray-900">{client.document}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Observações */}
              {client.notes && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-4">Observações</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{client.notes}</p>
                  </div>
                </div>
              )}

              {/* Datas */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-4">Informações do Sistema</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-600">Cadastrado em</p>
                      <p className="text-sm text-gray-900">
                        {new Date(client.createdAt).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-600">Última atualização</p>
                      <p className="text-sm text-gray-900">
                        {new Date(client.updatedAt).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <ClientInteractions client={client} />
          )}
        </div>
      </div>
    </div>
  );
};