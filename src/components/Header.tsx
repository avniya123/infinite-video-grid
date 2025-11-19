import { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Upload, Monitor, Heart, User, Bell, LogOut, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AuthDrawer } from '@/components/AuthDrawer';
import ProfileDrawer from '@/components/ProfileDrawer';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import type { User as SupabaseUser } from '@supabase/supabase-js';

export const Header = () => {
  const navigate = useNavigate();
  const [authDrawerOpen, setAuthDrawerOpen] = useState(false);
  const [profileDrawerOpen, setProfileDrawerOpen] = useState(false);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size should be less than 5MB');
        return;
      }
      toast.success('File uploaded successfully');
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
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

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-border bg-card shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo and Brand */}
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary via-accent to-primary flex items-center justify-center shadow-md">
                <span className="text-white font-bold text-lg">V</span>
              </div>
              <span className="text-xl font-bold text-foreground hidden sm:inline">VideoStudio</span>
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center gap-2">
              {user && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={triggerFileInput}
                    className="hidden sm:flex items-center gap-2 h-9 rounded-lg hover:bg-muted/50 transition-all"
                    title="Upload content"
                  >
                    <Upload className="w-4 h-4" />
                    <span className="hidden lg:inline">Upload</span>
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,video/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />

                  {/* Icon Buttons */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="hidden sm:flex h-9 w-9 rounded-lg hover:bg-muted/50 transition-all"
                  >
                    <Monitor className="w-5 h-5 text-muted-foreground" />
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="hidden sm:flex h-9 w-9 rounded-lg hover:bg-muted/50 transition-all"
                  >
                    <Heart className="w-5 h-5 text-muted-foreground" />
                  </Button>

                  {/* Notification Bell */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="relative h-9 w-9 rounded-lg hover:bg-muted/50 transition-all"
                  >
                    <Bell className="w-5 h-5 text-muted-foreground" />
                    <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-[10px] bg-destructive text-white rounded-full">
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
                    <Avatar className="w-9 h-9 border-2 border-primary/20 hover:border-primary/50 transition-all cursor-pointer">
                      <AvatarImage src={user.user_metadata?.avatar_url} alt={user.user_metadata?.full_name || 'User'} />
                      <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white text-sm">
                        <User className="w-4 h-4" />
                      </AvatarFallback>
                    </Avatar>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 bg-card">
                    <DropdownMenuItem onClick={() => setProfileDrawerOpen(true)}>
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate('/settings')}>
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Sign Out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button
                  onClick={() => setAuthDrawerOpen(true)}
                  className="h-9 px-6 rounded-lg bg-success hover:bg-success/90 text-success-foreground font-medium shadow-sm hover:shadow-md transition-all"
                >
                  Sign In
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      <AuthDrawer open={authDrawerOpen} onOpenChange={setAuthDrawerOpen} />
      <ProfileDrawer open={profileDrawerOpen} onOpenChange={setProfileDrawerOpen} />
    </>
  );
};
