'use client';

import { useState } from 'react';
import { Tag } from '@/types';
import { X, Plus } from 'lucide-react';

interface TagSelectorProps {
  selectedTags: string[];
  availableTags: Tag[];
  onChange: (tags: string[]) => void;
  entityType: 'client' | 'deal' | 'task';
}

export const TagSelector = ({ selectedTags, availableTags, onChange, entityType }: TagSelectorProps) => {
  const [isOpen, setIsOpen] = useState(false);

  // Filtrar tags disponíveis para este tipo de entidade
  const filteredTags = availableTags.filter(tag => 
    tag.entityTypes.includes(entityType)
  );

  const handleToggleTag = (tagId: string) => {
    if (selectedTags.includes(tagId)) {
      onChange(selectedTags.filter(id => id !== tagId));
    } else {
      onChange([...selectedTags, tagId]);
    }
  };

  const getTagById = (tagId: string) => {
    return availableTags.find(tag => tag.id === tagId);
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Tags
      </label>
      
      {/* Tags selecionadas */}
      <div className="flex flex-wrap gap-2 mb-2">
        {selectedTags.map(tagId => {
          const tag = getTagById(tagId);
          if (!tag) return null;
          
          return (
            <span
              key={tagId}
              className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium text-white"
              style={{ backgroundColor: tag.color }}
            >
              {tag.name}
              <button
                type="button"
                onClick={() => handleToggleTag(tagId)}
                className="ml-2 hover:opacity-75"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          );
        })}
      </div>

      {/* Botão para adicionar tags */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center justify-between"
        >
          <span>Adicionar tags...</span>
          <Plus className="h-4 w-4" />
        </button>

        {/* Dropdown de tags */}
        {isOpen && (
          <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
            {filteredTags.length === 0 ? (
              <div className="px-3 py-2 text-sm text-gray-500">
                Nenhuma tag disponível
              </div>
            ) : (
              filteredTags.map(tag => (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => {
                    handleToggleTag(tag.id);
                    setIsOpen(false);
                  }}
                  className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center space-x-2 ${
                    selectedTags.includes(tag.id) ? 'bg-blue-50' : ''
                  }`}
                >
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: tag.color }}
                  />
                  <span className="flex-1">{tag.name}</span>
                  {tag.category && (
                    <span className="text-xs text-gray-500">{tag.category}</span>
                  )}
                </button>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};
