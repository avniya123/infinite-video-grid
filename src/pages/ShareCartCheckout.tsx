import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerClose } from '@/components/ui/drawer';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetClose } from '@/components/ui/sheet';
import { Switch } from '@/components/ui/switch';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { ArrowLeft, Trash2, Edit, UserPlus, Users, UserCheck, Wallet, CreditCard, X, Upload, Download } from 'lucide-react';
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
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [shareMethod, setShareMethod] = useState<'cart' | 'edited'>('cart');
  const [paymentMethod, setPaymentMethod] = useState<'paytm' | 'credit'>('paytm');
  const [discountCode, setDiscountCode] = useState('');
  const [discountApplied, setDiscountApplied] = useState(false);
  const [discountPercent, setDiscountPercent] = useState(0);

  // Form states for adding user
  const [userType, setUserType] = useState<'single' | 'group' | 'enrol'>('single');
  const [newUserName, setNewUserName] = useState('');
  const [newUserPhone, setNewUserPhone] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [selectedUserType, setSelectedUserType] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<SharedUser | null>(null);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
  
  // Edit user states
  const [editDrawerOpen, setEditDrawerOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<SharedUser | null>(null);
  const [editUserName, setEditUserName] = useState('');
  const [editUserPhone, setEditUserPhone] = useState('');
  const [editUserEmail, setEditUserEmail] = useState('');
  const [editUserType, setEditUserType] = useState('');
  
  // CSV import states
  const [csvImportDrawerOpen, setCsvImportDrawerOpen] = useState(false);

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
    setDrawerOpen(false);
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
    setEditDrawerOpen(true);
  };

  const handleUpdateUser = () => {
    if (!editingUser || !editUserName || !editUserPhone || !editUserEmail || !editUserType) {
      toast.error('Please fill all required fields');
      return;
    }

    setSharedUsers(sharedUsers.map(u => 
      u.id === editingUser.id 
        ? { ...u, name: editUserName, phone: editUserPhone, email: editUserEmail, userType: editUserType }
        : u
    ));
    
    toast.success('User updated successfully');
    setEditDrawerOpen(false);
    setEditingUser(null);
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
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim());
        if (values.length >= 4 && values[0]) {
          newUsers.push({
            id: Date.now().toString() + i,
            name: values[0],
            phone: values[1],
            email: values[2],
            userType: values[3],
            hasAccess: true,
          });
        }
      }
      
      if (newUsers.length > 0) {
        setSharedUsers([...sharedUsers, ...newUsers]);
        toast.success(`${newUsers.length} user(s) imported successfully`);
        setCsvImportDrawerOpen(false);
      } else {
        toast.error('No valid users found in CSV file');
      }
    };
    reader.readAsText(file);
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

      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Back Button */}
        <div className="mb-6">
          <Button variant="ghost" size="sm" onClick={() => navigate('/publish-cart')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Share Cart Place Order</h1>
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              onClick={() => setCsvImportDrawerOpen(true)} 
              className="gap-2"
            >
              <Upload className="w-5 h-5" />
              Import CSV
            </Button>
            <Button onClick={() => setDrawerOpen(true)} className="gap-2">
              <UserPlus className="w-5 h-5" />
              Add Share Users
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Template & Users */}
          <div className="lg:col-span-2 space-y-6">
            {/* Template Info */}
            <Card className="p-6">
              <div className="flex gap-4">
                <img 
                  src={template.thumbnailUrl || '/placeholder.svg'} 
                  alt={template.title}
                  className="w-24 h-24 rounded-lg object-cover"
                />
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{template.title}</h3>
                  <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                    <span>{template.duration}</span>
                    <span>{template.orientation}</span>
                    <span>{template.resolution}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-3">
                    <span className="text-2xl font-bold text-green-600">₹ {template.price.toFixed(2)}</span>
                    <span className="text-sm text-muted-foreground line-through">MRP: ₹ {template.mrp.toFixed(2)}</span>
                    <span className="text-sm text-green-600">{template.discount}</span>
                  </div>
                </div>
              </div>
            </Card>

            {/* User List */}
            <Card className="p-6">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-lg">Confirm User list</h3>
                  <p className="text-sm text-muted-foreground">Editable for shared users.</p>
                </div>
                {sharedUsers.length > 0 && selectedUserIds.length > 0 && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleBulkDelete}
                    className="gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete Selected ({selectedUserIds.length})
                  </Button>
                )}
              </div>

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
                  <Button variant="link" onClick={() => setDrawerOpen(true)} className="mt-2">
                    Add your first user
                  </Button>
                </div>
              ) : (
                <div className="space-y-3 mt-4">
                  {sharedUsers.map((sharedUser) => (
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
                <div className="mt-6 p-4 bg-muted/30 rounded-lg">
                  <p className="text-sm font-medium">Media Templates for Shared user ( {sharedUsers.length} )</p>
                  <p className="text-xs text-muted-foreground mt-1">Notifications Sent Mail & Mobile to Selected users</p>
                </div>
              )}
            </Card>

            {/* Reseller Discount */}
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Reseller Discount</h3>
              <div className="flex gap-3">
                <Input
                  placeholder="Discount 10"
                  value={discountCode}
                  onChange={(e) => setDiscountCode(e.target.value)}
                  disabled={discountApplied}
                />
                <Button 
                  onClick={handleApplyDiscount}
                  disabled={discountApplied}
                >
                  Apply
                </Button>
              </div>
              {discountApplied && (
                <p className="text-sm text-green-600 mt-2">Success! Reseller coupon added</p>
              )}
            </Card>
          </div>

          {/* Right Column - Summary & Payment */}
          <div className="space-y-6">
            {/* Share Method */}
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Template Share Status Method</h3>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setShareMethod('cart')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    shareMethod === 'cart' 
                      ? 'border-primary bg-primary/5' 
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <Users className="w-8 h-8 mx-auto mb-2 text-primary" />
                  <p className="text-sm font-medium">Share Cart</p>
                </button>
                <button
                  onClick={() => setShareMethod('edited')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    shareMethod === 'edited' 
                      ? 'border-primary bg-primary/5' 
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <Edit className="w-8 h-8 mx-auto mb-2 text-primary" />
                  <p className="text-sm font-medium">Edited Templeted</p>
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
              className="w-full h-12 text-base font-semibold"
              size="lg"
              disabled={sharedUsers.length === 0}
            >
              <CreditCard className="w-5 h-5 mr-2" />
              Proceed to Payment
            </Button>
            {sharedUsers.length === 0 && (
              <p className="text-sm text-center text-muted-foreground mt-2">
                Please add at least one shared user to proceed
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Add Shared User Drawer */}
      <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
        <DrawerContent className="max-h-[90vh]">
          <DrawerHeader className="border-b">
            <div className="flex items-center justify-between">
              <DrawerTitle>Adding Shared User For Template</DrawerTitle>
              <DrawerClose asChild>
                <Button variant="ghost" size="icon">
                  <X className="w-4 h-4" />
                </Button>
              </DrawerClose>
            </div>
          </DrawerHeader>

          <div className="p-6 overflow-y-auto">
            {/* User Type Selection */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <button
                onClick={() => setUserType('single')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  userType === 'single'
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <UserPlus className="w-8 h-8 mx-auto mb-2 text-primary" />
                <p className="text-sm font-medium">Single User</p>
              </button>
              <button
                onClick={() => setUserType('group')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  userType === 'group'
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <Users className="w-8 h-8 mx-auto mb-2 text-primary" />
                <p className="text-sm font-medium">Group Users</p>
              </button>
              <button
                onClick={() => setUserType('enrol')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  userType === 'enrol'
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <UserCheck className="w-8 h-8 mx-auto mb-2 text-primary" />
                <p className="text-sm font-medium">enrol Users</p>
              </button>
            </div>

            {/* Form */}
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
                  <Input
                    placeholder="+91 0000000000"
                    value={newUserPhone}
                    onChange={(e) => setNewUserPhone(e.target.value)}
                    className="mt-2"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">
                    Email Id <span className="text-destructive">*</span>
                  </label>
                  <Input
                    type="email"
                    placeholder="yourmail@mail.com"
                    value={newUserEmail}
                    onChange={(e) => setNewUserEmail(e.target.value)}
                    className="mt-2"
                  />
                </div>
              </div>

              <Button 
                onClick={handleAddSharedUser}
                className="w-full mt-6"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Add Shared User
              </Button>
            </div>
          </div>
        </DrawerContent>
      </Drawer>

      {/* Edit User Drawer */}
      <Sheet open={editDrawerOpen} onOpenChange={setEditDrawerOpen}>
        <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader className="border-b pb-4 mb-6">
            <SheetTitle>Edit Shared User</SheetTitle>
          </SheetHeader>

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
                <Input
                  placeholder="+91 0000000000"
                  value={editUserPhone}
                  onChange={(e) => setEditUserPhone(e.target.value)}
                  className="mt-2"
                />
              </div>
              <div>
                <label className="text-sm font-medium">
                  Email Id <span className="text-destructive">*</span>
                </label>
                <Input
                  type="email"
                  placeholder="yourmail@mail.com"
                  value={editUserEmail}
                  onChange={(e) => setEditUserEmail(e.target.value)}
                  className="mt-2"
                />
              </div>
            </div>

            <Button 
              onClick={handleUpdateUser}
              className="w-full mt-6"
            >
              <Edit className="w-4 h-4 mr-2" />
              Update User
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* CSV Import Drawer */}
      <Sheet open={csvImportDrawerOpen} onOpenChange={setCsvImportDrawerOpen}>
        <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader className="border-b pb-4 mb-6">
            <SheetTitle>Import Users from CSV</SheetTitle>
          </SheetHeader>

          <div className="space-y-6">
            {/* Instructions */}
            <div className="bg-muted/50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">CSV Format Instructions</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Your CSV file should have the following columns in order:
              </p>
              <div className="bg-background p-3 rounded font-mono text-xs mb-3">
                name,phone,email,userType
              </div>
              <p className="text-sm text-muted-foreground">
                <span className="font-medium">User Types:</span> Family, Friend, Colleague, or Client
              </p>
            </div>

            {/* Download Template */}
            <div className="flex flex-col gap-3">
              <Button
                variant="outline"
                onClick={handleDownloadTemplate}
                className="gap-2"
              >
                <Download className="w-4 h-4" />
                Download CSV Template
              </Button>

              {/* File Upload */}
              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
                <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-sm font-medium mb-2">Upload CSV File</p>
                <p className="text-xs text-muted-foreground mb-4">
                  Click to select a CSV file from your computer
                </p>
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleCsvImport}
                    className="hidden"
                  />
                  <Button variant="default" asChild>
                    <span>
                      <Upload className="w-4 h-4 mr-2" />
                      Choose File
                    </span>
                  </Button>
                </label>
              </div>
            </div>

            {/* Example */}
            <div className="bg-muted/30 p-4 rounded-lg">
              <h4 className="text-sm font-semibold mb-2">Example CSV Content:</h4>
              <pre className="text-xs bg-background p-3 rounded overflow-x-auto">
{`name,phone,email,userType
John Doe,+91 9876543210,john@example.com,Family
Jane Smith,+91 9876543211,jane@example.com,Friend
Bob Johnson,+91 9876543212,bob@example.com,Colleague`}
              </pre>
            </div>
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
