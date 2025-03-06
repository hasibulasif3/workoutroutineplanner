
import { useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { SettingsSidebar } from '@/components/settings/SettingsSidebar';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

export default function Settings() {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    if (!isLoading && !user) {
      toast({
        title: 'Authentication required',
        description: 'You need to be logged in to access settings',
        variant: 'destructive',
      });
      navigate('/auth/login', { replace: true });
    }

    // Redirect to profile page if we're at /settings root
    if (location.pathname === '/settings') {
      navigate('/settings/profile', { replace: true });
    }
  }, [user, isLoading, navigate, location.pathname, toast]);

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-[70vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!user) {
    return null; // Will redirect via the useEffect
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Settings</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <SettingsSidebar />
          </div>
          <div className="md:col-span-3">
            <Outlet />
          </div>
        </div>
      </div>
    </Layout>
  );
}
