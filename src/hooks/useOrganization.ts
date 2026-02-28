// hooks/useOrganization.ts
import { useState, useEffect } from 'react';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Organization, User } from '@/types';
import { useAuth } from '@/contexts/AuthContext';

export const useOrganization = () => {
  const { user } = useAuth();
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [organizationUsers, setOrganizationUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrganization = async () => {
      if (!user?.organizationId || !db) {
        setLoading(false);
        return;
      }

      try {
        // Buscar dados da organização
        const orgDoc = await getDoc(doc(db, 'organizations', user.organizationId));
        
        if (orgDoc.exists()) {
          const orgData = orgDoc.data() as Organization;
          setOrganization({
            ...orgData,
            id: orgDoc.id,
          });

          // Buscar usuários da organização (apenas para admins e managers)
          if (user.role === 'admin' || user.role === 'manager') {
            const usersQuery = query(
              collection(db, 'users'),
              where('organizationId', '==', user.organizationId)
            );
            
            const usersSnapshot = await getDocs(usersQuery);
            const users = usersSnapshot.docs.map(doc => ({
              ...doc.data(),
              id: doc.id,
            })) as User[];
            
            setOrganizationUsers(users);
          }
        } else {
          setError('Organização não encontrada');
        }
      } catch (err) {
        console.error('Error fetching organization:', err);
        setError('Erro ao carregar organização');
      } finally {
        setLoading(false);
      }
    };

    fetchOrganization();
  }, [user]);

  const canManageUsers = user?.role === 'admin';
  const canViewTeam = user?.role === 'admin' || user?.role === 'manager';
  const canManageSettings = user?.role === 'admin';

  return {
    organization,
    organizationUsers,
    loading,
    error,
    canManageUsers,
    canViewTeam,
    canManageSettings,
  };
};