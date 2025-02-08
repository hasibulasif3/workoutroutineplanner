
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Plus, Eye, Edit, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

interface Banner {
  id: string;
  title: string;
  description: string;
  image_url: string;
  message: string;
  is_active: boolean;
  start_date: string;
  end_date: string;
  type: string;
  position: string;
}

export default function Banners() {
  const navigate = useNavigate();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newBanner, setNewBanner] = useState({
    title: '',
    description: '',
    image_url: '',
    message: '',
    is_active: true,
    start_date: '',
    end_date: '',
    type: 'info',
    position: 'top'
  });

  const { data: banners, isLoading, refetch } = useQuery({
    queryKey: ['banners'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('promotional_banners')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  const handleAddBanner = async () => {
    try {
      const { error } = await supabase
        .from('promotional_banners')
        .insert([newBanner]);

      if (error) throw error;
      
      setShowAddDialog(false);
      setNewBanner({
        title: '',
        description: '',
        image_url: '',
        message: '',
        is_active: true,
        start_date: '',
        end_date: '',
        type: 'info',
        position: 'top'
      });
      refetch();
    } catch (error) {
      console.error('Error adding banner:', error);
    }
  };

  return (
    <AdminLayout title="Promotional Banners">
      <div className="space-y-6 p-4 md:p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-1">
            <h2 className="text-xl md:text-2xl font-bold tracking-tight">Promotional Banners</h2>
            <p className="text-sm md:text-base text-muted-foreground">
              Manage your promotional banners and campaigns
            </p>
          </div>
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button className="w-full md:w-auto">
                <Plus className="mr-2 h-4 w-4" />
                Add Banner
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add New Banner</DialogTitle>
                <DialogDescription>
                  Create a new promotional banner for your campaigns
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={newBanner.title}
                    onChange={(e) => setNewBanner({ ...newBanner, title: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    value={newBanner.description}
                    onChange={(e) => setNewBanner({ ...newBanner, description: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="image">Image URL</Label>
                  <Input
                    id="image"
                    value={newBanner.image_url}
                    onChange={(e) => setNewBanner({ ...newBanner, image_url: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="start_date">Start Date</Label>
                    <Input
                      id="start_date"
                      type="date"
                      value={newBanner.start_date}
                      onChange={(e) => setNewBanner({ ...newBanner, start_date: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="end_date">End Date</Label>
                    <Input
                      id="end_date"
                      type="date"
                      value={newBanner.end_date}
                      onChange={(e) => setNewBanner({ ...newBanner, end_date: e.target.value })}
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddBanner}>Add Banner</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {isLoading ? (
            <p>Loading...</p>
          ) : banners?.map((banner) => (
            <Card key={banner.id} className="overflow-hidden flex flex-col">
              <div className="aspect-video relative">
                <img
                  src={banner.image_url}
                  alt={banner.title}
                  className="object-cover w-full h-full"
                />
                {banner.is_active && (
                  <div className="absolute top-2 right-2">
                    <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                      Active
                    </span>
                  </div>
                )}
              </div>
              <CardContent className="p-4 flex-1 flex flex-col">
                <div className="space-y-2 flex-1">
                  <h3 className="font-semibold text-lg">{banner.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">{banner.description}</p>
                  <div className="text-xs text-muted-foreground mt-2">
                    {new Date(banner.start_date).toLocaleDateString()} -{' '}
                    {new Date(banner.end_date).toLocaleDateString()}
                  </div>
                  <div className="flex justify-end gap-2 pt-2 mt-auto">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}
