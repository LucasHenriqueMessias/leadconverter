'use client';

import { useState, useEffect, useMemo } from 'react';
import { collection, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { Task, Client, Deal } from '@/types';
import { 
  CheckSquare, 
  Plus, 
  Calendar, 
  User, 
  AlertCircle, 
  CheckCircle2,
  Edit,
  Trash2,
  Phone,
  Mail,
  Users,
  ArrowRight,
  X,
  FileText,
  Flag,
  Tag
} from 'lucide-react';
import { UserFilter } from '../sales/UserFilter';

interface TaskFormProps {
  task?: Task | null;
  clients: Client[];
  deals: Deal[];
  onSave: (taskData: Omit<Task, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => void;
  onClose: () => void;
}

// Importar o TaskForm dinamicamente para evitar problemas de módulo
const TaskForm = ({ task, clients, deals, onSave, onClose }: TaskFormProps) => {
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

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const taskDataToSave: any = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      dueDate: new Date(formData.dueDate),
      priority: formData.priority,
      type: formData.type,
      completed: formData.completed,
    };

    // Só adicionar clientId se não estiver vazio
    if (formData.clientId) {
      taskDataToSave.clientId = formData.clientId;
    }

    // Só adicionar dealId se não estiver vazio
    if (formData.dealId) {
      taskDataToSave.dealId = formData.dealId;
    }

    onSave(taskDataToSave);
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

interface TasksViewProps {
  tasks: Task[];
  setTasks: (tasks: Task[]) => void;
  clients: Client[];
  deals: Deal[];
}

export const TasksView = ({ tasks, setTasks, clients, deals }: TasksViewProps) => {
  const { user, isAdmin, isManager } = useAuth();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'completed'>('all');
  const [filterPriority, setFilterPriority] = useState<'all' | 'low' | 'medium' | 'high'>('all');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  // Filtrar tarefas baseado no usuário selecionado e permissões
  const filteredTasks = useMemo(() => {
    let tasksToShow = tasks;

    // Se não é admin nem manager, mostrar apenas próprias tarefas
    if (!isAdmin && !isManager) {
      tasksToShow = tasks.filter(task => task.userId === user?.id);
    } else if (selectedUserId) {
      // Se admin/manager selecionou um usuário específico
      tasksToShow = tasks.filter(task => task.userId === selectedUserId);
    }
    // Se admin/manager e não selecionou usuário, mostrar todas

    // Aplicar filtros de status e prioridade
    return tasksToShow.filter(task => {
      const statusMatch = filterStatus === 'all' || 
        (filterStatus === 'pending' && !task.completed) ||
        (filterStatus === 'completed' && task.completed);
      
      const priorityMatch = filterPriority === 'all' || task.priority === filterPriority;
      
      return statusMatch && priorityMatch;
    });
  }, [tasks, selectedUserId, filterStatus, filterPriority, isAdmin, isManager, user?.id]);

  const handleAddTask = async (taskData: Omit<Task, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    if (!user || !db) return;

    try {
      // Para admin/manager, permitir especificar userId, senão usar o próprio
      const finalUserId = (isAdmin || isManager) && selectedUserId ? selectedUserId : user.id;
      
      // Remover campos undefined antes de salvar
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const cleanTaskData: any = {
        title: taskData.title,
        description: taskData.description,
        dueDate: taskData.dueDate,
        completed: taskData.completed,
        priority: taskData.priority,
        type: taskData.type,
        customFields: taskData.customFields || {},
        userId: finalUserId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Só adicionar clientId se existir
      if (taskData.clientId) {
        cleanTaskData.clientId = taskData.clientId;
      }

      // Só adicionar dealId se existir
      if (taskData.dealId) {
        cleanTaskData.dealId = taskData.dealId;
      }

      const docRef = await addDoc(collection(db, `organizations/${user.organizationId}/tasks`), cleanTaskData);

      const newTask: Task = {
        id: docRef.id,
        ...taskData,
        userId: finalUserId,
        customFields: taskData.customFields || {},
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      setTasks([...tasks, newTask]);
      setIsFormOpen(false);
    } catch (error) {
      console.error('Error adding task:', error);
    }
  };

  const handleUpdateTask = async (taskData: Omit<Task, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    if (!editingTask || !db || !user?.organizationId) return;

    try {
      // Remover campos undefined antes de atualizar
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const cleanUpdateData: any = {
        title: taskData.title,
        description: taskData.description,
        dueDate: taskData.dueDate,
        completed: taskData.completed,
        priority: taskData.priority,
        type: taskData.type,
        customFields: taskData.customFields || {},
        updatedAt: new Date(),
      };

      // Só adicionar clientId se existir
      if (taskData.clientId) {
        cleanUpdateData.clientId = taskData.clientId;
      }

      // Só adicionar dealId se existir
      if (taskData.dealId) {
        cleanUpdateData.dealId = taskData.dealId;
      }

      await updateDoc(doc(db, `organizations/${user.organizationId}/tasks`, editingTask.id), cleanUpdateData);

      setTasks(tasks.map(task =>
        task.id === editingTask.id
          ? { ...task, ...taskData, updatedAt: new Date() }
          : task
      ));
      setEditingTask(null);
      setIsFormOpen(false);
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('Tem certeza que deseja excluir esta tarefa?') || !db || !user?.organizationId) return;

    try {
      await deleteDoc(doc(db, `organizations/${user.organizationId}/tasks`, taskId));
      setTasks(tasks.filter(task => task.id !== taskId));
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const handleToggleComplete = async (task: Task) => {
    if (!db || !user?.organizationId) return;

    try {
      const updatedTask = { ...task, completed: !task.completed, updatedAt: new Date() };
      
      await updateDoc(doc(db, `organizations/${user.organizationId}/tasks`, task.id), {
        completed: !task.completed,
        updatedAt: new Date(),
      });

      setTasks(tasks.map(t => t.id === task.id ? updatedTask : t));
    } catch (error) {
      console.error('Error toggling task completion:', error);
    }
  };

  const openAddForm = () => {
    setEditingTask(null);
    setIsFormOpen(true);
  };

  const openEditForm = (task: Task) => {
    setEditingTask(task);
    setIsFormOpen(true);
  };

  // Organizar por data de vencimento
  const sortedTasks = filteredTasks.sort((a, b) => {
    if (a.completed && !b.completed) return 1;
    if (!a.completed && b.completed) return -1;
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'high': return 'Alta';
      case 'medium': return 'Média';
      case 'low': return 'Baixa';
      default: return priority;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'call': return <Phone className="h-4 w-4" />;
      case 'email': return <Mail className="h-4 w-4" />;
      case 'meeting': return <Users className="h-4 w-4" />;
      case 'follow-up': return <ArrowRight className="h-4 w-4" />;
      default: return <CheckSquare className="h-4 w-4" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'call': return 'Ligação';
      case 'email': return 'E-mail';
      case 'meeting': return 'Reunião';
      case 'follow-up': return 'Follow-up';
      default: return 'Outro';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Tarefas</h2>
          {(isAdmin || isManager) && (
            <p className="text-gray-600 mt-1">
              {selectedUserId 
                ? `Visualizando tarefas de um usuário específico`
                : `Visualizando tarefas de ${isAdmin ? 'toda a organização' : 'sua equipe'}`
              }
            </p>
          )}
        </div>
        <div className="flex items-center space-x-4">
          {(isAdmin || isManager) && (
            <UserFilter 
              selectedUserId={selectedUserId}
              onUserChange={setSelectedUserId}
            />
          )}
          <button
            onClick={openAddForm}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            <span>Nova Tarefa</span>
          </button>
        </div>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm font-medium text-gray-600">Total de Tarefas</div>
          <div className="text-2xl font-bold text-gray-900">{filteredTasks.length}</div>
          {selectedUserId && (
            <div className="text-xs text-gray-500 mt-1">
              {tasks.length} no total da organização
            </div>
          )}
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm font-medium text-gray-600">Pendentes</div>
          <div className="text-2xl font-bold text-blue-600">{filteredTasks.filter(task => !task.completed).length}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm font-medium text-gray-600">Concluídas</div>
          <div className="text-2xl font-bold text-green-600">{filteredTasks.filter(task => task.completed).length}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm font-medium text-gray-600">Atrasadas</div>
          <div className="text-2xl font-bold text-red-600">{filteredTasks.filter(task => !task.completed && new Date(task.dueDate) < new Date()).length}</div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-wrap gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as 'all' | 'pending' | 'completed')}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
            >
              <option value="all">Todas</option>
              <option value="pending">Pendentes</option>
              <option value="completed">Concluídas</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Prioridade</label>
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value as 'all' | Task['priority'])}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
            >
              <option value="all">Todas</option>
              <option value="high">Alta</option>
              <option value="medium">Média</option>
              <option value="low">Baixa</option>
            </select>
          </div>
        </div>
      </div>

      {/* Lista de Tarefas */}
      <div className="bg-white rounded-lg shadow">
        {sortedTasks.length === 0 ? (
          <div className="text-center py-12">
            <CheckSquare className="h-12 w-12 text-gray-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {tasks.length === 0 ? 'Nenhuma tarefa cadastrada' : 'Nenhuma tarefa encontrada'}
            </h3>
            <p className="text-gray-600">
              {tasks.length === 0 
                ? 'Crie sua primeira tarefa para começar a organizar seu trabalho.'
                : 'Tente ajustar os filtros para encontrar as tarefas desejadas.'
              }
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {sortedTasks.map((task) => {
              const client = task.clientId ? clients.find(c => c.id === task.clientId) : null;
              const deal = task.dealId ? deals.find(d => d.id === task.dealId) : null;
              const isOverdue = !task.completed && new Date(task.dueDate) < new Date();
              
              return (
                <div key={task.id} className={`p-4 hover:bg-gray-50 ${task.completed ? 'opacity-60' : ''}`}>
                  <div className="flex items-start space-x-3">
                    <button
                      onClick={() => handleToggleComplete(task)}
                      className={`mt-1 ${task.completed ? 'text-green-600' : 'text-gray-400 hover:text-green-600'}`}
                    >
                      {task.completed ? (
                        <CheckCircle2 className="h-5 w-5" />
                      ) : (
                        <div className="h-5 w-5 border-2 border-gray-300 rounded hover:border-green-600"></div>
                      )}
                    </button>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className={`text-sm font-medium ${task.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                            {task.title}
                          </h3>
                          {task.description && (
                            <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                          )}
                          
                          <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                            <div className="flex items-center space-x-1">
                              {getTypeIcon(task.type)}
                              <span>{getTypeLabel(task.type)}</span>
                            </div>
                            
                            <div className="flex items-center space-x-1">
                              <Calendar className="h-3 w-3" />
                              <span className={isOverdue ? 'text-red-600 font-medium' : ''}>
                                {new Date(task.dueDate).toLocaleDateString('pt-BR')}
                              </span>
                              {isOverdue && <AlertCircle className="h-3 w-3 text-red-600" />}
                            </div>
                            
                            {client && (
                              <div className="flex items-center space-x-1">
                                <User className="h-3 w-3" />
                                <span>{client.name}</span>
                              </div>
                            )}
                            
                            {deal && (
                              <div className="flex items-center space-x-1">
                                <CheckSquare className="h-3 w-3" />
                                <span>{deal.title}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2 ml-4">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                            {getPriorityLabel(task.priority)}
                          </span>
                          
                          <button
                            onClick={() => openEditForm(task)}
                            className="p-1 text-gray-400 hover:text-blue-600"
                            title="Editar"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          
                          <button
                            onClick={() => handleDeleteTask(task.id)}
                            className="p-1 text-gray-400 hover:text-red-600"
                            title="Excluir"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal do Formulário */}
      {isFormOpen && (
        <TaskForm
          task={editingTask}
          clients={clients}
          deals={deals}
          onSave={editingTask ? handleUpdateTask : handleAddTask}
          onClose={() => {
            setIsFormOpen(false);
            setEditingTask(null);
          }}
        />
      )}
    </div>
  );
};
