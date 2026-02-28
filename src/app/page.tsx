'use client';

import { useAuth } from '@/contexts/AuthContext';
import { LoginForm } from '@/components/auth/LoginForm';
import { Dashboard } from '@/components/dashboard/Dashboard';
import { PendingApproval } from '@/components/auth/PendingApproval';
import { UserSetup } from '@/components/auth/UserSetup';
import { FirestoreSetup } from '@/components/setup/FirestoreSetup';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { FirebaseConfigurationError } from '@/components/ui/FirebaseConfigurationError';
import { useState, useEffect } from 'react';

export default function Home() {
  const { user, firebaseUser, loading, approved, firebaseConfigured } = useAuth();
  const [showFirestoreSetup, setShowFirestoreSetup] = useState(false);

  // Detectar se precisa mostrar setup do Firestore
  useEffect(() => {
    if (firebaseUser && !user && !loading) {
      const timer = setTimeout(() => {
        setShowFirestoreSetup(true);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [firebaseUser, user, loading]);

  if (!firebaseConfigured) {
    return <FirebaseConfigurationError />;
  }

  if (loading) {
    return <LoadingSpinner />;
  }

  // Se o usuário está autenticado no Firebase mas não existe no Firestore
  if (firebaseUser && !user) {
    if (showFirestoreSetup) {
      return <FirestoreSetup />;
    }
    
    return <UserSetup />;
  }

  if (!user) {
    return <LoginForm />;
  }

  if (!approved) {
    return <PendingApproval />;
  }

  return <Dashboard />;
}
