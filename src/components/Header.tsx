import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Monitor, ShoppingCart, User, Bell, LogOut, ChevronDown, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Badge } from '@/components/ui/badge';
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
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  const isVideosPage = location.pathname === '/videos';

  useEffect(() => {
    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

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
    // Toggle category selection
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
            {/* Logo and Brand */}
            <div className="flex items-center gap-6">
              <Link to="/" className="flex items-center gap-2 cursor-pointer group">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-gray-800 to-gray-600 dark:from-gray-700 dark:to-gray-500 flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                  <span className="text-white font-bold text-lg">V</span>
                </div>
                <span className="text-xl font-bold text-gray-900 dark:text-white hidden sm:inline">VideoStudio</span>
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
                  <Button
                    variant="ghost"
                    size="icon"
                    className="hidden sm:flex h-9 w-9 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
                  >
                    <Monitor className="w-5 h-5" />
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="hidden sm:flex h-9 w-9 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
                  >
                    <ShoppingCart className="w-5 h-5" />
                  </Button>

                  {/* Notification Bell */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="relative h-9 w-9 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
                  >
                    <Bell className="w-5 h-5" />
                    <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-[10px] bg-destructive text-white rounded-full border-2 border-white dark:border-gray-900">
                      3
                    </Badge>
                  </Button>
                </>
              )}

              {/* Theme Toggle */}
              <ThemeToggle />

              {/* Sign In / User Profile */}
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Avatar className="w-9 h-9 border-2 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-all cursor-pointer">
                      <AvatarImage src={user.user_metadata?.avatar_url} alt={user.user_metadata?.full_name || 'User'} />
                      <AvatarFallback className="bg-gradient-to-br from-gray-800 to-gray-600 text-white text-sm">
                        <User className="w-4 h-4" />
                      </AvatarFallback>
                    </Avatar>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
                    <DropdownMenuItem onClick={() => setProfileDrawerOpen(true)} className="text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800">
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
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
                  className="h-9 px-6 rounded-lg bg-gray-900 hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-100 text-white dark:text-gray-900 font-medium shadow-sm hover:shadow-md transition-all border-0"
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
      <ProfileDrawer open={profileDrawerOpen} onOpenChange={setProfileDrawerOpen} />
    </>
  );
};
