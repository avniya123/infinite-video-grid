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
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { UsersManagementDrawer } from '@/components/UsersManagementDrawer';
import { toast } from 'sonner';
import { ArrowLeft, Trash2, Edit, Users, Wallet, CreditCard, Search, X, Download, ShoppingBag, Zap, Info, Play } from 'lucide-react';
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
  videoUrl?: string;
}

export default function ShareCartCheckout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [templates, setTemplates] = useState<TemplateData[]>([]);
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
  const [paymentConfirmDialogOpen, setPaymentConfirmDialogOpen] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState<TemplateData | null>(null);

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
            
            setTemplates([{
              id: variation.id,
              title: variation.title,
              price: price,
              mrp: mrp,
              discount: `${discountPercent}%`,
              duration: variation.duration,
              orientation: variation.aspect_ratio.includes('16:9') ? 'Landscape' : 
                          variation.aspect_ratio.includes('9:16') ? 'Portrait' : 'Square',
              resolution: variation.quality || '1920x1080',
              thumbnailUrl: variation.thumbnail_url || '/placeholder.svg',
              videoUrl: variation.video_url
            }]);
          }
        } catch (error) {
          console.error('Error loading variation:', error);
          toast.error('Failed to load template details');
          navigate('/videos');
        } finally {
          setIsLoadingTemplate(false);
        }
      } else {
        const templatesData = location.state?.templates;
        if (templatesData && Array.isArray(templatesData)) {
          setTemplates(templatesData);
        } else {
          toast.error('No templates selected');
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

  const handleRemoveTemplate = (templateId: string) => {
    if (templates.length === 1) {
      toast.error('Cannot remove the last template');
      return;
    }
    setTemplates(prev => prev.filter(t => t.id !== templateId));
    toast.success('Template removed from checkout');
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
    if (templates.length === 0) return { mrp: 0, subtotal: 0, discount: 0, tax: 0, total: 0 };
    
    const numUsers = sharedUsers.length || 1;
    
    // Calculate total for all templates
    const totalPrice = templates.reduce((sum, template) => sum + template.price, 0);
    const subtotal = totalPrice * numUsers;
    const discount = discountApplied ? (subtotal * discountPercent) / 100 : 0;
    const tax = (subtotal - discount) * 0.18;
    const total = subtotal - discount + tax;

    return { mrp: totalPrice, subtotal, discount, tax, total };
  };

  const handleProceedToPayment = () => {
    if (sharedUsers.length === 0) {
      toast.error('Please add at least one shared user');
      return;
    }
    
    // Show confirmation dialog first
    setPaymentConfirmDialogOpen(true);
  };

  const confirmPayment = async () => {
    setPaymentConfirmDialogOpen(false);
    
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
  if (isLoadingTemplate || templates.length === 0) {
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
        <div className="mb-6 flex items-center justify-end">
          <Button variant="ghost" size="sm" onClick={() => navigate('/publish-cart')} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            <span className="font-medium">Back to Publish Cart</span>
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
                  {isQuickMode ? `Quick Publish Cart (${templates.length})` : `Publish Cart Checkout (${templates.length})`}
                </h1>
                {isQuickMode && (
                  <Badge className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white border-0 gap-1.5 px-3 py-1">
                    <Zap className="h-3.5 w-3.5" />
                    Quick Mode
                  </Badge>
                )}
              </div>
              <p className="text-muted-foreground text-sm mt-0.5">
                {isQuickMode ? 'Fast checkout with instant template publishing' : 'Complete your purchase and publish templates to users'}
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
              <div className="space-y-5">
                {templates.map((template, index) => (
                  <div key={template.id} className="flex gap-5 pb-5 border-b last:border-0 last:pb-0">
                    <div className="relative rounded-xl overflow-hidden shadow-md group cursor-pointer"
                         onClick={() => template.videoUrl && setPreviewTemplate(template)}>
                      <img 
                        src={template.thumbnailUrl || '/placeholder.svg'} 
                        alt={template.title}
                        className="w-28 h-28 object-cover"
                      />
                      {template.videoUrl && (
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Play className="w-8 h-8 text-white" fill="white" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-xl mb-2">{template.title}</h3>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                        <span>{template.duration}</span>
                        <span>{template.orientation}</span>
                        <span>{template.resolution}</span>
                      </div>
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-2xl font-bold text-green-600">₹{template.price.toFixed(2)}</span>
                        <span className="text-sm text-muted-foreground line-through">₹{template.mrp.toFixed(2)}</span>
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {template.discount} off
                        </span>
                      </div>
                      {template.videoUrl && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setPreviewTemplate(template)}
                          className="gap-2"
                        >
                          <Play className="w-3.5 h-3.5" />
                          Preview Video
                        </Button>
                      )}
                    </div>
                    {templates.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveTemplate(template.id)}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </Card>

            {/* Published Users Management */}
            <Card className="p-6 shadow-sm border-border/50">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-semibold">Published Users</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Manage users who will receive this published template
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
              <h3 className="font-semibold mb-4">Generate Video</h3>
              <p className="text-xs text-muted-foreground mb-4">
                {isQuickMode ? 'Quick publish mode - Published user access only' : 'Choose how to publish the template'}
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
                <p className="text-sm font-medium">Published User</p>
              </button>
              
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
                  Changed
                </p>
                {isQuickMode && (
                  <div className="flex items-center justify-center gap-1 mt-1">
                    <Info className="h-3 w-3 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground">Not available in Quick Mode</p>
                  </div>
                )}
              </button>
              </div>
            </Card>

            {/* Price Summary */}
            <Card className="p-6">
              <div className="space-y-3 text-sm">
                {/* Render Process Indicator */}
                <div className="flex justify-between items-center pb-3 border-b">
                  <span className="text-muted-foreground font-medium">Generate Video</span>
                  <div className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-2 ${
                    shareMethod === 'cart' 
                      ? 'bg-primary/10 text-primary border border-primary/20' 
                      : 'bg-secondary/10 text-secondary-foreground border border-secondary/20'
                  }`}>
                    {shareMethod === 'cart' ? (
                      <>
                        <Users className="w-3.5 h-3.5" />
                        Published User
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
                  <span className="text-muted-foreground">No Of Published Users</span>
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
                      src={templates[0].thumbnailUrl || '/placeholder.svg'} 
                      alt={templates[0].title}
                      className="w-16 h-16 rounded-md object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{templates[0].title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className="text-xs">
                          {templates[0].duration}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {templates[0].resolution}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  {/* Users Count */}
                  <div className="flex items-center justify-between p-3 bg-background/80 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Published Users</span>
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
                      After payment, you can manage and add enrolled users to publish this template with instant access.
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

      {/* Payment Confirmation Dialog */}
      <AlertDialog open={paymentConfirmDialogOpen} onOpenChange={setPaymentConfirmDialogOpen}>
        <AlertDialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl flex items-center gap-2">
              <CreditCard className="h-6 w-6 text-primary" />
              Confirm Payment
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base">
              Please review your order details before proceeding with the payment.
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="space-y-4 py-4">
            {/* Template Details */}
            <div className="space-y-2">
              <h4 className="font-semibold text-sm text-muted-foreground">Template Details</h4>
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {templates.map((template) => (
                  <div key={template.id} className="flex items-start gap-4 p-4 bg-muted/30 rounded-lg">
                    <img 
                      src={template.thumbnailUrl || '/placeholder.svg'} 
                      alt={template.title}
                      className="w-20 h-20 rounded-md object-cover"
                    />
                    <div className="flex-1">
                      <p className="font-semibold">{template.title}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="secondary" className="text-xs">{template.duration}</Badge>
                        <Badge variant="outline" className="text-xs">{template.orientation}</Badge>
                        <Badge variant="outline" className="text-xs">{template.resolution}</Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Render Process */}
            <div className="space-y-2">
              <h4 className="font-semibold text-sm text-muted-foreground">Generate Video</h4>
              <div className="p-4 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-2">
                  {shareMethod === 'cart' ? (
                    <>
                      <Users className="h-5 w-5 text-primary" />
                      <span className="font-medium">Published User Access</span>
                    </>
                  ) : (
                    <>
                      <Edit className="h-5 w-5 text-primary" />
                      <span className="font-medium">Changed</span>
                    </>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  {shareMethod === 'cart' 
                    ? `Template will be published to ${sharedUsers.length} user(s). Each user will receive individual access.`
                    : 'You will have full editing and rendering rights for this template.'}
                </p>
              </div>
            </div>

            {/* Published Users Summary */}
            {shareMethod === 'cart' && sharedUsers.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-semibold text-sm text-muted-foreground">
                  Published Users ({sharedUsers.length})
                </h4>
                <div className="p-4 bg-muted/30 rounded-lg max-h-40 overflow-y-auto">
                  <div className="space-y-2">
                    {sharedUsers.slice(0, 5).map((user) => (
                      <div key={user.id} className="flex items-center gap-2 text-sm">
                        <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium">{user.name}</span>
                        <span className="text-muted-foreground">•</span>
                        <span className="text-muted-foreground text-xs">{user.email}</span>
                      </div>
                    ))}
                    {sharedUsers.length > 5 && (
                      <p className="text-xs text-muted-foreground mt-2">
                        + {sharedUsers.length - 5} more user(s)
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Payment Summary */}
            <div className="space-y-2">
              <h4 className="font-semibold text-sm text-muted-foreground">Payment Summary</h4>
              <div className="p-4 bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg border border-primary/20 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Base Price</span>
                  <span className="font-medium">₹ {pricing.mrp.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Quantity (Users)</span>
                  <span className="font-medium">× {sharedUsers.length || 1}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">₹ {pricing.subtotal.toFixed(2)}</span>
                </div>
                {discountApplied && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Discount ({discountPercent}%)</span>
                    <span>- ₹ {pricing.discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tax (18%)</span>
                  <span className="font-medium">₹ {pricing.tax.toFixed(2)}</span>
                </div>
                <div className="pt-3 border-t border-primary/20">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-lg">Total Amount</span>
                    <span className="text-2xl font-bold text-primary">₹ {pricing.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="space-y-2">
              <h4 className="font-semibold text-sm text-muted-foreground">Payment Method</h4>
              <div className="p-4 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-2">
                  {paymentMethod === 'paytm' ? (
                    <>
                      <Wallet className="h-5 w-5 text-primary" />
                      <span className="font-medium">PAYTM - UPI Payment</span>
                    </>
                  ) : (
                    <>
                      <CreditCard className="h-5 w-5 text-primary" />
                      <span className="font-medium">Credit Zone - Trusted Partners</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* What Happens Next */}
            <div className="space-y-2">
              <h4 className="font-semibold text-sm text-muted-foreground">What Happens Next?</h4>
              <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">1</div>
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      Payment will be processed securely through {paymentMethod === 'paytm' ? 'PAYTM' : 'Credit Zone'}
                    </p>
                  </div>
                  {isQuickMode ? (
                    <>
                      <div className="flex items-start gap-2">
                        <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">2</div>
                        <p className="text-sm text-blue-700 dark:text-blue-300">
                          You can manage and add enrolled users to publish this template
                        </p>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">3</div>
                        <p className="text-sm text-blue-700 dark:text-blue-300">
                          All selected users will receive instant access to the published template
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-start gap-2">
                        <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">2</div>
                        <p className="text-sm text-blue-700 dark:text-blue-300">
                          Template will be published and granted to all {sharedUsers.length} user(s)
                        </p>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">3</div>
                        <p className="text-sm text-blue-700 dark:text-blue-300">
                          Each user will receive a notification with their access credentials
                        </p>
                      </div>
                    </>
                  )}
                  <div className="flex items-start gap-2">
                    <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">{isQuickMode ? '4' : '4'}</div>
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      You will receive a confirmation email with the order receipt
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmPayment}
              className="bg-primary hover:bg-primary/90 gap-2"
            >
              <CreditCard className="h-4 w-4" />
              Confirm & Pay ₹ {pricing.total.toFixed(2)}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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

      {/* Video Preview Dialog */}
      <Dialog open={!!previewTemplate} onOpenChange={() => setPreviewTemplate(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{previewTemplate?.title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {previewTemplate?.videoUrl ? (
              <div className="relative w-full rounded-lg overflow-hidden bg-black">
                <video
                  src={previewTemplate.videoUrl}
                  poster={previewTemplate.thumbnailUrl}
                  controls
                  className="w-full aspect-video"
                  autoPlay
                >
                  Your browser does not support the video tag.
                </video>
              </div>
            ) : (
              <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                <p className="text-muted-foreground">Video preview not available</p>
              </div>
            )}
            <div className="grid grid-cols-3 gap-4 text-sm p-4 bg-muted/30 rounded-lg">
              <div>
                <p className="text-muted-foreground">Duration</p>
                <p className="font-medium">{previewTemplate?.duration}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Orientation</p>
                <p className="font-medium">{previewTemplate?.orientation}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Resolution</p>
                <p className="font-medium">{previewTemplate?.resolution}</p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
