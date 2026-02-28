'use client';

import { useState } from 'react';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types';
import { ROLE_LABELS, ROLE_DESCRIPTIONS } from '@/lib/permissions';
import { X, Mail, Send } from 'lucide-react';

interface InviteUserFormProps {
  onClose: () => void;
  onInviteSent: () => void;
}

export const InviteUserForm = ({ onClose, onInviteSent }: InviteUserFormProps) => {
  const { user: currentUser, organization } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    role: 'sales' as UserRole,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email.trim() || !formData.name.trim()) {
      setError('Email e nome são obrigatórios');
      return;
    }

    if (!currentUser?.organizationId || !db) {
      setError('Erro de configuração');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Criar convite na coleção de convites
      const inviteId = `invite_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      await setDoc(doc(db, 'invites', inviteId), {
        id: inviteId,
        organizationId: currentUser.organizationId,
        organizationName: organization?.name || 'Organização',
        invitedBy: currentUser.id,
        invitedByName: currentUser.name,
        email: formData.email.toLowerCase().trim(),
        name: formData.name.trim(),
        role: formData.role,
        status: 'pending',
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 dias
      });

      // Aqui você poderia enviar um email de convite
      // Por enquanto, vamos apenas mostrar as instruções

      alert(`Convite criado com sucesso!\n\nInstrua ${formData.name} a:\n1. Acessar ${window.location.origin}\n2. Criar conta com o email: ${formData.email}\n3. O sistema detectará o convite automaticamente`);
      
      onInviteSent();
      onClose();
    } catch (error: any) {
      console.error('Erro ao criar convite:', error);
      setError(error.message || 'Erro ao criar convite');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="flex justify-between items-center p-6 border-b">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <Mail className="h-5 w-5 mr-2 text-blue-600" />
            Convidar Usuário
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <div className="text-sm text-red-800">{error}</div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="usuario@exemplo.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nome *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Nome completo"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Função *
            </label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              {Object.entries(ROLE_LABELS)
                .filter(([role]) => role !== 'admin') // Não permitir criar outros admins por convite
                .map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              {ROLE_DESCRIPTIONS[formData.role]}
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <h4 className="text-sm font-medium text-blue-800 mb-1">
              Como funciona:
            </h4>
            <ul className="text-xs text-blue-700 space-y-1">
              <li>• O usuário receberá instruções para criar conta</li>
              <li>• Ao usar o email convidado, será adicionado à sua organização</li>
              <li>• O convite expira em 7 dias</li>
            </ul>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
            >
              <Send className="h-4 w-4" />
              <span>{loading ? 'Enviando...' : 'Enviar Convite'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};