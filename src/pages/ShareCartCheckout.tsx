import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetClose } from '@/components/ui/sheet';
import { Switch } from '@/components/ui/switch';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { ArrowLeft, Trash2, Edit, UserPlus, Users, UserCheck, Wallet, CreditCard, X, Upload, Download, Check, XCircle, Search } from 'lucide-react';
import type { User as SupabaseUser } from '@supabase/supabase-js';

interface SharedUser {
  id: string;
  name: string;
  phone: string;
  email: string;
  userType: string;
  hasAccess: boolean;
}

interface TemplateData {
  id: string;
  title: string;
  price: number;
  mrp: number;
  discount: string;
  duration: string;
  orientation: string;
  resolution: string;
  thumbnailUrl: string;
}

export default function ShareCartCheckout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [template, setTemplate] = useState<TemplateData | null>(null);
  const [sharedUsers, setSharedUsers] = useState<SharedUser[]>([]);
  const [addUserSheetOpen, setAddUserSheetOpen] = useState(false);
  const [shareMethod, setShareMethod] = useState<'cart' | 'edited'>('cart');
  const [paymentMethod, setPaymentMethod] = useState<'paytm' | 'credit'>('paytm');
  const [discountCode, setDiscountCode] = useState('');
  const [discountApplied, setDiscountApplied] = useState(false);
  const [discountPercent, setDiscountPercent] = useState(0);

  // Form states for adding user
  const [drawerMode, setDrawerMode] = useState<'add' | 'csv' | 'enrol'>('add');
  const [newUserName, setNewUserName] = useState('');
  const [newUserPhone, setNewUserPhone] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [selectedUserType, setSelectedUserType] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<SharedUser | null>(null);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
  
  // Edit user states
  const [editingUser, setEditingUser] = useState<SharedUser | null>(null);
  const [editUserName, setEditUserName] = useState('');
  const [editUserPhone, setEditUserPhone] = useState('');
  const [editUserEmail, setEditUserEmail] = useState('');
  const [editUserType, setEditUserType] = useState('');
  
  // CSV import states
  const [csvPreviewData, setCsvPreviewData] = useState<SharedUser[]>([]);
  const [csvImportErrors, setCsvImportErrors] = useState<{ duplicates: string[], invalidFormats: string[] }>({ duplicates: [], invalidFormats: [] });
  
  // Enrolled users states
  const [enrolledUsers, setEnrolledUsers] = useState<SharedUser[]>([]);
  const [loadingEnrolledUsers, setLoadingEnrolledUsers] = useState(false);
  const [selectedEnrolledIds, setSelectedEnrolledIds] = useState<string[]>([]);
  const [enrolledSearchQuery, setEnrolledSearchQuery] = useState('');
  const [enrolledUserType, setEnrolledUserType] = useState('family');
  
  // Search/filter state
  const [searchQuery, setSearchQuery] = useState('');
  
  // Real-time validation states
  const [isNewEmailValid, setIsNewEmailValid] = useState<boolean | null>(null);
  const [isNewPhoneValid, setIsNewPhoneValid] = useState<boolean | null>(null);
  const [isEditEmailValid, setIsEditEmailValid] = useState<boolean | null>(null);
  const [isEditPhoneValid, setIsEditPhoneValid] = useState<boolean | null>(null);

  // Validation functions
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone: string): boolean => {
    // Accepts formats: +91 9876543210, +919876543210, 9876543210, or 10-digit numbers
    const phoneRegex = /^(\+91[\s]?)?[6-9]\d{9}$/;
    return phoneRegex.test(phone.replace(/\s+/g, ''));
  };

  // Real-time validation handlers
  const handleNewEmailChange = (value: string) => {
    setNewUserEmail(value);
    if (value.length === 0) {
      setIsNewEmailValid(null);
    } else {
      setIsNewEmailValid(validateEmail(value));
    }
  };

  const handleNewPhoneChange = (value: string) => {
    setNewUserPhone(value);
    if (value.length === 0) {
      setIsNewPhoneValid(null);
    } else {
      setIsNewPhoneValid(validatePhone(value));
    }
  };

  const handleEditEmailChange = (value: string) => {
    setEditUserEmail(value);
    if (value.length === 0) {
      setIsEditEmailValid(null);
    } else {
      setIsEditEmailValid(validateEmail(value));
    }
  };

  const handleEditPhoneChange = (value: string) => {
    setEditUserPhone(value);
    if (value.length === 0) {
      setIsEditPhoneValid(null);
    } else {
      setIsEditPhoneValid(validatePhone(value));
    }
  };

  useEffect(() => {
    checkUser();
    // Get template data from navigation state
    const templateData = location.state?.template;
    if (templateData) {
      setTemplate(templateData);
    } else {
      toast.error('No template selected');
      navigate('/publish-cart');
    }
  }, []);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      toast.error('Please sign in to continue');
      navigate('/');
      return;
    }
    setUser(session.user);
  };

  const handleAddSharedUser = () => {
    if (!newUserName || !newUserPhone || !newUserEmail || !selectedUserType) {
      toast.error('Please fill all required fields');
      return;
    }

    // Validate email format
    if (!validateEmail(newUserEmail)) {
      toast.error('Invalid email format', {
        description: 'Please enter a valid email address (e.g., example@domain.com)',
      });
      return;
    }

    // Validate phone format
    if (!validatePhone(newUserPhone)) {
      toast.error('Invalid phone number format', {
        description: 'Please enter a valid 10-digit Indian phone number (e.g., +91 9876543210)',
      });
      return;
    }

    // Check for duplicate email
    const duplicateEmail = sharedUsers.find(
      user => user.email.toLowerCase() === newUserEmail.toLowerCase()
    );
    if (duplicateEmail) {
      toast.error('User with this email already exists', {
        description: `${duplicateEmail.name} is already in the shared users list.`,
      });
      return;
    }

    // Check for duplicate phone
    const duplicatePhone = sharedUsers.find(
      user => user.phone === newUserPhone
    );
    if (duplicatePhone) {
      toast.error('User with this phone number already exists', {
        description: `${duplicatePhone.name} is already in the shared users list.`,
      });
      return;
    }

    const newUser: SharedUser = {
      id: Date.now().toString(),
      name: newUserName,
      phone: newUserPhone,
      email: newUserEmail,
      userType: selectedUserType,
      hasAccess: true,
    };

    setSharedUsers([...sharedUsers, newUser]);
    toast.success('Shared user added successfully');
    
    // Reset form
    setNewUserName('');
    setNewUserPhone('');
    setNewUserEmail('');
    setSelectedUserType('');
    setIsNewEmailValid(null);
    setIsNewPhoneValid(null);
    setAddUserSheetOpen(false);
  };

  const handleRemoveUser = (user: SharedUser) => {
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };

  const confirmRemoveUser = () => {
    if (userToDelete) {
      setSharedUsers(sharedUsers.filter(u => u.id !== userToDelete.id));
      setSelectedUserIds(selectedUserIds.filter(id => id !== userToDelete.id));
      toast.success('User removed from shared list');
      setDeleteDialogOpen(false);
      setUserToDelete(null);
    }
  };

  const handleToggleUserSelection = (userId: string) => {
    setSelectedUserIds(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleToggleSelectAll = () => {
    if (selectedUserIds.length === sharedUsers.length) {
      setSelectedUserIds([]);
    } else {
      setSelectedUserIds(sharedUsers.map(u => u.id));
    }
  };

  const handleBulkDelete = () => {
    if (selectedUserIds.length === 0) {
      toast.error('No users selected');
      return;
    }
    setBulkDeleteDialogOpen(true);
  };

  const confirmBulkDelete = () => {
    setSharedUsers(sharedUsers.filter(u => !selectedUserIds.includes(u.id)));
    toast.success(`${selectedUserIds.length} user(s) removed from shared list`);
    setSelectedUserIds([]);
    setBulkDeleteDialogOpen(false);
  };

  const handleEditUser = (user: SharedUser) => {
    setEditingUser(user);
    setEditUserName(user.name);
    setEditUserPhone(user.phone);
    setEditUserEmail(user.email);
    setEditUserType(user.userType);
    setIsEditEmailValid(validateEmail(user.email));
    setIsEditPhoneValid(validatePhone(user.phone));
    setDrawerMode('add');
    setAddUserSheetOpen(true);
  };

  const handleUpdateUser = () => {
    if (!editingUser || !editUserName || !editUserPhone || !editUserEmail || !editUserType) {
      toast.error('Please fill all required fields');
      return;
    }

    // Validate email format
    if (!validateEmail(editUserEmail)) {
      toast.error('Invalid email format', {
        description: 'Please enter a valid email address (e.g., example@domain.com)',
      });
      return;
    }

    // Validate phone format
    if (!validatePhone(editUserPhone)) {
      toast.error('Invalid phone number format', {
        description: 'Please enter a valid 10-digit Indian phone number (e.g., +91 9876543210)',
      });
      return;
    }

    // Check for duplicate email (excluding current user)
    const duplicateEmail = sharedUsers.find(
      user => user.id !== editingUser.id && user.email.toLowerCase() === editUserEmail.toLowerCase()
    );
    if (duplicateEmail) {
      toast.error('User with this email already exists', {
        description: `${duplicateEmail.name} already has this email address.`,
      });
      return;
    }

    // Check for duplicate phone (excluding current user)
    const duplicatePhone = sharedUsers.find(
      user => user.id !== editingUser.id && user.phone === editUserPhone
    );
    if (duplicatePhone) {
      toast.error('User with this phone number already exists', {
        description: `${duplicatePhone.name} already has this phone number.`,
      });
      return;
    }

    setSharedUsers(sharedUsers.map(u => 
      u.id === editingUser.id 
        ? { ...u, name: editUserName, phone: editUserPhone, email: editUserEmail, userType: editUserType }
        : u
    ));
    
    toast.success('User updated successfully');
    setAddUserSheetOpen(false);
    setEditingUser(null);
    setIsEditEmailValid(null);
    setIsEditPhoneValid(null);
  };

  const handleDownloadTemplate = () => {
    const csvContent = "name,phone,email,userType\nJohn Doe,+91 9876543210,john@example.com,Family\nJane Smith,+91 9876543211,jane@example.com,Friend";
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'shared_users_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
    
    toast.success('CSV template downloaded');
    setDrawerMode('csv');
    setAddUserSheetOpen(true);
  };

  const handleExportUsers = () => {
    const usersToExport = searchQuery ? filteredUsers : sharedUsers;
    
    if (usersToExport.length === 0) {
      toast.error('No users to export');
      return;
    }

    // Create CSV content with header
    const header = 'name,phone,email,userType';
    const rows = usersToExport.map(user => 
      `${user.name},${user.phone},${user.email},${user.userType}`
    );
    const csvContent = [header, ...rows].join('\n');

    // Create and download the file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    
    // Create filename with timestamp
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = searchQuery 
      ? `filtered_shared_users_${timestamp}.csv`
      : `shared_users_${timestamp}.csv`;
    a.download = filename;
    
    a.click();
    window.URL.revokeObjectURL(url);
    
    const message = searchQuery 
      ? `Exported ${usersToExport.length} filtered user(s)`
      : `Exported ${usersToExport.length} user(s)`;
    
    toast.success('Export successful', {
      description: message,
    });
  };

  const handleCsvImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n');
      const headers = lines[0].split(',').map(h => h.trim());
      
      const newUsers: SharedUser[] = [];
      const duplicates: string[] = [];
      const invalidFormats: string[] = [];
      
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim());
        if (values.length >= 4 && values[0]) {
          const email = values[2];
          const phone = values[1];
          const name = values[0];
          
          // Validate email format
          if (!validateEmail(email)) {
            invalidFormats.push(`${name} (invalid email)`);
            continue;
          }
          
          // Validate phone format
          if (!validatePhone(phone)) {
            invalidFormats.push(`${name} (invalid phone)`);
            continue;
          }
          
          // Check for duplicates in existing shared users
          const duplicateEmail = sharedUsers.find(
            user => user.email.toLowerCase() === email.toLowerCase()
          );
          const duplicatePhone = sharedUsers.find(
            user => user.phone === phone
          );
          
          // Check for duplicates within the CSV being imported
          const csvDuplicateEmail = newUsers.find(
            user => user.email.toLowerCase() === email.toLowerCase()
          );
          const csvDuplicatePhone = newUsers.find(
            user => user.phone === phone
          );
          
          if (duplicateEmail || duplicatePhone || csvDuplicateEmail || csvDuplicatePhone) {
            duplicates.push(name);
            continue;
          }
          
          newUsers.push({
            id: Date.now().toString() + i + Math.random(),
            name: name,
            phone: phone,
            email: email,
            userType: values[3],
            hasAccess: true,
          });
        }
      }
      
      // Store in preview state instead of immediately adding
      setCsvPreviewData(newUsers);
      setCsvImportErrors({ duplicates, invalidFormats });
      
      if (newUsers.length === 0) {
        let errorMessage = 'No valid users found in CSV file';
        let description = '';
        
        if (duplicates.length > 0) {
          errorMessage = 'All users in CSV already exist or have invalid formats';
          description = `${duplicates.length} duplicate(s)`;
        }
        if (invalidFormats.length > 0) {
          if (description) description += ', ';
          description += `${invalidFormats.length} invalid format(s): ${invalidFormats.slice(0, 2).join(', ')}${invalidFormats.length > 2 ? '...' : ''}`;
        }
        
        toast.error(errorMessage, {
          description: description || undefined,
        });
      }
    };
    reader.readAsText(file);
    
    // Reset file input
    event.target.value = '';
  };

  const handleConfirmCsvImport = () => {
    if (csvPreviewData.length === 0) {
      toast.error('No users to import');
      return;
    }

    setSharedUsers([...sharedUsers, ...csvPreviewData]);
    
    let message = `${csvPreviewData.length} user(s) imported successfully`;
    if (csvImportErrors.duplicates.length > 0) {
      message += `. ${csvImportErrors.duplicates.length} duplicate(s) skipped`;
    }
    if (csvImportErrors.invalidFormats.length > 0) {
      message += `. ${csvImportErrors.invalidFormats.length} invalid format(s) skipped`;
    }
    
    toast.success('CSV Import Complete', {
      description: message,
    });
    
    // Reset and close
    setCsvPreviewData([]);
    setCsvImportErrors({ duplicates: [], invalidFormats: [] });
    setAddUserSheetOpen(false);
  };

  const handleRemovePreviewUser = (userId: string) => {
    setCsvPreviewData(csvPreviewData.filter(u => u.id !== userId));
  };

  const handleTogglePreviewUserAccess = (userId: string) => {
    setCsvPreviewData(csvPreviewData.map(u =>
      u.id === userId ? { ...u, hasAccess: !u.hasAccess } : u
    ));
  };

  const handleCancelCsvImport = () => {
    setCsvPreviewData([]);
    setCsvImportErrors({ duplicates: [], invalidFormats: [] });
    setAddUserSheetOpen(false);
  };

  const handleAddEnrolledUsers = () => {
    const usersToAdd = enrolledUsers
      .filter(u => selectedEnrolledIds.includes(u.id))
      .map(u => ({ ...u, userType: enrolledUserType }));
    
    // Filter out duplicates
    const newUsers = usersToAdd.filter(enrolledUser => 
      !sharedUsers.some(sharedUser => 
        sharedUser.email.toLowerCase() === enrolledUser.email.toLowerCase() ||
        sharedUser.phone === enrolledUser.phone
      )
    );
    
    if (newUsers.length === 0) {
      toast.error('All selected users are already in the shared list');
      return;
    }
    
    setSharedUsers([...sharedUsers, ...newUsers]);
    
    const skipped = usersToAdd.length - newUsers.length;
    const message = skipped > 0 
      ? `${newUsers.length} user(s) added as ${enrolledUserType}. ${skipped} duplicate(s) skipped.`
      : `${newUsers.length} enrolled user(s) added as ${enrolledUserType}`;
    
    toast.success('Enrolled Users Added', {
      description: message,
    });
    
    setSelectedEnrolledIds([]);
    setEnrolledUserType('family');
    setAddUserSheetOpen(false);
  };

  const handleToggleAccess = (userId: string) => {
    setSharedUsers(sharedUsers.map(u => 
      u.id === userId ? { ...u, hasAccess: !u.hasAccess } : u
    ));
  };

  const handleApplyDiscount = () => {
    if (discountCode.toLowerCase() === 'discount10') {
      setDiscountApplied(true);
      setDiscountPercent(10);
      toast.success('Reseller coupon added', {
        description: '10% discount applied',
        className: 'bg-green-50 text-green-900',
      });
    } else {
      toast.error('Invalid discount code');
    }
  };

  const calculatePricing = () => {
    if (!template) return { mrp: 0, subtotal: 0, discount: 0, tax: 0, total: 0 };
    
    const numUsers = sharedUsers.length || 1;
    const mrp = template.price;
    const subtotal = mrp * numUsers;
    const discount = discountApplied ? (subtotal * discountPercent) / 100 : 0;
    const tax = (subtotal - discount) * 0.18;
    const total = subtotal - discount + tax;

    return { mrp, subtotal, discount, tax, total };
  };

  const handleProceedToPayment = () => {
    if (sharedUsers.length === 0) {
      toast.error('Please add at least one shared user', {
        description: 'You need to add at least one user to share this template with before proceeding to payment.',
      });
      return;
    }
    toast.success('Processing payment...', {
      description: 'Redirecting to payment gateway',
    });
    // Here you would integrate with actual payment gateway
  };

  // Filter users based on search query
  const filteredUsers = sharedUsers.filter((user) => {
    const query = searchQuery.toLowerCase();
    return (
      user.name.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query) ||
      user.phone.includes(query) ||
      user.userType.toLowerCase().includes(query)
    );
  });

  const pricing = calculatePricing();

  if (!template) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header 
        selectedMainCategory={null}
        selectedSubcategory={null}
        onMainCategorySelect={() => {}}
        onSubcategorySelect={() => {}}
      />

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Back Button */}
        <div className="mb-6">
          <Button variant="ghost" size="sm" onClick={() => navigate('/publish-cart')} className="hover:bg-muted/50">
            <ArrowLeft className="w-4 h-4 mr-2" />
            <span className="font-medium">Back to Cart</span>
          </Button>
        </div>

        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-bold tracking-tight mb-3 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Share Cart Checkout
          </h1>
          <p className="text-muted-foreground text-lg">
            Manage shared users and complete your order
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 mb-8">
          <Button 
            variant="outline" 
            onClick={() => {
              setDrawerMode('csv');
              setAddUserSheetOpen(true);
            }}
            className="gap-2 font-medium hover:bg-accent hover:text-accent-foreground transition-all"
          >
            <Upload className="w-4 h-4" />
            Import CSV
          </Button>
          <Button 
            onClick={() => {
              setDrawerMode('add');
              setEditingUser(null);
              setAddUserSheetOpen(true);
            }} 
            className="gap-2 font-medium shadow-sm hover:shadow-md transition-all"
          >
            <UserPlus className="w-4 h-4" />
            Add Users
          </Button>
          <Button 
            onClick={() => {
              setDrawerMode('enrol');
              setAddUserSheetOpen(true);
            }}
            variant="outline"
            className="gap-2 font-medium hover:bg-accent hover:text-accent-foreground transition-all"
          >
            <UserCheck className="w-4 h-4" />
            Enrolled Users
          </Button>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Template & Users */}
          <div className="lg:col-span-2 space-y-8">
            {/* Template Info */}
            <Card className="p-6 shadow-sm border-border/50 hover:shadow-md transition-shadow">
              <h2 className="text-lg font-semibold mb-4 text-foreground">Template Details</h2>
              <div className="flex gap-5">
                <div className="relative rounded-xl overflow-hidden shadow-md">
                  <img 
                    src={template.thumbnailUrl || '/placeholder.svg'} 
                    alt={template.title}
                    className="w-28 h-28 object-cover"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-xl mb-2 text-foreground">{template.title}</h3>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                    <span className="inline-flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40" />
                      {template.duration}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40" />
                      {template.orientation}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40" />
                      {template.resolution}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-bold text-green-600">₹{template.price.toFixed(2)}</span>
                    <span className="text-sm text-muted-foreground line-through">₹{template.mrp.toFixed(2)}</span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                      {template.discount}
                    </span>
                  </div>
                </div>
              </div>
            </Card>

            {/* User List */}
            <Card className="p-6 shadow-sm border-border/50 hover:shadow-md transition-shadow">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-foreground">Shared Users</h2>
                  <p className="text-sm text-muted-foreground mt-1">Manage users who have access to this template</p>
                </div>
                {sharedUsers.length > 0 && selectedUserIds.length > 0 && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleBulkDelete}
                    className="gap-2 shadow-sm hover:shadow-md transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                    Remove ({selectedUserIds.length})
                  </Button>
                )}
              </div>

              {/* Search Bar */}
              {sharedUsers.length > 0 && (
                <div className="mb-4 space-y-3">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder="Search by name, email, phone, or type..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                      {searchQuery && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
                          onClick={() => setSearchQuery('')}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                    <Button
                      variant="outline"
                      size="default"
                      onClick={handleExportUsers}
                      className="gap-2 shrink-0"
                    >
                      <Download className="w-4 h-4" />
                      Export {searchQuery ? 'Filtered' : 'All'}
                    </Button>
                  </div>
                  {searchQuery && (
                    <p className="text-xs text-muted-foreground">
                      Found {filteredUsers.length} of {sharedUsers.length} user(s)
                    </p>
                  )}
                </div>
              )}

              {/* Table Header */}
              <div className="grid grid-cols-12 gap-4 pb-3 border-b text-sm font-medium text-muted-foreground">
                <div className="col-span-1 flex items-center">
                  {sharedUsers.length > 0 && (
                    <Checkbox
                      checked={selectedUserIds.length === sharedUsers.length && sharedUsers.length > 0}
                      onCheckedChange={handleToggleSelectAll}
                      aria-label="Select all users"
                    />
                  )}
                </div>
                <div className="col-span-3">SHARED NAME</div>
                <div className="col-span-3">CONTACT</div>
                <div className="col-span-2">STATUS</div>
                <div className="col-span-3">ACTION</div>
              </div>

              {/* User Rows */}
              {sharedUsers.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground">
                  <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p className="font-medium">No shared users added yet</p>
                  <p className="text-sm mt-1">Add at least one user to proceed with checkout</p>
                  <Button variant="link" onClick={() => setAddUserSheetOpen(true)} className="mt-2">
                    Add your first user
                  </Button>
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground">
                  <Search className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p className="font-medium">No users found</p>
                  <p className="text-sm mt-1">Try adjusting your search query</p>
                  <Button variant="link" onClick={() => setSearchQuery('')} className="mt-2">
                    Clear search
                  </Button>
                </div>
              ) : (
                <div className="space-y-3 mt-4">
                  {filteredUsers.map((sharedUser) => (
                    <div key={sharedUser.id} className="grid grid-cols-12 gap-4 items-center py-3 border-b last:border-b-0">
                      <div className="col-span-1 flex items-center">
                        <Checkbox
                          checked={selectedUserIds.includes(sharedUser.id)}
                          onCheckedChange={() => handleToggleUserSelection(sharedUser.id)}
                          aria-label={`Select ${sharedUser.name}`}
                        />
                      </div>
                      <div className="col-span-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-semibold">
                            {sharedUser.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium">{sharedUser.name}</p>
                            <p className="text-xs text-muted-foreground">{sharedUser.userType}</p>
                          </div>
                        </div>
                      </div>
                      <div className="col-span-3 text-sm">
                        <p>{sharedUser.phone}</p>
                        <p className="text-muted-foreground">{sharedUser.email}</p>
                      </div>
                      <div className="col-span-2">
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={sharedUser.hasAccess}
                            onCheckedChange={() => handleToggleAccess(sharedUser.id)}
                          />
                          <span className="text-sm">{sharedUser.hasAccess ? 'Access' : 'No Access'}</span>
                        </div>
                      </div>
                      <div className="col-span-3 flex gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8"
                          onClick={() => handleEditUser(sharedUser)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => handleRemoveUser(sharedUser)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {sharedUsers.length > 0 && (
                <div className="mt-6 p-5 bg-gradient-to-br from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/20 rounded-xl border border-primary/20">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-background/50">
                      <Users className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        {sharedUsers.length} {sharedUsers.length === 1 ? 'User' : 'Users'} Selected
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Email & mobile notifications will be sent to all users with access enabled
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </Card>

            {/* Reseller Discount */}
            <Card className="p-6 shadow-sm border-border/50 hover:shadow-md transition-shadow">
              <h2 className="text-lg font-semibold mb-4 text-foreground">Reseller Discount</h2>
              <div className="flex gap-3">
                <Input
                  placeholder="Enter discount code"
                  value={discountCode}
                  onChange={(e) => setDiscountCode(e.target.value)}
                  disabled={discountApplied}
                  className="font-medium"
                />
                <Button 
                  onClick={handleApplyDiscount}
                  disabled={discountApplied}
                  className="px-6 font-medium shadow-sm hover:shadow-md transition-all"
                >
                  Apply
                </Button>
              </div>
              {discountApplied && (
                <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <p className="text-sm font-medium text-green-700 dark:text-green-400">
                    ✓ Discount code applied successfully
                  </p>
                </div>
              )}
            </Card>
          </div>

          {/* Right Column - Summary & Payment */}
          <div className="space-y-8">
            {/* Share Method */}
            <Card className="p-6 shadow-sm border-border/50 hover:shadow-md transition-shadow">
              <h2 className="text-lg font-semibold mb-5 text-foreground">Share Method</h2>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setShareMethod('cart')}
                  className={`p-5 rounded-xl border-2 transition-all duration-200 ${
                    shareMethod === 'cart' 
                      ? 'border-primary bg-primary/10 shadow-sm' 
                      : 'border-border hover:border-primary/40 hover:bg-accent/5'
                  }`}
                >
                  <Users className={`w-7 h-7 mx-auto mb-2 ${shareMethod === 'cart' ? 'text-primary' : 'text-muted-foreground'}`} />
                  <p className="text-sm font-semibold">Share Cart</p>
                </button>
                <button
                  onClick={() => setShareMethod('edited')}
                  className={`p-5 rounded-xl border-2 transition-all duration-200 ${
                    shareMethod === 'edited' 
                      ? 'border-primary bg-primary/10 shadow-sm' 
                      : 'border-border hover:border-primary/40 hover:bg-accent/5'
                  }`}
                >
                  <Edit className={`w-7 h-7 mx-auto mb-2 ${shareMethod === 'edited' ? 'text-primary' : 'text-muted-foreground'}`} />
                  <p className="text-sm font-semibold">Edited Template</p>
                </button>
              </div>
            </Card>

            {/* Price Summary */}
            <Card className="p-6">
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">MRP</span>
                  <span className="font-medium">$ {pricing.mrp.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">No Of Shared Users</span>
                  <span className="font-medium">X {sharedUsers.length || 1}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">$ {pricing.subtotal.toFixed(2)}</span>
                </div>
                {discountApplied && (
                  <div className="flex justify-between text-green-600">
                    <span>Reseller Discounts - {discountPercent} %</span>
                    <span>$ -{pricing.discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tax (18%)</span>
                  <span className="font-medium">$ {pricing.tax.toFixed(2)}</span>
                </div>
                <div className="border-t pt-3 flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>${pricing.total.toFixed(2)}</span>
                </div>
              </div>
            </Card>

            {/* Payment Method */}
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Payment Method</h3>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setPaymentMethod('paytm')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    paymentMethod === 'paytm' 
                      ? 'border-primary bg-primary/5' 
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <Wallet className="w-8 h-8 mx-auto mb-2 text-primary" />
                  <p className="text-sm font-medium">PAYTM</p>
                  <p className="text-xs text-muted-foreground">UPI Payment</p>
                </button>
                <button
                  onClick={() => setPaymentMethod('credit')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    paymentMethod === 'credit' 
                      ? 'border-primary bg-primary/5' 
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <CreditCard className="w-8 h-8 mx-auto mb-2 text-primary" />
                  <p className="text-sm font-medium">Credit zone</p>
                  <p className="text-xs text-muted-foreground">Truest Partners</p>
                </button>
              </div>
            </Card>

            {/* Proceed Button */}
            <Button 
              onClick={handleProceedToPayment}
              className="w-full h-14 text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
              size="lg"
              disabled={sharedUsers.length === 0}
            >
              <CreditCard className="w-5 h-5 mr-2" />
              Proceed to Payment
            </Button>
            {sharedUsers.length === 0 && (
              <div className="text-center p-4 bg-muted/30 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  Add at least one user to proceed with checkout
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Shared User Sheet */}
      <Sheet open={addUserSheetOpen} onOpenChange={setAddUserSheetOpen}>
        <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader className="border-b pb-4">
            <div className="flex items-center justify-between">
              <SheetTitle>
                {drawerMode === 'add' && !editingUser && 'Add Shared User'}
                {drawerMode === 'add' && editingUser && 'Edit Shared User'}
                {drawerMode === 'csv' && 'Import Users from CSV'}
                {drawerMode === 'enrol' && 'Select Enrolled Users'}
              </SheetTitle>
              <SheetClose asChild>
                <Button variant="ghost" size="icon">
                  <X className="w-4 h-4" />
                </Button>
              </SheetClose>
            </div>
          </SheetHeader>

          <div className="py-6 space-y-6">
            {/* Conditional Rendering based on Drawer Mode */}
            {drawerMode === 'add' && !editingUser && (
              <>
                {/* Form for Adding User */}
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">
                      Select Type Of User <span className="text-destructive">*</span>
                    </label>
                    <Select value={selectedUserType} onValueChange={setSelectedUserType}>
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Select a User..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="family">Family</SelectItem>
                        <SelectItem value="friend">Friend</SelectItem>
                        <SelectItem value="colleague">Colleague</SelectItem>
                        <SelectItem value="client">Client</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium">
                      User name <span className="text-destructive">*</span>
                    </label>
                    <Input
                      placeholder="Enter the user name"
                      value={newUserName}
                      onChange={(e) => setNewUserName(e.target.value)}
                      className="mt-2"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">
                        User Phone Number <span className="text-destructive">*</span>
                      </label>
                      <div className="relative">
                        <Input
                          placeholder="+91 0000000000"
                          value={newUserPhone}
                          onChange={(e) => handleNewPhoneChange(e.target.value)}
                          className={`mt-2 pr-10 ${
                            isNewPhoneValid === true 
                              ? 'border-green-500 focus-visible:ring-green-500' 
                              : isNewPhoneValid === false 
                              ? 'border-red-500 focus-visible:ring-red-500' 
                              : ''
                          }`}
                        />
                        {isNewPhoneValid !== null && (
                          <div className="absolute right-3 top-1/2 -translate-y-1/2 mt-1">
                            {isNewPhoneValid ? (
                              <Check className="w-5 h-5 text-green-500" />
                            ) : (
                              <XCircle className="w-5 h-5 text-red-500" />
                            )}
                          </div>
                        )}
                      </div>
                      {isNewPhoneValid === false && newUserPhone.length > 0 && (
                        <p className="text-xs text-red-500 mt-1">Invalid phone format</p>
                      )}
                    </div>
                    <div>
                      <label className="text-sm font-medium">
                        Email Id <span className="text-destructive">*</span>
                      </label>
                      <div className="relative">
                        <Input
                          type="email"
                          placeholder="yourmail@mail.com"
                          value={newUserEmail}
                          onChange={(e) => handleNewEmailChange(e.target.value)}
                          className={`mt-2 pr-10 ${
                            isNewEmailValid === true 
                              ? 'border-green-500 focus-visible:ring-green-500' 
                              : isNewEmailValid === false 
                              ? 'border-red-500 focus-visible:ring-red-500' 
                              : ''
                          }`}
                        />
                        {isNewEmailValid !== null && (
                          <div className="absolute right-3 top-1/2 -translate-y-1/2 mt-1">
                            {isNewEmailValid ? (
                              <Check className="w-5 h-5 text-green-500" />
                            ) : (
                              <XCircle className="w-5 h-5 text-red-500" />
                            )}
                          </div>
                        )}
                      </div>
                      {isNewEmailValid === false && newUserEmail.length > 0 && (
                        <p className="text-xs text-red-500 mt-1">Invalid email format</p>
                      )}
                    </div>
                  </div>

                  <Button onClick={handleAddSharedUser} className="w-full">
                    Add User
                  </Button>
                </div>
              </>
            )}

            {/* Edit User Mode */}
            {drawerMode === 'add' && editingUser && (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">
                    Select Type Of User <span className="text-destructive">*</span>
                  </label>
                  <Select value={editUserType} onValueChange={setEditUserType}>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Select a User..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="family">Family</SelectItem>
                      <SelectItem value="friend">Friend</SelectItem>
                      <SelectItem value="colleague">Colleague</SelectItem>
                      <SelectItem value="client">Client</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium">
                    User name <span className="text-destructive">*</span>
                  </label>
                  <Input
                    placeholder="Enter the user name"
                    value={editUserName}
                    onChange={(e) => setEditUserName(e.target.value)}
                    className="mt-2"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">
                      User Phone Number <span className="text-destructive">*</span>
                    </label>
                    <div className="relative">
                      <Input
                        placeholder="+91 0000000000"
                        value={editUserPhone}
                        onChange={(e) => handleEditPhoneChange(e.target.value)}
                        className={`mt-2 pr-10 ${
                          isEditPhoneValid === true 
                            ? 'border-green-500 focus-visible:ring-green-500' 
                            : isEditPhoneValid === false 
                            ? 'border-red-500 focus-visible:ring-red-500' 
                            : ''
                        }`}
                      />
                      {isEditPhoneValid !== null && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 mt-1">
                          {isEditPhoneValid ? (
                            <Check className="w-5 h-5 text-green-500" />
                          ) : (
                            <XCircle className="w-5 h-5 text-red-500" />
                          )}
                        </div>
                      )}
                    </div>
                    {isEditPhoneValid === false && editUserPhone.length > 0 && (
                      <p className="text-xs text-red-500 mt-1">Invalid phone format</p>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-medium">
                      Email Id <span className="text-destructive">*</span>
                    </label>
                    <div className="relative">
                      <Input
                        type="email"
                        placeholder="yourmail@mail.com"
                        value={editUserEmail}
                        onChange={(e) => handleEditEmailChange(e.target.value)}
                        className={`mt-2 pr-10 ${
                          isEditEmailValid === true 
                            ? 'border-green-500 focus-visible:ring-green-500' 
                            : isEditEmailValid === false 
                            ? 'border-red-500 focus-visible:ring-red-500' 
                            : ''
                        }`}
                      />
                      {isEditEmailValid !== null && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 mt-1">
                          {isEditEmailValid ? (
                            <Check className="w-5 h-5 text-green-500" />
                          ) : (
                            <XCircle className="w-5 h-5 text-red-500" />
                          )}
                        </div>
                      )}
                    </div>
                    {isEditEmailValid === false && editUserEmail.length > 0 && (
                      <p className="text-xs text-red-500 mt-1">Invalid email format</p>
                    )}
                  </div>
                </div>

                <Button onClick={handleUpdateUser} className="w-full">
                  Update User
                </Button>
              </div>
            )}

            {/* CSV Import Mode */}
            {drawerMode === 'csv' && csvPreviewData.length === 0 && (
              <div className="space-y-6">
                <div className="p-6 border-2 border-dashed border-border rounded-lg">
                  <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-center font-medium mb-2">Upload CSV File</h3>
                  <p className="text-sm text-muted-foreground text-center mb-4">
                    Import multiple users at once using a CSV file
                  </p>
                  <Input
                    type="file"
                    accept=".csv"
                    onChange={handleCsvImport}
                    className="cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium">CSV Format Instructions</h4>
                    <Button variant="outline" size="sm" onClick={handleDownloadTemplate}>
                      <Download className="w-4 h-4 mr-2" />
                      Download Template
                    </Button>
                  </div>
                  <div className="p-4 bg-muted/30 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-3">
                      Your CSV file should include the following columns in order:
                    </p>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>name</TableHead>
                          <TableHead>phone</TableHead>
                          <TableHead>email</TableHead>
                          <TableHead>userType</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell>John Doe</TableCell>
                          <TableCell>+91 9876543210</TableCell>
                          <TableCell>john@example.com</TableCell>
                          <TableCell>Family</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Jane Smith</TableCell>
                          <TableCell>+91 9876543211</TableCell>
                          <TableCell>jane@example.com</TableCell>
                          <TableCell>Friend</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Bob Johnson</TableCell>
                          <TableCell>+91 9876543212</TableCell>
                          <TableCell>bob@example.com</TableCell>
                          <TableCell>Colleague</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </div>
            )}

            {/* CSV Preview Mode */}
            {drawerMode === 'csv' && csvPreviewData.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Preview CSV Import ({csvPreviewData.length} users)</h4>
                </div>

                {/* Error Summary */}
                {(csvImportErrors.duplicates.length > 0 || csvImportErrors.invalidFormats.length > 0) && (
                  <div className="p-4 bg-muted/30 rounded-lg space-y-2">
                    {csvImportErrors.duplicates.length > 0 && (
                      <div className="flex items-start gap-2">
                        <XCircle className="w-5 h-5 text-orange-500 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium">Duplicates Skipped ({csvImportErrors.duplicates.length})</p>
                          <p className="text-xs text-muted-foreground">
                            {csvImportErrors.duplicates.slice(0, 3).join(', ')}
                            {csvImportErrors.duplicates.length > 3 && ` and ${csvImportErrors.duplicates.length - 3} more`}
                          </p>
                        </div>
                      </div>
                    )}
                    {csvImportErrors.invalidFormats.length > 0 && (
                      <div className="flex items-start gap-2">
                        <XCircle className="w-5 h-5 text-red-500 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium">Invalid Formats Skipped ({csvImportErrors.invalidFormats.length})</p>
                          <p className="text-xs text-muted-foreground">
                            {csvImportErrors.invalidFormats.slice(0, 3).join(', ')}
                            {csvImportErrors.invalidFormats.length > 3 && ` and ${csvImportErrors.invalidFormats.length - 3} more`}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Preview Table */}
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Access</TableHead>
                        <TableHead>Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {csvPreviewData.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">{user.name}</TableCell>
                          <TableCell className="text-sm">{user.phone}</TableCell>
                          <TableCell className="text-sm">{user.email}</TableCell>
                          <TableCell className="text-sm">{user.userType}</TableCell>
                          <TableCell>
                            <Switch
                              checked={user.hasAccess}
                              onCheckedChange={() => handleTogglePreviewUserAccess(user.id)}
                            />
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRemovePreviewUser(user.id)}
                            >
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <Button variant="outline" onClick={handleCancelCsvImport} className="flex-1">
                    Cancel
                  </Button>
                  <Button onClick={handleConfirmCsvImport} className="flex-1">
                    Confirm Import
                  </Button>
                </div>
              </div>
            )}

            {/* Enrolled Users Mode */}
            {drawerMode === 'enrol' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium mb-2">Select Registered Users</h4>
                    <p className="text-sm text-muted-foreground">
                      Choose users who are already registered in the system
                    </p>
                  </div>
                  {enrolledUsers.length > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={async () => {
                        if (!user) {
                          toast.error('Please login to save users');
                          return;
                        }

                        try {
                          const usersToSave = enrolledUsers.map(enrolledUser => ({
                            user_id: user.id,
                            enrolled_user_name: enrolledUser.name,
                            enrolled_user_phone: enrolledUser.phone,
                            enrolled_user_email: enrolledUser.email,
                            is_enabled: true,
                          }));

                          const { error } = await supabase
                            .from('saved_enrolled_users')
                            .insert(usersToSave);

                          if (error) throw error;

                          toast.success('Users saved successfully', {
                            description: `${enrolledUsers.length} enrolled user(s) saved to My Users`,
                          });
                        } catch (error) {
                          console.error('Error saving users:', error);
                          toast.error('Failed to save users');
                        }
                      }}
                      className="gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Save All Users
                    </Button>
                  )}
                </div>

                {/* User Type Selection */}
                <div>
                  <label className="text-sm font-medium">
                    Assign User Type <span className="text-destructive">*</span>
                  </label>
                  <Select value={enrolledUserType} onValueChange={setEnrolledUserType}>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Select user type..." />
                    </SelectTrigger>
                    <SelectContent className="bg-background z-50">
                      <SelectItem value="family">Family</SelectItem>
                      <SelectItem value="friend">Friend</SelectItem>
                      <SelectItem value="colleague">Colleague</SelectItem>
                      <SelectItem value="client">Client</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-1">
                    All selected users will be added with this user type
                  </p>
                </div>

                {loadingEnrolledUsers ? (
                  <div className="py-12 text-center">
                    <p className="text-muted-foreground">Loading users...</p>
                  </div>
                ) : enrolledUsers.length === 0 ? (
                  <div className="py-12 text-center text-muted-foreground">
                    <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p className="font-medium">No registered users found</p>
                    <p className="text-sm mt-1">There are no users registered in the system yet</p>
                  </div>
                ) : (
                  <>
                    {/* Search Input */}
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder="Search by name or email..."
                        value={enrolledSearchQuery}
                        onChange={(e) => setEnrolledSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>

                    {(() => {
                      const filteredEnrolledUsers = enrolledUsers.filter(user =>
                        user.name.toLowerCase().includes(enrolledSearchQuery.toLowerCase()) ||
                        user.email.toLowerCase().includes(enrolledSearchQuery.toLowerCase())
                      );

                      return (
                        <>
                          {enrolledSearchQuery && (
                            <p className="text-xs text-muted-foreground">
                              Found {filteredEnrolledUsers.length} of {enrolledUsers.length} user(s)
                            </p>
                          )}

                          {filteredEnrolledUsers.length === 0 ? (
                            <div className="py-12 text-center text-muted-foreground">
                              <Search className="w-12 h-12 mx-auto mb-3 opacity-50" />
                              <p className="font-medium">No users found</p>
                              <p className="text-sm mt-1">Try adjusting your search query</p>
                              <Button variant="link" onClick={() => setEnrolledSearchQuery('')} className="mt-2">
                                Clear search
                              </Button>
                            </div>
                          ) : (
                            <>
                              <div className="border rounded-lg max-h-96 overflow-y-auto">
                                <Table>
                                  <TableHeader>
                                    <TableRow>
                                      <TableHead className="w-12">
                                        <Checkbox
                                          checked={
                                            filteredEnrolledUsers.length > 0 &&
                                            filteredEnrolledUsers.every(user => selectedEnrolledIds.includes(user.id))
                                          }
                                          onCheckedChange={(checked) => {
                                            if (checked) {
                                              setSelectedEnrolledIds([
                                                ...selectedEnrolledIds,
                                                ...filteredEnrolledUsers
                                                  .filter(user => !selectedEnrolledIds.includes(user.id))
                                                  .map(user => user.id)
                                              ]);
                                            } else {
                                              setSelectedEnrolledIds(
                                                selectedEnrolledIds.filter(
                                                  id => !filteredEnrolledUsers.some(user => user.id === id)
                                                )
                                              );
                                            }
                                          }}
                                        />
                                      </TableHead>
                                      <TableHead>Name</TableHead>
                                      <TableHead>Email</TableHead>
                                      <TableHead>Phone</TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {filteredEnrolledUsers.map((user) => (
                                      <TableRow key={user.id}>
                                        <TableCell>
                                          <Checkbox
                                            checked={selectedEnrolledIds.includes(user.id)}
                                            onCheckedChange={(checked) => {
                                              if (checked) {
                                                setSelectedEnrolledIds([...selectedEnrolledIds, user.id]);
                                              } else {
                                                setSelectedEnrolledIds(selectedEnrolledIds.filter(id => id !== user.id));
                                              }
                                            }}
                                          />
                                        </TableCell>
                                        <TableCell className="font-medium">{user.name}</TableCell>
                                        <TableCell className="text-sm">{user.email}</TableCell>
                                        <TableCell className="text-sm">{user.phone || 'N/A'}</TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              </div>

                              <Button
                                onClick={handleAddEnrolledUsers}
                                className="w-full"
                                disabled={selectedEnrolledIds.length === 0}
                              >
                                Add Selected Users ({selectedEnrolledIds.length})
                              </Button>
                            </>
                          )}
                        </>
                      );
                    })()}
                  </>
                )}
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Shared User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove <span className="font-semibold text-foreground">{userToDelete?.name}</span> from the shared user list? 
              They will no longer have access to this template.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmRemoveUser}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remove User
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Delete Confirmation Dialog */}
      <AlertDialog open={bulkDeleteDialogOpen} onOpenChange={setBulkDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Multiple Users</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove <span className="font-semibold text-foreground">{selectedUserIds.length} user(s)</span> from the shared user list? 
              They will no longer have access to this template. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmBulkDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remove {selectedUserIds.length} User(s)
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
