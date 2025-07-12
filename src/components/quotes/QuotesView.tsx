'use client';

import { useState, useEffect } from 'react';
import { collection, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { Quote, QuoteItem, Client } from '@/types';
import { 
  FileText, 
  Plus, 
  Calendar, 
  DollarSign, 
  User, 
  Edit,
  Trash2,
  Send,
  CheckCircle2,
  XCircle,
  Clock
} from 'lucide-react';

// Componente do formulário inline para evitar problemas de módulo
const QuoteForm = ({ quote, clients, onSave, onClose }: {
  quote?: Quote | null;
  clients: Client[];
  onSave: (quoteData: Omit<Quote, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => void;
  onClose: () => void;
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    clientId: '',
    validUntil: '',
    status: 'draft' as 'draft' | 'sent' | 'accepted' | 'rejected',
    items: [] as QuoteItem[],
  });

  useEffect(() => {
    if (quote) {
      setFormData({
        title: quote.title,
        description: quote.description,
        clientId: quote.clientId,
        validUntil: new Date(quote.validUntil).toISOString().slice(0, 10),
        status: quote.status,
        items: quote.items || [],
      });
    }
  }, [quote]);

  const addItem = () => {
    const newItem: QuoteItem = {
      id: Date.now().toString(),
      description: '',
      quantity: 1,
      unitPrice: 0,
      total: 0,
    };
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, newItem]
    }));
  };

  const updateItem = (index: number, field: keyof QuoteItem, value: string | number) => {
    const updatedItems = [...formData.items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    
    // Recalcular total do item
    if (field === 'quantity' || field === 'unitPrice') {
      updatedItems[index].total = updatedItems[index].quantity * updatedItems[index].unitPrice;
    }
    
    setFormData(prev => ({ ...prev, items: updatedItems }));
  };

  const removeItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const calculateTotal = () => {
    return formData.items.reduce((sum, item) => sum + item.total, 0);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.clientId || !formData.validUntil) {
      alert('Por favor, preencha os campos obrigatórios.');
      return;
    }

    if (formData.items.length === 0) {
      alert('Adicione pelo menos um item ao orçamento.');
      return;
    }

    onSave({
      title: formData.title.trim(),
      description: formData.description.trim(),
      clientId: formData.clientId,
      validUntil: new Date(formData.validUntil),
      status: formData.status,
      items: formData.items,
      total: calculateTotal(),
    });
  };

  return (
    <div className="fixed inset-0 bg-transparent flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {quote ? 'Editar Orçamento' : 'Novo Orçamento'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XCircle className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                placeholder="Ex: Orçamento para Website..."
                required
              />
            </div>

            {/* Cliente */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cliente *
              </label>
              <select
                value={formData.clientId}
                onChange={(e) => setFormData(prev => ({ ...prev, clientId: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
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
              placeholder="Detalhes do orçamento..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Data de Validade */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Válido até *
              </label>
              <input
                type="date"
                value={formData.validUntil}
                onChange={(e) => setFormData(prev => ({ ...prev, validUntil: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as Quote['status'] }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="draft">Rascunho</option>
                <option value="sent">Enviado</option>
                <option value="accepted">Aceito</option>
                <option value="rejected">Rejeitado</option>
              </select>
            </div>
          </div>

          {/* Itens do Orçamento */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Itens do Orçamento</h3>
              <button
                type="button"
                onClick={addItem}
                className="bg-green-600 text-white px-3 py-1 rounded-lg text-sm flex items-center space-x-1 hover:bg-green-700"
              >
                <Plus className="h-4 w-4" />
                <span>Adicionar Item</span>
              </button>
            </div>

            <div className="space-y-3">
              {formData.items.map((item, index) => (
                <div key={item.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Descrição
                      </label>
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) => updateItem(index, 'description', e.target.value)}
                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                        placeholder="Descrição do item..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Qtd
                      </label>
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateItem(index, 'quantity', Number(e.target.value))}
                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                        min="1"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Valor Unit.
                      </label>
                      <input
                        type="number"
                        value={item.unitPrice}
                        onChange={(e) => updateItem(index, 'unitPrice', Number(e.target.value))}
                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                        min="0"
                        step="0.01"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Total
                        </label>
                        <div className="text-sm font-medium text-gray-900">
                          R$ {item.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        className="text-red-600 hover:text-red-800 ml-2"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Total Geral */}
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-lg font-medium text-gray-900">Total Geral:</span>
                <span className="text-xl font-bold text-green-600">
                  R$ {calculateTotal().toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>

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
              {quote ? 'Salvar' : 'Criar Orçamento'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface QuotesViewProps {
  quotes: Quote[];
  setQuotes: (quotes: Quote[]) => void;
  clients: Client[];
}

export const QuotesView = ({ quotes, setQuotes, clients }: QuotesViewProps) => {
  const { user } = useAuth();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingQuote, setEditingQuote] = useState<Quote | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'draft' | 'sent' | 'accepted' | 'rejected'>('all');

  const handleAddQuote = async (quoteData: Omit<Quote, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    if (!user || !db) return;

    try {
      const docRef = await addDoc(collection(db, 'quotes'), {
        ...quoteData,
        userId: user.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const newQuote: Quote = {
        id: docRef.id,
        ...quoteData,
        userId: user.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      setQuotes([...quotes, newQuote]);
      setIsFormOpen(false);
    } catch (error) {
      console.error('Error adding quote:', error);
    }
  };

  const handleUpdateQuote = async (quoteData: Omit<Quote, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    if (!editingQuote || !db) return;

    try {
      await updateDoc(doc(db, 'quotes', editingQuote.id), {
        ...quoteData,
        updatedAt: new Date(),
      });

      setQuotes(quotes.map(quote =>
        quote.id === editingQuote.id
          ? { ...quote, ...quoteData, updatedAt: new Date() }
          : quote
      ));
      setEditingQuote(null);
      setIsFormOpen(false);
    } catch (error) {
      console.error('Error updating quote:', error);
    }
  };

  const handleDeleteQuote = async (quoteId: string) => {
    if (!confirm('Tem certeza que deseja excluir este orçamento?') || !db) return;

    try {
      await deleteDoc(doc(db, 'quotes', quoteId));
      setQuotes(quotes.filter(quote => quote.id !== quoteId));
    } catch (error) {
      console.error('Error deleting quote:', error);
    }
  };

  const handleStatusChange = async (quote: Quote, newStatus: Quote['status']) => {
    if (!db) return;

    try {
      await updateDoc(doc(db, 'quotes', quote.id), {
        status: newStatus,
        updatedAt: new Date(),
      });

      setQuotes(quotes.map(q =>
        q.id === quote.id
          ? { ...q, status: newStatus, updatedAt: new Date() }
          : q
      ));
    } catch (error) {
      console.error('Error updating quote status:', error);
    }
  };

  const openAddForm = () => {
    setEditingQuote(null);
    setIsFormOpen(true);
  };

  const openEditForm = (quote: Quote) => {
    setEditingQuote(quote);
    setIsFormOpen(true);
  };

  // Filtrar orçamentos
  const filteredQuotes = quotes.filter(quote => {
    return filterStatus === 'all' || quote.status === filterStatus;
  });

  // Organizar por data de criação (mais recentes primeiro)
  const sortedQuotes = filteredQuotes.sort((a, b) => {
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'text-gray-600 bg-gray-50';
      case 'sent': return 'text-blue-600 bg-blue-50';
      case 'accepted': return 'text-green-600 bg-green-50';
      case 'rejected': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'draft': return 'Rascunho';
      case 'sent': return 'Enviado';
      case 'accepted': return 'Aceito';
      case 'rejected': return 'Rejeitado';
      default: return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft': return <Clock className="h-4 w-4" />;
      case 'sent': return <Send className="h-4 w-4" />;
      case 'accepted': return <CheckCircle2 className="h-4 w-4" />;
      case 'rejected': return <XCircle className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const draftQuotes = quotes.filter(q => q.status === 'draft');
  const sentQuotes = quotes.filter(q => q.status === 'sent');
  const acceptedQuotes = quotes.filter(q => q.status === 'accepted');
  const totalValue = acceptedQuotes.reduce((sum, quote) => sum + quote.total, 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Orçamentos</h2>
        <button
          onClick={openAddForm}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          <span>Novo Orçamento</span>
        </button>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm font-medium text-gray-600">Total de Orçamentos</div>
          <div className="text-2xl font-bold text-gray-900">{quotes.length}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm font-medium text-gray-600">Rascunhos</div>
          <div className="text-2xl font-bold text-gray-600">{draftQuotes.length}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm font-medium text-gray-600">Enviados</div>
          <div className="text-2xl font-bold text-blue-600">{sentQuotes.length}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm font-medium text-gray-600">Valor Aceito</div>
          <div className="text-2xl font-bold text-green-600">
            R$ {totalValue.toLocaleString('pt-BR')}
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-wrap gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as Quote['status'] | 'all')}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
            >
              <option value="all">Todos</option>
              <option value="draft">Rascunhos</option>
              <option value="sent">Enviados</option>
              <option value="accepted">Aceitos</option>
              <option value="rejected">Rejeitados</option>
            </select>
          </div>
        </div>
      </div>

      {/* Lista de Orçamentos */}
      <div className="bg-white rounded-lg shadow">
        {sortedQuotes.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {quotes.length === 0 ? 'Nenhum orçamento cadastrado' : 'Nenhum orçamento encontrado'}
            </h3>
            <p className="text-gray-600">
              {quotes.length === 0 
                ? 'Crie seu primeiro orçamento para começar a vender.'
                : 'Tente ajustar os filtros para encontrar os orçamentos desejados.'
              }
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {sortedQuotes.map((quote) => {
              const client = clients.find(c => c.id === quote.clientId);
              const isExpired = new Date(quote.validUntil) < new Date();
              
              return (
                <div key={quote.id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-medium text-gray-900">{quote.title}</h3>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(quote.status)}`}>
                          {getStatusIcon(quote.status)}
                          <span className="ml-1">{getStatusLabel(quote.status)}</span>
                        </span>
                        {isExpired && quote.status === 'sent' && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-red-600 bg-red-50">
                            Expirado
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-6 text-sm text-gray-500 mb-2">
                        <div className="flex items-center space-x-1">
                          <User className="h-4 w-4" />
                          <span>{client?.name || 'Cliente não encontrado'}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <DollarSign className="h-4 w-4" />
                          <span className="font-medium text-green-600">
                            R$ {quote.total.toLocaleString('pt-BR')}
                          </span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>Válido até {new Date(quote.validUntil).toLocaleDateString('pt-BR')}</span>
                        </div>
                      </div>
                      
                      {quote.description && (
                        <p className="text-sm text-gray-600 mb-2">{quote.description}</p>
                      )}
                      
                      <div className="text-xs text-gray-500">
                        {quote.items.length} {quote.items.length === 1 ? 'item' : 'itens'} • 
                        Criado em {new Date(quote.createdAt).toLocaleDateString('pt-BR')}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      {/* Botões de ação rápida por status */}
                      {quote.status === 'draft' && (
                        <button
                          onClick={() => handleStatusChange(quote, 'sent')}
                          className="p-1 text-gray-400 hover:text-blue-600"
                          title="Marcar como enviado"
                        >
                          <Send className="h-4 w-4" />
                        </button>
                      )}
                      
                      {quote.status === 'sent' && (
                        <>
                          <button
                            onClick={() => handleStatusChange(quote, 'accepted')}
                            className="p-1 text-gray-400 hover:text-green-600"
                            title="Marcar como aceito"
                          >
                            <CheckCircle2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleStatusChange(quote, 'rejected')}
                            className="p-1 text-gray-400 hover:text-red-600"
                            title="Marcar como rejeitado"
                          >
                            <XCircle className="h-4 w-4" />
                          </button>
                        </>
                      )}
                      
                      <button
                        onClick={() => openEditForm(quote)}
                        className="p-1 text-gray-400 hover:text-blue-600"
                        title="Editar"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      
                      <button
                        onClick={() => handleDeleteQuote(quote.id)}
                        className="p-1 text-gray-400 hover:text-red-600"
                        title="Excluir"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
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
        <QuoteForm
          quote={editingQuote}
          clients={clients}
          onSave={editingQuote ? handleUpdateQuote : handleAddQuote}
          onClose={() => {
            setIsFormOpen(false);
            setEditingQuote(null);
          }}
        />
      )}
    </div>
  );
};
