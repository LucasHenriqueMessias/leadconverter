'use client';

import { useState } from 'react';
import { Client, Tag } from '@/types';
import { X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { CustomFieldRenderer } from '@/components/customFields/CustomFieldRenderer';
import { TagSelector } from '@/components/tags/TagSelector';

interface ClientFormProps {
  client: Client | null;
  onSubmit: (clientData: Omit<Client, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => void;
  onClose: () => void;
}

export const ClientForm = ({ client, onSubmit, onClose }: ClientFormProps) => {
  const { organization } = useAuth();
  const [formData, setFormData] = useState({
    name: client?.name || '',
    email: client?.email || '',
    phone: client?.phone || '',
    document: client?.document || '',
    segment: client?.segment || '',
    notes: client?.notes || '',
    tags: client?.tags || [],
    customFields: client?.customFields || {},
  });

  // Obter campos customizados para clientes
  const customFields = organization?.settings?.customFields?.filter(
    field => field.entity === 'client'
  ) || [];

  // Mock de tags disponíveis - em produção viria do Firestore
  const availableTags: Tag[] = [
    {
      id: '1',
      organizationId: organization?.id || '',
      name: 'VIP',
      color: '#FFD700',
      category: 'status',
      description: 'Clientes de alto valor',
      entityTypes: ['client', 'deal'],
      usageCount: 45,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: '2',
      organizationId: organization?.id || '',
      name: 'Inbound',
      color: '#3B82F6',
      category: 'origem',
      description: 'Lead que veio por marketing',
      entityTypes: ['client', 'deal'],
      usageCount: 156,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: '3',
      organizationId: organization?.id || '',
      name: 'Produto A',
      color: '#10B981',
      category: 'produto',
      description: 'Interessado no Produto A',
      entityTypes: ['client', 'deal'],
      usageCount: 89,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: '4',
      organizationId: organization?.id || '',
      name: 'Quente',
      color: '#F59E0B',
      category: 'interesse',
      description: 'Lead com alto interesse',
      entityTypes: ['client', 'deal'],
      usageCount: 67,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      organizationId: organization?.id || '',
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleCustomFieldChange = (fieldId: string, value: any) => {
    setFormData({
      ...formData,
      customFields: {
        ...formData.customFields,
        [fieldId]: value,
      },
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-6 border-b border-gray-200 flex-shrink-0">
          <h3 className="text-lg font-semibold text-gray-900">
            {client ? 'Editar Cliente' : 'Novo Cliente'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome *
              </label>
              <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Telefone *
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              placeholder="(11) 99999-9999"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              CPF/CNPJ
            </label>
            <input
              type="text"
              name="document"
              value={formData.document}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Segmento
            </label>
            <select
              name="segment"
              value={formData.segment}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Selecione um segmento</option>
              <option value="Varejo">Varejo</option>
              <option value="Serviços">Serviços</option>
              <option value="Indústria">Indústria</option>
              <option value="Tecnologia">Tecnologia</option>
              <option value="Saúde">Saúde</option>
              <option value="Educação">Educação</option>
              <option value="Alimentação">Alimentação</option>
              <option value="Construção">Construção</option>
              <option value="Outro">Outro</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Observações
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Anotações sobre o cliente..."
            />
          </div>

          {/* Tags */}
          <TagSelector
            selectedTags={formData.tags}
            availableTags={availableTags}
            onChange={(tags) => setFormData({ ...formData, tags })}
            entityType="client"
          />

          {/* Campos Customizados */}
          {customFields.length > 0 && (
            <div className="pt-4 border-t border-gray-200">
              <h4 className="text-sm font-semibold text-gray-900 mb-4">
                Informações Adicionais
              </h4>
              <div className="space-y-4">
                {customFields.map((field) => (
                  <CustomFieldRenderer
                    key={field.id}
                    field={field}
                    value={formData.customFields[field.id]}
                    onChange={(value) => handleCustomFieldChange(field.id, value)}
                  />
                ))}
              </div>
            </div>
          )}
          </div>

          <div className="flex space-x-3 pt-4 border-t border-gray-200 p-6 flex-shrink-0 bg-white">
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500"
            >
              {client ? 'Atualizar' : 'Criar'}
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
