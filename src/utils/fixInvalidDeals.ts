// utils/fixInvalidDeals.ts
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export const fixInvalidDeals = async (userId: string) => {
  if (!db) return false;
  
  try {
    const dealsQuery = query(
      collection(db, 'deals'),
      where('userId', '==', userId)
    );
    
    const dealsSnapshot = await getDocs(dealsQuery);
    const validStages = ['lead', 'qualified', 'proposal', 'negotiation', 'closed-won', 'closed-lost'];
    
    const updates: Promise<void>[] = [];
    
    dealsSnapshot.docs.forEach((dealDoc) => {
      const dealData = dealDoc.data();
      
      // Se o stage não está na lista de stages válidos, corrigir para 'lead'
      if (!validStages.includes(dealData.stage) && db) {
        console.log(`Corrigindo deal ${dealDoc.id} com stage inválido: ${dealData.stage}`);
        updates.push(
          updateDoc(doc(db, 'deals', dealDoc.id), {
            stage: 'lead',
            updatedAt: new Date(),
          })
        );
      }
    });
    
    if (updates.length > 0) {
      await Promise.all(updates);
      console.log(`${updates.length} deal(s) corrigido(s)`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Erro ao corrigir deals:', error);
    return false;
  }
};
