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
import { TemplateDetailsSkeleton } from '@/components/TemplateCardSkeleton';
import { toast } from 'sonner';
import { ArrowLeft, Trash2, Edit, Users, Wallet, CreditCard, Search, X, Download, ShoppingBag, Zap, Info, Play, Sparkles } from 'lucide-react';
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
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <Header 
          selectedMainCategory={null}
          selectedSubcategory={null}
          onMainCategorySelect={() => {}}
          onSubcategorySelect={() => {}}
        />
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          {/* Header Skeleton */}
          <div className="mb-8">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-2xl backdrop-blur-sm border border-primary/20">
                <ShoppingBag className="h-7 w-7 text-primary animate-pulse" />
              </div>
              <div className="flex-1 space-y-2">
                <div className="h-8 w-64 bg-muted/50 rounded-lg animate-pulse"></div>
                <div className="h-4 w-96 bg-muted/30 rounded-lg animate-pulse"></div>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column Skeleton */}
            <div className="lg:col-span-2 space-y-8">
              <TemplateDetailsSkeleton />
              
              {/* Users Section Skeleton */}
              <Card className="p-6 shadow-lg border-border/50 bg-card/50 backdrop-blur-sm">
                <div className="h-6 w-48 bg-muted/50 rounded-lg animate-pulse mb-4"></div>
                <div className="space-y-3">
                  <div className="h-12 bg-muted/30 rounded-lg animate-pulse"></div>
                  <div className="h-12 bg-muted/30 rounded-lg animate-pulse"></div>
                </div>
              </Card>
            </div>

            {/* Right Column Skeleton */}
            <div className="space-y-8">
              <Card className="p-6 shadow-lg border-border/50 bg-card/50 backdrop-blur-sm">
                <div className="h-6 w-40 bg-muted/50 rounded-lg animate-pulse mb-4"></div>
                <div className="space-y-3">
                  <div className="h-20 bg-muted/30 rounded-lg animate-pulse"></div>
                  <div className="h-20 bg-muted/30 rounded-lg animate-pulse"></div>
                </div>
              </Card>
              
              <Card className="p-6 shadow-lg border-border/50 bg-card/50 backdrop-blur-sm">
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex justify-between">
                      <div className="h-4 w-32 bg-muted/30 rounded animate-pulse"></div>
                      <div className="h-4 w-20 bg-muted/30 rounded animate-pulse"></div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <Header 
        selectedMainCategory={null}
        selectedSubcategory={null}
        onMainCategorySelect={() => {}}
        onSubcategorySelect={() => {}}
      />

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="relative p-3 bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl backdrop-blur-sm border border-primary/20 shadow-lg">
              <ShoppingBag className="h-5.5 w-5.5 text-primary" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full animate-pulse"></div>
            </div>
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-xl font-extrabold tracking-wide text-foreground leading-tight">
                  {isQuickMode ? `Quick Publish Cart (${templates.length})` : `Publish Cart Checkout (${templates.length})`}
                </h1>
                {isQuickMode && (
                  <Badge className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white border-0 gap-1.5 px-3 py-1.5 shadow-lg">
                    <Zap className="h-4 w-4" />
                    Quick Mode
                  </Badge>
                )}
              </div>
              <p className="text-muted-foreground text-sm mt-0.5 flex items-center gap-2 tracking-wide">
                <Sparkles className="h-4 w-4 text-primary" />
                {isQuickMode ? 'Fast checkout with instant template publishing' : 'Complete your purchase and publish templates to users'}
              </p>
            </div>
          </div>
          <Button 
            variant="ghost"
            onClick={() => navigate('/publish-cart')} 
            className="gap-2 hover:bg-primary/10 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Publish Cart
          </Button>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Template & Users */}
          <div className="lg:col-span-2 space-y-8 animate-fade-in">
            {/* Template Info */}
            <Card className="p-4 shadow-sm border-border/40 bg-gradient-to-br from-background/95 to-muted/10 hover:shadow-md transition-all duration-300">
              <div className="flex items-center gap-2 mb-3">
                <div className="h-0.5 w-8 rounded-full bg-gradient-to-r from-primary to-primary/50" />
                <h2 className="text-base font-bold text-foreground/90 tracking-wide">Template Details</h2>
              </div>
              <div className="space-y-2">
                {templates.map((template, index) => (
                  <div key={template.id} className="group relative p-2.5 rounded-lg border border-border/40 bg-background/60 backdrop-blur-sm hover:shadow-sm hover:border-primary/20 transition-all duration-300">
                    <div className="flex gap-2.5 items-start">
                      <div className="relative w-16 h-16 rounded-md overflow-hidden flex-shrink-0 cursor-pointer group/preview"
                           onClick={() => template.videoUrl && setPreviewTemplate(template)}>
                        <img 
                          src={template.thumbnailUrl || '/placeholder.svg'} 
                          alt={template.title}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        {template.videoUrl && (
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/preview:opacity-100 transition-opacity duration-200">
                            <Play className="w-5 h-5 text-white" />
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0 space-y-1.5">
                        <h3 className="font-medium text-sm line-clamp-1 group-hover:text-primary transition-colors">
                          {template.title}
                        </h3>
                        <div className="flex flex-wrap items-center gap-1.5">
                          <Badge variant="secondary" className="h-5 px-1.5 text-[10px] bg-primary/10 text-primary border-primary/20">
                            {template.duration}
                          </Badge>
                          <Badge variant="secondary" className="h-5 px-1.5 text-[10px] bg-primary/10 text-primary border-primary/20">
                            {template.orientation}
                          </Badge>
                          <Badge variant="secondary" className="h-5 px-1.5 text-[10px] bg-primary/10 text-primary border-primary/20">
                            {template.resolution}
                          </Badge>
                        </div>
                        <div className="flex items-start gap-2 pt-0.5">
                          <div className="flex flex-col">
                            <p className="text-base font-bold text-primary leading-tight">₹{template.price}</p>
                            <span className="text-[10px] text-muted-foreground">per variation</span>
                          </div>
                          {template.videoUrl && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setPreviewTemplate(template)}
                              className="ml-auto h-6 px-2 text-[10px] hover:bg-primary/10"
                            >
                              <Play className="w-3 h-3 mr-0.5" />
                              Preview
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Published Users Management */}
            <Card className="p-6 shadow-lg border-border/50 bg-card/50 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-semibold flex items-center gap-2">
                    <div className="h-1 w-10 bg-gradient-to-r from-primary to-primary/50 rounded-full"></div>
                    Published Users
                  </h2>
                  <p className="text-sm text-muted-foreground mt-2">
                    Manage users who will receive this published template
                  </p>
                </div>
                <Button
                  onClick={() => {
                    setEditingUser(null);
                    setAddUserSheetOpen(true);
                  }}
                  className="gap-2 shadow-md hover:shadow-lg transition-all bg-gradient-to-r from-primary to-primary/90"
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
                <div className="text-center py-16 px-4">
                  <div className="relative mb-6">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-32 h-32 bg-primary/5 rounded-full animate-pulse"></div>
                    </div>
                    <Users className="w-20 h-20 mx-auto relative text-muted-foreground/40" />
                  </div>
                  <h3 className="text-xl font-bold mb-2 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">No Users Added Yet</h3>
                  <p className="text-muted-foreground mb-8 max-w-sm mx-auto">
                    Start by adding users to share this amazing template with them
                  </p>
                  <Button
                    onClick={() => {
                      setEditingUser(null);
                      setAddUserSheetOpen(true);
                    }}
                    className="gap-2 shadow-lg hover:shadow-xl transition-all bg-gradient-to-r from-primary to-primary/90"
                    size="lg"
                  >
                    <Users className="w-5 h-5" />
                    Add Your First User
                    <Sparkles className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </Card>
          </div>

          {/* Right Column - Summary & Payment */}
          <div className="space-y-8 animate-fade-in" style={{ animationDelay: '200ms' }}>
            {/* Render Process */}
            <Card className="p-5 shadow-lg border-border/50 bg-card/50 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
              <div className="flex items-center gap-2 mb-3">
                <div className="h-0.5 w-8 bg-gradient-to-r from-primary to-primary/50 rounded-full"></div>
                <h3 className="font-semibold text-base">Generate Video</h3>
              </div>
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
                  className={`p-4 rounded-lg border-2 transition-all duration-300 group hover:scale-105 ${
                    shareMethod === 'cart' 
                      ? 'border-primary bg-gradient-to-br from-primary/10 to-primary/5 shadow-md' 
                      : 'border-border hover:border-primary/50 hover:bg-primary/5'
                  }`}
                >
                  <Users className={`w-8 h-8 mx-auto mb-2 transition-transform group-hover:scale-110 ${shareMethod === 'cart' ? 'text-primary' : 'text-muted-foreground'}`} />
                  <p className="text-sm font-semibold">Published User</p>
                </button>
                
                <button
                  onClick={() => {
                    if (!isQuickMode) {
                      setSelfRenderConfirmDialogOpen(true);
                    }
                  }}
                  disabled={isQuickMode}
                  className={`p-4 rounded-lg border-2 transition-all duration-300 group relative ${
                    isQuickMode 
                      ? 'opacity-50 cursor-not-allowed bg-muted/20 border-muted' 
                      : shareMethod === 'edited' 
                        ? 'border-primary bg-gradient-to-br from-primary/10 to-primary/5 shadow-md hover:scale-105' 
                        : 'border-border hover:border-primary/50 hover:bg-primary/5 hover:scale-105'
                  }`}
                >
                  <Edit className={`w-8 h-8 mx-auto mb-2 transition-transform group-hover:scale-110 ${
                    isQuickMode 
                      ? 'text-muted-foreground/50' 
                      : shareMethod === 'edited' 
                        ? 'text-primary' 
                        : 'text-muted-foreground'
                  }`} />
                  <p className={`text-sm font-semibold ${isQuickMode ? 'text-muted-foreground' : ''}`}>
                    Changed
                  </p>
                  {isQuickMode && (
                    <div className="flex items-center justify-center gap-1 mt-1.5">
                      <Info className="h-3 w-3 text-muted-foreground" />
                      <p className="text-[10px] text-muted-foreground">Not available</p>
                    </div>
                  )}
                </button>
              </div>
            </Card>

            {/* Order Summary */}
            <Card className={`p-5 shadow-lg border-border/50 backdrop-blur-sm hover:shadow-xl transition-all duration-300 ${
              isQuickMode ? 'bg-gradient-to-br from-primary/5 via-background to-background border-primary/30' : 'bg-card/50'
            }`}>
              <div className="flex items-center gap-2 mb-4">
                {isQuickMode && (
                  <div className="p-1.5 bg-primary/20 rounded-lg">
                    <Zap className="h-4 w-4 text-primary" />
                  </div>
                )}
                <h3 className={`font-semibold text-base flex items-center gap-2 ${isQuickMode ? 'text-primary' : ''}`}>
                  <div className="h-0.5 w-8 bg-gradient-to-r from-primary to-primary/50 rounded-full"></div>
                  {isQuickMode ? 'Quick Payment Summary' : 'Order Summary'}
                </h3>
              </div>
              
              <div className="space-y-3 text-sm">
                {/* Render Process Indicator */}
                <div className="flex justify-between items-center pb-3 border-b border-border/50">
                  <span className="text-muted-foreground text-xs font-medium">Generate Video</span>
                  <div className={`px-3 py-1.5 rounded-full text-[10px] font-semibold flex items-center gap-1.5 ${
                    shareMethod === 'cart' 
                      ? 'bg-gradient-to-r from-primary/20 to-primary/10 text-primary border border-primary/30' 
                      : 'bg-gradient-to-r from-secondary/20 to-secondary/10 text-secondary-foreground border border-secondary/30'
                  }`}>
                    {shareMethod === 'cart' ? (
                      <>
                        <Users className="w-3 h-3" />
                        Published User
                      </>
                    ) : (
                      <>
                        <Edit className="w-3 h-3" />
                        Self & Render
                      </>
                    )}
                  </div>
                </div>
                
                <div className="flex justify-between py-1.5">
                  <span className="text-muted-foreground text-xs">MRP</span>
                  <span className="font-semibold text-sm">₹{pricing.mrp.toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-muted-foreground text-xs">Published Users</span>
                  <Badge variant="secondary" className="font-semibold h-5 text-xs">X {sharedUsers.length || 1}</Badge>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-muted-foreground text-xs">Subtotal</span>
                  <span className="font-semibold text-sm">₹{pricing.subtotal.toFixed(2)}</span>
                </div>
                {discountApplied && (
                  <div className="flex justify-between py-1.5 text-green-600">
                    <span className="font-medium text-xs">Discount ({discountPercent}%)</span>
                    <span className="font-semibold text-sm">-₹{pricing.discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between py-1.5">
                  <span className="text-muted-foreground text-xs">Tax (18%)</span>
                  <span className="font-semibold text-sm">₹{pricing.tax.toFixed(2)}</span>
                </div>
                <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent my-2" />
                <div className="flex justify-between items-center py-2 bg-gradient-to-r from-primary/5 to-transparent rounded-lg px-2.5">
                  <span className="font-bold text-sm">Total Amount</span>
                  <span className="text-primary font-bold text-lg">₹{pricing.total.toFixed(2)}</span>
                </div>
              </div>

              {/* Discount Code */}
              <div className="mt-4 space-y-2">
                <div className="flex gap-2">
                  <Input
                    placeholder="Discount code"
                    value={discountCode}
                    onChange={(e) => setDiscountCode(e.target.value)}
                    disabled={discountApplied}
                    className="h-9 text-sm border-primary/30 focus:border-primary"
                  />
                  <Button
                    onClick={handleApplyDiscount}
                    variant="outline"
                    size="sm"
                    disabled={discountApplied}
                    className="h-9 border-primary/30 hover:bg-primary hover:text-primary-foreground"
                  >
                    Apply
                  </Button>
                </div>
              </div>

              {/* Quick Mode Info */}
              {isQuickMode && (
                <div className="mt-4 flex items-start gap-2 p-2.5 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <Info className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
                  <p className="text-[10px] text-blue-700 dark:text-blue-300 leading-relaxed">
                    After payment, manage and add enrolled users instantly
                  </p>
                </div>
              )}
            </Card>

            {/* Payment Method */}
            <Card className="p-5 shadow-lg border-border/50 bg-card/50 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
              <div className="flex items-center gap-2 mb-4">
                <div className="h-0.5 w-8 bg-gradient-to-r from-primary to-primary/50 rounded-full"></div>
                <h3 className="font-semibold text-base">Payment Method</h3>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setPaymentMethod('paytm')}
                  className={`p-4 rounded-lg border-2 transition-all duration-300 group hover:scale-105 ${
                    paymentMethod === 'paytm' 
                      ? 'border-primary bg-gradient-to-br from-primary/10 to-primary/5 shadow-md' 
                      : 'border-border hover:border-primary/50 hover:bg-primary/5'
                  }`}
                >
                  <Wallet className={`w-8 h-8 mx-auto mb-2 transition-transform group-hover:scale-110 ${paymentMethod === 'paytm' ? 'text-primary' : 'text-muted-foreground'}`} />
                  <p className="text-sm font-semibold">PAYTM</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">UPI Payment</p>
                </button>
                <button
                  onClick={() => setPaymentMethod('credit')}
                  className={`p-4 rounded-lg border-2 transition-all duration-300 group hover:scale-105 ${
                    paymentMethod === 'credit' 
                      ? 'border-primary bg-gradient-to-br from-primary/10 to-primary/5 shadow-md' 
                      : 'border-border hover:border-primary/50 hover:bg-primary/5'
                  }`}
                >
                  <CreditCard className={`w-8 h-8 mx-auto mb-2 transition-transform group-hover:scale-110 ${paymentMethod === 'credit' ? 'text-primary' : 'text-muted-foreground'}`} />
                  <p className="text-sm font-semibold">Credit Zone</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Trusted Partners</p>
                </button>
              </div>
            </Card>

            {/* Proceed Button */}
            <Button
              onClick={handleProceedToPayment}
              className="w-full h-16 text-lg font-bold shadow-2xl hover:shadow-3xl transition-all duration-300 bg-gradient-to-r from-primary via-primary to-primary/90 hover:from-primary/90 hover:via-primary hover:to-primary group relative overflow-hidden"
              size="lg"
              disabled={sharedUsers.length === 0}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
              <CreditCard className="w-6 h-6 mr-3 group-hover:scale-110 transition-transform" />
              <span className="relative">Proceed to Payment</span>
              <Sparkles className="w-5 h-5 ml-3 group-hover:rotate-12 transition-transform" />
            </Button>
            {sharedUsers.length === 0 && (
              <div className="text-center p-4 bg-gradient-to-r from-muted/30 to-muted/10 rounded-lg border border-border/50">
                <Info className="w-5 h-5 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground font-medium">
                  Add at least one user to proceed with payment
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
              <h4 className="font-semibold text-sm text-muted-foreground flex items-center gap-2">
                <div className="h-0.5 w-6 bg-primary rounded-full"></div>
                Template Details
              </h4>
              <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
                {templates.map((template) => (
                  <div key={template.id} className="group flex items-start gap-2 p-2 bg-gradient-to-br from-muted/20 to-muted/5 rounded-md border border-border/30 hover:border-primary/20 transition-all">
                    <div className="relative rounded overflow-hidden shadow-sm flex-shrink-0">
                      <img 
                        src={template.thumbnailUrl || '/placeholder.svg'} 
                        alt={template.title}
                        className="w-12 h-12 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-xs truncate mb-1">{template.title}</p>
                      <div className="flex flex-wrap items-center gap-1">
                        <Badge variant="secondary" className="text-[10px] py-0 h-4 px-1.5">{template.duration}</Badge>
                        <Badge variant="secondary" className="text-[10px] py-0 h-4 px-1.5">{template.orientation}</Badge>
                        <Badge variant="secondary" className="text-[10px] py-0 h-4 px-1.5">{template.resolution}</Badge>
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
