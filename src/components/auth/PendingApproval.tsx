'use client';

import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { Clock, LogOut, Mail } from 'lucide-react';

export const PendingApproval = () => {
  const { user } = useAuth();

  const handleLogout = async () => {
    try {
      if (!auth) {
        console.error('Firebase auth não está configurado');
        return;
      }
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-yellow-100">
            <Clock className="h-6 w-6 text-yellow-600" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Aguardando Aprovação
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Seu cadastro está pendente de aprovação
          </p>
        </div>

        <div className="mt-8 bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="space-y-6">
            <div className="flex items-center space-x-3">
              <Mail className="h-5 w-5 text-gray-400" />
              <span className="text-sm text-gray-600">{user?.email}</span>
            </div>
            
            <div className="text-center">
              <p className="text-sm text-gray-500">
                Olá, <strong>{user?.name}</strong>!
              </p>
              <p className="mt-2 text-sm text-gray-500">
                Seu cadastro foi recebido e está sendo analisado pelo nosso time. 
                Você receberá um email quando sua conta for aprovada.
              </p>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <button
                onClick={handleLogout}
                className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
