'use client';

import { useState } from 'react';
import { migrateToMultiTenant, checkMigrationStatus, createSampleOrganization } from '@/utils/migration';
import { Database, AlertTriangle, CheckCircle, Play, Users } from 'lucide-react';

export const MigrationPanel = () => {
  const [loading, setLoading] = useState(false);
  const [migrationStatus, setMigrationStatus] = useState<'not-checked' | 'needed' | 'completed'>('not-checked');
  const [migrationResult, setMigrationResult] = useState<any>(null);

  const checkStatus = async () => {
    setLoading(true);
    try {
      const isCompleted = await checkMigrationStatus();
      setMigrationStatus(isCompleted ? 'completed' : 'needed');
    } catch (error) {
      console.error('Erro ao verificar status:', error);
      alert('Erro ao verificar status da migração');
    } finally {
      setLoading(false);
    }
  };

  const runMigration = async () => {
    if (!confirm('ATENÇÃO: Esta operação irá migrar todos os dados existentes para a nova estrutura multi-tenant. Certifique-se de ter feito backup dos dados. Continuar?')) {
      return;
    }

    setLoading(true);
    try {
      const result = await migrateToMultiTenant();
      setMigrationResult(result);
      setMigrationStatus('completed');
      alert('Migração concluída com sucesso!');
    } catch (error) {
      console.error('Erro na migração:', error);
      alert('Erro durante a migração. Verifique o console para detalhes.');
    } finally {
      setLoading(false);
    }
  };

  const createSample = async () => {
    const adminName = prompt('Nome do administrador:');
    const adminEmail = prompt('Email do administrador:');
    
    if (!adminName || !adminEmail) {
      alert('Nome e email são obrigatórios');
      return;
    }

    setLoading(true);
    try {
      const adminUserId = `user_${Date.now()}`;
      const result = await createSampleOrganization(adminUserId, adminEmail, adminName);
      alert(`Organização de exemplo criada!\nID: ${result.organizationId}\nUsuário Admin: ${adminEmail}`);
    } catch (error) {
      console.error('Erro ao criar organização:', error);
      alert('Erro ao criar organização de exemplo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center space-x-3 mb-6">
          <Database className="h-8 w-8 text-blue-600" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Painel de Migração</h2>
            <p className="text-gray-600">Migre dados existentes para a nova estrutura multi-tenant</p>
          </div>
        </div>

        {/* Status da Migração */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2" />
            <div>
              <h3 className="text-sm font-medium text-yellow-800">
                Importante - Leia antes de continuar
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <ul className="list-disc list-inside space-y-1">
                  <li>Faça backup completo dos dados antes de executar a migração</li>
                  <li>A migração deve ser executada apenas uma vez</li>
                  <li>Todos os usuários existentes se tornarão admins de suas próprias organizações</li>
                  <li>Os dados serão movidos para a nova estrutura hierárquica</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Verificar Status */}
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div>
              <h3 className="text-lg font-medium text-gray-900">1. Verificar Status</h3>
              <p className="text-sm text-gray-600">
                Verifique se a migração já foi executada
              </p>
            </div>
            <button
              onClick={checkStatus}
              disabled={loading}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Verificando...' : 'Verificar'}
            </button>
          </div>

          {migrationStatus !== 'not-checked' && (
            <div className={`p-4 rounded-lg ${
              migrationStatus === 'completed' 
                ? 'bg-green-50 border border-green-200' 
                : 'bg-red-50 border border-red-200'
            }`}>
              <div className="flex items-center">
                {migrationStatus === 'completed' ? (
                  <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
                )}
                <span className={`font-medium ${
                  migrationStatus === 'completed' ? 'text-green-800' : 'text-red-800'
                }`}>
                  {migrationStatus === 'completed' 
                    ? 'Migração já foi executada' 
                    : 'Migração necessária'
                  }
                </span>
              </div>
            </div>
          )}

          {/* Executar Migração */}
          {migrationStatus === 'needed' && (
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div>
                <h3 className="text-lg font-medium text-gray-900">2. Executar Migração</h3>
                <p className="text-sm text-gray-600">
                  Migrar todos os dados existentes para a nova estrutura
                </p>
              </div>
              <button
                onClick={runMigration}
                disabled={loading}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 disabled:opacity-50 flex items-center space-x-2"
              >
                <Play className="h-4 w-4" />
                <span>{loading ? 'Migrando...' : 'Executar Migração'}</span>
              </button>
            </div>
          )}

          {/* Resultado da Migração */}
          {migrationResult && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="text-lg font-medium text-green-800 mb-2">
                Migração Concluída com Sucesso!
              </h3>
              <div className="text-sm text-green-700 space-y-1">
                <p>• {migrationResult.migratedUsers} usuários migrados</p>
                <p>• {migrationResult.migratedClients} clientes migrados</p>
                <p>• {migrationResult.migratedDeals} negócios migrados</p>
                <p>• {migrationResult.migratedTasks} tarefas migradas</p>
                <p>• {migrationResult.migratedQuotes} orçamentos migrados</p>
              </div>
              <div className="mt-3 p-3 bg-yellow-100 border border-yellow-300 rounded">
                <p className="text-sm text-yellow-800">
                  <strong>Próximos passos:</strong> Verifique se todos os dados foram migrados corretamente 
                  e depois remova as coleções antigas manualmente no Firebase Console.
                </p>
              </div>
            </div>
          )}

          {/* Criar Organização de Exemplo */}
          <div className="border-t border-gray-200 pt-6">
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div>
                <h3 className="text-lg font-medium text-gray-900">Criar Organização de Exemplo</h3>
                <p className="text-sm text-gray-600">
                  Criar uma organização com dados de exemplo para testes
                </p>
              </div>
              <button
                onClick={createSample}
                disabled={loading}
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50 flex items-center space-x-2"
              >
                <Users className="h-4 w-4" />
                <span>{loading ? 'Criando...' : 'Criar Exemplo'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};