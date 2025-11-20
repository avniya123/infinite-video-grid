import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Camera, Loader2, LogOut, User, Shield, Info, Key, Mail, Eye, AlertCircle } from 'lucide-react';
import { profileSchema, type ProfileFormData } from '@/lib/validations';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { DRAWER_PRESETS, getDrawerHeaderClassName } from '@/config/drawer';

interface ProfileDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ProfileDrawer({ open, onOpenChange }: ProfileDrawerProps) {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState<ProfileFormData>({
    fullName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
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

  // Password visibility state
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);

  // Security options state
  const [securityOptions, setSecurityOptions] = useState({
    twoFactorEnabled: false,
    loginAlerts: true,
  });

  // Location lookup state
  const [locationData, setLocationData] = useState<{
    city: string;
    state: string;
    country: string;
    district?: string;
  } | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState('US');
  const [locationError, setLocationError] = useState<string>('');

  useEffect(() => {
    if (open) {
      checkUser();
    }
  }, [open]);

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
          pincode: data.pincode || '',
        });
        setAvatarUrl(data.avatar_url);
        
        // Load existing location data if available
        if (data.city && data.state && data.country) {
          setLocationData({
            city: data.city,
            district: data.district || undefined,
            state: data.state,
            country: data.country,
          });
        }
      }
    } catch (error: any) {
      console.error('Error loading profile:', error);
      toast.error('Failed to load profile');
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

    // Trigger location lookup when pincode changes and has correct length for country
    if (name === 'pincode') {
      const requiredLength = selectedCountry === 'IN' ? 6 : 5; // India: 6 digits, US: 5 digits
      
      if (value.length === requiredLength) {
        lookupPincode(value).catch(err => {
          console.error('Pincode lookup failed:', err);
          setLocationError('Unable to verify pincode. Please continue with manual entry.');
        });
      } else if (value.length < requiredLength) {
        setLocationData(null);
        setLocationError('');
      }
    }
  };

  const lookupPincode = async (pincode: string) => {
    const requiredLength = selectedCountry === 'IN' ? 6 : 5;
    if (!pincode || pincode.length < requiredLength) return;
    
    setLocationLoading(true);
    setLocationError('');
    setLocationData(null);
    
    try {
      const { data, error } = await supabase.functions.invoke('lookup-pincode', {
        body: { pincode, countryCode: selectedCountry }
      }).catch(err => {
        // Catch network/invocation errors
        console.error('Function invoke error:', err);
        return { data: null, error: { message: 'Network error' } };
      });

      if (error) {
        const errorMsg = error.message?.toLowerCase() || '';
        if (errorMsg.includes('pincode not found') || errorMsg.includes('404')) {
          setLocationError(`Pincode not found for ${selectedCountry}. Please check the pincode and country.`);
        } else {
          setLocationError('Unable to verify pincode. Please continue with manual entry.');
        }
        return;
      }

      if (data?.error) {
        setLocationError(`Pincode not found for ${selectedCountry}. Please check the pincode and country.`);
        return;
      }

      if (data?.city && data?.state && data?.country) {
        setLocationData(data);
        setLocationError('');
      } else {
        setLocationError('Unable to verify pincode. Please continue with manual entry.');
      }
    } catch (error: any) {
      console.error('Error looking up pincode:', error);
      setLocationError('Unable to verify pincode. Please continue with manual entry.');
    } finally {
      setLocationLoading(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image must be less than 2MB');
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
          pincode: validatedData.pincode,
          city: locationData?.city || null,
          district: locationData?.district || null,
          state: locationData?.state || null,
          country: locationData?.country || null,
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
      toast.error('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    setSaving(true);
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
      setSaving(false);
    }
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
    setSaving(true);
    try {
      await supabase.auth.signOut({ scope: 'global' });
      toast.success('Signed out from all devices');
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to sign out');
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    onOpenChange(false);
    toast.success('Signed out successfully');
  };

  if (loading) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="right" className={DRAWER_PRESETS.settings}>
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className={DRAWER_PRESETS.settings}>
        <SheetHeader className={getDrawerHeaderClassName('standard')}>
          <SheetTitle className="text-xl">Settings</SheetTitle>
          <SheetDescription>Manage your account settings and preferences</SheetDescription>
        </SheetHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="px-6 pt-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="profile" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Profile
              </TabsTrigger>
              <TabsTrigger value="account" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Account Settings
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="p-6 space-y-6">
            {/* Profile Tab */}
            <TabsContent value="profile" className="space-y-6 mt-0">
              <Card>
                <CardHeader>
                  <CardTitle>Profile Picture</CardTitle>
                  <CardDescription>Upload a profile picture (max 2MB)</CardDescription>
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
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Camera className="mr-2 h-4 w-4" />
                          Change Avatar
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription>Update your personal details</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
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
                    <Label htmlFor="email">Email</Label>
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
                    <Label htmlFor="phone">Phone</Label>
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
                    <Label htmlFor="dateOfBirth">Date of Birth</Label>
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
                    <Label htmlFor="country">Country</Label>
                    <Select value={selectedCountry} onValueChange={(value) => {
                      setSelectedCountry(value);
                      setLocationData(null);
                      setLocationError('');
                      // Re-lookup if pincode exists
                      if (formData.pincode.length >= 4) {
                        setTimeout(() => lookupPincode(formData.pincode), 100);
                      }
                    }}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select country" />
                      </SelectTrigger>
                      <SelectContent className="bg-background z-50">
                        <SelectItem value="US">United States 🇺🇸</SelectItem>
                        <SelectItem value="IN">India 🇮🇳</SelectItem>
                        <SelectItem value="GB">United Kingdom 🇬🇧</SelectItem>
                        <SelectItem value="CA">Canada 🇨🇦</SelectItem>
                        <SelectItem value="AU">Australia 🇦🇺</SelectItem>
                        <SelectItem value="DE">Germany 🇩🇪</SelectItem>
                        <SelectItem value="FR">France 🇫🇷</SelectItem>
                        <SelectItem value="ES">Spain 🇪🇸</SelectItem>
                        <SelectItem value="IT">Italy 🇮🇹</SelectItem>
                        <SelectItem value="MX">Mexico 🇲🇽</SelectItem>
                        <SelectItem value="BR">Brazil 🇧🇷</SelectItem>
                        <SelectItem value="JP">Japan 🇯🇵</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">Select your country before entering pincode</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="pincode">Pincode</Label>
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
                    {locationLoading && (
                      <p className="text-xs text-muted-foreground flex items-center gap-2">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        Looking up location...
                      </p>
                    )}
                    {locationError && !locationLoading && (
                      <p className="text-xs text-amber-600 dark:text-amber-500 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3 flex-shrink-0" />
                        <span>{locationError}</span>
                      </p>
                    )}
                    {locationData && !locationLoading && !locationError && (
                      <div className="text-xs text-muted-foreground p-2 bg-muted/30 rounded-md">
                        <p className="flex items-center gap-1">
                          {locationData.city}{locationData.district && `, ${locationData.district}`}, {locationData.state}, {locationData.country}
                        </p>
                      </div>
                    )}
                  </div>

                    <Button type="submit" disabled={saving} className="w-full mt-6">
                      {saving ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving Changes...
                        </>
                      ) : (
                        'Save Changes'
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
                    <CardTitle>Security Information</CardTitle>
                  </div>
                  <CardDescription>Manage your password and security settings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <form onSubmit={handlePasswordChange} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword">Current Password</Label>
                      <div className="relative">
                        <Input
                          id="currentPassword"
                          type={showCurrentPassword ? "text" : "password"}
                          value={passwordData.currentPassword}
                          onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                          placeholder="Enter current password"
                          className="pr-10"
                        />
                        <button
                          type="button"
                          onMouseEnter={() => setShowCurrentPassword(true)}
                          onMouseLeave={() => setShowCurrentPassword(false)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                          aria-label="Show password on hover"
                        >
                          <Eye className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="newPassword">New Password</Label>
                      <div className="relative">
                        <Input
                          id="newPassword"
                          type={showNewPassword ? "text" : "password"}
                          value={passwordData.newPassword}
                          onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                          placeholder="Enter new password (min 8 characters)"
                          className="pr-10"
                        />
                        <button
                          type="button"
                          onMouseEnter={() => setShowNewPassword(true)}
                          onMouseLeave={() => setShowNewPassword(false)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                          aria-label="Show password on hover"
                        >
                          <Eye className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm New Password</Label>
                      <div className="relative">
                        <Input
                          id="confirmPassword"
                          type={showConfirmNewPassword ? "text" : "password"}
                          value={passwordData.confirmPassword}
                          onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                          placeholder="Confirm new password"
                          className="pr-10"
                        />
                        <button
                          type="button"
                          onMouseEnter={() => setShowConfirmNewPassword(true)}
                          onMouseLeave={() => setShowConfirmNewPassword(false)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                          aria-label="Show password on hover"
                        >
                          <Eye className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                    <Button type="submit" variant="outline" className="w-full" disabled={saving}>
                      {saving ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Updating...
                        </>
                      ) : (
                        <>
                          <Key className="mr-2 h-4 w-4" />
                          Update Password
                        </>
                      )}
                    </Button>
                  </form>

                  <Separator className="my-6" />

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="twoFactor">Two-Factor Authentication</Label>
                        <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
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
                        <Label htmlFor="loginAlerts">Login Alerts</Label>
                        <p className="text-sm text-muted-foreground">Get notified of new sign-ins</p>
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
                        Signing out...
                      </>
                    ) : (
                      <>
                        <LogOut className="mr-2 h-4 w-4" />
                        Sign Out All Devices
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* Account Information */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Info className="h-5 w-5 text-primary" />
                    <CardTitle>Account Information</CardTitle>
                  </div>
                  <CardDescription>View your account details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between py-2">
                    <div className="space-y-0.5">
                      <p className="text-sm font-medium">Account ID</p>
                      <p className="text-sm text-muted-foreground">{user?.id.substring(0, 18)}...</p>
                    </div>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between py-2">
                    <div className="space-y-0.5">
                      <p className="text-sm font-medium">Email Verified</p>
                      <p className="text-sm text-muted-foreground">
                        {user?.email_confirmed_at ? 'Yes' : 'No'}
                      </p>
                    </div>
                    {!user?.email_confirmed_at && (
                      <Button variant="outline" size="sm">
                        <Mail className="mr-2 h-4 w-4" />
                        Verify Email
                      </Button>
                    )}
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between py-2">
                    <div className="space-y-0.5">
                      <p className="text-sm font-medium">Account Created</p>
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
