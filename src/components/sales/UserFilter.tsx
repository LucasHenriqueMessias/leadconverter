'use client';

import { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { User } from '@/types';
import { Users, Filter, X } from 'lucide-react';

interface UserFilterProps {
  selectedUserId: string | null;
  onUserChange: (userId: string | null) => void;
}

export const UserFilter = ({ selectedUserId, onUserChange }: UserFilterProps) => {
  const { user: currentUser, isAdmin, isManager } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      if (!currentUser?.organizationId || !db || (!isAdmin && !isManager)) {
        setLoading(false);
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
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [currentUser, isAdmin, isManager]);

  // Se não é admin nem manager, não mostrar filtro
  if (!isAdmin && !isManager) {
    return null;
  }

  if (loading) {
    return (
      <div className="flex items-center space-x-2 text-gray-500">
        <Filter className="h-4 w-4" />
        <span className="text-sm">Carregando usuários...</span>
      </div>
    );
  }

  const selectedUser = users.find(u => u.id === selectedUserId);

  return (
    <div className="flex items-center space-x-3">
      <div className="flex items-center space-x-2">
        <Users className="h-4 w-4 text-gray-600" />
        <span className="text-sm font-medium text-gray-700">Filtrar por:</span>
      </div>
      
      <div className="flex items-center space-x-2">
        <select
          value={selectedUserId || ''}
          onChange={(e) => onUserChange(e.target.value || null)}
          className="text-sm border border-gray-300 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">Todos os usuários</option>
          {users.map((user) => (
            <option key={user.id} value={user.id}>
              {user.name} ({user.role})
            </option>
          ))}
        </select>
        
        {selectedUserId && (
          <button
            onClick={() => onUserChange(null)}
            className="p-1 text-gray-400 hover:text-gray-600 rounded"
            title="Limpar filtro"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
      
      {selectedUser && (
        <div className="flex items-center space-x-2 bg-blue-50 px-3 py-1 rounded-full">
          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
          <span className="text-sm text-blue-700">
            Visualizando: {selectedUser.name}
          </span>
        </div>
      )}
    </div>
  );
};