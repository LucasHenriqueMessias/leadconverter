'use client';

import { useAuth } from '@/contexts/AuthContext';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Bug, User, Building, Shield, RefreshCw } from 'lucide-react';

export const AuthDebug = () => {
  const { 
    user, 
    firebaseUser, 
    organization, 
    loading, 
    approved, 
    firebaseConfigured,
    isAdmin,
    isManager 
  } = useAuth();

  const handleLogout = async () => {
    if (auth) {
      await signOut(auth);
    }
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-300 rounded-lg shadow-lg p-4 max-w-sm z-50">
      <div className="flex items-center space-x-2 mb-3">
        <Bug className="h-4 w-4 text-blue-600" />
        <span className="text-sm font-medium">Debug Auth</span>
        <button
          onClick={handleRefresh}
          className="ml-auto p-1 hover:bg-gray-100 rounded"
          title="Refresh"
        >
          <RefreshCw className="h-3 w-3" />
        </button>
      </div>
      
      <div className="space-y-2 text-xs">
        <div className="flex items-center space-x-2">
          <Shield className="h-3 w-3" />
          <span>Firebase: {firebaseConfigured ? '✅' : '❌'}</span>
        </div>
        
        <div className="flex items-center space-x-2">
          <span>Loading: {loading ? '⏳' : '✅'}</span>
        </div>
        
        <div className="flex items-center space-x-2">
          <User className="h-3 w-3" />
          <span>Firebase User: {firebaseUser ? '✅' : '❌'}</span>
        </div>
        
        <div className="flex items-center space-x-2">
          <span>DB User: {user ? '✅' : '❌'}</span>
        </div>
        
        {user && (
          <div className="pl-4 space-y-1">
            <div>Email: {user.email}</div>
            <div>Name: {user.name}</div>
            <div>Role: {user.role || 'N/A'}</div>
            <div>Approved: {approved ? '✅' : '❌'}</div>
            <div>OrgId: {user.organizationId || 'N/A'}</div>
          </div>
        )}
        
        <div className="flex items-center space-x-2">
          <Building className="h-3 w-3" />
          <span>Organization: {organization ? '✅' : '❌'}</span>
        </div>
        
        {organization && (
          <div className="pl-4 space-y-1">
            <div>Name: {organization.name}</div>
            <div>Plan: {organization.plan}</div>
          </div>
        )}
        
        <div className="pt-2 border-t">
          <div>Admin: {isAdmin ? '✅' : '❌'}</div>
          <div>Manager: {isManager ? '✅' : '❌'}</div>
        </div>
        
        {firebaseUser && (
          <button
            onClick={handleLogout}
            className="w-full mt-2 px-2 py-1 bg-red-100 text-red-800 rounded text-xs hover:bg-red-200"
          >
            Logout
          </button>
        )}
      </div>
    </div>
  );
};