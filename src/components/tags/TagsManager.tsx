'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Tag, Segment } from '@/types';
import { Tags, Plus, Edit2, Trash2, Filter, Users, Target } from 'lucide-react';

export const TagsManager = () => {
  const { organization } = useAuth();
  const [activeTab, setActiveTab] = useState<'tags' | 'segments'>('tags');
  const [showTagForm, setShowTagForm] = useState(false);
  const [showSegmentForm, setShowSegmentForm] = useState(false);

  // Mock data - em produção viria do Firestore
  const tags: Tag[] = [
    {
      id: '1',
      organizationId: organization?.id || '',
      name: 'VIP',
      color: '#FFD700',
      category: 'status',
      description: 'Clientes de alto valor',
      entityTypes: ['client', 'deal'],
      usageCount: 45,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: '2',
      organizationId: organization?.id || '',
      name: 'Urgente',
      color: '#EF4444',
      category: 'prioridade',
      description: 'Requer atenção imediata',
      entityTypes: ['deal', 'task'],
      usageCount: 23,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: '3',
      organizationId: organization?.id || '',
      name: 'Inbound',
      color: '#3B82F6',
      category: 'origem',
      description: 'Lead que veio por marketing',
      entityTypes: ['client', 'deal'],
      usageCount: 156,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: '4',
      organizationId: organization?.id || '',
      name: 'Produto A',
      color: '#10B981',
      category: 'produto',
      description: 'Interessado no Produto A',
      entityTypes: ['client', 'deal'],
      usageCount: 89,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  const segments: Segment[] = [
    {
      id: '1',
      organizationId: organization?.id || '',
      name: 'Clientes Inativos',
      description: 'Sem interação nos últimos 30 dias',
      entityType: 'client',
      filters: [
        { field: 'lastInteractionDate', operator: 'less_than', value: '30 days' }
      ],
      color: '#EF4444',
      icon: 'AlertCircle',
      count: 34,
      lastCalculated: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: '2',
      organizationId: organization?.id || '',
      name: 'Deals de Alto Valor',
      description: 'Negócios acima de R$ 50.000',
      entityType: 'deal',
      filters: [
        { field: 'value', operator: 'greater_than', value: 50000 }
      ],
      color: '#10B981',
      icon: 'TrendingUp',
      count: 12,
      lastCalculated: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: '3',
      organizationId: organization?.id || '',
      name: 'Leads Quentes',
      description: 'Score A ou B com interação recente',
      entityType: 'client',
      filters: [
        { field: 'leadScore.grade', operator: 'in', value: ['A', 'B'], logicalOperator: 'AND' },
        { field: 'lastInteractionDate', operator: 'greater_than', value: '7 days' }
      ],
      color: '#F59E0B',
      icon: 'Flame',
      count: 28,
      lastCalculated: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  const tagCategories = [
    { id: 'status', name: 'Status', color: '#FFD700' },
    { id: 'origem', name: 'Origem', color: '#3B82F6' },
    { id: 'produto', name: 'Produto', color: '#10B981' },
    { id: 'prioridade', name: 'Prioridade', color: '#EF4444' },
    { id: 'interesse', name: 'Interesse', color: '#8B5CF6' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Tags e Segmentação</h2>
          <p className="text-gray-600 mt-1">
            Organize e segmente seus clientes e negócios
          </p>
        </div>
        <button
          onClick={() => activeTab === 'tags' ? setShowTagForm(true) : setShowSegmentForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          <span>{activeTab === 'tags' ? 'Nova Tag' : 'Novo Segmento'}</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('tags')}
            className={`
              py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2
              ${activeTab === 'tags'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }
            `}
          >
            <Tags className="h-5 w-5" />
            <span>Tags</span>
            <span className="bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full text-xs">
              {tags.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('segments')}
            className={`
              py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2
              ${activeTab === 'segments'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }
            `}
          >
            <Filter className="h-5 w-5" />
            <span>Segmentos</span>
            <span className="bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full text-xs">
              {segments.length}
            </span>
          </button>
        </nav>
      </div>

      {/* Tags View */}
      {activeTab === 'tags' && (
        <div className="space-y-6">
          {/* Categories */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Categorias</h3>
            <div className="flex flex-wrap gap-3">
              {tagCategories.map((category) => (
                <div
                  key={category.id}
                  className="px-4 py-2 rounded-lg border-2 border-gray-200 hover:border-blue-500 cursor-pointer transition-colors"
                  style={{ borderColor: category.color + '40' }}
                >
                  <div className="flex items-center space-x-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: category.color }}
                    />
                    <span className="font-medium text-gray-900">{category.name}</span>
                    <span className="text-sm text-gray-500">
                      ({tags.filter(t => t.category === category.id).length})
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tags List */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Todas as Tags</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {tags.map((tag) => (
                  <div
                    key={tag.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: tag.color }}
                        />
                        <h4 className="font-medium text-gray-900">{tag.name}</h4>
                      </div>
                      <div className="flex items-center space-x-1">
                        <button className="p-1 text-gray-400 hover:text-blue-600">
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button className="p-1 text-gray-400 hover:text-red-600">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    
                    {tag.description && (
                      <p className="text-sm text-gray-600 mb-3">{tag.description}</p>
                    )}
                    
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span className="bg-gray-100 px-2 py-1 rounded">
                        {tag.category}
                      </span>
                      <span>{tag.usageCount} usos</span>
                    </div>
                    
                    <div className="flex items-center space-x-2 mt-3 text-xs text-gray-500">
                      {tag.entityTypes.map((type) => (
                        <span key={type} className="bg-blue-50 text-blue-600 px-2 py-1 rounded">
                          {type}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Segments View */}
      {activeTab === 'segments' && (
        <div className="space-y-4">
          {segments.map((segment) => (
            <div key={segment.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div
                    className="p-3 rounded-lg"
                    style={{ backgroundColor: segment.color + '20' }}
                  >
                    {segment.entityType === 'client' ? (
                      <Users className="h-6 w-6" style={{ color: segment.color }} />
                    ) : (
                      <Target className="h-6 w-6" style={{ color: segment.color }} />
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{segment.name}</h3>
                    <p className="text-sm text-gray-600 mt-1">{segment.description}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="p-2 text-gray-400 hover:text-blue-600">
                    <Edit2 className="h-5 w-5" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-red-600">
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-6">
                  <div>
                    <div className="text-2xl font-bold text-gray-900">{segment.count}</div>
                    <div className="text-sm text-gray-600">
                      {segment.entityType === 'client' ? 'Clientes' : 'Negócios'}
                    </div>
                  </div>
                  <div className="border-l border-gray-200 pl-6">
                    <div className="text-sm text-gray-600">Filtros</div>
                    <div className="text-sm font-medium text-gray-900 mt-1">
                      {segment.filters.length} condições
                    </div>
                  </div>
                </div>
                <button
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Ver {segment.entityType === 'client' ? 'Clientes' : 'Negócios'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
