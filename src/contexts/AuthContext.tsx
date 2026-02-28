'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, isFirebaseConfigured } from '@/lib/firebase';
import { User, Organization } from '@/types';
import { hasPermission } from '@/lib/permissions';

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  organization: Organization | null;
  loading: boolean;
  approved: boolean;
  firebaseConfigured: boolean;
  hasPermission: (resource: any, action: any, scope?: any) => boolean;
  isAdmin: boolean;
  isManager: boolean;
  canManageUsers: boolean;
  canViewReports: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  firebaseUser: null,
  organization: null,
  loading: true,
  approved: false,
  firebaseConfigured: false,
  hasPermission: () => false,
  isAdmin: false,
  isManager: false,
  canManageUsers: false,
  canViewReports: false,
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);
  const firebaseConfigured = isFirebaseConfigured();

  useEffect(() => {
    if (!firebaseConfigured || !auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setFirebaseUser(firebaseUser);
      
      if (firebaseUser && db) {
        try {
          // Buscar dados do usuário
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data() as User;
            
            // Se o usuário não tem organizationId, criar uma organização para ele
            let finalUserData = userData;
            if (!userData.organizationId) {
              console.log('Usuário sem organização, criando uma nova...');
              
              const orgId = `org_${firebaseUser.uid}`;
              const organization = {
                id: orgId,
                name: `Organização de ${userData.name || 'Usuário'}`,
                plan: 'professional' as const,
                maxUsers: 15,
                maxDeals: 1000,
                ownerId: firebaseUser.uid,
                settings: {
                  customFields: [],
                  salesStages: [],
                  integrations: [],
                  branding: {
                    primaryColor: '#3B82F6',
                    secondaryColor: '#1E40AF',
                  },
                },
                createdAt: new Date(),
                updatedAt: new Date(),
              };
              
              // Criar organização
              await setDoc(doc(db, 'organizations', orgId), organization);
              
              // Atualizar usuário com organizationId e role admin
              const updatedUserData = {
                ...userData,
                organizationId: orgId,
                role: 'admin' as const,
                permissions: [],
                approved: true, // Aprovar automaticamente usuários existentes
              };
              
              await setDoc(doc(db, 'users', firebaseUser.uid), updatedUserData);
              finalUserData = updatedUserData;
            }
            
            const userWithId = {
              ...finalUserData,
              id: firebaseUser.uid,
              createdAt: finalUserData.createdAt,
              updatedAt: finalUserData.updatedAt,
            };
            setUser(userWithId);

            // Buscar dados da organização
            if (finalUserData.organizationId) {
              const orgDoc = await getDoc(doc(db, 'organizations', finalUserData.organizationId));
              if (orgDoc.exists()) {
                const orgData = orgDoc.data() as Organization;
                setOrganization({
                  ...orgData,
                  id: orgDoc.id,
                });
              }
            }
          } else {
            setUser(null);
            setOrganization(null);
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          setUser(null);
          setOrganization(null);
        }
      } else {
        setUser(null);
        setOrganization(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, [firebaseConfigured]);

  // If Firebase is not configured, set loading to false immediately
  useEffect(() => {
    if (!firebaseConfigured) {
      setLoading(false);
    }
  }, [firebaseConfigured]);

  const approved = user?.approved || false;
  const isAdmin = user?.role === 'admin';
  const isManager = user?.role === 'manager';
  const canManageUsers = isAdmin;
  const canViewReports = isAdmin || isManager;

  const checkPermission = (resource: any, action: any, scope: any = 'own') => {
    if (!user) return false;
    return hasPermission(user.role, resource, action, scope);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      firebaseUser, 
      organization,
      loading, 
      approved, 
      firebaseConfigured,
      hasPermission: checkPermission,
      isAdmin,
      isManager,
      canManageUsers,
      canViewReports,
    }}>
      {children}
    </AuthContext.Provider>
  );
};
