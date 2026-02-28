'use client';

import { useState, useEffect } from 'react';
import { CustomField } from '@/types';
import { X, Plus, Trash2 } from 'lucide-react';

interface CustomFieldFormProps {
  field: CustomField | null;
  entity: 'client' | 'deal' | 'task' | 'quote';
  onSubmit: (data: Omit<CustomField, 'id'>) => void;
  onClose: () => void;
}

export const CustomFieldForm = ({ field, entity, onSubmit, onClose }: CustomFieldFormProps) => {
  const [name, setName] = useState('');
  const [type, setType] = useState<CustomField['type']>('text');
  const [required, setRequired] = useState(false);
  const [options, setOptions] = useState<string[]>([]);
  const [newOption, setNewOption] = useState('');

  useEffect(() => {
    if (field) {
      setName(field.name);
      setType(field.type);
      setRequired(field.required);
      setOptions(field.options || []);
    }
  }, [field]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      alert('Por favor, informe o nome do campo.');
      return;
    }

    if ((type === 'select' || type === 'multiselect') && options.length === 0) {
      alert('Por favor, adicione pelo menos uma opção.');
      return;
    }

    const fieldData: any = {
      name: name.trim(),
      type,
      required,
      entity,
    };

    // Adicionar options apenas se for select/multiselect e tiver opções
    if ((type === 'select' || type === 'multiselect') && options.length > 0) {
      fieldData.options = options;
    }

    onSubmit(fieldData);
  };

  const handleAddOption = () => {
    if (!newOption.trim()) return;
    if (options.includes(newOption.trim())) {
      alert('Esta opção já existe.');
      return;
    }
    setOptions([...options, newOption.trim()]);
    setNewOption('');
  };

  const handleRemoveOption = (index: number) => {
    setOptions(options.filter((_, i) => i !== index));
  };

  const needsOptions = type === 'select' || type === 'multiselect';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {field ? 'Editar Campo Customizado' : 'Novo Campo Customizado'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Nome do Campo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nome do Campo *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Ex: Número de Funcionários, Origem do Lead..."
              required
            />
            <p className="text-xs text-gray-600 mt-1">
              Este nome aparecerá nos formulários de {
                entity === 'client' ? 'clientes' : 
                entity === 'deal' ? 'negócios' : 
                entity === 'task' ? 'tarefas' : 
                'orçamentos'
              }
            </p>
          </div>

          {/* Tipo do Campo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo do Campo *
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as CustomField['type'])}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="text">Texto</option>
              <option value="number">Número</option>
              <option value="date">Data</option>
              <option value="select">Seleção Única</option>
              <option value="multiselect">Seleção Múltipla</option>
            </select>
          </div>

          {/* Opções (para select e multiselect) */}
          {needsOptions && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Opções *
              </label>
              
              {/* Lista de Opções */}
              {options.length > 0 && (
                <div className="space-y-2 mb-3">
                  {options.map((option, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                    >
                      <span className="text-sm text-gray-900">{option}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveOption(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Adicionar Nova Opção */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newOption}
                  onChange={(e) => setNewOption(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddOption();
                    }
                  }}
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Digite uma opção e clique em Adicionar"
                />
                <button
                  type="button"
                  onClick={handleAddOption}
                  className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Adicionar
                </button>
              </div>
              <p className="text-xs text-gray-600 mt-1">
                Adicione as opções que estarão disponíveis para seleção
              </p>
            </div>
          )}

          {/* Campo Obrigatório */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="required"
              checked={required}
              onChange={(e) => setRequired(e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="required" className="ml-2 text-sm text-gray-700">
              Campo obrigatório
            </label>
          </div>

          {/* Preview */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Preview</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {name || 'Nome do Campo'} {required && <span className="text-red-500">*</span>}
              </label>
              {type === 'text' && (
                <input
                  type="text"
                  disabled
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white"
                  placeholder="Campo de texto"
                />
              )}
              {type === 'number' && (
                <input
                  type="number"
                  disabled
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white"
                  placeholder="Campo numérico"
                />
              )}
              {type === 'date' && (
                <input
                  type="date"
                  disabled
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white"
                />
              )}
              {type === 'select' && (
                <select
                  disabled
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white"
                >
                  <option>Selecione uma opção</option>
                  {options.map((option, index) => (
                    <option key={index}>{option}</option>
                  ))}
                </select>
              )}
              {type === 'multiselect' && (
                <div className="border border-gray-300 rounded-lg p-3 bg-white">
                  {options.length > 0 ? (
                    options.map((option, index) => (
                      <div key={index} className="flex items-center mb-2 last:mb-0">
                        <input
                          type="checkbox"
                          disabled
                          className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                        />
                        <label className="ml-2 text-sm text-gray-700">{option}</label>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">Adicione opções acima</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Botões */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              {field ? 'Atualizar Campo' : 'Criar Campo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
