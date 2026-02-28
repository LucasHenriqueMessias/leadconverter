// utils/migration.ts
import { 
  collection, 
  getDocs, 
  doc, 
  setDoc, 
  updateDoc, 
  writeBatch,
  query,
  where
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { User, Organization, Client, Deal, Task, Quote } from '@/types';
import { getRolePermissions } from '@/lib/permissions';

/**
 * Script de migração para converter dados existentes para a nova estrutura multi-tenant
 * ATENÇÃO: Execute apenas uma vez e faça backup dos dados antes!
 */

export const migrateToMultiTenant = async () => {
  if (!db) {
    throw new Error('Firebase não configurado');
  }

  console.log('🚀 Iniciando migração para multi-tenancy...');

  try {
    // 1. Buscar todos os usuários existentes
    const usersSnapshot = await getDocs(collection(db, 'users'));
    const existingUsers = usersSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as User[];

    console.log(`📊 Encontrados ${existingUsers.length} usuários para migrar`);

    // 2. Criar organizações para cada usuário (assumindo que cada usuário atual será admin da própria org)
    const batch = writeBatch(db);
    const organizationIds: Record<string, string> = {};

    for (const user of existingUsers) {
      // Criar organização para o usuário
      const orgId = `org_${user.id}`;
      const organization: Organization = {
        id: orgId,
        name: `Organização de ${user.name}`,
        plan: 'professional',
        maxUsers: 15,
        maxDeals: 1000,
        ownerId: user.id,
        settings: {
          customFields: [],
          salesStages: [], // Será preenchido com DEFAULT_STAGES
          integrations: [],
          automations: [],
          funnels: [],
          slaRules: [],
          branding: {
            primaryColor: '#3B82F6',
            secondaryColor: '#1E40AF',
          },
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Salvar organização
      batch.set(doc(db, 'organizations', orgId), organization);
      organizationIds[user.id] = orgId;

      // Atualizar usuário com organizationId e role admin
      const updatedUser: Partial<User> = {
        organizationId: orgId,
        role: 'admin',
        permissions: getRolePermissions('admin'),
        approved: true, // Usuários existentes são aprovados automaticamente
      };

      batch.update(doc(db, 'users', user.id), updatedUser);
    }

    // Commit das organizações e usuários
    await batch.commit();
    console.log('✅ Organizações e usuários migrados');

    // 3. Migrar clientes para a nova estrutura
    const clientsSnapshot = await getDocs(collection(db, 'clients'));
    const existingClients = clientsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Client[];

    console.log(`📊 Encontrados ${existingClients.length} clientes para migrar`);

    const clientBatch = writeBatch(db);
    for (const client of existingClients) {
      const orgId = organizationIds[client.userId];
      if (orgId) {
        const updatedClient = {
          ...client,
          organizationId: orgId,
          customFields: {},
          tags: [],
        };

        // Mover para nova estrutura: organizations/{orgId}/clients/{clientId}
        clientBatch.set(
          doc(db, `organizations/${orgId}/clients`, client.id),
          updatedClient
        );
      }
    }
    await clientBatch.commit();
    console.log('✅ Clientes migrados');

    // 4. Migrar deals
    const dealsSnapshot = await getDocs(collection(db, 'deals'));
    const existingDeals = dealsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Deal[];

    console.log(`📊 Encontrados ${existingDeals.length} deals para migrar`);

    const dealBatch = writeBatch(db);
    for (const deal of existingDeals) {
      const orgId = organizationIds[deal.userId];
      if (orgId) {
        const updatedDeal = {
          ...deal,
          organizationId: orgId,
          customFields: {},
          tags: [],
        };

        dealBatch.set(
          doc(db, `organizations/${orgId}/deals`, deal.id),
          updatedDeal
        );
      }
    }
    await dealBatch.commit();
    console.log('✅ Deals migrados');

    // 5. Migrar tasks
    const tasksSnapshot = await getDocs(collection(db, 'tasks'));
    const existingTasks = tasksSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Task[];

    console.log(`📊 Encontradas ${existingTasks.length} tasks para migrar`);

    const taskBatch = writeBatch(db);
    for (const task of existingTasks) {
      const orgId = organizationIds[task.userId];
      if (orgId) {
        const updatedTask = {
          ...task,
          organizationId: orgId,
        };

        taskBatch.set(
          doc(db, `organizations/${orgId}/tasks`, task.id),
          updatedTask
        );
      }
    }
    await taskBatch.commit();
    console.log('✅ Tasks migradas');

    // 6. Migrar quotes
    const quotesSnapshot = await getDocs(collection(db, 'quotes'));
    const existingQuotes = quotesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Quote[];

    console.log(`📊 Encontradas ${existingQuotes.length} quotes para migrar`);

    const quoteBatch = writeBatch(db);
    for (const quote of existingQuotes) {
      const orgId = organizationIds[quote.userId];
      if (orgId) {
        const updatedQuote = {
          ...quote,
          organizationId: orgId,
        };

        quoteBatch.set(
          doc(db, `organizations/${orgId}/quotes`, quote.id),
          updatedQuote
        );
      }
    }
    await quoteBatch.commit();
    console.log('✅ Quotes migradas');

    console.log('🎉 Migração concluída com sucesso!');
    console.log('⚠️  IMPORTANTE: Verifique os dados e depois remova as coleções antigas manualmente');
    
    return {
      success: true,
      migratedUsers: existingUsers.length,
      migratedClients: existingClients.length,
      migratedDeals: existingDeals.length,
      migratedTasks: existingTasks.length,
      migratedQuotes: existingQuotes.length,
    };

  } catch (error) {
    console.error('❌ Erro durante a migração:', error);
    throw error;
  }
};

/**
 * Função para criar uma organização de exemplo com dados de teste
 */
export const createSampleOrganization = async (adminUserId: string, adminEmail: string, adminName: string) => {
  if (!db) {
    throw new Error('Firebase não configurado');
  }

  const orgId = `org_sample_${Date.now()}`;
  
  // Criar organização
  const organization: Organization = {
    id: orgId,
    name: 'Empresa Exemplo LTDA',
    plan: 'professional',
    maxUsers: 15,
    maxDeals: 1000,
    ownerId: adminUserId,
    settings: {
      customFields: [
        {
          id: 'industry',
          name: 'Setor',
          type: 'select',
          options: ['Tecnologia', 'Saúde', 'Educação', 'Varejo'],
          required: false,
          entity: 'client',
        },
      ],
      salesStages: [
        {
          id: 'lead',
          name: 'Lead',
          color: 'bg-gray-500',
          order: 0,
          probability: 10,
          description: 'Primeiro contato',
        },
        {
          id: 'qualified',
          name: 'Qualificado',
          color: 'bg-blue-500',
          order: 1,
          probability: 25,
          description: 'Lead qualificado',
        },
        {
          id: 'proposal',
          name: 'Proposta',
          color: 'bg-yellow-500',
          order: 2,
          probability: 50,
          description: 'Proposta enviada',
        },
        {
          id: 'closed-won',
          name: 'Fechado - Ganho',
          color: 'bg-green-500',
          order: 3,
          probability: 100,
          description: 'Venda realizada',
        },
      ],
      integrations: [],
      automations: [],
      funnels: [],
      slaRules: [],
      branding: {
        primaryColor: '#3B82F6',
        secondaryColor: '#1E40AF',
      },
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  // Salvar organização
  await setDoc(doc(db, 'organizations', orgId), organization);

  // Criar usuário admin
  const adminUser: User = {
    id: adminUserId,
    organizationId: orgId,
    email: adminEmail,
    name: adminName,
    role: 'admin',
    permissions: getRolePermissions('admin'),
    approved: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  await setDoc(doc(db, 'users', adminUserId), adminUser);

  console.log(`✅ Organização de exemplo criada: ${orgId}`);
  return { organizationId: orgId, organization, user: adminUser };
};

/**
 * Função para verificar se a migração já foi executada
 */
export const checkMigrationStatus = async (): Promise<boolean> => {
  if (!db) return false;

  try {
    // Verificar se existem organizações
    const orgsSnapshot = await getDocs(collection(db, 'organizations'));
    return orgsSnapshot.size > 0;
  } catch (error) {
    console.error('Erro ao verificar status da migração:', error);
    return false;
  }
};