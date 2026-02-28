'use client';

import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, addDoc, updateDoc, deleteDoc, doc, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { Interaction, Client } from '@/types';
import { InteractionTimeline } from './InteractionTimeline';
import { InteractionForm } from './InteractionForm';
import { Plus, Filter, Phone, Users, MessageCircle, Mail, FileText } from 'lucide-react';

interface ClientInteractionsProps {
  client: Client;
  dealId?: string;
}

export const ClientInteractions = ({ client, dealId }: ClientInteractionsProps) => {
  const { user } = useAuth();
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingInteraction, setEditingInteraction] = useState<Interaction | null>(null);
  const [filterType, setFilterType] = useState<Interaction['type'] | 'all'>('all');

  // Carregar interações em tempo real
  useEffect(() => {
    if (!user?.organizationId || !db) {
      setLoading(false);
      return;
    }

    try {
      const interactionsQuery = query(
        collection(db, `organizations/${user.organizationId}/interactions`),
        where('clientId', '==', client.id),
        orderBy('date', 'desc')
      );

      const unsubscribe = onSnapshot(
        interactionsQuery,
        (snapshot) => {
          const interactionsData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            date: doc.data().date?.toDate(),
            createdAt: doc.data().createdAt?.toDate(),
            updatedAt: doc.data().updatedAt?.toDate(),
          })) as Interaction[];

          setInteractions(interactionsData);
          setLoading(false);
        },
        (error) => {
          console.error('Error loading interactions:', error);
          setLoading(false);
        }
      );

      return unsubscribe;
    } catch (error) {
      console.error('Error setting up interactions listener:', error);
      setLoading(false);
    }
  }, [user, client.id]);

  const handleAddInteraction = async (interactionData: Omit<Interaction, 'id' | 'organizationId' | 'userId' | 'userName' | 'createdAt' | 'updatedAt'>) => {
    if (!user || !db || !user.organizationId) return;

    try {
      await addDoc(collection(db, `organizations/${user.organizationId}/interactions`), {
        ...interactionData,
        organizationId: user.organizationId,
        userId: user.id,
        userName: user.name,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      setIsFormOpen(false);
    } catch (error) {
      console.error('Error adding interaction:', error);
      alert('Erro ao registrar interação. Tente novamente.');
    }
  };

  const handleUpdateInteraction = async (interactionData: Omit<Interaction, 'id' | 'organizationId' | 'userId' | 'userName' | 'createdAt' | 'updatedAt'>) => {
    if (!editingInteraction || !db || !user?.organizationId) return;

    try {
      await updateDoc(doc(db, `organizations/${user.organizationId}/interactions`, editingInteraction.id), {
        ...interactionData,
        updatedAt: new Date(),
      });

      setEditingInteraction(null);
      setIsFormOpen(false);
    } catch (error) {
      console.error('Error updating interaction:', error);
      alert('Erro ao atualizar interação. Tente novamente.');
    }
  };

  const handleDeleteInteraction = async (interactionId: string) => {
    if (!db || !user?.organizationId) return;

    try {
      await deleteDoc(doc(db, `organizations/${user.organizationId}/interactions`, interactionId));
    } catch (error) {
      console.error('Error deleting interaction:', error);
      alert('Erro ao excluir interação. Tente novamente.');
    }
  };

  const openAddForm = () => {
    setEditingInteraction(null);
    setIsFormOpen(true);
  };

  const openEditForm = (interaction: Interaction) => {
    setEditingInteraction(interaction);
    setIsFormOpen(true);
  };

  // Filtrar interações por tipo
  const filteredInteractions = filterType === 'all' 
    ? interactions 
    : interactions.filter(i => i.type === filterType);

  // Estatísticas
  const stats = {
    total: interactions.length,
    calls: interactions.filter(i => i.type === 'call').length,
    meetings: interactions.filter(i => i.type === 'meeting').length,
    whatsapp: interactions.filter(i => i.type === 'whatsapp').length,
    emails: interactions.filter(i => i.type === 'email').length,
    notes: interactions.filter(i => i.type === 'note').length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header com estatísticas */}
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Histórico de Relacionamento
          </h3>
          <p className="text-sm text-gray-600">
            {stats.total} {stats.total === 1 ? 'interação registrada' : 'interações registradas'}
          </p>
        </div>
        <button
          onClick={openAddForm}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          <span>Nova Interação</span>
        </button>
      </div>

      {/* Estatísticas por tipo */}
      {stats.total > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <button
            onClick={() => setFilterType('all')}
            className={`p-3 rounded-lg border-2 transition-all ${
              filterType === 'all'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="text-center">
              <div className={`text-2xl font-bold ${filterType === 'all' ? 'text-blue-600' : 'text-gray-900'}`}>
                {stats.total}
              </div>
              <div className={`text-xs ${filterType === 'all' ? 'text-blue-700' : 'text-gray-600'}`}>
                Todas
              </div>
            </div>
          </button>

          <button
            onClick={() => setFilterType('call')}
            className={`p-3 rounded-lg border-2 transition-all ${
              filterType === 'call'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="text-center">
              <Phone className={`h-5 w-5 mx-auto mb-1 ${filterType === 'call' ? 'text-blue-600' : 'text-gray-600'}`} />
              <div className={`text-lg font-bold ${filterType === 'call' ? 'text-blue-600' : 'text-gray-900'}`}>
                {stats.calls}
              </div>
              <div className={`text-xs ${filterType === 'call' ? 'text-blue-700' : 'text-gray-600'}`}>
                Ligações
              </div>
            </div>
          </button>

          <button
            onClick={() => setFilterType('meeting')}
            className={`p-3 rounded-lg border-2 transition-all ${
              filterType === 'meeting'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="text-center">
              <Users className={`h-5 w-5 mx-auto mb-1 ${filterType === 'meeting' ? 'text-blue-600' : 'text-gray-600'}`} />
              <div className={`text-lg font-bold ${filterType === 'meeting' ? 'text-blue-600' : 'text-gray-900'}`}>
                {stats.meetings}
              </div>
              <div className={`text-xs ${filterType === 'meeting' ? 'text-blue-700' : 'text-gray-600'}`}>
                Reuniões
              </div>
            </div>
          </button>

          <button
            onClick={() => setFilterType('whatsapp')}
            className={`p-3 rounded-lg border-2 transition-all ${
              filterType === 'whatsapp'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="text-center">
              <MessageCircle className={`h-5 w-5 mx-auto mb-1 ${filterType === 'whatsapp' ? 'text-blue-600' : 'text-gray-600'}`} />
              <div className={`text-lg font-bold ${filterType === 'whatsapp' ? 'text-blue-600' : 'text-gray-900'}`}>
                {stats.whatsapp}
              </div>
              <div className={`text-xs ${filterType === 'whatsapp' ? 'text-blue-700' : 'text-gray-600'}`}>
                WhatsApp
              </div>
            </div>
          </button>

          <button
            onClick={() => setFilterType('email')}
            className={`p-3 rounded-lg border-2 transition-all ${
              filterType === 'email'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="text-center">
              <Mail className={`h-5 w-5 mx-auto mb-1 ${filterType === 'email' ? 'text-blue-600' : 'text-gray-600'}`} />
              <div className={`text-lg font-bold ${filterType === 'email' ? 'text-blue-600' : 'text-gray-900'}`}>
                {stats.emails}
              </div>
              <div className={`text-xs ${filterType === 'email' ? 'text-blue-700' : 'text-gray-600'}`}>
                E-mails
              </div>
            </div>
          </button>
        </div>
      )}

      {/* Timeline */}
      <InteractionTimeline
        interactions={filteredInteractions}
        onEdit={openEditForm}
        onDelete={handleDeleteInteraction}
        canEdit={true}
      />

      {/* Formulário */}
      {isFormOpen && (
        <InteractionForm
          interaction={editingInteraction}
          clientId={client.id}
          dealId={dealId}
          onSubmit={editingInteraction ? handleUpdateInteraction : handleAddInteraction}
          onClose={() => {
            setIsFormOpen(false);
            setEditingInteraction(null);
          }}
        />
      )}
    </div>
  );
};