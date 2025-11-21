import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { LayoutTemplate, ShoppingCart, User, Bell, LogOut, ChevronDown, Check, Menu, X, Share, FileText, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AuthDrawer } from '@/components/AuthDrawer';
import ProfileDrawer from '@/components/ProfileDrawer';
import { SubcategorySlider } from '@/components/SubcategorySlider';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import type { User as SupabaseUser } from '@supabase/supabase-js';

const personalCategories = [
  'Personal Celebrations',
  'Festival Celebrations',
  'National & Public Holidays',
  'Corporate & Office',
  'Entertainment & Showbiz',
  'Sports & Competition',
  'Environmental & Nature',
];

const businessCategories = [
  'Corporate Events',
  'Marketing & Advertising',
  'Professional Services',
  'E-commerce',
];

interface HeaderProps {
  selectedSubcategory?: string | null;
  selectedMainCategory?: string | null;
  onSubcategorySelect?: (subcategory: string | null) => void;
  onMainCategorySelect?: (mainCategory: string | null) => void;
}

export const Header = ({ selectedSubcategory, selectedMainCategory, onSubcategorySelect, onMainCategorySelect }: HeaderProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [authDrawerOpen, setAuthDrawerOpen] = useState(false);
  const [profileDrawerOpen, setProfileDrawerOpen] = useState(false);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [profileData, setProfileData] = useState<any>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const isVideosPage = location.pathname === '/videos';

  useEffect(() => {
    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setProfileData(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      setProfileData(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast.success('Logged out successfully');
      navigate('/');
    } catch (error: any) {
      toast.error(error.message || 'Failed to log out');
    }
  };

  const selectCategory = (category: string) => {
    // If NOT on videos page, navigate to videos page with category
    if (location.pathname !== '/videos') {
      navigate('/videos');
      // Set category after navigation
      setTimeout(() => {
        setSelectedCategory(category);
        if (onMainCategorySelect) {
          onMainCategorySelect(category);
        }
      }, 100);
      return;
    }

    // If on videos page, toggle category selection
    if (selectedCategory === category) {
      setSelectedCategory(null);
      if (onSubcategorySelect) {
        onSubcategorySelect(null);
      }
      if (onMainCategorySelect) {
        onMainCategorySelect(null);
      }
    } else {
      setSelectedCategory(category);
      // Clear subcategory selection when changing main category
      if (onSubcategorySelect) {
        onSubcategorySelect(null);
      }
      // Set main category for filtering
      if (onMainCategorySelect) {
        onMainCategorySelect(category);
      }
    }
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Mobile Menu Button */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon">
                  <Menu className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] sm:w-[400px]">
                <nav className="flex flex-col gap-4 mt-8">
                  {/* Categories */}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <h3 className="font-semibold text-sm text-muted-foreground px-2">Personals</h3>
                      {personalCategories.map((category) => (
                        <Button
                          key={category}
                          variant="ghost"
                          className="w-full justify-start"
                          onClick={() => {
                            selectCategory(category);
                            setMobileMenuOpen(false);
                          }}
                        >
                          {selectedCategory === category && <Check className="mr-2 h-4 w-4" />}
                          {category}
                        </Button>
                      ))}
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-semibold text-sm text-muted-foreground px-2">Business</h3>
                      {businessCategories.map((category) => (
                        <Button
                          key={category}
                          variant="ghost"
                          className="w-full justify-start"
                          onClick={() => {
                            selectCategory(category);
                            setMobileMenuOpen(false);
                          }}
                        >
                          {selectedCategory === category && <Check className="mr-2 h-4 w-4" />}
                          {category}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* User Actions */}
                  {user && (
                    <div className="border-t pt-4 space-y-2">
                      <Button 
                        variant="ghost" 
                        className="w-full justify-start"
                        onClick={() => {
                          navigate('/my-templates');
                          setMobileMenuOpen(false);
                        }}
                      >
                        <LayoutTemplate className="mr-2 h-4 w-4" />
                        My Templates
                      </Button>
                      <Button 
                        variant="ghost" 
                        className="w-full justify-start"
                        onClick={() => {
                          navigate('/my-videos');
                          setMobileMenuOpen(false);
                        }}
                      >
                        <Video className="mr-2 h-4 w-4" />
                        My Videos
                      </Button>
                      <Button 
                        variant="ghost" 
                        className="w-full justify-start"
                        onClick={() => {
                          navigate('/my-users');
                          setMobileMenuOpen(false);
                        }}
                      >
                        <User className="mr-2 h-4 w-4" />
                        My Users
                      </Button>
                      <Button 
                        variant="ghost" 
                        className="w-full justify-start"
                        onClick={() => {
                          navigate('/my-bills');
                          setMobileMenuOpen(false);
                        }}
                      >
                        <FileText className="mr-2 h-4 w-4" />
                        My Bills
                      </Button>
                      <Button 
                        variant="ghost" 
                        className="w-full justify-start"
                        onClick={() => {
                          navigate('/publish-cart');
                          setMobileMenuOpen(false);
                        }}
                      >
                        <ShoppingCart className="mr-2 h-4 w-4" />
                        Cart
                      </Button>
                      <Button variant="ghost" className="w-full justify-start">
                        <Bell className="mr-2 h-4 w-4" />
                        Notifications
                      </Button>
                    </div>
                  )}

                  {/* Auth Actions */}
                  <div className="border-t pt-4 space-y-2">
                    {user ? (
                      <>
                        <Button
                          variant="ghost"
                          className="w-full justify-start"
                          onClick={() => {
                            setProfileDrawerOpen(true);
                            setMobileMenuOpen(false);
                          }}
                        >
                          <User className="mr-2 h-4 w-4" />
                          Profile
                        </Button>
                        <Button
                          variant="ghost"
                          className="w-full justify-start"
                          onClick={() => {
                            handleLogout();
                            setMobileMenuOpen(false);
                          }}
                        >
                          <LogOut className="mr-2 h-4 w-4" />
                          Logout
                        </Button>
                      </>
                    ) : (
                      <Button
                        className="w-full"
                        onClick={() => {
                          setAuthDrawerOpen(true);
                          setMobileMenuOpen(false);
                        }}
                      >
                        Sign In
                      </Button>
                    )}
                  </div>

                  {/* Theme Toggle */}
                  <div className="border-t pt-4">
                    <div className="flex items-center justify-between px-2">
                      <span className="text-sm font-medium">Theme</span>
                      <ThemeToggle />
                    </div>
                  </div>
                </nav>
              </SheetContent>
            </Sheet>

            {/* Logo and Brand */}
            <div className="flex items-center gap-6">
              <Link to="/" className="flex items-center gap-2 cursor-pointer group">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-gray-800 to-gray-600 dark:from-gray-700 dark:to-gray-500 flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                  <span className="text-white font-extrabold text-lg">V</span>
                </div>
                <span className="text-lg font-extrabold text-gray-900 dark:text-white hidden sm:inline tracking-wide">VideoStudio</span>
              </Link>

              {/* Category Navigation */}
              <nav className="hidden md:flex items-center gap-1">
                {/* Personals Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    className="h-9 px-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1"
                  >
                    Personals
                    <ChevronDown className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent 
                  align="start" 
                  className="w-64 p-2 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 shadow-lg"
                >
                  <DropdownMenuLabel className="text-xs font-semibold text-gray-500 dark:text-gray-400 px-2">
                    Personal Categories
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-700" />
                  <div className="grid grid-cols-1 gap-1">
                    {personalCategories.map((category) => (
                      <DropdownMenuItem
                        key={category}
                        onClick={() => selectCategory(category)}
                        className="cursor-pointer flex items-center justify-between px-2 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-gray-700 dark:text-gray-200"
                      >
                        <span className="text-sm">{category}</span>
                        {selectedCategory === category && (
                          <Check className="w-4 h-4 text-gray-900 dark:text-white" />
                        )}
                      </DropdownMenuItem>
                    ))}
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Business Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    className="h-9 px-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1"
                  >
                    Business
                    <ChevronDown className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent 
                  align="start" 
                  className="w-64 p-2 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 shadow-lg"
                >
                  <DropdownMenuLabel className="text-xs font-semibold text-gray-500 dark:text-gray-400 px-2">
                    Business Categories
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-700" />
                  <div className="grid grid-cols-1 gap-1">
                    {businessCategories.map((category) => (
                      <DropdownMenuItem
                        key={category}
                        onClick={() => selectCategory(category)}
                        className="cursor-pointer flex items-center justify-between px-2 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-gray-700 dark:text-gray-200"
                      >
                        <span className="text-sm">{category}</span>
                        {selectedCategory === category && (
                          <Check className="w-4 h-4 text-gray-900 dark:text-white" />
                        )}
                      </DropdownMenuItem>
                    ))}
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
              </nav>
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center gap-2">
              {user && (
                <>
                  {/* Icon Buttons */}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate('/my-templates')}
                        className="flex h-8 w-8 sm:h-9 sm:w-9 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
                      >
                        <LayoutTemplate className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>My Templates</p>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate('/my-videos')}
                        className="flex h-8 w-8 sm:h-9 sm:w-9 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
                      >
                        <Video className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>My Videos</p>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate('/publish-cart')}
                        className="flex h-8 w-8 sm:h-9 sm:w-9 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
                      >
                        <ShoppingCart className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Publish Cart</p>
                    </TooltipContent>
                  </Tooltip>

                  {/* Notification Bell */}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="relative h-9 w-9 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
                      >
                        <Bell className="w-4 h-4" />
                        <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-[10px] bg-destructive text-white rounded-full border-2 border-white dark:border-gray-900">
                          3
                        </Badge>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Notifications</p>
                    </TooltipContent>
                  </Tooltip>
                </>
              )}

              {/* Theme Toggle - Desktop Only */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="hidden md:block">
                    <ThemeToggle />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Toggle Theme</p>
                </TooltipContent>
              </Tooltip>

              {/* Sign In / User Profile - Desktop Only */}
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild className="hidden md:flex">
                    <Avatar className="w-9 h-9 border-2 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-all cursor-pointer">
                      <AvatarImage 
                        src={profileData?.avatar_url || user.user_metadata?.avatar_url} 
                        alt={profileData?.full_name || user.user_metadata?.full_name || 'User'}
                        key={profileData?.avatar_url} 
                      />
                      <AvatarFallback className="bg-gradient-to-br from-gray-800 to-gray-600 text-white text-sm">
                        {(profileData?.full_name || user.user_metadata?.full_name || user.email || 'U').charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
                    <DropdownMenuLabel className="text-gray-700 dark:text-gray-200">My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-700" />
                    <DropdownMenuItem onClick={() => setProfileDrawerOpen(true)} className="text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800">
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/my-templates')} className="text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800">
                      <LayoutTemplate className="mr-2 h-4 w-4" />
                      <span>My Templates</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/my-users')} className="text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800">
                      <User className="mr-2 h-4 w-4" />
                      <span>My Users</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/my-bills')} className="text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800">
                      <FileText className="mr-2 h-4 w-4" />
                      <span>My Billing</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/publish-cart')} className="text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800">
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      <span>Publish Cart</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-700" />
                    <DropdownMenuItem onClick={handleLogout} className="text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button
                  onClick={() => setAuthDrawerOpen(true)}
                  className="hidden md:inline-flex h-9 px-6 rounded-lg bg-gray-900 hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-100 text-white dark:text-gray-900 font-medium shadow-sm hover:shadow-md transition-all border-0"
                >
                  Sign In
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {selectedCategory && (
        <SubcategorySlider 
          category={selectedCategory} 
          selectedSubcategory={selectedSubcategory || null}
          onSubcategorySelect={onSubcategorySelect || (() => {})}
        />
      )}

      <AuthDrawer open={authDrawerOpen} onOpenChange={setAuthDrawerOpen} />
      <ProfileDrawer 
        open={profileDrawerOpen} 
        onOpenChange={setProfileDrawerOpen}
        onProfileUpdate={() => user && fetchProfile(user.id)}
      />
    </>
  );
};
