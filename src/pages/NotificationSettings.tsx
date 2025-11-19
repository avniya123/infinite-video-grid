import { useState } from 'react';
import { ArrowLeft, Bell, Heart, MessageSquare, Download, Share2, Upload, Mail, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';

interface NotificationPreferences {
  likes: boolean;
  comments: boolean;
  downloads: boolean;
  shares: boolean;
  uploads: boolean;
  system: boolean;
  emailNotifications: boolean;
  pushNotifications: boolean;
  weeklyDigest: boolean;
  marketingEmails: boolean;
}

const defaultPreferences: NotificationPreferences = {
  likes: true,
  comments: true,
  downloads: true,
  shares: true,
  uploads: true,
  system: true,
  emailNotifications: true,
  pushNotifications: false,
  weeklyDigest: true,
  marketingEmails: false,
};

export default function NotificationSettings() {
  const navigate = useNavigate();
  const [preferences, setPreferences] = useState<NotificationPreferences>(defaultPreferences);
  const [isSaving, setIsSaving] = useState(false);

  const handleToggle = (key: keyof NotificationPreferences) => {
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSaving(false);
    toast.success('Notification preferences saved successfully!');
  };

  const handleReset = () => {
    setPreferences(defaultPreferences);
    toast.info('Preferences reset to default');
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Back Button */}
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => navigate('/')}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Gallery
        </Button>

        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Notification Settings</h1>
          <p className="text-muted-foreground">
            Manage how you receive notifications and updates about your videos and activity.
          </p>
        </div>

        <div className="space-y-6">
          {/* Activity Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-primary" />
                Activity Notifications
              </CardTitle>
              <CardDescription>
                Get notified about interactions with your videos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center">
                    <Heart className="w-5 h-5 text-red-500" />
                  </div>
                  <div>
                    <Label htmlFor="likes" className="text-base font-medium cursor-pointer">
                      Likes
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      When someone likes your video
                    </p>
                  </div>
                </div>
                <Switch
                  id="likes"
                  checked={preferences.likes}
                  onCheckedChange={() => handleToggle('likes')}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                    <MessageSquare className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <Label htmlFor="comments" className="text-base font-medium cursor-pointer">
                      Comments
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      When someone comments on your video
                    </p>
                  </div>
                </div>
                <Switch
                  id="comments"
                  checked={preferences.comments}
                  onCheckedChange={() => handleToggle('comments')}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
                    <Download className="w-5 h-5 text-green-500" />
                  </div>
                  <div>
                    <Label htmlFor="downloads" className="text-base font-medium cursor-pointer">
                      Downloads
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      When your video is downloaded
                    </p>
                  </div>
                </div>
                <Switch
                  id="downloads"
                  checked={preferences.downloads}
                  onCheckedChange={() => handleToggle('downloads')}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center">
                    <Share2 className="w-5 h-5 text-purple-500" />
                  </div>
                  <div>
                    <Label htmlFor="shares" className="text-base font-medium cursor-pointer">
                      Shares
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      When your video is shared
                    </p>
                  </div>
                </div>
                <Switch
                  id="shares"
                  checked={preferences.shares}
                  onCheckedChange={() => handleToggle('shares')}
                />
              </div>
            </CardContent>
          </Card>

          {/* System Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5 text-primary" />
                System Notifications
              </CardTitle>
              <CardDescription>
                Updates about your uploads and system changes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center">
                    <Upload className="w-5 h-5 text-orange-500" />
                  </div>
                  <div>
                    <Label htmlFor="uploads" className="text-base font-medium cursor-pointer">
                      Upload Status
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Updates about your video uploads
                    </p>
                  </div>
                </div>
                <Switch
                  id="uploads"
                  checked={preferences.uploads}
                  onCheckedChange={() => handleToggle('uploads')}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center">
                    <Bell className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div>
                    <Label htmlFor="system" className="text-base font-medium cursor-pointer">
                      System Updates
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      New features and important announcements
                    </p>
                  </div>
                </div>
                <Switch
                  id="system"
                  checked={preferences.system}
                  onCheckedChange={() => handleToggle('system')}
                />
              </div>
            </CardContent>
          </Card>

          {/* Delivery Methods */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-primary" />
                Delivery Methods
              </CardTitle>
              <CardDescription>
                Choose how you want to receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center">
                    <Mail className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div>
                    <Label htmlFor="emailNotifications" className="text-base font-medium cursor-pointer">
                      Email Notifications
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Receive notifications via email
                    </p>
                  </div>
                </div>
                <Switch
                  id="emailNotifications"
                  checked={preferences.emailNotifications}
                  onCheckedChange={() => handleToggle('emailNotifications')}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center">
                    <Smartphone className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div>
                    <Label htmlFor="pushNotifications" className="text-base font-medium cursor-pointer">
                      Push Notifications
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Receive push notifications in your browser
                    </p>
                  </div>
                </div>
                <Switch
                  id="pushNotifications"
                  checked={preferences.pushNotifications}
                  onCheckedChange={() => handleToggle('pushNotifications')}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center">
                    <Mail className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div>
                    <Label htmlFor="weeklyDigest" className="text-base font-medium cursor-pointer">
                      Weekly Digest
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Get a weekly summary of your activity
                    </p>
                  </div>
                </div>
                <Switch
                  id="weeklyDigest"
                  checked={preferences.weeklyDigest}
                  onCheckedChange={() => handleToggle('weeklyDigest')}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center">
                    <Mail className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div>
                    <Label htmlFor="marketingEmails" className="text-base font-medium cursor-pointer">
                      Marketing Emails
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Tips, offers, and product updates
                    </p>
                  </div>
                </div>
                <Switch
                  id="marketingEmails"
                  checked={preferences.marketingEmails}
                  onCheckedChange={() => handleToggle('marketingEmails')}
                />
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 justify-end pt-4">
            <Button
              variant="outline"
              onClick={handleReset}
            >
              Reset to Default
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : 'Save Preferences'}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
