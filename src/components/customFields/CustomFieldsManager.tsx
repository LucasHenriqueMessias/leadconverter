'use client';

import { useState, useEffect } from 'react';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { CustomField } from '@/types';
import { Plus, Edit2, Trash2, Settings, Type, Hash, Calendar, List, CheckSquare } from 'lucide-react';
import { CustomFieldForm } from './CustomFieldForm';

export const CustomFieldsManager = () => {
  const { user, organization } = useAuth();
  const [customFields, setCustomFields] = useState<CustomField[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingField, setEditingField] = useState<CustomField | null>(null);
  const [selectedEntity, setSelectedEntity] = useState<'client' | 'deal' | 'task' | 'quote'>('client');

  useEffect(() => {
    if (organization?.settings?.customFields) {
      setCustomFields(organization.settings.customFields);
    }
  }, [organization]);

  const filteredFields = customFields.filter(field => field.entity === selectedEntity);

  const handleSaveField = async (fieldData: Omit<CustomField, 'id'>) => {
    if (!user?.organizationId || !db) {
      console.error('Missing user.organizationId or db:', { 
        hasUser: !!user, 
        organizationId: user?.organizationId, 
        hasDb: !!db 
      });
      alert('Erro: Usuário ou banco de dados não disponível.');
      return;
    }

    console.log('Saving field:', fieldData);
    console.log('Organization ID:', user.organizationId);
    console.log('Current organization:', organization);

    try {
      let updatedFields: CustomField[];

      if (editingField) {
        // Atualizar campo existente
        updatedFields = customFields.map(field =>
          field.id === editingField.id
            ? { ...fieldData, id: editingField.id }
            : field
        );
        console.log('Updating existing field');
      } else {
        // Criar novo campo
        const newField: CustomField = {
          ...fieldData,
          id: `field_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        };
        updatedFields = [...customFields, newField];
        console.log('Creating new field:', newField);
      }

      // Remover campos undefined antes de salvar
      const cleanedFields = updatedFields.map(field => {
        const cleanField: any = {
          id: field.id,
          name: field.name,
          type: field.type,
          required: field.required,
          entity: field.entity,
        };
        
        // Adicionar options apenas se existir e tiver itens
        if (field.options && field.options.length > 0) {
          cleanField.options = field.options;
        }
        
        return cleanField;
      });

      console.log('Cleaned fields to save:', cleanedFields);

      // Verificar se a organização tem a estrutura settings
      const orgRef = doc(db, 'organizations', user.organizationId);
      const orgDoc = await getDoc(orgRef);
      
      if (!orgDoc.exists()) {
        throw new Error('Organização não encontrada');
      }

      const orgData = orgDoc.data();
      console.log('Current org data:', orgData);

      // Se não tem settings, criar estrutura completa
      if (!orgData.settings) {
        console.log('Creating settings structure...');
        await updateDoc(orgRef, {
          settings: {
            customFields: cleanedFields,
            salesStages: [],
            integrations: [],
            branding: {
              primaryColor: '#3B82F6',
              secondaryColor: '#1E40AF',
            },
          },
        });
      } else {
        // Atualizar apenas customFields
        await updateDoc(orgRef, {
          'settings.customFields': cleanedFields,
        });
      }

      console.log('Field saved successfully!');
      setCustomFields(updatedFields);
      setIsFormOpen(false);
      setEditingField(null);
      alert('Campo salvo com sucesso!');
    } catch (error) {
      console.error('Error saving custom field:', error);
      alert(`Erro ao salvar campo customizado: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  };

  const handleDeleteField = async (fieldId: string) => {
    if (!confirm('Tem certeza que deseja excluir este campo? Os dados existentes serão mantidos mas o campo não aparecerá mais nos formulários.')) return;
    if (!user?.organizationId || !db) return;

    try {
      const updatedFields = customFields.filter(field => field.id !== fieldId);

      await updateDoc(doc(db, 'organizations', user.organizationId), {
        'settings.customFields': updatedFields,
      });

      setCustomFields(updatedFields);
    } catch (error) {
      console.error('Error deleting custom field:', error);
      alert('Erro ao excluir campo. Tente novamente.');
    }
  };

  const openAddForm = () => {
    setEditingField(null);
    setIsFormOpen(true);
  };

  const openEditForm = (field: CustomField) => {
    setEditingField(field);
    setIsFormOpen(true);
  };

  const getFieldTypeIcon = (type: CustomField['type']) => {
    switch (type) {
      case 'text':
        return <Type className="h-4 w-4" />;
      case 'number':
        return <Hash className="h-4 w-4" />;
      case 'date':
        return <Calendar className="h-4 w-4" />;
      case 'select':
        return <List className="h-4 w-4" />;
      case 'multiselect':
        return <CheckSquare className="h-4 w-4" />;
      default:
        return <Type className="h-4 w-4" />;
    }
  };

  const getFieldTypeLabel = (type: CustomField['type']) => {
    const labels = {
      text: 'Texto',
      number: 'Número',
      date: 'Data',
      select: 'Seleção Única',
      multiselect: 'Seleção Múltipla',
    };
    return labels[type];
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Settings className="h-6 w-6" />
            Campos Customizados
          </h2>
          <p className="text-gray-600 mt-1">
            Personalize os campos de acordo com as necessidades da sua organização
          </p>
          {/* Debug Info */}
          <div className="text-xs text-gray-500 mt-1">
            Org ID: {user?.organizationId || 'N/A'} | 
            Total campos: {customFields.length} | 
            DB: {db ? '✓' : '✗'}
          </div>
        </div>
        <button
          onClick={openAddForm}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          <span>Novo Campo</span>
        </button>
      </div>

      {/* Tabs de Entidade */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <div className="flex">
            <button
              onClick={() => setSelectedEntity('client')}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                selectedEntity === 'client'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Clientes
            </button>
            <button
              onClick={() => setSelectedEntity('deal')}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                selectedEntity === 'deal'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Negócios
            </button>
            <button
              onClick={() => setSelectedEntity('task')}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                selectedEntity === 'task'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Tarefas
            </button>
            <button
              onClick={() => setSelectedEntity('quote')}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                selectedEntity === 'quote'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Orçamentos
            </button>
          </div>
        </div>

        {/* Lista de Campos */}
        <div className="p-6">
          {filteredFields.length === 0 ? (
            <div className="text-center py-12">
              <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhum campo customizado
              </h3>
              <p className="text-gray-600 mb-4">
                Crie campos personalizados para capturar informações específicas do seu negócio
              </p>
              <button
                onClick={openAddForm}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Criar Primeiro Campo
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredFields.map((field) => (
                <div
                  key={field.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                      {getFieldTypeIcon(field.type)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-gray-900">{field.name}</h3>
                        {field.required && (
                          <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded">
                            Obrigatório
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm text-gray-600">
                          {getFieldTypeLabel(field.type)}
                        </span>
                        {field.options && field.options.length > 0 && (
                          <span className="text-xs text-gray-500">
                            • {field.options.length} opções
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => openEditForm(field)}
                      className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                      title="Editar"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteField(field.id)}
                      className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg"
                      title="Excluir"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Informações */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-blue-900 mb-2">💡 Dicas de Uso</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• <strong>Texto</strong>: Para informações livres (ex: Observações, Referência)</li>
          <li>• <strong>Número</strong>: Para valores numéricos (ex: Número de Funcionários, Faturamento)</li>
          <li>• <strong>Data</strong>: Para datas específicas (ex: Data de Fundação, Vencimento do Contrato)</li>
          <li>• <strong>Seleção Única</strong>: Para escolher uma opção (ex: Origem do Lead, Porte da Empresa)</li>
          <li>• <strong>Seleção Múltipla</strong>: Para escolher várias opções (ex: Produtos de Interesse, Canais)</li>
        </ul>
      </div>

      {/* Formulário */}
      {isFormOpen && (
        <CustomFieldForm
          field={editingField}
          entity={selectedEntity}
          onSubmit={handleSaveField}
          onClose={() => {
            setIsFormOpen(false);
            setEditingField(null);
          }}
        />
      )}
    </div>
  );
};
