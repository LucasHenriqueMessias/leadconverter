'use client';

import { useState } from 'react';
import { collection, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { Client } from '@/types';
import { Plus, Edit, Trash2, Phone, Mail, User } from 'lucide-react';
import { ClientForm } from './ClientForm';

interface ClientsViewProps {
  clients: Client[];
  setClients: (clients: Client[]) => void;
}

export const ClientsView = ({ clients, setClients }: ClientsViewProps) => {
  const { user } = useAuth();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.phone.includes(searchTerm)
  );

  const handleAddClient = async (clientData: Omit<Client, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    if (!user || !db) return;

    try {
      const docRef = await addDoc(collection(db, 'clients'), {
        ...clientData,
        userId: user.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const newClient: Client = {
        id: docRef.id,
        ...clientData,
        userId: user.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      setClients([...clients, newClient]);
      setIsFormOpen(false);
    } catch (error) {
      console.error('Error adding client:', error);
    }
  };

  const handleUpdateClient = async (clientData: Omit<Client, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    if (!editingClient || !db) return;

    try {
      await updateDoc(doc(db, 'clients', editingClient.id), {
        ...clientData,
        updatedAt: new Date(),
      });

      setClients(clients.map(client =>
        client.id === editingClient.id
          ? { ...client, ...clientData, updatedAt: new Date() }
          : client
      ));
      setEditingClient(null);
      setIsFormOpen(false);
    } catch (error) {
      console.error('Error updating client:', error);
    }
  };

  const handleDeleteClient = async (clientId: string) => {
    if (!confirm('Tem certeza que deseja excluir este cliente?') || !db) return;

    try {
      await deleteDoc(doc(db, 'clients', clientId));
      setClients(clients.filter(client => client.id !== clientId));
    } catch (error) {
      console.error('Error deleting client:', error);
    }
  };

  const openWhatsApp = (phone: string) => {
    const cleanPhone = phone.replace(/\D/g, '');
    window.open(`https://wa.me/55${cleanPhone}`, '_blank');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Clientes</h2>
        <button
          onClick={() => {
            setEditingClient(null);
            setIsFormOpen(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          <span>Novo Cliente</span>
        </button>
      </div>

      <div className="mb-6">
        <input
          type="text"
          placeholder="Buscar clientes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cliente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contato
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Segmento
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredClients.map((client) => (
                <tr key={client.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                          <User className="h-5 w-5 text-gray-500" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{client.name}</div>
                        <div className="text-sm text-gray-500">{client.document}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{client.email}</div>
                    <div className="text-sm text-gray-500">{client.phone}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {client.segment}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => openWhatsApp(client.phone)}
                      className="text-green-600 hover:text-green-900"
                      title="WhatsApp"
                    >
                      <Phone className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => window.open(`mailto:${client.email}`, '_blank')}
                      className="text-blue-600 hover:text-blue-900"
                      title="Email"
                    >
                      <Mail className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => {
                        setEditingClient(client);
                        setIsFormOpen(true);
                      }}
                      className="text-indigo-600 hover:text-indigo-900"
                      title="Editar"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteClient(client.id)}
                      className="text-red-600 hover:text-red-900"
                      title="Excluir"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isFormOpen && (
        <ClientForm
          client={editingClient}
          onSubmit={editingClient ? handleUpdateClient : handleAddClient}
          onClose={() => {
            setIsFormOpen(false);
            setEditingClient(null);
          }}
        />
      )}
    </div>
  );
};
