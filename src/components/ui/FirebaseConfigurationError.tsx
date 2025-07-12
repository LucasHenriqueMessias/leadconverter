'use client';

import { AlertTriangle, ExternalLink } from 'lucide-react';

export const FirebaseConfigurationError = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-red-100">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Configuração Necessária
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Firebase não está configurado
          </p>
        </div>

        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Para usar o LeadConverter, você precisa:
              </h3>
              
              <ol className="list-decimal list-inside space-y-3 text-sm text-gray-600">
                <li>
                  <a 
                    href="https://console.firebase.google.com/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-500 inline-flex items-center"
                  >
                    Criar um projeto no Firebase Console
                    <ExternalLink className="h-3 w-3 ml-1" />
                  </a>
                </li>
                <li>Habilitar Authentication (Email/Password)</li>
                <li>Criar um banco de dados Firestore</li>
                <li>Copiar as credenciais do Firebase</li>
                <li>Configurar o arquivo <code className="bg-gray-100 px-1 rounded">.env.local</code></li>
              </ol>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <h4 className="text-sm font-medium text-gray-900 mb-2">
                Arquivo .env.local
              </h4>
              <div className="bg-gray-100 p-3 rounded-md text-xs font-mono">
                <div className="space-y-1">
                  <div>NEXT_PUBLIC_FIREBASE_API_KEY=sua-api-key</div>
                  <div>NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=seu-projeto.firebaseapp.com</div>
                  <div>NEXT_PUBLIC_FIREBASE_PROJECT_ID=seu-projeto-id</div>
                  <div>NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=seu-projeto.appspot.com</div>
                  <div>NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789</div>
                  <div>NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123</div>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-md">
              <p className="text-sm text-blue-800">
                <strong>Dica:</strong> Após configurar o Firebase, reinicie o servidor de desenvolvimento com <code>npm run dev</code>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
