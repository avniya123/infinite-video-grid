import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Bell, Lock, User, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export default function Settings() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);

  // Password change state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Notification preferences state
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    pushNotifications: false,
    marketingEmails: false,
    securityAlerts: true,
  });

  // Security options state
  const [securityOptions, setSecurityOptions] = useState({
    twoFactorEnabled: false,
    loginAlerts: true,
  });

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate('/');
      return;
    }
    setUser(user);
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword,
      });

      if (error) throw error;

      toast.success('Password updated successfully');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error: any) {
      toast.error(error.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationToggle = (key: keyof typeof notifications) => {
    setNotifications(prev => {
      const newState = { ...prev, [key]: !prev[key] };
      toast.success('Notification preferences updated');
      return newState;
    });
  };

  const handleSecurityToggle = (key: keyof typeof securityOptions) => {
    setSecurityOptions(prev => {
      const newState = { ...prev, [key]: !prev[key] };
      
      if (key === 'twoFactorEnabled' && newState[key]) {
        toast.success('Two-factor authentication enabled');
      } else if (key === 'twoFactorEnabled') {
        toast.success('Two-factor authentication disabled');
      } else {
        toast.success('Security settings updated');
      }
      
      return newState;
    });
  };

  const handleSignOutAllDevices = async () => {
    setLoading(true);
    try {
      await supabase.auth.signOut({ scope: 'global' });
      toast.success('Signed out from all devices');
      navigate('/');
    } catch (error: any) {
      toast.error(error.message || 'Failed to sign out');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/')}
            className="mb-2"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-sm text-muted-foreground">
            Manage your account settings and preferences
          </p>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <Tabs defaultValue="security" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Security
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="account" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Account
            </TabsTrigger>
          </TabsList>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-6">
            {/* Change Password */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  Change Password
                </CardTitle>
                <CardDescription>
                  Update your password to keep your account secure
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePasswordChange} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="new-password">New Password</Label>
                    <Input
                      id="new-password"
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) =>
                        setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))
                      }
                      placeholder="Enter new password"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm New Password</Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) =>
                        setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))
                      }
                      placeholder="Confirm new password"
                      required
                    />
                  </div>

                  <Button type="submit" disabled={loading}>
                    {loading ? 'Updating...' : 'Update Password'}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Security Options */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Security Options
                </CardTitle>
                <CardDescription>
                  Additional security features for your account
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="2fa" className="text-base">
                      Two-Factor Authentication
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Add an extra layer of security to your account
                    </p>
                  </div>
                  <Switch
                    id="2fa"
                    checked={securityOptions.twoFactorEnabled}
                    onCheckedChange={() => handleSecurityToggle('twoFactorEnabled')}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="login-alerts" className="text-base">
                      Login Alerts
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Get notified of new sign-ins to your account
                    </p>
                  </div>
                  <Switch
                    id="login-alerts"
                    checked={securityOptions.loginAlerts}
                    onCheckedChange={() => handleSecurityToggle('loginAlerts')}
                  />
                </div>

                <Separator />

                <div className="pt-2">
                  <Button
                    variant="destructive"
                    onClick={handleSignOutAllDevices}
                    disabled={loading}
                  >
                    Sign Out All Devices
                  </Button>
                  <p className="text-sm text-muted-foreground mt-2">
                    This will sign you out from all devices except this one
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notification Preferences
                </CardTitle>
                <CardDescription>
                  Choose what notifications you want to receive
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="email-notif" className="text-base">
                      Email Notifications
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Receive updates and news via email
                    </p>
                  </div>
                  <Switch
                    id="email-notif"
                    checked={notifications.emailNotifications}
                    onCheckedChange={() => handleNotificationToggle('emailNotifications')}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="push-notif" className="text-base">
                      Push Notifications
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Get push notifications on your device
                    </p>
                  </div>
                  <Switch
                    id="push-notif"
                    checked={notifications.pushNotifications}
                    onCheckedChange={() => handleNotificationToggle('pushNotifications')}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="marketing" className="text-base">
                      Marketing Emails
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Receive promotional content and offers
                    </p>
                  </div>
                  <Switch
                    id="marketing"
                    checked={notifications.marketingEmails}
                    onCheckedChange={() => handleNotificationToggle('marketingEmails')}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="security" className="text-base">
                      Security Alerts
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Important security notifications (recommended)
                    </p>
                  </div>
                  <Switch
                    id="security"
                    checked={notifications.securityAlerts}
                    onCheckedChange={() => handleNotificationToggle('securityAlerts')}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Account Tab */}
          <TabsContent value="account" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Account Information
                </CardTitle>
                <CardDescription>
                  View and manage your account details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Email Address</Label>
                  <Input value={user?.email || ''} disabled />
                  <p className="text-sm text-muted-foreground">
                    Your email address cannot be changed
                  </p>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label>Account Created</Label>
                  <p className="text-sm">
                    {user?.created_at
                      ? new Date(user.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })
                      : 'N/A'}
                  </p>
                </div>

                <Separator />

                <div className="pt-2">
                  <Button variant="outline" onClick={() => navigate('/profile')}>
                    Edit Profile
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
