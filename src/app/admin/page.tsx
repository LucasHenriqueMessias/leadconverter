'use client';

import { useState } from 'react';
import { FirebaseTest } from '@/components/admin/FirebaseTest';
import { MigrationPanel } from '@/components/admin/MigrationPanel';
import { Settings, Database, TestTube } from 'lucide-react';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<'test' | 'migration'>('test');

  const tabs = [
    { id: 'test', label: 'Teste Firebase', icon: TestTube },
    { id: 'migration', label: 'Migração', icon: Database },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <Settings className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Painel de Administração</h1>
              <p className="text-gray-600">Configure e teste o sistema</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8">
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
        </div>

        {/* Content */}
        {activeTab === 'test' && <FirebaseTest />}
        {activeTab === 'migration' && <MigrationPanel />}
      </div>
    </div>
  );
}