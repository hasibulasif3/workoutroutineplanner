import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAdmin();
  }, []);

  const checkAdmin = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate('/admin/login');
        return;
      }

      const { data: adminUser, error } = await supabase
        .from('admin_users')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error || !adminUser) {
        navigate('/admin/login');
        return;
      }

      setLoading(false);
    } catch (error) {
      navigate('/admin/login');
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Products</CardTitle>
          </CardHeader>
          <CardContent>
            <button 
              className="text-blue-600 hover:text-blue-800"
              onClick={() => navigate('/admin/products')}
            >
              Manage Products →
            </button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Promotional Banners</CardTitle>
          </CardHeader>
          <CardContent>
            <button 
              className="text-blue-600 hover:text-blue-800"
              onClick={() => navigate('/admin/banners')}
            >
              Manage Banners →
            </button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}