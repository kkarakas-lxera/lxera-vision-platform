import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import {
  Settings as SettingsIcon,
  Bell,
  Shield,
  Database,
  Globe,
  Mail,
  Users,
  Key,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';

const Settings = () => {
  const [emailNotifications, setEmailNotifications] = React.useState(true);
  const [maintenanceMode, setMaintenanceMode] = React.useState(false);
  const [autoBackup, setAutoBackup] = React.useState(true);

  const handleSave = () => {
    toast.success('Settings saved successfully');
  };

  return (
    <div className="p-6 space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Platform Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your platform configuration and preferences</p>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Platform Information
              </CardTitle>
              <CardDescription>Basic platform configuration</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="platform-name">Platform Name</Label>
                <Input id="platform-name" defaultValue="LXERA Vision Platform" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="support-email">Support Email</Label>
                <Input id="support-email" type="email" defaultValue="support@lxera.ai" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="timezone">Default Timezone</Label>
                <Input id="timezone" defaultValue="UTC" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                System Configuration
              </CardTitle>
              <CardDescription>Advanced system settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Maintenance Mode</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable to show maintenance page to users
                  </p>
                </div>
                <Switch
                  checked={maintenanceMode}
                  onCheckedChange={setMaintenanceMode}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Automatic Backups</Label>
                  <p className="text-sm text-muted-foreground">
                    Daily automatic database backups
                  </p>
                </div>
                <Switch
                  checked={autoBackup}
                  onCheckedChange={setAutoBackup}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Settings */}
        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Email Notifications
              </CardTitle>
              <CardDescription>Configure email notification preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>New Demo Requests</Label>
                  <p className="text-sm text-muted-foreground">
                    Get notified when new demo requests arrive
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>New Company Registrations</Label>
                  <p className="text-sm text-muted-foreground">
                    Alert when new companies sign up
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>System Alerts</Label>
                  <p className="text-sm text-muted-foreground">
                    Critical system notifications and errors
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security Settings
              </CardTitle>
              <CardDescription>Platform security configuration</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label>Session Timeout (minutes)</Label>
                <Input type="number" defaultValue="30" />
              </div>
              <div className="grid gap-2">
                <Label>Maximum Login Attempts</Label>
                <Input type="number" defaultValue="5" />
              </div>
              <div className="grid gap-2">
                <Label>Password Minimum Length</Label>
                <Input type="number" defaultValue="8" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                API Keys
              </CardTitle>
              <CardDescription>Manage API access keys</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-yellow-900">API key management coming soon</p>
                    <p className="text-yellow-700 mt-1">
                      This feature will allow you to create and manage API keys for integrations.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Integrations Settings */}
        <TabsContent value="integrations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                SSO Configuration
              </CardTitle>
              <CardDescription>Single Sign-On settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label>SAML 2.0 Endpoint</Label>
                <Input placeholder="https://your-idp.com/saml" />
              </div>
              <div className="grid gap-2">
                <Label>Entity ID</Label>
                <Input placeholder="your-entity-id" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Email Service
              </CardTitle>
              <CardDescription>Configure email delivery service</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label>SMTP Host</Label>
                <Input placeholder="smtp.example.com" />
              </div>
              <div className="grid gap-2">
                <Label>SMTP Port</Label>
                <Input type="number" placeholder="587" />
              </div>
              <div className="grid gap-2">
                <Label>SMTP Username</Label>
                <Input placeholder="username@example.com" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave}>
          Save Settings
        </Button>
      </div>
    </div>
  );
};

export default Settings;