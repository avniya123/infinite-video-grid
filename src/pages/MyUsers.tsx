import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { ArrowLeft, Search, Mail, Phone, Calendar, Trash2, Users, Filter, X, Pencil } from 'lucide-react';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import { UsersManagementDrawer } from '@/components/UsersManagementDrawer';
import { useSharedUsers } from '@/hooks/useSharedUsers';
import type { SharedUser } from '@/hooks/useSharedUsers';

interface SavedUser {
  id: string;
  enrolled_user_name: string;
  enrolled_user_phone: string | null;
  enrolled_user_email: string;
  is_enabled: boolean;
  created_at: string;
  updated_at: string;
  user_type?: string;
}

export default function MyUsers() {
  const navigate = useNavigate();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [savedUsers, setSavedUsers] = useState<SavedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUserType, setSelectedUserType] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');
  const [usersDrawerOpen, setUsersDrawerOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<SharedUser | null>(null);
  
  const {
    sharedUsers,
    addUser,
    updateUser,
    removeUser,
    importUsersFromCsv,
    loadEnrolledUsers,
    addEnrolledUsers,
    enrolledUsers
  } = useSharedUsers();

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

  const filteredUsers = savedUsers.filter(user => {
    const matchesSearch = user.enrolled_user_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.enrolled_user_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.enrolled_user_phone && user.enrolled_user_phone.includes(searchQuery));
    
    const matchesType = selectedUserType === 'all' || user.user_type === selectedUserType;
    
    return matchesSearch && matchesType;
  });

  const userTypes = ['all', ...new Set(savedUsers.map(u => u.user_type).filter(Boolean))];

  const hasActiveFilters = selectedUserType !== 'all' || searchQuery.length > 0;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const groupUsersByDate = () => {
    const grouped: { [key: string]: SavedUser[] } = {};
    filteredUsers.forEach(user => {
      const date = formatDate(user.created_at);
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(user);
    });
    return grouped;
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedUserType('all');
  };

  const handleEditUser = (user: SavedUser) => {
    const sharedUser: SharedUser = {
      id: user.id,
      name: user.enrolled_user_name,
      email: user.enrolled_user_email,
      phone: user.enrolled_user_phone || '',
      userType: user.user_type || '',
      hasAccess: user.is_enabled
    };
    setEditingUser(sharedUser);
    setUsersDrawerOpen(true);
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
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-2.5 bg-primary/10 rounded-xl">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold">
                My Users {savedUsers.length > 0 && `(${savedUsers.length})`}
              </h1>
              <p className="text-muted-foreground text-sm mt-0.5">
                Manage your saved enrolled users
              </p>
            </div>
          </div>
          <Button onClick={() => setUsersDrawerOpen(true)}>
            <Users className="w-4 h-4 mr-2" />
            Manage Users
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={selectedUserType} onValueChange={setSelectedUserType}>
              <SelectTrigger className="w-full sm:w-48">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent className="bg-background z-50">
                <SelectItem value="all">All Types</SelectItem>
                {userTypes.filter(type => type !== 'all').map(type => (
                  <SelectItem key={type} value={type!} className="capitalize">
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {hasActiveFilters && (
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="gap-1">
                {filteredUsers.length} of {savedUsers.length} users
              </Badge>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={clearFilters}
                className="h-7 px-2 text-xs"
              >
                <X className="w-3 h-3 mr-1" />
                Clear filters
              </Button>
            </div>
          )}
        </div>

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
              {hasActiveFilters ? 'No users found' : 'No saved users yet'}
            </p>
            <p className="text-sm">
              {hasActiveFilters 
                ? 'Try adjusting your filters or search query'
                : 'Users you save from the enrolled list will appear here'}
            </p>
            {hasActiveFilters && (
              <Button variant="link" onClick={clearFilters} className="mt-2">
                Clear filters
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-8">
            {/* Table View */}
            <Card className="overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="w-12">#</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Added On</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((savedUser, index) => (
                    <TableRow key={savedUser.id} className="hover:bg-muted/30">
                      <TableCell className="font-medium text-muted-foreground">
                        {index + 1}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-semibold">
                            {savedUser.enrolled_user_name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold">{savedUser.enrolled_user_name}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm">
                            <Mail className="w-3 h-3 text-muted-foreground" />
                            <span className="truncate max-w-[200px]">{savedUser.enrolled_user_email}</span>
                          </div>
                          {savedUser.enrolled_user_phone && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Phone className="w-3 h-3" />
                              <span>{savedUser.enrolled_user_phone}</span>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {savedUser.user_type ? (
                          <Badge variant="outline" className="capitalize">
                            {savedUser.user_type}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground text-sm">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={savedUser.is_enabled}
                            onCheckedChange={() => handleToggleEnabled(savedUser.id, savedUser.is_enabled)}
                          />
                          <Badge 
                            variant={savedUser.is_enabled ? "default" : "secondary"}
                            className="text-xs"
                          >
                            {savedUser.is_enabled ? 'Enabled' : 'Disabled'}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="w-3 h-3" />
                          <span>{formatDate(savedUser.created_at)}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditUser(savedUser)}
                            className="hover:bg-primary/10"
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteUser(savedUser.id)}
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </div>
        )}
      </div>

      <UsersManagementDrawer
        open={usersDrawerOpen}
        onOpenChange={(open) => {
          setUsersDrawerOpen(open);
          if (!open) {
            setEditingUser(null);
          }
        }}
        editingUser={editingUser}
        showEnrolledTab={false}
        onAddUser={async (userData) => {
          const success = addUser(userData);
          if (success) {
            // Also save to Supabase
            const { data: { user: currentUser } } = await supabase.auth.getUser();
            if (currentUser) {
              await supabase.from('saved_enrolled_users').insert({
                user_id: currentUser.id,
                enrolled_user_name: userData.name,
                enrolled_user_email: userData.email,
                enrolled_user_phone: userData.phone,
                user_type: userData.userType,
                is_enabled: true
              });
            }
            toast.success('User added successfully');
            fetchSavedUsers();
          }
        }}
        onUpdateUser={async (userData) => {
          const success = updateUser(userData);
          if (success) {
            // Update in Supabase
            await supabase
              .from('saved_enrolled_users')
              .update({
                enrolled_user_name: userData.name,
                enrolled_user_email: userData.email,
                enrolled_user_phone: userData.phone,
                user_type: userData.userType,
                is_enabled: userData.hasAccess
              })
              .eq('id', userData.id);
            toast.success('User updated successfully');
            fetchSavedUsers();
            setEditingUser(null);
            setUsersDrawerOpen(false);
          }
        }}
        onImportCsv={async (users) => {
          const success = importUsersFromCsv(users);
          if (success) {
            // Save all to Supabase
            const { data: { user: currentUser } } = await supabase.auth.getUser();
            if (currentUser) {
              const usersToInsert = users.map(u => ({
                user_id: currentUser.id,
                enrolled_user_name: u.name,
                enrolled_user_email: u.email,
                enrolled_user_phone: u.phone,
                user_type: u.userType,
                is_enabled: true
              }));
              await supabase.from('saved_enrolled_users').insert(usersToInsert);
            }
            toast.success('Users imported successfully');
            fetchSavedUsers();
          }
        }}
        onAddEnrolledUsers={async (users) => {
          const success = addEnrolledUsers(users);
          if (success) {
            // Save all to Supabase
            const { data: { user: currentUser } } = await supabase.auth.getUser();
            if (currentUser) {
              const usersToInsert = users.map(u => ({
                user_id: currentUser.id,
                enrolled_user_name: u.name,
                enrolled_user_email: u.email,
                enrolled_user_phone: u.phone,
                user_type: u.userType,
                is_enabled: true
              }));
              await supabase.from('saved_enrolled_users').insert(usersToInsert);
            }
            toast.success('Enrolled users added successfully');
            fetchSavedUsers();
          }
        }}
        enrolledUsers={enrolledUsers}
        loadingEnrolledUsers={loading}
        onLoadEnrolledUsers={loadEnrolledUsers}
      />
    </div>
  );
}
