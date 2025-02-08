
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

interface AdminSettings {
  id: string;
  site_name: string;
  contact_email: string;
  enable_notifications: boolean;
  maintenance_mode: boolean;
  theme: string;
}

export default function Settings() {
  const navigate = useNavigate();
  const [settings, setSettings] = useState<AdminSettings>({
    id: '',
    site_name: '',
    contact_email: '',
    enable_notifications: true,
    maintenance_mode: false,
    theme: 'dark'
  });

  const { data, isLoading } = useQuery({
    queryKey: ['admin-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('admin_settings')
        .select('*')
        .single();
      
      if (error) throw error;
      return data as AdminSettings;
    }
  });

  useEffect(() => {
    if (data) {
      setSettings(data);
    }
  }, [data]);

  const handleSaveSettings = async () => {
    try {
      const { error } = await supabase
        .from('admin_settings')
        .upsert([settings]);

      if (error) throw error;
      
      // Show success message
      console.log('Settings saved successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  return (
    <AdminLayout title="Settings">
      <div className="space-y-6">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
          <p className="text-muted-foreground">
            Manage your application settings and preferences
          </p>
        </div>

        <Tabs defaultValue="general" className="space-y-4">
          <TabsList>
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="appearance">Appearance</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>General Settings</CardTitle>
                <CardDescription>
                  Configure your site's basic information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="site_name">Site Name</Label>
                  <Input
                    id="site_name"
                    value={settings.site_name}
                    onChange={(e) => setSettings({ ...settings, site_name: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="contact_email">Contact Email</Label>
                  <Input
                    id="contact_email"
                    type="email"
                    value={settings.contact_email}
                    onChange={(e) => setSettings({ ...settings, contact_email: e.target.value })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Maintenance Mode</Label>
                    <p className="text-sm text-muted-foreground">
                      Enable maintenance mode to show a maintenance page to visitors
                    </p>
                  </div>
                  <Switch
                    checked={settings.maintenance_mode}
                    onCheckedChange={(checked) => setSettings({ ...settings, maintenance_mode: checked })}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Notification Settings</CardTitle>
                <CardDescription>
                  Configure how you receive notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive email notifications for important updates
                    </p>
                  </div>
                  <Switch
                    checked={settings.enable_notifications}
                    onCheckedChange={(checked) => setSettings({ ...settings, enable_notifications: checked })}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="appearance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Appearance Settings</CardTitle>
                <CardDescription>
                  Customize the look and feel of your admin panel
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <Label>Theme</Label>
                  <div className="flex gap-4">
                    <Button
                      variant={settings.theme === 'light' ? 'default' : 'outline'}
                      onClick={() => setSettings({ ...settings, theme: 'light' })}
                    >
                      Light
                    </Button>
                    <Button
                      variant={settings.theme === 'dark' ? 'default' : 'outline'}
                      onClick={() => setSettings({ ...settings, theme: 'dark' })}
                    >
                      Dark
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>
                  Configure security settings for your admin panel
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="current_password">Current Password</Label>
                  <Input id="current_password" type="password" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="new_password">New Password</Label>
                  <Input id="new_password" type="password" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="confirm_password">Confirm New Password</Label>
                  <Input id="confirm_password" type="password" />
                </div>
                <Button className="w-full">Change Password</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end">
          <Button onClick={handleSaveSettings}>Save Changes</Button>
        </div>
      </div>
    </AdminLayout>
  );
}
