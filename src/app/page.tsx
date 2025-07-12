'use client';

import { useAuth } from '@/contexts/AuthContext';
import { LoginForm } from '@/components/auth/LoginForm';
import { Dashboard } from '@/components/dashboard/Dashboard';
import { PendingApproval } from '@/components/auth/PendingApproval';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { FirebaseConfigurationError } from '@/components/ui/FirebaseConfigurationError';

export default function Home() {
  const { user, loading, approved, firebaseConfigured } = useAuth();

  if (!firebaseConfigured) {
    return <FirebaseConfigurationError />;
  }

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <LoginForm />;
  }

  if (!approved) {
    return <PendingApproval />;
  }

  return <Dashboard />;
}
