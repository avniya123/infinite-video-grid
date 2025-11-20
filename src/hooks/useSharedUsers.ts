import { useState } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export interface SharedUser {
  id: string;
  name: string;
  phone: string;
  email: string;
  userType: string;
  hasAccess: boolean;
}

export function useSharedUsers() {
  const [sharedUsers, setSharedUsers] = useState<SharedUser[]>([]);
  const [enrolledUsers, setEnrolledUsers] = useState<SharedUser[]>([]);
  const [loadingEnrolledUsers, setLoadingEnrolledUsers] = useState(false);

  // Validation functions
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone: string): boolean => {
    const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/;
    return phoneRegex.test(phone);
  };

  // Check for duplicates
  const checkDuplicateUser = (email: string, phone: string, excludeId?: string): SharedUser | null => {
    const duplicateEmail = sharedUsers.find(
      user => user.id !== excludeId && user.email.toLowerCase() === email.toLowerCase()
    );
    if (duplicateEmail) return duplicateEmail;

    const duplicatePhone = sharedUsers.find(
      user => user.id !== excludeId && user.phone === phone
    );
    if (duplicatePhone) return duplicatePhone;

    return null;
  };

  // Add a single user
  const addUser = (userData: Omit<SharedUser, 'id'>) => {
    // Validate inputs
    if (!userData.name || !userData.phone || !userData.email || !userData.userType) {
      toast.error('Please fill all required fields');
      return false;
    }

    if (!validateEmail(userData.email)) {
      toast.error('Invalid email format', {
        description: 'Please enter a valid email address',
      });
      return false;
    }

    if (!validatePhone(userData.phone)) {
      toast.error('Invalid phone number format', {
        description: 'Please enter a valid phone number',
      });
      return false;
    }

    // Check for duplicates
    const duplicate = checkDuplicateUser(userData.email, userData.phone);
    if (duplicate) {
      toast.error('User already exists', {
        description: `${duplicate.name} is already in the shared users list.`,
      });
      return false;
    }

    const newUser: SharedUser = {
      id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...userData,
    };

    setSharedUsers(prev => [...prev, newUser]);
    toast.success('User added successfully');
    return true;
  };

  // Update existing user
  const updateUser = (updatedUser: SharedUser) => {
    if (!updatedUser.name || !updatedUser.phone || !updatedUser.email || !updatedUser.userType) {
      toast.error('Please fill all required fields');
      return false;
    }

    if (!validateEmail(updatedUser.email)) {
      toast.error('Invalid email format');
      return false;
    }

    if (!validatePhone(updatedUser.phone)) {
      toast.error('Invalid phone number format');
      return false;
    }

    const duplicate = checkDuplicateUser(updatedUser.email, updatedUser.phone, updatedUser.id);
    if (duplicate) {
      toast.error('User with these details already exists');
      return false;
    }

    setSharedUsers(prev => 
      prev.map(user => user.id === updatedUser.id ? updatedUser : user)
    );
    toast.success('User updated successfully');
    return true;
  };

  // Remove user
  const removeUser = (userId: string) => {
    setSharedUsers(prev => prev.filter(user => user.id !== userId));
    toast.success('User removed successfully');
  };

  // Toggle user access
  const toggleUserAccess = (userId: string) => {
    setSharedUsers(prev =>
      prev.map(user =>
        user.id === userId ? { ...user, hasAccess: !user.hasAccess } : user
      )
    );
  };

  // Import users from CSV
  const importUsersFromCsv = (users: SharedUser[]) => {
    if (users.length === 0) {
      toast.error('No users to import');
      return false;
    }

    // Filter out duplicates
    const validUsers = users.filter(newUser => {
      const duplicate = sharedUsers.find(
        existing => 
          existing.email.toLowerCase() === newUser.email.toLowerCase() ||
          existing.phone === newUser.phone
      );
      return !duplicate;
    });

    if (validUsers.length === 0) {
      toast.error('All users already exist');
      return false;
    }

    setSharedUsers(prev => [...prev, ...validUsers]);
    
    const skipped = users.length - validUsers.length;
    toast.success('CSV Import Complete', {
      description: skipped > 0 
        ? `${validUsers.length} user(s) imported. ${skipped} duplicate(s) skipped.`
        : `${validUsers.length} user(s) imported successfully`,
    });
    return true;
  };

  // Load enrolled users from Supabase
  const loadEnrolledUsers = async () => {
    setLoadingEnrolledUsers(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Please sign in to view enrolled users');
        return;
      }

      const { data, error } = await supabase
        .from('saved_enrolled_users')
        .select('*')
        .eq('user_id', session.user.id)
        .eq('is_enabled', true)
        .order('enrolled_user_name', { ascending: true });

      if (error) throw error;

      const mappedUsers: SharedUser[] = (data || []).map(user => ({
        id: user.id,
        name: user.enrolled_user_name,
        email: user.enrolled_user_email,
        phone: user.enrolled_user_phone || '',
        userType: 'family',
        hasAccess: true,
      }));

      setEnrolledUsers(mappedUsers);
      toast.success(`Loaded ${mappedUsers.length} enrolled users`);
    } catch (error) {
      console.error('Error loading enrolled users:', error);
      toast.error('Failed to load enrolled users');
    } finally {
      setLoadingEnrolledUsers(false);
    }
  };

  // Add multiple enrolled users
  const addEnrolledUsers = (users: SharedUser[]) => {
    // Filter out duplicates
    const validUsers = users.filter(newUser => {
      const duplicate = sharedUsers.find(
        existing =>
          existing.email.toLowerCase() === newUser.email.toLowerCase() ||
          existing.phone === newUser.phone
      );
      return !duplicate;
    });

    if (validUsers.length === 0) {
      toast.error('All selected users already exist');
      return false;
    }

    setSharedUsers(prev => [...prev, ...validUsers]);
    
    const skipped = users.length - validUsers.length;
    toast.success('Enrolled users added', {
      description: skipped > 0
        ? `${validUsers.length} user(s) added. ${skipped} duplicate(s) skipped.`
        : `${validUsers.length} user(s) added successfully`,
    });
    return true;
  };

  return {
    sharedUsers,
    setSharedUsers,
    enrolledUsers,
    loadingEnrolledUsers,
    validateEmail,
    validatePhone,
    addUser,
    updateUser,
    removeUser,
    toggleUserAccess,
    importUsersFromCsv,
    loadEnrolledUsers,
    addEnrolledUsers,
  };
}
