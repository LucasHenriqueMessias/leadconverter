import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, QueryConstraint } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { getDataScope } from '@/lib/permissions';
import { normalizeStage } from '@/utils/stageUtils';

interface UseRealtimeDataOptions {
  collectionName: string;
  additionalConstraints?: QueryConstraint[];
}

export function useRealtimeData<T>(options: UseRealtimeDataOptions) {
  const { user, isAdmin, isManager } = useAuth();
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.organizationId || !db) {
      setLoading(false);
      return;
    }

    try {
      // Determinar escopo baseado no role do usuário
      const { scope } = getDataScope(user.role, user.id, user.teamId);
      
      // Construir query base
      let constraints: QueryConstraint[] = [];
      
      // Adicionar filtros baseados no escopo
      if (scope === 'own') {
        constraints.push(where('userId', '==', user.id));
      } else if (scope === 'team' && user.teamId) {
        constraints.push(where('teamId', '==', user.teamId));
      }
      // Para admin (scope === 'organization'), não adicionar filtros - mostrar tudo

      // Adicionar constraints adicionais se fornecidas
      if (options.additionalConstraints) {
        constraints.push(...options.additionalConstraints);
      }

      // Criar query
      const q = query(
        collection(db, `organizations/${user.organizationId}/${options.collectionName}`),
        ...constraints
      );

      // Escutar mudanças em tempo real
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const items = snapshot.docs.map(doc => {
            const data = doc.data();
            
            // Processar dados específicos por tipo
            let processedData = {
              id: doc.id,
              ...data,
              // Converter timestamps do Firestore para Date
              createdAt: data.createdAt?.toDate(),
              updatedAt: data.updatedAt?.toDate(),
              dueDate: data.dueDate?.toDate(),
              expectedCloseDate: data.expectedCloseDate?.toDate(),
              validUntil: data.validUntil?.toDate(),
            };

            // Normalizar stage para deals
            if (options.collectionName === 'deals' && data.stage) {
              (processedData as any).stage = normalizeStage(data.stage);
            }

            return processedData as T;
          });
          
          setData(items);
          setLoading(false);
          setError(null);
        },
        (err) => {
          console.error(`Error listening to ${options.collectionName}:`, err);
          setError(err.message);
          setLoading(false);
        }
      );

      return unsubscribe;
    } catch (err) {
      console.error(`Error setting up ${options.collectionName} listener:`, err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      setLoading(false);
    }
  }, [user, options.collectionName, isAdmin, isManager]);

  return { data, loading, error, setData };
}

// Hooks específicos para cada tipo de dados
export const useRealtimeClients = () => {
  return useRealtimeData<any>({ collectionName: 'clients' });
};

export const useRealtimeDeals = () => {
  return useRealtimeData<any>({ collectionName: 'deals' });
};

export const useRealtimeTasks = () => {
  return useRealtimeData<any>({ collectionName: 'tasks' });
};

export const useRealtimeQuotes = () => {
  return useRealtimeData<any>({ collectionName: 'quotes' });
};