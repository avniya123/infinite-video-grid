import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Camera, Loader2, User } from 'lucide-react';
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
        .maybeSingle();

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
          <SheetTitle className="text-xl">Profile</SheetTitle>
          <SheetDescription>Manage your profile information</SheetDescription>
        </SheetHeader>

        <div className="p-6 space-y-6">
          {/* Profile Picture */}
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

          {/* Personal Information */}
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
                  <Label htmlFor="address">Address</Label>
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
        </div>
      </SheetContent>
    </Sheet>
  );
}
