'use client';

import { useState, useEffect } from 'react';
import { Task, Client, Deal } from '@/types';
import { X, Calendar, User, FileText, Flag, Tag } from 'lucide-react';

interface TaskFormProps {
  task?: Task | null;
  clients: Client[];
  deals: Deal[];
  onSave: (taskData: Omit<Task, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => void;
  onClose: () => void;
}

export const TaskForm = ({ task, clients, deals, onSave, onClose }: TaskFormProps) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    type: 'other' as 'call' | 'meeting' | 'follow-up' | 'email' | 'other',
    clientId: '',
    dealId: '',
    completed: false,
  });

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title,
        description: task.description,
        dueDate: new Date(task.dueDate).toISOString().slice(0, 16),
        priority: task.priority,
        type: task.type,
        clientId: task.clientId || '',
        dealId: task.dealId || '',
        completed: task.completed,
      });
    }
  }, [task]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.dueDate) {
      alert('Por favor, preencha os campos obrigatórios.');
      return;
    }

    onSave({
      title: formData.title.trim(),
      description: formData.description.trim(),
      dueDate: new Date(formData.dueDate),
      priority: formData.priority,
      type: formData.type,
      clientId: formData.clientId || undefined,
      dealId: formData.dealId || undefined,
      completed: formData.completed,
    });
  };

  const handleClientChange = (clientId: string) => {
    setFormData(prev => ({
      ...prev,
      clientId,
      dealId: '' // Reset deal when client changes
    }));
  };

  // Filtrar deals do cliente selecionado
  const filteredDeals = formData.clientId 
    ? deals.filter(deal => deal.clientId === formData.clientId)
    : deals;

  return (
    <div className="fixed inset-0 bg-transparent flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {task ? 'Editar Tarefa' : 'Nova Tarefa'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Título */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Título *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Ex: Ligar para cliente..."
              required
            />
          </div>

          {/* Descrição */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descrição
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Detalhes da tarefa..."
            />
          </div>

          {/* Data e Hora */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Data e Hora de Vencimento *
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
              <input
                type="datetime-local"
                value={formData.dueDate}
                onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg pl-10 pr-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Prioridade */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Prioridade
              </label>
              <div className="relative">
                <Flag className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as Task['priority'] }))}
                  className="w-full border border-gray-300 rounded-lg pl-10 pr-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="low">Baixa</option>
                  <option value="medium">Média</option>
                  <option value="high">Alta</option>
                </select>
              </div>
            </div>

            {/* Tipo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo
              </label>
              <div className="relative">
                <Tag className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                <select
                  value={formData.type}
                  onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as Task['type'] }))}
                  className="w-full border border-gray-300 rounded-lg pl-10 pr-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="call">Ligação</option>
                  <option value="email">E-mail</option>
                  <option value="meeting">Reunião</option>
                  <option value="follow-up">Follow-up</option>
                  <option value="other">Outro</option>
                </select>
              </div>
            </div>
          </div>

          {/* Cliente */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cliente (opcional)
            </label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
              <select
                value={formData.clientId}
                onChange={(e) => handleClientChange(e.target.value)}
                className="w-full border border-gray-300 rounded-lg pl-10 pr-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Selecione um cliente</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Negócio */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Negócio (opcional)
            </label>
            <div className="relative">
              <FileText className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
              <select
                value={formData.dealId}
                onChange={(e) => setFormData(prev => ({ ...prev, dealId: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg pl-10 pr-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={!formData.clientId}
              >
                <option value="">Selecione um negócio</option>
                {filteredDeals.map((deal) => (
                  <option key={deal.id} value={deal.id}>
                    {deal.title}
                  </option>
                ))}
              </select>
            </div>
            {!formData.clientId && (
              <p className="text-xs text-gray-600 mt-1">
                Selecione um cliente primeiro para ver os negócios disponíveis
              </p>
            )}
          </div>

          {/* Status (apenas na edição) */}
          {task && (
            <div>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.completed}
                  onChange={(e) => setFormData(prev => ({ ...prev, completed: e.target.checked }))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">
                  Tarefa concluída
                </span>
              </label>
            </div>
          )}

          {/* Botões */}
          <div className="flex justify-end space-x-3 pt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              {task ? 'Salvar' : 'Criar Tarefa'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
