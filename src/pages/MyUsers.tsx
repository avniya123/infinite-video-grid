import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { ArrowLeft, Search, Mail, Phone, Calendar, Trash2 } from 'lucide-react';
import type { User as SupabaseUser } from '@supabase/supabase-js';

interface SavedUser {
  id: string;
  enrolled_user_name: string;
  enrolled_user_phone: string | null;
  enrolled_user_email: string;
  is_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export default function MyUsers() {
  const navigate = useNavigate();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [savedUsers, setSavedUsers] = useState<SavedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error('Please login to view your users');
      navigate('/');
      return;
    }
    setUser(user);
    fetchSavedUsers();
  };

  const fetchSavedUsers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('saved_enrolled_users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setSavedUsers(data || []);
    } catch (error) {
      console.error('Error fetching saved users:', error);
      toast.error('Failed to load saved users');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleEnabled = async (userId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('saved_enrolled_users')
        .update({ is_enabled: !currentStatus })
        .eq('id', userId);

      if (error) throw error;

      setSavedUsers(savedUsers.map(u => 
        u.id === userId ? { ...u, is_enabled: !currentStatus } : u
      ));

      toast.success(`User ${!currentStatus ? 'enabled' : 'disabled'}`);
    } catch (error) {
      console.error('Error toggling user status:', error);
      toast.error('Failed to update user status');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('saved_enrolled_users')
        .delete()
        .eq('id', userId);

      if (error) throw error;

      setSavedUsers(savedUsers.filter(u => u.id !== userId));
      toast.success('User removed from list');
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Failed to delete user');
    }
  };

  const filteredUsers = savedUsers.filter(user =>
    user.enrolled_user_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.enrolled_user_email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Back Button */}
        <div className="mb-6">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">My Users</h1>
          <p className="text-muted-foreground">
            Manage your saved enrolled users ({savedUsers.length} total)
          </p>
        </div>

        {/* Search Bar */}
        {savedUsers.length > 0 && (
          <div className="mb-6">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            {searchQuery && (
              <p className="text-xs text-muted-foreground mt-2">
                Found {filteredUsers.length} of {savedUsers.length} user(s)
              </p>
            )}
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div className="py-12 text-center">
            <p className="text-muted-foreground">Loading users...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8" />
            </div>
            <p className="font-medium text-lg mb-2">
              {searchQuery ? 'No users found' : 'No saved users yet'}
            </p>
            <p className="text-sm">
              {searchQuery 
                ? 'Try adjusting your search query'
                : 'Users you save from the enrolled list will appear here'}
            </p>
            {searchQuery && (
              <Button variant="link" onClick={() => setSearchQuery('')} className="mt-2">
                Clear search
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredUsers.map((savedUser) => (
              <Card key={savedUser.id} className="p-5 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center font-semibold text-lg">
                      {savedUser.enrolled_user_name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">
                        {savedUser.enrolled_user_name}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Switch
                          checked={savedUser.is_enabled}
                          onCheckedChange={() => handleToggleEnabled(savedUser.id, savedUser.is_enabled)}
                        />
                        <span className={`text-xs font-medium ${
                          savedUser.is_enabled ? 'text-green-600' : 'text-muted-foreground'
                        }`}>
                          {savedUser.is_enabled ? 'Enabled' : 'Disabled'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteUser(savedUser.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <span className="truncate">{savedUser.enrolled_user_email}</span>
                  </div>
                  {savedUser.enrolled_user_phone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <span>{savedUser.enrolled_user_phone}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t">
                    <Calendar className="w-3 h-3" />
                    <span>Added {formatDate(savedUser.created_at)}</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
