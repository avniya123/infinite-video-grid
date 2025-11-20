import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerClose } from '@/components/ui/drawer';
import { Switch } from '@/components/ui/switch';
import { Card } from '@/components/ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { ArrowLeft, Trash2, Edit, UserPlus, Users, UserCheck, Wallet, CreditCard, X } from 'lucide-react';
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
      toast.success('User removed from shared list');
      setDeleteDialogOpen(false);
      setUserToDelete(null);
    }
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
      toast.error('Please add at least one shared user');
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
          <Button onClick={() => setDrawerOpen(true)} className="gap-2">
            <UserPlus className="w-5 h-5" />
            Add Share Users
          </Button>
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
              <div className="mb-4">
                <h3 className="font-semibold text-lg">Confirm User list</h3>
                <p className="text-sm text-muted-foreground">Editable for shared users.</p>
              </div>

              {/* Table Header */}
              <div className="grid grid-cols-12 gap-4 pb-3 border-b text-sm font-medium text-muted-foreground">
                <div className="col-span-3">SHARED NAME</div>
                <div className="col-span-3">CONTACT</div>
                <div className="col-span-3">STATUS</div>
                <div className="col-span-3">ACTION</div>
              </div>

              {/* User Rows */}
              {sharedUsers.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground">
                  <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No shared users added yet</p>
                  <Button variant="link" onClick={() => setDrawerOpen(true)} className="mt-2">
                    Add your first user
                  </Button>
                </div>
              ) : (
                <div className="space-y-3 mt-4">
                  {sharedUsers.map((sharedUser) => (
                    <div key={sharedUser.id} className="grid grid-cols-12 gap-4 items-center py-3 border-b last:border-b-0">
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
                      <div className="col-span-3">
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={sharedUser.hasAccess}
                            onCheckedChange={() => handleToggleAccess(sharedUser.id)}
                          />
                          <span className="text-sm">{sharedUser.hasAccess ? 'Order Access' : 'No Access'}</span>
                        </div>
                      </div>
                      <div className="col-span-3 flex gap-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
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
            >
              <CreditCard className="w-5 h-5 mr-2" />
              Proceed to Payment
            </Button>
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
    </div>
  );
}
