'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { AlertCircle, Copy, Eye, EyeOff, Plus, Trash2 } from 'lucide-react';
import { useOrganization } from '@/hooks/useOrganization';
import {
  createApiKey,
  deactivateApiKey,
  listApiKeys,
  type ApiKey,
} from '@/lib/apiKeyManager';

export function ApiKeysManager() {
  const { organization } = useOrganization();
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [generatedKey, setGeneratedKey] = useState<{ key: string; id: string } | null>(null);
  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null);
  const [visibleKeyId, setVisibleKeyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadApiKeys = useCallback(async () => {
    if (!organization?.id) return;

    try {
      setLoading(true);
      setError(null);
      const keys = await listApiKeys(organization.id);
      setApiKeys(keys);
    } catch (err) {
      setError('Erro ao carregar API Keys');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [organization?.id]);

  useEffect(() => {
    loadApiKeys();
  }, [loadApiKeys]);

  const handleCreateKey = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newKeyName.trim()) {
      setError('Nome da API Key e obrigatorio');
      return;
    }

    if (!organization?.id) {
      setError('Organizacao nao identificada');
      return;
    }

    try {
      setCreating(true);
      setError(null);
      const result = await createApiKey(organization.id, newKeyName);

      if (result) {
        setGeneratedKey(result);
        setNewKeyName('');
        await loadApiKeys();
      } else {
        setError('Erro ao criar API Key');
      }
    } catch (err) {
      setError('Erro ao criar API Key');
      console.error(err);
    } finally {
      setCreating(false);
    }
  };

  const handleDeactivate = async (keyId: string) => {
    if (!confirm('Tem certeza? Esta chave nao podera mais ser usada.')) return;

    try {
      const success = await deactivateApiKey(keyId);
      if (success) {
        await loadApiKeys();
      } else {
        setError('Erro ao desativar API Key');
      }
    } catch (err) {
      setError('Erro ao desativar API Key');
      console.error(err);
    }
  };

  const handleCopyKey = (key: string, keyId: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKeyId(keyId);
    setTimeout(() => setCopiedKeyId(null), 2000);
  };

  const maskKey = (key: string): string => {
    if (key.length <= 10) return '***';
    return key.substring(0, 10) + '***' + key.substring(key.length - 4);
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">API Keys</h2>
        <p className="text-gray-600">Gerencie as chaves API para ingestao de leads de sistemas externos.</p>
      </div>

      {generatedKey && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start">
            <div className="flex-1">
              <h3 className="font-semibold text-green-900 mb-2">API Key Criada com Sucesso</h3>
              <p className="text-sm text-green-700 mb-3">Copie sua chave agora. Voce nao podera ve-la novamente.</p>
              <div className="bg-white border border-green-200 rounded p-3 font-mono text-sm break-all">
                {generatedKey.key}
              </div>
              <button
                onClick={() => handleCopyKey(generatedKey.key, generatedKey.id)}
                className="mt-2 inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded font-medium"
              >
                <Copy size={16} />
                {copiedKeyId === generatedKey.id ? 'Copiada!' : 'Copiar Chave'}
              </button>
            </div>
            <button onClick={() => setGeneratedKey(null)} className="text-green-600 hover:text-green-900 text-xl">
              x
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
          <div>
            <h3 className="font-semibold text-red-900">Erro</h3>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleCreateKey} className="mb-6 bg-gray-50 rounded-lg p-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={newKeyName}
            onChange={(e) => setNewKeyName(e.target.value)}
            placeholder="Nome descritivo (ex: Landing Page Principal)"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={creating || !newKeyName.trim()}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium"
          >
            <Plus size={16} />
            {creating ? 'Criando...' : 'Criar Chave'}
          </button>
        </div>
      </form>

      <div>
        <h3 className="font-semibold text-gray-900 mb-3">Chaves Ativas</h3>

        {loading ? (
          <div className="text-center py-8 text-gray-500">Carregando...</div>
        ) : apiKeys.length === 0 ? (
          <div className="text-center py-8 text-gray-500">Nenhuma API Key criada. Crie uma acima para comecar.</div>
        ) : (
          <div className="space-y-3">
            {apiKeys.map((apiKey) => (
              <div key={apiKey.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{apiKey.name}</h4>
                    <div className="mt-2 flex items-center gap-2">
                      <code className="text-sm bg-gray-100 px-2 py-1 rounded font-mono">
                        {visibleKeyId === apiKey.id ? apiKey.key : maskKey(apiKey.key)}
                      </code>
                      <button
                        onClick={() => setVisibleKeyId(visibleKeyId === apiKey.id ? null : apiKey.id)}
                        className="text-gray-500 hover:text-gray-700"
                        title="Mostrar/Ocultar"
                      >
                        {visibleKeyId === apiKey.id ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                      <button onClick={() => handleCopyKey(apiKey.key, apiKey.id)} className="text-gray-500 hover:text-gray-700">
                        {copiedKeyId === apiKey.id ? <span className="text-xs text-green-600">Copiada</span> : <Copy size={16} />}
                      </button>
                    </div>
                    <div className="mt-2 text-xs text-gray-500 space-y-1">
                      <p>
                        Criada em: {apiKey.createdAt.toLocaleDateString('pt-BR')} as {apiKey.createdAt.toLocaleTimeString('pt-BR')}
                      </p>
                      {apiKey.lastUsedAt && (
                        <p>
                          Ultima utilizacao: {apiKey.lastUsedAt.toLocaleDateString('pt-BR')} as{' '}
                          {apiKey.lastUsedAt.toLocaleTimeString('pt-BR')}
                        </p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeactivate(apiKey.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 p-2 rounded"
                    title="Desativar chave"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
