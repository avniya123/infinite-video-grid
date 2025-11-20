import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { UsersManagementDrawer } from '@/components/UsersManagementDrawer';
import { toast } from 'sonner';
import { ArrowLeft, Trash2, Edit, Users, Wallet, CreditCard, Search, X, Download, ShoppingBag, Zap, Info } from 'lucide-react';
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
  const [isQuickMode, setIsQuickMode] = useState(false);
  const [isLoadingTemplate, setIsLoadingTemplate] = useState(false);
  
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
  const [autoLoadEnrolled, setAutoLoadEnrolled] = useState(false);

  useEffect(() => {
    const initializePage = async () => {
      await checkUser();
      
      // Check if this is quick mode from URL params
      const searchParams = new URLSearchParams(location.search);
      const mode = searchParams.get('mode');
      const variationId = searchParams.get('variationId');
      
      if (mode === 'quick' && variationId) {
        setIsQuickMode(true);
        setShareMethod('cart'); // Pre-select Share User Cart
        
        // Fetch actual variation data from database
        setIsLoadingTemplate(true);
        try {
          const { data: variation, error } = await supabase
            .from('video_variations')
            .select('*')
            .eq('id', variationId)
            .single();
          
          if (error) throw error;
          
          if (variation) {
            // Calculate price and discount (placeholder values)
            const mrp = 1499;
            const price = 999;
            const discountPercent = Math.round(((mrp - price) / mrp) * 100);
            
            setTemplate({
              id: variation.id,
              title: variation.title,
              price: price,
              mrp: mrp,
              discount: `${discountPercent}%`,
              duration: variation.duration,
              orientation: variation.aspect_ratio.includes('16:9') ? 'Landscape' : 
                          variation.aspect_ratio.includes('9:16') ? 'Portrait' : 'Square',
              resolution: variation.quality || '1920x1080',
              thumbnailUrl: variation.thumbnail_url || '/placeholder.svg'
            });
          }
        } catch (error) {
          console.error('Error loading variation:', error);
          toast.error('Failed to load template details');
          navigate('/videos');
        } finally {
          setIsLoadingTemplate(false);
        }
      } else {
        const templateData = location.state?.template;
        if (templateData) {
          setTemplate(templateData);
        } else {
          toast.error('No template selected');
          navigate('/publish-cart');
        }
      }
    };
    
    initializePage();
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

  const handleProceedToPayment = async () => {
    if (sharedUsers.length === 0) {
      toast.error('Please add at least one shared user');
      return;
    }
    
    if (isQuickMode) {
      toast.success('Payment successful! Loading enrolled users...', {
        duration: 2000
      });
      
      // Load enrolled users automatically
      setAutoLoadEnrolled(true);
      await loadEnrolledUsers();
      
      // Open drawer with enrolled users tab pre-selected
      setTimeout(() => {
        setAddUserSheetOpen(true);
        toast.info('Select enrolled users to share this template', {
          duration: 4000
        });
      }, 1500);
    } else {
      toast.success('Processing payment...');
    }
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

  // Show loading state while fetching template data
  if (isLoadingTemplate || !template) {
    return (
      <div className="min-h-screen bg-background">
        <Header 
          selectedMainCategory={null}
          selectedSubcategory={null}
          onMainCategorySelect={() => {}}
          onSubcategorySelect={() => {}}
        />
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading template details...</p>
            </div>
          </div>
        </div>
      </div>
    );
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
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-3">
            <div className="p-2.5 bg-primary/10 rounded-xl">
              <ShoppingBag className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold tracking-tight">
                  {isQuickMode ? 'Quick Cart Payment' : 'Share Cart Checkout'}
                </h1>
                {isQuickMode && (
                  <Badge className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white border-0 gap-1.5 px-3 py-1">
                    <Zap className="h-3.5 w-3.5" />
                    Quick Mode
                  </Badge>
                )}
              </div>
              <p className="text-muted-foreground text-sm mt-0.5">
                {isQuickMode ? 'Fast checkout with shared user access' : 'Manage shared users and complete your order'}
              </p>
            </div>
          </div>
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
              <p className="text-xs text-muted-foreground mb-4">
                {isQuickMode ? 'Quick cart mode - Shared user access only' : 'Choose how to render the template'}
              </p>
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
                  <p className="text-sm font-medium">Shared User</p>
                </button>
                
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => {
                          if (!isQuickMode) {
                            setSelfRenderConfirmDialogOpen(true);
                          }
                        }}
                        disabled={isQuickMode}
                        className={`p-4 rounded-lg border-2 transition-all relative ${
                          isQuickMode 
                            ? 'opacity-50 cursor-not-allowed bg-muted/20 border-muted' 
                            : shareMethod === 'edited' 
                              ? 'border-primary bg-primary/5' 
                              : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <Edit className={`w-8 h-8 mx-auto mb-2 ${
                          isQuickMode 
                            ? 'text-muted-foreground/50' 
                            : shareMethod === 'edited' 
                              ? 'text-primary' 
                              : 'text-muted-foreground'
                        }`} />
                        <p className={`text-sm font-medium ${isQuickMode ? 'text-muted-foreground' : ''}`}>
                          Self & Render
                        </p>
                        {isQuickMode && (
                          <div className="flex items-center justify-center gap-1 mt-1">
                            <Info className="h-3 w-3 text-muted-foreground" />
                            <p className="text-xs text-muted-foreground">Disabled</p>
                          </div>
                        )}
                      </button>
                    </TooltipTrigger>
                    {isQuickMode && (
                      <TooltipContent side="bottom" className="max-w-xs">
                        <p className="text-sm">
                          Self & Render is not available in Quick Mode. Quick Mode is designed for fast checkout with shared user access only.
                        </p>
                      </TooltipContent>
                    )}
                  </Tooltip>
                </TooltipProvider>
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
                        Shared User
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

            {/* Payment Summary Card - Quick Mode */}
            {isQuickMode && (
              <Card className="p-6 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
                <div className="flex items-center gap-2 mb-4">
                  <Zap className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold text-primary">Quick Payment Summary</h3>
                </div>
                <div className="space-y-3">
                  {/* Template Info */}
                  <div className="flex items-start gap-3 p-3 bg-background/80 rounded-lg">
                    <img 
                      src={template.thumbnailUrl || '/placeholder.svg'} 
                      alt={template.title}
                      className="w-16 h-16 rounded-md object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{template.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className="text-xs">
                          {template.duration}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {template.resolution}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  {/* Users Count */}
                  <div className="flex items-center justify-between p-3 bg-background/80 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Shared Users</span>
                    </div>
                    <Badge variant="default" className="bg-primary">
                      {sharedUsers.length || 0} {sharedUsers.length === 1 ? 'user' : 'users'}
                    </Badge>
                  </div>
                  
                  {/* Total Price */}
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-emerald-500/10 to-emerald-600/10 rounded-lg border border-emerald-500/20">
                    <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">Total Amount</span>
                    <span className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">
                      ₹ {pricing.total.toFixed(2)}
                    </span>
                  </div>
                  
                  {/* Quick Info */}
                  <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <Info className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
                    <p className="text-xs text-blue-700 dark:text-blue-300">
                      After payment, you'll be able to manage and add enrolled users to share this template.
                    </p>
                  </div>
                </div>
              </Card>
            )}

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
        onOpenChange={(open) => {
          setAddUserSheetOpen(open);
          if (!open) {
            setAutoLoadEnrolled(false);
          }
        }}
        editingUser={editingUser}
        onAddUser={handleAddSharedUser}
        onUpdateUser={handleUpdateSharedUser}
        onImportCsv={handleConfirmCsvImport}
        onAddEnrolledUsers={handleAddEnrolledUsers}
        enrolledUsers={enrolledUsers}
        loadingEnrolledUsers={loadingEnrolledUsers}
        onLoadEnrolledUsers={loadEnrolledUsers}
        defaultTab={autoLoadEnrolled ? 'enrolled' : undefined}
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
