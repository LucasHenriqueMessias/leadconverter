'use client';

import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { formatDate } from '@/utils/dateUtils';
import { Mail, Clock, Trash2, RefreshCw } from 'lucide-react';

interface Invite {
  id: string;
  email: string;
  name: string;
  role: string;
  status: string;
  createdAt: any;
  expiresAt: any;
}

export const PendingInvites = () => {
  const { user } = useAuth();
  const [invites, setInvites] = useState<Invite[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchInvites = async () => {
    if (!user?.organizationId || !db) return;

    try {
      const invitesQuery = query(
        collection(db, 'invites'),
        where('organizationId', '==', user.organizationId),
        where('status', '==', 'pending')
      );
      
      const snapshot = await getDocs(invitesQuery);
      const invitesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Invite[];
      
      setInvites(invitesData);
    } catch (error) {
      console.error('Error fetching invites:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvites();
  }, [user]);

  const handleDeleteInvite = async (inviteId: string) => {
    if (!confirm('Tem certeza que deseja cancelar este convite?') || !db) return;

    try {
      await deleteDoc(doc(db, 'invites', inviteId));
      setInvites(invites.filter(invite => invite.id !== inviteId));
    } catch (error) {
      console.error('Error deleting invite:', error);
    }
  };

  const isExpired = (expiresAt: any) => {
    const expireDate = expiresAt?.toDate ? expiresAt.toDate() : new Date(expiresAt);
    return expireDate < new Date();
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (invites.length === 0) {
    return null; // Não mostrar se não há convites
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <Mail className="h-5 w-5 mr-2 text-blue-600" />
            Convites Pendentes
          </h3>
          <button
            onClick={fetchInvites}
            className="text-gray-400 hover:text-gray-600"
            title="Atualizar"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>
      
      <div className="divide-y divide-gray-200">
        {invites.map((invite) => (
          <div key={invite.id} className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {invite.name}
                    </p>
                    <p className="text-sm text-gray-500">{invite.email}</p>
                  </div>
                  <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                    {invite.role}
                  </span>
                </div>
                
                <div className="mt-2 flex items-center text-xs text-gray-500 space-x-4">
                  <div className="flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    <span>Enviado em {formatDate(invite.createdAt)}</span>
                  </div>
                  <div className={`flex items-center ${isExpired(invite.expiresAt) ? 'text-red-600' : ''}`}>
                    <span>
                      {isExpired(invite.expiresAt) ? 'Expirado' : `Expira em ${formatDate(invite.expiresAt)}`}
                    </span>
                  </div>
                </div>
              </div>
              
              <button
                onClick={() => handleDeleteInvite(invite.id)}
                className="text-red-600 hover:text-red-900 ml-4"
                title="Cancelar convite"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};