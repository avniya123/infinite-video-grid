import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutTemplate,
  FileText,
  ShoppingCart,
  User,
  Users,
  Zap,
  Moon,
  Sun,
  Home,
  Search,
} from 'lucide-react';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export function QuickActionsMenu() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { setTheme, theme } = useTheme();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const handleNavigate = (path: string) => {
    navigate(path);
    setOpen(false);
    toast.success('Navigated successfully');
  };

  const handleThemeToggle = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
    setOpen(false);
    toast.success(`Switched to ${theme === 'dark' ? 'light' : 'dark'} mode`);
  };

  return (
    <>
      {/* Floating Action Button */}
      <Button
        onClick={() => setOpen(true)}
        size="icon"
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all z-50 bg-primary hover:bg-primary/90"
        aria-label="Quick Actions Menu"
      >
        <Zap className="h-6 w-6" />
      </Button>

      {/* Command Dialog */}
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          
          <CommandGroup heading="Navigation">
            <CommandItem onSelect={() => handleNavigate('/')}>
              <Home className="mr-2 h-4 w-4" />
              <span>Home</span>
            </CommandItem>
            <CommandItem onSelect={() => handleNavigate('/videos')}>
              <Search className="mr-2 h-4 w-4" />
              <span>Browse Videos</span>
            </CommandItem>
            <CommandItem onSelect={() => handleNavigate('/my-templates')}>
              <LayoutTemplate className="mr-2 h-4 w-4" />
              <span>My Templates</span>
            </CommandItem>
            <CommandItem onSelect={() => handleNavigate('/my-bills')}>
              <FileText className="mr-2 h-4 w-4" />
              <span>My Bills</span>
            </CommandItem>
            <CommandItem onSelect={() => handleNavigate('/my-users')}>
              <Users className="mr-2 h-4 w-4" />
              <span>My Users</span>
            </CommandItem>
            <CommandItem onSelect={() => handleNavigate('/publish-cart')}>
              <ShoppingCart className="mr-2 h-4 w-4" />
              <span>Publish Cart</span>
            </CommandItem>
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading="Settings">
            <CommandItem onSelect={handleThemeToggle}>
              {theme === 'dark' ? (
                <>
                  <Sun className="mr-2 h-4 w-4" />
                  <span>Switch to Light Mode</span>
                </>
              ) : (
                <>
                  <Moon className="mr-2 h-4 w-4" />
                  <span>Switch to Dark Mode</span>
                </>
              )}
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>

      {/* Keyboard Shortcut Hint */}
      <div className="fixed bottom-6 left-6 z-50 hidden md:block">
        <div className="text-xs text-muted-foreground bg-card border border-border rounded-lg px-3 py-2 shadow-sm">
          Press{' '}
          <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
            <span className="text-xs">⌘</span>K
          </kbd>{' '}
          for quick actions
        </div>
      </div>
    </>
  );
}
