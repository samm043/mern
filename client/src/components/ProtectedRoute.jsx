import { useAuth } from '../hooks/useAuth';
import { useLocation } from 'wouter';
import { useEffect } from 'react';

export function ProtectedRoute({ path, component: Component }) {
  const { user, isLoading } = useAuth();
  const [location, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && !user) {
      setLocation('/auth');
    }
  }, [user, isLoading, setLocation]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect in useEffect
  }

  return <Component />;
}

export function AdminRoute({ path, component: Component }) {
  const { user, isLoading } = useAuth();
  const [location, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'admin')) {
      setLocation('/');
    }
  }, [user, isLoading, setLocation]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 text-lg mb-4">Access Denied</div>
        <p className="text-gray-600 mb-4">You don't have permission to access this page.</p>
        <button
          onClick={() => setLocation('/')}
          className="text-blue-600 hover:underline"
        >
          Go to Dashboard
        </button>
      </div>
    );
  }

  return <Component />;
}