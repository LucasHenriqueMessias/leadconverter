'use client';

import { useState } from 'react';
import { collection, addDoc, getDocs } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db, isFirebaseConfigured } from '@/lib/firebase';
import { CheckCircle, XCircle, AlertCircle, Database, Users, Shield } from 'lucide-react';

export const FirebaseTest = () => {
  const [testResults, setTestResults] = useState<Record<string, 'pending' | 'success' | 'error'>>({});
  const [testMessages, setTestMessages] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const updateTest = (test: string, status: 'pending' | 'success' | 'error', message: string) => {
    setTestResults(prev => ({ ...prev, [test]: status }));
    setTestMessages(prev => ({ ...prev, [test]: message }));
  };

  const runTests = async () => {
    setLoading(true);
    setTestResults({});
    setTestMessages({});

    // Teste 1: Configuração do Firebase
    updateTest('config', 'pending', 'Verificando configuração...');
    try {
      const configured = isFirebaseConfigured();
      if (configured) {
        updateTest('config', 'success', 'Firebase configurado corretamente');
      } else {
        updateTest('config', 'error', 'Firebase não configurado - verifique .env.local');
        setLoading(false);
        return;
      }
    } catch (error) {
      updateTest('config', 'error', `Erro na configuração: ${error}`);
      setLoading(false);
      return;
    }

    // Teste 2: Conexão com Firestore
    updateTest('firestore', 'pending', 'Testando conexão com Firestore...');
    try {
      if (!db) {
        updateTest('firestore', 'error', 'Firestore não inicializado');
      } else {
        // Tentar ler uma coleção (mesmo que vazia)
        const testCollection = collection(db, 'test');
        await getDocs(testCollection);
        updateTest('firestore', 'success', 'Conexão com Firestore OK');
      }
    } catch (error: any) {
      if (error.code === 'permission-denied') {
        updateTest('firestore', 'success', 'Firestore conectado (regras de segurança ativas)');
      } else {
        updateTest('firestore', 'error', `Erro no Firestore: ${error.message}`);
      }
    }

    // Teste 3: Authentication
    updateTest('auth', 'pending', 'Testando Authentication...');
    try {
      if (!auth) {
        updateTest('auth', 'error', 'Authentication não inicializado');
      } else {
        // Verificar se o auth está funcionando (sem criar usuário real)
        updateTest('auth', 'success', 'Authentication configurado');
      }
    } catch (error: any) {
      updateTest('auth', 'error', `Erro no Authentication: ${error.message}`);
    }

    // Teste 4: Estrutura de dados (verificar se organizações existem)
    updateTest('structure', 'pending', 'Verificando estrutura de dados...');
    try {
      if (!db) {
        updateTest('structure', 'error', 'Database não disponível');
      } else {
        const orgsCollection = collection(db, 'organizations');
        const orgsSnapshot = await getDocs(orgsCollection);
        
        if (orgsSnapshot.size > 0) {
          updateTest('structure', 'success', `${orgsSnapshot.size} organizações encontradas`);
        } else {
          updateTest('structure', 'error', 'Nenhuma organização encontrada - execute a migração');
        }
      }
    } catch (error: any) {
      if (error.code === 'permission-denied') {
        updateTest('structure', 'error', 'Sem permissão - faça login primeiro');
      } else {
        updateTest('structure', 'error', `Erro na estrutura: ${error.message}`);
      }
    }

    setLoading(false);
  };

  const getStatusIcon = (status: 'pending' | 'success' | 'error') => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'pending':
        return <AlertCircle className="h-5 w-5 text-yellow-600 animate-pulse" />;
    }
  };

  const tests = [
    {
      id: 'config',
      name: 'Configuração Firebase',
      icon: Shield,
      description: 'Verifica se as credenciais estão corretas'
    },
    {
      id: 'firestore',
      name: 'Conexão Firestore',
      icon: Database,
      description: 'Testa conexão com o banco de dados'
    },
    {
      id: 'auth',
      name: 'Authentication',
      icon: Users,
      description: 'Verifica se o sistema de autenticação está ativo'
    },
    {
      id: 'structure',
      name: 'Estrutura de Dados',
      icon: Database,
      description: 'Verifica se as organizações existem'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Teste de Configuração Firebase</h2>
            <p className="text-gray-600">Verifique se tudo está funcionando corretamente</p>
          </div>
          <button
            onClick={runTests}
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Testando...' : 'Executar Testes'}
          </button>
        </div>

        <div className="space-y-4">
          {tests.map((test) => {
            const Icon = test.icon;
            const status = testResults[test.id];
            const message = testMessages[test.id];

            return (
              <div key={test.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Icon className="h-6 w-6 text-gray-600" />
                    <div>
                      <h3 className="font-medium text-gray-900">{test.name}</h3>
                      <p className="text-sm text-gray-500">{test.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {status && getStatusIcon(status)}
                  </div>
                </div>
                {message && (
                  <div className={`mt-3 p-3 rounded-md text-sm ${
                    status === 'success' ? 'bg-green-50 text-green-800' :
                    status === 'error' ? 'bg-red-50 text-red-800' :
                    'bg-yellow-50 text-yellow-800'
                  }`}>
                    {message}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {Object.keys(testResults).length > 0 && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-medium text-blue-900 mb-2">Próximos Passos:</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              {testResults.config === 'error' && (
                <li>• Configure o arquivo .env.local com suas credenciais Firebase</li>
              )}
              {testResults.firestore === 'error' && (
                <li>• Crie um banco Firestore no Firebase Console</li>
              )}
              {testResults.auth === 'error' && (
                <li>• Habilite Authentication no Firebase Console</li>
              )}
              {testResults.structure === 'error' && (
                <li>• Execute a migração ou crie uma organização de exemplo</li>
              )}
              {Object.values(testResults).every(status => status === 'success') && (
                <li>• ✅ Tudo configurado! O sistema está pronto para uso.</li>
              )}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};