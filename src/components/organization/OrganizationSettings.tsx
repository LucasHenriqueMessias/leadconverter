'use client';

import { useState, useEffect } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { Organization, SalesFunnelStage } from '@/types';
import { DEFAULT_STAGES } from '@/constants/salesFunnel';
import { Settings, Building, Palette, Workflow, Shield } from 'lucide-react';

export const OrganizationSettings = () => {
  const { user, organization, isAdmin } = useAuth();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'general' | 'stages' | 'branding' | 'limits'>('general');
  
  const [formData, setFormData] = useState({
    name: organization?.name || '',
    maxUsers: organization?.maxUsers || 10,
    maxDeals: organization?.maxDeals || 100,
    primaryColor: organization?.settings?.branding?.primaryColor || '#3B82F6',
    secondaryColor: organization?.settings?.branding?.secondaryColor || '#1E40AF',
  });

  const [customStages, setCustomStages] = useState<SalesFunnelStage[]>(
    organization?.settings?.salesStages || DEFAULT_STAGES
  );

  useEffect(() => {
    if (organization) {
      setFormData({
        name: organization.name,
        maxUsers: organization.maxUsers,
        maxDeals: organization.maxDeals,
        primaryColor: organization.settings?.branding?.primaryColor || '#3B82F6',
        secondaryColor: organization.settings?.branding?.secondaryColor || '#1E40AF',
      });
      setCustomStages(organization.settings?.salesStages || DEFAULT_STAGES);
    }
  }, [organization]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.organizationId || !db || !isAdmin) return;

    setLoading(true);
    try {
      await updateDoc(doc(db, 'organizations', user.organizationId), {
        name: formData.name,
        maxUsers: formData.maxUsers,
        maxDeals: formData.maxDeals,
        'settings.branding.primaryColor': formData.primaryColor,
        'settings.branding.secondaryColor': formData.secondaryColor,
        'settings.salesStages': customStages,
        updatedAt: new Date(),
      });

      alert('Configurações atualizadas com sucesso!');
    } catch (error) {
      console.error('Error updating organization:', error);
      alert('Erro ao atualizar configurações');
    } finally {
      setLoading(false);
    }
  };

  const handleStageUpdate = (index: number, field: keyof SalesFunnelStage, value: any) => {
    const updatedStages = [...customStages];
    updatedStages[index] = { ...updatedStages[index], [field]: value };
    setCustomStages(updatedStages);
  };

  const addStage = () => {
    const newStage: SalesFunnelStage = {
      id: `custom-${Date.now()}`,
      name: 'Nova Etapa',
      color: 'bg-gray-500',
      order: customStages.length,
      probability: 50,
      description: 'Descrição da nova etapa',
    };
    setCustomStages([...customStages, newStage]);
  };

  const removeStage = (index: number) => {
    if (customStages.length <= 2) {
      alert('Deve haver pelo menos 2 etapas no funil');
      return;
    }
    const updatedStages = customStages.filter((_, i) => i !== index);
    setCustomStages(updatedStages);
  };

  if (!isAdmin) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-center py-12">
            <Shield className="h-12 w-12 text-gray-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Acesso Restrito
            </h3>
            <p className="text-gray-600">
              Apenas administradores podem acessar as configurações da organização.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'general', label: 'Geral', icon: Building },
    { id: 'stages', label: 'Funil de Vendas', icon: Workflow },
    { id: 'branding', label: 'Visual', icon: Palette },
    { id: 'limits', label: 'Limites', icon: Settings },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Configurações da Organização</h2>
          <p className="text-gray-600 mt-1">
            Gerencie as configurações e preferências da sua organização
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {/* Tab: Geral */}
          {activeTab === 'general' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome da Organização
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Plano Atual
                  </label>
                  <div className="px-3 py-2 bg-gray-100 border border-gray-300 rounded-md text-gray-700">
                    {organization?.plan || 'Não definido'}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Proprietário
                  </label>
                  <div className="px-3 py-2 bg-gray-100 border border-gray-300 rounded-md text-gray-700">
                    {user?.name}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab: Funil de Vendas */}
          {activeTab === 'stages' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">
                  Etapas do Funil de Vendas
                </h3>
                <button
                  type="button"
                  onClick={addStage}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                >
                  Adicionar Etapa
                </button>
              </div>

              <div className="space-y-4">
                {customStages.map((stage, index) => (
                  <div key={stage.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Nome
                        </label>
                        <input
                          type="text"
                          value={stage.name}
                          onChange={(e) => handleStageUpdate(index, 'name', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Cor
                        </label>
                        <select
                          value={stage.color}
                          onChange={(e) => handleStageUpdate(index, 'color', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="bg-gray-500">Cinza</option>
                          <option value="bg-blue-500">Azul</option>
                          <option value="bg-green-500">Verde</option>
                          <option value="bg-yellow-500">Amarelo</option>
                          <option value="bg-orange-500">Laranja</option>
                          <option value="bg-red-500">Vermelho</option>
                          <option value="bg-purple-500">Roxo</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Probabilidade (%)
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={stage.probability}
                          onChange={(e) => handleStageUpdate(index, 'probability', parseInt(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div className="flex items-end">
                        {customStages.length > 2 && (
                          <button
                            type="button"
                            onClick={() => removeStage(index)}
                            className="w-full bg-red-600 text-white px-3 py-2 rounded-md hover:bg-red-700"
                          >
                            Remover
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Descrição
                      </label>
                      <textarea
                        value={stage.description || ''}
                        onChange={(e) => handleStageUpdate(index, 'description', e.target.value)}
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Descrição da etapa..."
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab: Visual */}
          {activeTab === 'branding' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">
                Personalização Visual
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cor Primária
                  </label>
                  <div className="flex items-center space-x-3">
                    <input
                      type="color"
                      value={formData.primaryColor}
                      onChange={(e) => setFormData(prev => ({ ...prev, primaryColor: e.target.value }))}
                      className="w-12 h-10 border border-gray-300 rounded-md"
                    />
                    <input
                      type="text"
                      value={formData.primaryColor}
                      onChange={(e) => setFormData(prev => ({ ...prev, primaryColor: e.target.value }))}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cor Secundária
                  </label>
                  <div className="flex items-center space-x-3">
                    <input
                      type="color"
                      value={formData.secondaryColor}
                      onChange={(e) => setFormData(prev => ({ ...prev, secondaryColor: e.target.value }))}
                      className="w-12 h-10 border border-gray-300 rounded-md"
                    />
                    <input
                      type="text"
                      value={formData.secondaryColor}
                      onChange={(e) => setFormData(prev => ({ ...prev, secondaryColor: e.target.value }))}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Prévia</h4>
                <div className="flex space-x-4">
                  <div 
                    className="w-16 h-16 rounded-lg flex items-center justify-center text-white font-medium"
                    style={{ backgroundColor: formData.primaryColor }}
                  >
                    Primária
                  </div>
                  <div 
                    className="w-16 h-16 rounded-lg flex items-center justify-center text-white font-medium"
                    style={{ backgroundColor: formData.secondaryColor }}
                  >
                    Secundária
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab: Limites */}
          {activeTab === 'limits' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">
                Limites do Plano
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Máximo de Usuários
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.maxUsers}
                    onChange={(e) => setFormData(prev => ({ ...prev, maxUsers: parseInt(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Número máximo de usuários que podem ser criados
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Máximo de Negócios
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.maxDeals}
                    onChange={(e) => setFormData(prev => ({ ...prev, maxDeals: parseInt(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Número máximo de negócios ativos simultâneos
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end pt-6 border-t border-gray-200">
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Salvando...' : 'Salvar Configurações'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};