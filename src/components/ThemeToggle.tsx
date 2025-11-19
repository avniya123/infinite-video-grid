import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

export const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button 
        variant="ghost" 
        size="icon" 
        className="h-9 w-9 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700"
      >
        <Sun className="h-4 w-4" />
      </Button>
    );
  }

  const handleThemeChange = () => {
    // Add smooth fade effect
    document.documentElement.style.setProperty('--theme-transition', '0.3s');
    setTheme(theme === 'dark' ? 'light' : 'dark');
    
    // Reset transition after animation
    setTimeout(() => {
      document.documentElement.style.removeProperty('--theme-transition');
    }, 300);
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleThemeChange}
      className={`h-9 w-9 rounded-lg transition-all duration-300 hover:scale-110 hover:rotate-12 ${
        theme === 'dark' 
          ? 'bg-gray-800 hover:bg-gray-700 text-white' 
          : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
      }`}
      title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      <div className="relative w-4 h-4">
        {theme === 'dark' ? (
          <Sun className="h-4 w-4 absolute inset-0 transition-all duration-300 rotate-0 scale-100 opacity-100" />
        ) : (
          <Moon className="h-4 w-4 absolute inset-0 transition-all duration-300 rotate-0 scale-100 opacity-100" />
        )}
      </div>
    </Button>
  );
};
