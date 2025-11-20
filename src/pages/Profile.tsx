import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { Camera, Loader2, LogOut, User, Shield, Info, Key, Mail, Eye, AlertCircle, ArrowLeft } from 'lucide-react';
import { profileSchema, type ProfileFormData } from '@/lib/validations';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import { Header } from '@/components/Header';

export default function Profile() {
  const navigate = useNavigate();
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
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);

  const [securityOptions, setSecurityOptions] = useState({
    twoFactorEnabled: false,
    loginAlerts: true,
  });

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
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      toast.error('Please sign in to view your profile');
      navigate('/');
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
        
        if (data.city && data.state && data.country) {
          setLocationData({
            city: data.city,
            state: data.state,
            country: data.country,
            district: data.district || undefined
          });
          setSelectedCountry(data.country);
        }
      }
    } catch (error: any) {
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success('Logged out successfully');
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header 
          selectedMainCategory={null}
          selectedSubcategory={null}
          onMainCategorySelect={() => {}}
          onSubcategorySelect={() => {}}
        />
        <div className="flex items-center justify-center h-[calc(100vh-80px)]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <Header 
        selectedMainCategory={null}
        selectedSubcategory={null}
        onMainCategorySelect={() => {}}
        onSubcategorySelect={() => {}}
      />
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Profile Settings</h1>
            <p className="text-muted-foreground">Manage your account settings and preferences</p>
          </div>

          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">
                Profile page is under development. Use the profile menu in the header to access your profile settings.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
