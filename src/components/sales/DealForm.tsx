'use client';

import { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { Deal, Client, User } from '@/types';
import { X, User as UserIcon } from 'lucide-react';
import { DEFAULT_STAGES } from '@/constants/salesFunnel';
import { CustomFieldRenderer } from '@/components/customFields/CustomFieldRenderer';

interface DealFormProps {
  deal: Deal | null;
  clients: Client[];
  initialStage?: string;
  onSubmit: (dealData: Omit<Deal, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onClose: () => void;
}

export const DealForm = ({ deal, clients, initialStage, onSubmit, onClose }: DealFormProps) => {
  const { user: currentUser, isAdmin, isManager, organization } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [formData, setFormData] = useState({
    clientId: deal?.clientId || '',
    userId: deal?.userId || currentUser?.id || '',
    title: deal?.title || '',
    value: deal?.value || 0,
    stage: deal?.stage || initialStage || 'lead',
    probability: deal?.probability || 50,
    funnelId: deal?.funnelId || 'funnel_inbound',
    expectedCloseDate: deal?.expectedCloseDate 
      ? new Date(deal.expectedCloseDate).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0],
    notes: deal?.notes || '',
    customFields: deal?.customFields || {},
  });

  // Obter campos customizados para negócios
  const customFields = organization?.settings?.customFields?.filter(
    field => field.entity === 'deal'
  ) || [];

  // Carregar usuários se for admin ou manager
  useEffect(() => {
    const fetchUsers = async () => {
      if (!currentUser?.organizationId || !db || (!isAdmin && !isManager)) {
        return;
      }

      try {
        const usersQuery = query(
          collection(db, 'users'),
          where('organizationId', '==', currentUser.organizationId),
          where('approved', '==', true)
        );
        
        const snapshot = await getDocs(usersQuery);
        const usersData = snapshot.docs.map(doc => ({
          ...doc.data(),
          id: doc.id,
        })) as User[];
        
        setUsers(usersData);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    fetchUsers();
  }, [currentUser, isAdmin, isManager]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      organizationId: currentUser?.organizationId || '',
      funnelId: formData.funnelId || 'funnel_inbound',
      customFields: formData.customFields,
      tags: [],
      expectedCloseDate: new Date(formData.expectedCloseDate),
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'value' || name === 'probability' ? Number(value) : value,
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
    <div className="fixed inset-0 bg-transparent flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-gray-900">
            {deal ? 'Editar Negócio' : 'Novo Negócio'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Seleção de Usuário (apenas para admins/managers) */}
          {(isAdmin || isManager) && users.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <UserIcon className="inline h-4 w-4 mr-1" />
                Responsável
              </label>
              <select
                name="userId"
                value={formData.userId}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Selecione um usuário</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name} ({user.role})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cliente *
            </label>
            <select
              name="clientId"
              value={formData.clientId}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Selecione um cliente</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Título do Negócio *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              placeholder="Ex: Desenvolvimento de Website"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Valor (R$) *
              </label>
              <input
                type="number"
                name="value"
                value={formData.value}
                onChange={handleChange}
                required
                min="0"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Probabilidade (%)
              </label>
              <input
                type="number"
                name="probability"
                value={formData.probability}
                onChange={handleChange}
                min="0"
                max="100"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Estágio
            </label>
            <select
              name="stage"
              value={formData.stage}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {DEFAULT_STAGES.map((stage) => (
                <option key={stage.id} value={stage.id}>
                  {stage.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Data Prevista de Fechamento
            </label>
            <input
              type="date"
              name="expectedCloseDate"
              value={formData.expectedCloseDate}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
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
              placeholder="Detalhes sobre o negócio..."
            />
          </div>

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

          <div className="flex space-x-3 pt-4">
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500"
            >
              {deal ? 'Atualizar' : 'Criar'}
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
