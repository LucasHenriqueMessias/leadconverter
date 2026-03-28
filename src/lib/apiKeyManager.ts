import { db } from './firebase';
import {
  Timestamp,
  addDoc,
  collection,
  doc,
  getDocs,
  query,
  updateDoc,
  where,
} from 'firebase/firestore';

export interface ApiKey {
  id: string;
  organizationId: string;
  key: string;
  name: string;
  createdAt: Date;
  lastUsedAt?: Date;
  isActive: boolean;
}

export function generateApiKey(organizationId: string): string {
  const randomPart = Math.random().toString(36).substring(2, 18);
  return `lc_${organizationId}_${randomPart}`;
}

export async function createApiKey(
  organizationId: string,
  name: string
): Promise<{ key: string; id: string } | null> {
  if (!db) {
    return null;
  }

  try {
    const newKey = generateApiKey(organizationId);
    const docRef = await addDoc(collection(db, 'apiKeys'), {
      organizationId,
      key: newKey,
      name,
      createdAt: Timestamp.now(),
      isActive: true,
    });

    return { key: newKey, id: docRef.id };
  } catch (error) {
    console.error('Erro ao criar API Key:', error);
    return null;
  }
}

export async function deactivateApiKey(apiKeyId: string): Promise<boolean> {
  if (!db) {
    return false;
  }

  try {
    await updateDoc(doc(db, 'apiKeys', apiKeyId), { isActive: false });
    return true;
  } catch (error) {
    console.error('Erro ao desativar API Key:', error);
    return false;
  }
}

export async function listApiKeys(organizationId: string): Promise<ApiKey[]> {
  if (!db) {
    return [];
  }

  try {
    const q = query(collection(db, 'apiKeys'), where('organizationId', '==', organizationId));
    const snapshot = await getDocs(q);

    return snapshot.docs.map((item) => ({
      id: item.id,
      ...item.data(),
      createdAt: (item.data().createdAt as Timestamp).toDate(),
      lastUsedAt: item.data().lastUsedAt
        ? (item.data().lastUsedAt as Timestamp).toDate()
        : undefined,
    })) as ApiKey[];
  } catch (error) {
    console.error('Erro ao listar API Keys:', error);
    return [];
  }
}
