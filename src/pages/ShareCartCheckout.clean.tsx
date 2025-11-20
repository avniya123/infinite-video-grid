import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { UsersManagementDrawer } from '@/components/UsersManagementDrawer';
import { toast } from 'sonner';
import { ArrowLeft, Trash2, Edit, Users, Wallet, CreditCard, Search, X, Download } from 'lucide-react';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import { useSharedUsers, type SharedUser } from '@/hooks/useSharedUsers';

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
  
  // User management hook
  const {
    sharedUsers,
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
  } = useSharedUsers();
  
  // UI states
  const [addUserSheetOpen, setAddUserSheetOpen] = useState(false);
  const [shareMethod, setShareMethod] = useState<'cart' | 'edited'>('cart');
  const [paymentMethod, setPaymentMethod] = useState<'paytm' | 'credit'>('paytm');
  const [discountCode, setDiscountCode] = useState('');
  const [discountApplied, setDiscountApplied] = useState(false);
  const [discountPercent, setDiscountPercent] = useState(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<SharedUser | null>(null);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
  const [selfRenderConfirmDialogOpen, setSelfRenderConfirmDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<SharedUser | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    checkUser();
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

  // Wrapper handlers for drawer
  const handleAddSharedUser = (userData: Omit<SharedUser, 'id'>) => {
    const success = addUser(userData);
    if (success) {
      setAddUserSheetOpen(false);
    }
  };

  const handleUpdateSharedUser = (updatedUser: SharedUser) => {
    const success = updateUser(updatedUser);
    if (success) {
      setEditingUser(null);
      setAddUserSheetOpen(false);
    }
  };

  const handleRemoveUser = (user: SharedUser) => {
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };

  const confirmRemoveUser = () => {
    if (userToDelete) {
      removeUser(userToDelete.id);
      setSelectedUserIds(selectedUserIds.filter(id => id !== userToDelete.id));
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
    selectedUserIds.forEach(id => removeUser(id));
    setSelectedUserIds([]);
    setBulkDeleteDialogOpen(false);
  };

  const handleEditUser = (user: SharedUser) => {
    setEditingUser(user);
    setAddUserSheetOpen(true);
  };

  const handleConfirmCsvImport = (users: SharedUser[]) => {
    const success = importUsersFromCsv(users);
    if (success) {
      setAddUserSheetOpen(false);
    }
  };

  const handleAddEnrolledUsers = (users: SharedUser[]) => {
    const success = addEnrolledUsers(users);
    if (success) {
      setAddUserSheetOpen(false);
    }
  };

  const handleToggleAccess = (userId: string) => {
    toggleUserAccess(userId);
  };

  const handleApplyDiscount = () => {
    if (discountCode.toLowerCase() === 'discount10') {
      setDiscountApplied(true);
      setDiscountPercent(10);
      toast.success('Reseller coupon added', {
        description: '10% discount applied',
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
      toast.error('Please add at least one shared user');
      return;
    }
    toast.success('Processing payment...');
  };

  const handleExportUsers = () => {
    const csvContent = `Name,Phone,Email,UserType,HasAccess\n${
      filteredUsers.map(u => 
        `${u.name},${u.phone},${u.email},${u.userType},${u.hasAccess}`
      ).join('\n')
    }`;
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `shared-users-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

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
          <h1 className="text-4xl font-bold tracking-tight mb-3">
            Share Cart Checkout
          </h1>
          <p className="text-muted-foreground text-lg">
            Manage shared users and complete your order
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Template & Users */}
          <div className="lg:col-span-2 space-y-8">
            {/* Template Info */}
            <Card className="p-6 shadow-sm border-border/50">
              <h2 className="text-lg font-semibold mb-4">Template Details</h2>
              <div className="flex gap-5">
                <div className="relative rounded-xl overflow-hidden shadow-md">
                  <img 
                    src={template.thumbnailUrl || '/placeholder.svg'} 
                    alt={template.title}
                    className="w-28 h-28 object-cover"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-xl mb-2">{template.title}</h3>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                    <span>{template.duration}</span>
                    <span>{template.orientation}</span>
                    <span>{template.resolution}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-bold text-green-600">₹{template.price.toFixed(2)}</span>
                    <span className="text-sm text-muted-foreground line-through">₹{template.mrp.toFixed(2)}</span>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {template.discount} off
                    </span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Shared Users Management */}
            <Card className="p-6 shadow-sm border-border/50">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-semibold">Shared Users</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Manage users who can access this template
                  </p>
                </div>
                <Button
                  onClick={() => {
                    setEditingUser(null);
                    setAddUserSheetOpen(true);
                  }}
                  className="gap-2"
                >
                  <Users className="w-4 h-4" />
                  Add Users
                </Button>
              </div>

              {/* Search and Export */}
              {sharedUsers.length > 0 && (
                <div className="mb-6 space-y-3">
                  <div className="flex gap-3 items-center">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder="Search users..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 pr-9"
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
                      onClick={handleExportUsers}
                      className="gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Export
                    </Button>
                  </div>
                  {searchQuery && (
                    <p className="text-xs text-muted-foreground">
                      Found {filteredUsers.length} of {sharedUsers.length} user(s)
                    </p>
                  )}
                </div>
              )}

              {/* Users Table */}
              {sharedUsers.length > 0 ? (
                <div className="space-y-4">
                  {/* Bulk Actions */}
                  {selectedUserIds.length > 0 && (
                    <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                      <span className="text-sm font-medium">
                        {selectedUserIds.length} user(s) selected
                      </span>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={handleBulkDelete}
                        className="ml-auto"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Remove Selected
                      </Button>
                    </div>
                  )}

                  {/* Table Header */}
                  <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-muted/30 rounded-lg text-sm font-medium">
                    <div className="col-span-1 flex items-center">
                      <Checkbox
                        checked={selectedUserIds.length === sharedUsers.length}
                        onCheckedChange={handleToggleSelectAll}
                      />
                    </div>
                    <div className="col-span-3">User</div>
                    <div className="col-span-3">Contact</div>
                    <div className="col-span-2">Access</div>
                    <div className="col-span-3">Actions</div>
                  </div>

                  {/* Users List */}
                  <div className="space-y-2">
                    {filteredUsers.map((sharedUser) => (
                      <div
                        key={sharedUser.id}
                        className={`grid grid-cols-12 gap-4 px-4 py-4 rounded-lg border transition-colors ${
                          selectedUserIds.includes(sharedUser.id)
                            ? 'bg-primary/5 border-primary/20'
                            : 'hover:bg-muted/30 border-border/50'
                        }`}
                      >
                        <div className="col-span-1 flex items-center">
                          <Checkbox
                            checked={selectedUserIds.includes(sharedUser.id)}
                            onCheckedChange={() => handleToggleUserSelection(sharedUser.id)}
                          />
                        </div>
                        <div className="col-span-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary">
                              {sharedUser.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-medium">{sharedUser.name}</p>
                              <p className="text-xs text-muted-foreground capitalize">{sharedUser.userType}</p>
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
                            <span className="text-sm">{sharedUser.hasAccess ? 'Active' : 'Disabled'}</span>
                          </div>
                        </div>
                        <div className="col-span-3 flex gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleEditUser(sharedUser)}
                            className="h-9 w-9"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleRemoveUser(sharedUser)}
                            className="h-9 w-9 hover:bg-destructive/10 hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Users className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
                  <h3 className="text-lg font-semibold mb-2">No Users Added</h3>
                  <p className="text-muted-foreground mb-6">
                    Add users to share this template with them
                  </p>
                  <Button
                    onClick={() => {
                      setEditingUser(null);
                      setAddUserSheetOpen(true);
                    }}
                    className="gap-2"
                  >
                    <Users className="w-4 h-4" />
                    Add First User
                  </Button>
                </div>
              )}
            </Card>
          </div>

          {/* Right Column - Summary & Payment */}
          <div className="space-y-8">
            {/* Render Process */}
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Render Process</h3>
              <p className="text-xs text-muted-foreground mb-4">Choose how to render the template</p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => {
                    setShareMethod('cart');
                    setEditingUser(null);
                    setAddUserSheetOpen(true);
                  }}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    shareMethod === 'cart' 
                      ? 'border-primary bg-primary/5' 
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <Users className={`w-8 h-8 mx-auto mb-2 ${shareMethod === 'cart' ? 'text-primary' : 'text-muted-foreground'}`} />
                  <p className="text-sm font-medium">Share Cart</p>
                </button>
                <button
                  onClick={() => setSelfRenderConfirmDialogOpen(true)}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    shareMethod === 'edited' 
                      ? 'border-primary bg-primary/5' 
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <Edit className={`w-8 h-8 mx-auto mb-2 ${shareMethod === 'edited' ? 'text-primary' : 'text-muted-foreground'}`} />
                  <p className="text-sm font-medium">Self & Render</p>
                </button>
              </div>
            </Card>

            {/* Price Summary */}
            <Card className="p-6">
              <div className="space-y-3 text-sm">
                {/* Render Process Indicator */}
                <div className="flex justify-between items-center pb-3 border-b">
                  <span className="text-muted-foreground font-medium">Render Process</span>
                  <div className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-2 ${
                    shareMethod === 'cart' 
                      ? 'bg-primary/10 text-primary border border-primary/20' 
                      : 'bg-secondary/10 text-secondary-foreground border border-secondary/20'
                  }`}>
                    {shareMethod === 'cart' ? (
                      <>
                        <Users className="w-3.5 h-3.5" />
                        Share Cart
                      </>
                    ) : (
                      <>
                        <Edit className="w-3.5 h-3.5" />
                        Self & Render
                      </>
                    )}
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">MRP</span>
                  <span className="font-medium">₹ {pricing.mrp.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">No Of Shared Users</span>
                  <span className="font-medium">X {sharedUsers.length || 1}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">₹ {pricing.subtotal.toFixed(2)}</span>
                </div>
                {discountApplied && (
                  <div className="flex justify-between text-green-600">
                    <span>Reseller Discounts - {discountPercent}%</span>
                    <span>₹ -{pricing.discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tax (18%)</span>
                  <span className="font-medium">₹ {pricing.tax.toFixed(2)}</span>
                </div>
                <div className="h-px bg-border my-2" />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-primary">₹ {pricing.total.toFixed(2)}</span>
                </div>
              </div>

              {/* Discount Code */}
              <div className="mt-6 space-y-3">
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter discount code"
                    value={discountCode}
                    onChange={(e) => setDiscountCode(e.target.value)}
                    disabled={discountApplied}
                  />
                  <Button
                    onClick={handleApplyDiscount}
                    variant="outline"
                    disabled={discountApplied}
                  >
                    Apply
                  </Button>
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
                  <p className="text-sm font-medium">Credit Zone</p>
                  <p className="text-xs text-muted-foreground">Trusted Partners</p>
                </button>
              </div>
            </Card>

            {/* Proceed Button */}
            <Button 
              onClick={handleProceedToPayment}
              className="w-full h-14 text-base font-semibold shadow-lg"
              size="lg"
              disabled={sharedUsers.length === 0}
            >
              <CreditCard className="w-5 h-5 mr-2" />
              Proceed to Payment
            </Button>
            {sharedUsers.length === 0 && (
              <div className="text-center p-4 bg-muted/30 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  Add at least one user to proceed
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Users Management Drawer */}
      <UsersManagementDrawer
        open={addUserSheetOpen}
        onOpenChange={setAddUserSheetOpen}
        editingUser={editingUser}
        onAddUser={handleAddSharedUser}
        onUpdateUser={handleUpdateSharedUser}
        onImportCsv={handleConfirmCsvImport}
        onAddEnrolledUsers={handleAddEnrolledUsers}
        enrolledUsers={enrolledUsers}
        loadingEnrolledUsers={loadingEnrolledUsers}
        onLoadEnrolledUsers={loadEnrolledUsers}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Shared User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove <span className="font-semibold text-foreground">{userToDelete?.name}</span>?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmRemoveUser}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Delete Dialog */}
      <AlertDialog open={bulkDeleteDialogOpen} onOpenChange={setBulkDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Multiple Users</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove {selectedUserIds.length} user(s)?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmBulkDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remove All
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Self Render Confirmation Dialog */}
      <AlertDialog open={selfRenderConfirmDialogOpen} onOpenChange={setSelfRenderConfirmDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Self & Render Confirmation</AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <p>
                When you select <span className="font-semibold text-foreground">"Self & Render"</span>, the template will be rendered using your logged-in profile data.
              </p>
              <div className="bg-muted/50 p-3 rounded-lg space-y-2 text-sm">
                <p className="font-medium text-foreground">Data that will be used:</p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Your name</li>
                  <li>Your email address</li>
                  <li>Your phone number</li>
                </ul>
              </div>
              <p>
                This personalizes the output specifically for you.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setShareMethod('edited');
                setSelfRenderConfirmDialogOpen(false);
                toast.success('Self & Render mode activated', {
                  description: 'Your profile data will be used for rendering',
                });
              }}
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
