'use client';

import { useState, useEffect } from 'react';
import { SalesFunnel, SalesFunnelStage } from '@/types';
import { X, Plus, Trash2, GripVertical } from 'lucide-react';

interface FunnelFormProps {
  funnel: SalesFunnel | null;
  onSubmit: (data: Omit<SalesFunnel, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onClose: () => void;
}

export const FunnelForm = ({ funnel, onSubmit, onClose }: FunnelFormProps) => {
  const [name, setName] = useState('');
  const [type, setType] = useState<SalesFunnel['type']>('custom');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#3B82F6');
  const [icon, setIcon] = useState('layers');
  const [active, setActive] = useState(true);
  const [stages, setStages] = useState<SalesFunnelStage[]>([]);

  useEffect(() => {
    if (funnel) {
      setName(funnel.name);
      setType(funnel.type);
      setDescription(funnel.description);
      setColor(funnel.color);
      setIcon(funnel.icon);
      setActive(funnel.active);
      setStages(funnel.stages);
    }
  }, [funnel]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || stages.length < 2) {
      alert('Preencha o nome e adicione pelo menos 2 etapas.');
      return;
    }

    const defaultProbabilities: Record<string, number> = {};
    stages.forEach(stage => {
      defaultProbabilities[stage.id] = stage.probability;
    });

    onSubmit({
      name: name.trim(),
      type,
      description: description.trim(),
      color,
      icon,
      active,
      stages,
      defaultProbabilities,
    });
  };

  const addStage = () => {
    const newStage: SalesFunnelStage = {
      id: `stage_${Date.now()}`,
      name: '',
      color: '#94A3B8',
      order: stages.length + 1,
      probability: 50,
    };
    setStages([...stages, newStage]);
  };

  const updateStage = (index: number, field: keyof SalesFunnelStage, value: any) => {
    const updated = [...stages];
    updated[index] = { ...updated[index], [field]: value };
    setStages(updated);
  };

  const removeStage = (index: number) => {
    setStages(stages.filter((_, i) => i !== index));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {funnel ? 'Editar Funil' : 'Novo Funil'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome do Funil *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo *
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as SalesFunnel['type'])}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              >
                <option value="inbound">Inbound</option>
                <option value="outbound">Outbound</option>
                <option value="partnership">Parcerias</option>
                <option value="custom">Personalizado</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descrição
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cor
              </label>
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-full h-10 border border-gray-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ícone
              </label>
              <select
                value={icon}
                onChange={(e) => setIcon(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              >
                <option value="trending-up">Trending Up</option>
                <option value="users">Users</option>
                <option value="handshake">Handshake</option>
                <option value="layers">Layers</option>
              </select>
            </div>

            <div className="flex items-end">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={active}
                  onChange={(e) => setActive(e.target.checked)}
                  className="h-4 w-4 text-blue-600 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">Ativo</span>
              </label>
            </div>
          </div>

          {/* Etapas */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <label className="block text-sm font-medium text-gray-700">
                Etapas do Funil *
              </label>
              <button
                type="button"
                onClick={addStage}
                className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                <Plus className="h-4 w-4" />
                Adicionar Etapa
              </button>
            </div>

            <div className="space-y-2">
              {stages.map((stage, index) => (
                <div key={stage.id} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                  <GripVertical className="h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    value={stage.name}
                    onChange={(e) => updateStage(index, 'name', e.target.value)}
                    placeholder="Nome da etapa"
                    className="flex-1 border border-gray-300 rounded px-2 py-1 text-sm"
                  />
                  <input
                    type="color"
                    value={stage.color}
                    onChange={(e) => updateStage(index, 'color', e.target.value)}
                    className="w-12 h-8 border border-gray-300 rounded"
                  />
                  <input
                    type="number"
                    value={stage.probability}
                    onChange={(e) => updateStage(index, 'probability', Number(e.target.value))}
                    placeholder="%"
                    min="0"
                    max="100"
                    className="w-16 border border-gray-300 rounded px-2 py-1 text-sm"
                  />
                  <span className="text-xs text-gray-500">%</span>
                  <button
                    type="button"
                    onClick={() => removeStage(index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

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
              {funnel ? 'Atualizar' : 'Criar Funil'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
