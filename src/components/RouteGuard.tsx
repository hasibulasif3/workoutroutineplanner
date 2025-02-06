import { ReactNode, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface RouteGuardProps {
  children: ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
}

export function RouteGuard({ 
  children, 
  requireAuth = false,
  redirectTo = '/login' 
}: RouteGuardProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    // Check authorization status
    const checkAuth = async () => {
      try {
        // Add your auth check logic here
        const isAuthenticated = true; // Replace with actual auth check
        
        if (requireAuth && !isAuthenticated) {
          toast.error('Please log in to access this page');
          navigate(redirectTo, { 
            state: { from: location.pathname }
          });
          return;
        }
        
        setIsAuthorized(true);
      } catch (error) {
        console.error('Auth check failed:', error);
        setIsAuthorized(false);
        navigate(redirectTo);
      }
    };

    checkAuth();
  }, [location, navigate, redirectTo, requireAuth]);

  if (!isAuthorized) {
    return null;
  }

  return <>{children}</>;
}