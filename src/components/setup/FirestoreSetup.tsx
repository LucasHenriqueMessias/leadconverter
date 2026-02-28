'use client';

import { useState } from 'react';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { Database, AlertTriangle, CheckCircle, ExternalLink } from 'lucide-react';

export const FirestoreSetup = () => {
  const { firebaseUser } = useAuth();
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  const testFirestore = async () => {
    if (!firebaseUser || !db) return;

    setTesting(true);
    setTestResult(null);
    setErrorMessage('');

    try {
      // Tentar escrever um documento de teste
      const testDoc = doc(db, 'test', 'connection');
      await setDoc(testDoc, {
        test: true,
        timestamp: new Date(),
        userId: firebaseUser.uid
      });

      // Tentar ler o documento
      const docSnap = await getDoc(testDoc);
      
      if (docSnap.exists()) {
        setTestResult('success');
      } else {
        throw new Error('Documento não foi criado');
      }
    } catch (error: any) {
      console.error('Erro no teste do Firestore:', error);
      setTestResult('error');
      setErrorMessage(error.message || 'Erro desconhecido');
    } finally {
      setTesting(false);
    }
  };

  const createUserDirectly = async () => {
    if (!firebaseUser || !db) return;

    try {
      // Tentar criar o usuário diretamente com regras mais simples
      await setDoc(doc(db, 'users', firebaseUser.uid), {
        name: 'Usuário Temporário',
        email: firebaseUser.email,
        organizationId: '',
        role: 'admin',
        permissions: [],
        approved: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      alert('Usuário criado! Recarregando página...');
      window.location.reload();
    } catch (error: any) {
      console.error('Erro ao criar usuário:', error);
      alert(`Erro: ${error.message}`);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-red-100">
            <Database className="h-6 w-6 text-red-600" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Configuração do Firestore Necessária
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            O banco de dados precisa ser configurado no Firebase Console
          </p>
        </div>

        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="space-y-6">
              {/* Erro atual */}
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex">
                  <AlertTriangle className="h-5 w-5 text-red-400" />
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">
                      Erro de Permissão
                    </h3>
                    <div className="mt-2 text-sm text-red-700">
                      <p>Missing or insufficient permissions</p>
                      <p className="mt-1">O Firestore não está configurado ou as regras são muito restritivas.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Teste de conexão */}
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    Teste de Conexão
                  </h3>
                  <button
                    onClick={testFirestore}
                    disabled={testing}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    {testing ? 'Testando...' : 'Testar Firestore'}
                  </button>
                </div>

                {testResult === 'success' && (
                  <div className="flex items-center text-green-600">
                    <CheckCircle className="h-5 w-5 mr-2" />
                    <span>Firestore funcionando! Tente recarregar a página.</span>
                  </div>
                )}

                {testResult === 'error' && (
                  <div className="text-red-600">
                    <p>Erro: {errorMessage}</p>
                  </div>
                )}
              </div>

              {/* Instruções */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="text-sm font-medium text-blue-800 mb-3">
                  Como Resolver:
                </h3>
                <ol className="text-sm text-blue-700 space-y-2 list-decimal list-inside">
                  <li>
                    <strong>Acesse o Firebase Console:</strong>
                    <a 
                      href="https://console.firebase.google.com/project/leadbox-ad65e/firestore"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center ml-2 text-blue-600 hover:text-blue-800"
                    >
                      Abrir Firestore
                      <ExternalLink className="h-3 w-3 ml-1" />
                    </a>
                  </li>
                  <li><strong>Clique em "Create database"</strong> se não existir</li>
                  <li><strong>Escolha "Start in test mode"</strong> (temporário)</li>
                  <li><strong>Selecione uma região</strong> (ex: southamerica-east1)</li>
                  <li><strong>Aguarde a criação</strong> e volte aqui</li>
                </ol>
              </div>

              {/* Regras temporárias */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h3 className="text-sm font-medium text-yellow-800 mb-3">
                  Regras Temporárias (Opcional):
                </h3>
                <p className="text-sm text-yellow-700 mb-3">
                  Se o problema persistir, aplique estas regras temporárias no Firestore:
                </p>
                <pre className="bg-gray-800 text-green-400 p-3 rounded text-xs overflow-x-auto">
{`rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}`}
                </pre>
                <p className="text-xs text-yellow-600 mt-2">
                  ⚠️ Essas regras são permissivas. Substitua pelas regras de produção depois.
                </p>
              </div>

              {/* Botão de emergência */}
              <div className="border-t pt-4">
                <button
                  onClick={createUserDirectly}
                  className="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
                >
                  Tentar Criar Usuário Mesmo Assim
                </button>
                <p className="text-xs text-gray-500 mt-2 text-center">
                  Use apenas se o Firestore estiver configurado mas ainda der erro
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};