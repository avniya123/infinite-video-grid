import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Camera, Loader2, LogOut, User, Shield, Info, Key, Mail, Globe } from 'lucide-react';
import { profileSchema, type ProfileFormData } from '@/lib/validations';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';

interface ProfileDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ProfileDrawer({ open, onOpenChange }: ProfileDrawerProps) {
  const { t, i18n } = useTranslation();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState<ProfileFormData>({
    fullName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    address: '',
    pincode: '',
  });
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [errors, setErrors] = useState<Partial<Record<keyof ProfileFormData, string>>>({});
  const [activeTab, setActiveTab] = useState('profile');
  
  // Notification preferences state
  // Password change state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Security options state
  const [securityOptions, setSecurityOptions] = useState({
    twoFactorEnabled: false,
    loginAlerts: true,
  });

  // Language preference state
  const [language, setLanguage] = useState(i18n.language || 'en');

  useEffect(() => {
    if (open) {
      checkUser();
      setLanguage(i18n.language || 'en');
    }
  }, [open, i18n.language]);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      onOpenChange(false);
      return;
    }
    setUser(session.user);
    await loadProfile(session.user.id);
  };

  const loadProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;

      if (data) {
        setFormData({
          fullName: data.full_name || '',
          email: data.email || '',
          phone: data.phone || '',
          dateOfBirth: data.date_of_birth || '',
          address: data.address || '',
          pincode: data.pincode || '',
        });
        setAvatarUrl(data.avatar_url);
      }
    } catch (error: any) {
      console.error('Error loading profile:', error);
      toast.error(t('toast.profileLoadError'));
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name as keyof ProfileFormData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (!file.type.startsWith('image/')) {
      toast.error(t('toast.uploadImageFile'));
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error(t('toast.imageMaxSize'));
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}/avatar.${fileExt}`;

      if (avatarUrl) {
        const oldPath = avatarUrl.split('/').slice(-2).join('/');
        await supabase.storage.from('avatars').remove([oldPath]);
      }

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id);

      if (updateError) throw updateError;

      setAvatarUrl(publicUrl);
      toast.success('Avatar updated successfully');
    } catch (error: any) {
      console.error('Error uploading avatar:', error);
      toast.error('Failed to upload avatar');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const validatedData = profileSchema.parse(formData);
      setSaving(true);

      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: validatedData.fullName,
          email: validatedData.email,
          phone: validatedData.phone,
          date_of_birth: validatedData.dateOfBirth,
          address: validatedData.address,
          pincode: validatedData.pincode,
        })
        .eq('id', user.id);

      if (error) throw error;

      toast.success('Profile updated successfully');
      setErrors({});
    } catch (error: any) {
      if (error.errors) {
        const formattedErrors: Partial<Record<keyof ProfileFormData, string>> = {};
        error.errors.forEach((err: any) => {
          const field = err.path[0] as keyof ProfileFormData;
          formattedErrors[field] = err.message;
        });
        setErrors(formattedErrors);
      } else {
        toast.error('Failed to update profile');
      }
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error(t('toast.passwordsNoMatch'));
      return;
    }

    if (passwordData.newPassword.length < 8) {
      toast.error(t('toast.passwordTooShort'));
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword,
      });

      if (error) throw error;

      toast.success(t('toast.passwordUpdated'));
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error: any) {
      toast.error(error.message || t('toast.passwordUpdateError'));
    } finally {
      setSaving(false);
    }
  };

  const handleSecurityToggle = (key: keyof typeof securityOptions) => {
    setSecurityOptions(prev => {
      const newState = { ...prev, [key]: !prev[key] };
      
      if (key === 'twoFactorEnabled' && newState[key]) {
        toast.success(t('toast.twoFactorEnabled'));
      } else if (key === 'twoFactorEnabled') {
        toast.success(t('toast.twoFactorDisabled'));
      } else {
        toast.success(t('toast.securityUpdated'));
      }
      
      return newState;
    });
  };

  const handleSignOutAllDevices = async () => {
    setSaving(true);
    try {
      await supabase.auth.signOut({ scope: 'global' });
      toast.success(t('toast.signedOutAllDevices'));
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || t('toast.signOutError'));
    } finally {
      setSaving(false);
    }
  };

  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage);
    i18n.changeLanguage(newLanguage);
    localStorage.setItem('language', newLanguage);
    toast.success(t('toast.languageUpdated'));
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    onOpenChange(false);
    toast.success(t('toast.signedOut'));
  };

  if (loading) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto p-0">
        <SheetHeader className="p-6 pb-4 border-b">
          <SheetTitle className="text-xl">{t('profile.settings')}</SheetTitle>
          <SheetDescription>{t('profile.manageSettings')}</SheetDescription>
        </SheetHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="px-6 pt-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="profile" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                {t('profile.profileTab')}
              </TabsTrigger>
              <TabsTrigger value="account" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                {t('profile.accountSettingsTab')}
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="p-6 space-y-6">
            {/* Profile Tab */}
            <TabsContent value="profile" className="space-y-6 mt-0">
              <Card>
                <CardHeader>
                  <CardTitle>{t('profile.profilePicture')}</CardTitle>
                  <CardDescription>{t('profile.uploadProfilePicture')}</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center gap-4">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={avatarUrl || undefined} alt="Profile" />
                    <AvatarFallback>
                      <User className="h-12 w-12" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="relative">
                    <input
                      type="file"
                      id="avatar"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      className="hidden"
                      disabled={uploading}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={uploading}
                      onClick={() => document.getElementById('avatar')?.click()}
                    >
                      {uploading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          {t('profile.uploading')}
                        </>
                      ) : (
                        <>
                          <Camera className="mr-2 h-4 w-4" />
                          {t('profile.changeAvatar')}
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>{t('profile.personalInformation')}</CardTitle>
                  <CardDescription>{t('profile.updatePersonalDetails')}</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">{t('profile.fullName')}</Label>
                    <Input
                      id="fullName"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      placeholder="John Doe"
                    />
                    {errors.fullName && (
                      <p className="text-sm text-destructive">{errors.fullName}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">{t('profile.email')}</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="john@example.com"
                      disabled
                      className="bg-muted cursor-not-allowed"
                    />
                    {errors.email && (
                      <p className="text-sm text-destructive">{errors.email}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">{t('profile.phone')}</Label>
                    <Input
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+1234567890"
                      disabled
                      className="bg-muted cursor-not-allowed"
                    />
                    {errors.phone && (
                      <p className="text-sm text-destructive">{errors.phone}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dateOfBirth">{t('profile.dateOfBirth')}</Label>
                    <Input
                      id="dateOfBirth"
                      name="dateOfBirth"
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={handleChange}
                    />
                    {errors.dateOfBirth && (
                      <p className="text-sm text-destructive">{errors.dateOfBirth}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">{t('profile.address')}</Label>
                    <Input
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      placeholder="123 Main St, City, Country"
                    />
                    {errors.address && (
                      <p className="text-sm text-destructive">{errors.address}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="pincode">{t('profile.pincode')}</Label>
                    <Input
                      id="pincode"
                      name="pincode"
                      value={formData.pincode}
                      onChange={handleChange}
                      placeholder="123456"
                    />
                    {errors.pincode && (
                      <p className="text-sm text-destructive">{errors.pincode}</p>
                    )}
                  </div>

                    <Button type="submit" disabled={saving} className="w-full mt-6">
                      {saving ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          {t('profile.savingChanges')}
                        </>
                      ) : (
                        t('profile.saveChanges')
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Account Settings Tab */}
            <TabsContent value="account" className="space-y-6 mt-0">
              {/* Security Information */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-primary" />
                    <CardTitle>{t('profile.securityInformation')}</CardTitle>
                  </div>
                  <CardDescription>{t('profile.managePassword')}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <form onSubmit={handlePasswordChange} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword">{t('profile.currentPassword')}</Label>
                      <Input
                        id="currentPassword"
                        type="password"
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                        placeholder={t('profile.enterCurrentPassword')}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="newPassword">{t('profile.newPassword')}</Label>
                      <Input
                        id="newPassword"
                        type="password"
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                        placeholder={t('profile.enterNewPassword')}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">{t('profile.confirmPassword')}</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        placeholder={t('profile.confirmNewPassword')}
                      />
                    </div>
                    <Button type="submit" variant="outline" className="w-full" disabled={saving}>
                      {saving ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          {t('profile.updating')}
                        </>
                      ) : (
                        <>
                          <Key className="mr-2 h-4 w-4" />
                          {t('profile.updatePassword')}
                        </>
                      )}
                    </Button>
                  </form>

                  <Separator className="my-6" />

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="twoFactor">{t('profile.twoFactorAuth')}</Label>
                        <p className="text-sm text-muted-foreground">{t('profile.addExtraSecurity')}</p>
                      </div>
                      <Switch
                        id="twoFactor"
                        checked={securityOptions.twoFactorEnabled}
                        onCheckedChange={() => handleSecurityToggle('twoFactorEnabled')}
                      />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="loginAlerts">{t('profile.loginAlerts')}</Label>
                        <p className="text-sm text-muted-foreground">{t('profile.getNotifiedSignIns')}</p>
                      </div>
                      <Switch
                        id="loginAlerts"
                        checked={securityOptions.loginAlerts}
                        onCheckedChange={() => handleSecurityToggle('loginAlerts')}
                      />
                    </div>
                  </div>

                  <Separator className="my-6" />

                  <Button 
                    variant="destructive" 
                    className="w-full"
                    onClick={handleSignOutAllDevices}
                    disabled={saving}
                  >
                    {saving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {t('profile.signingOut')}
                      </>
                    ) : (
                      <>
                        <LogOut className="mr-2 h-4 w-4" />
                        {t('profile.signOutAllDevices')}
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* Language Preference */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Globe className="h-5 w-5 text-primary" />
                    <CardTitle>{t('profile.languagePreference')}</CardTitle>
                  </div>
                  <CardDescription>{t('profile.chooseLanguage')}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="language">{t('profile.interfaceLanguage')}</Label>
                    <Select value={language} onValueChange={handleLanguageChange}>
                      <SelectTrigger id="language" className="w-full">
                        <SelectValue placeholder={t('profile.selectLanguage')} />
                      </SelectTrigger>
                      <SelectContent className="bg-popover z-50">
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="es">Español (Spanish)</SelectItem>
                        <SelectItem value="fr">Français (French)</SelectItem>
                        <SelectItem value="de">Deutsch (German)</SelectItem>
                        <SelectItem value="it">Italiano (Italian)</SelectItem>
                        <SelectItem value="pt">Português (Portuguese)</SelectItem>
                        <SelectItem value="zh">中文 (Chinese)</SelectItem>
                        <SelectItem value="ja">日本語 (Japanese)</SelectItem>
                        <SelectItem value="ko">한국어 (Korean)</SelectItem>
                        <SelectItem value="ar">العربية (Arabic)</SelectItem>
                        <SelectItem value="hi">हिन्दी (Hindi)</SelectItem>
                        <SelectItem value="ru">Русский (Russian)</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-muted-foreground">
                      {t('profile.languageDescription')}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Account Information */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Info className="h-5 w-5 text-primary" />
                    <CardTitle>{t('profile.accountInformation')}</CardTitle>
                  </div>
                  <CardDescription>{t('profile.viewAccountDetails')}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between py-2">
                    <div className="space-y-0.5">
                      <p className="text-sm font-medium">{t('profile.accountId')}</p>
                      <p className="text-sm text-muted-foreground">{user?.id.substring(0, 18)}...</p>
                    </div>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between py-2">
                    <div className="space-y-0.5">
                      <p className="text-sm font-medium">{t('profile.emailVerified')}</p>
                      <p className="text-sm text-muted-foreground">
                        {user?.email_confirmed_at ? t('profile.yes') : t('profile.no')}
                      </p>
                    </div>
                    {!user?.email_confirmed_at && (
                      <Button variant="outline" size="sm">
                        <Mail className="mr-2 h-4 w-4" />
                        {t('profile.verifyEmail')}
                      </Button>
                    )}
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between py-2">
                    <div className="space-y-0.5">
                      <p className="text-sm font-medium">{t('profile.accountCreated')}</p>
                      <p className="text-sm text-muted-foreground">
                        {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Sign Out Button */}
              <Card className="border-destructive/50">
                <CardContent className="pt-6">
                  <Button
                    variant="destructive"
                    className="w-full"
                    onClick={handleSignOut}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    {t('profile.signOut')}
                  </Button>
                </CardContent>
              </Card>

              {/* Sign Out Button */}
              <Card className="border-destructive/50">
                <CardContent className="pt-6">
                  <Button
                    variant="destructive"
                    className="w-full"
                    onClick={handleSignOut}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}
