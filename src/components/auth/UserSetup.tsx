'use client';

import { useState } from 'react';
import { doc, setDoc, getDocs, collection } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { User, Settings, AlertCircle } from 'lucide-react';

export const UserSetup = () => {
  const { firebaseUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firebaseUser || !db || !name.trim()) return;

    setLoading(true);
    setError('');

    try {
      // Verificar se é o primeiro usuário
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const isFirstUser = usersSnapshot.size === 0;
      
      let organizationId = '';
      
      if (isFirstUser) {
        // Criar organização para o primeiro usuário
        const orgId = `org_${firebaseUser.uid}`;
        const organization = {
          id: orgId,
          name: `Organização de ${name}`,
          plan: 'professional',
          maxUsers: 15,
          maxDeals: 1000,
          ownerId: firebaseUser.uid,
          settings: {
            customFields: [],
            salesStages: [],
            integrations: [],
            branding: {
              primaryColor: '#3B82F6',
              secondaryColor: '#1E40AF',
            },
          },
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        
        await setDoc(doc(db, 'organizations', orgId), organization);
        organizationId = orgId;
      }
      
      // Criar documento do usuário no Firestore
      await setDoc(doc(db, 'users', firebaseUser.uid), {
        name: name.trim(),
        email: firebaseUser.email,
        organizationId: organizationId,
        role: isFirstUser ? 'admin' : 'sales',
        permissions: [],
        approved: isFirstUser, // Primeiro usuário é aprovado automaticamente
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Recarregar a página para atualizar o contexto
      window.location.reload();
      
    } catch (error: any) {
      console.error('Erro ao configurar usuário:', error);
      
      // Se for erro de permissão, mostrar instruções específicas
      if (error.code === 'permission-denied' || error.message.includes('Missing or insufficient permissions')) {
        setError('Firestore não configurado. Veja as instruções abaixo.');
      } else {
        setError(error.message || 'Erro ao configurar usuário');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-blue-100">
            <Settings className="h-6 w-6 text-blue-600" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Configuração Inicial
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Complete seu perfil para continuar
          </p>
        </div>

        <div className="mt-8 bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {error && (
            <div className="mb-4 rounded-md bg-red-50 p-4">
              <div className="flex">
                <AlertCircle className="h-5 w-5 text-red-400" />
                <div className="ml-3">
                  <div className="text-sm text-red-800">{error}</div>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSetup} className="space-y-6">
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <User className="h-5 w-5 text-gray-400" />
              <span className="text-sm text-gray-600">{firebaseUser?.email}</span>
            </div>

            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Nome Completo
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Digite seu nome completo"
              />
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex">
                <AlertCircle className="h-5 w-5 text-blue-400" />
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">
                    Configuração Automática
                  </h3>
                  <div className="mt-2 text-sm text-blue-700">
                    <p>
                      Seu perfil será configurado automaticamente com as permissões adequadas.
                      Se você for o primeiro usuário, receberá privilégios de administrador.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !name.trim()}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Configurando...' : 'Continuar'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};