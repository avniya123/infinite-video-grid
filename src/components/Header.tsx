import { useState, useRef } from 'react';
import { Upload, Monitor, Heart, Bell, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';

export const Header = () => {
  const [profileImage, setProfileImage] = useState<string>('/placeholder.svg');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
        toast.success('Profile image updated successfully');
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo and Brand */}
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary via-purple-500 to-pink-500 flex items-center justify-center">
                <span className="text-white font-bold text-lg">V</span>
              </div>
              <span className="text-xl font-bold text-foreground hidden sm:inline">VideoStudio</span>
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex items-center gap-6">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="text-sm font-medium">
                    Gallery
                    <span className="ml-1 text-muted-foreground">▾</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuItem>All Videos</DropdownMenuItem>
                  <DropdownMenuItem>Favorites</DropdownMenuItem>
                  <DropdownMenuItem>Recent</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="text-sm font-medium">
                    Categories
                    <span className="ml-1 text-muted-foreground">▾</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuItem>Nature</DropdownMenuItem>
                  <DropdownMenuItem>Business</DropdownMenuItem>
                  <DropdownMenuItem>Urban</DropdownMenuItem>
                  <DropdownMenuItem>Lifestyle</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </nav>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-2">
            {/* Upload Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={triggerFileInput}
              className="hidden sm:flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              <span className="hidden lg:inline">Upload</span>
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />

            {/* Icon Buttons */}
            <Button variant="ghost" size="icon" className="hidden sm:flex">
              <Monitor className="w-5 h-5 text-muted-foreground" />
            </Button>
            
            <Button variant="ghost" size="icon" className="hidden sm:flex">
              <Heart className="w-5 h-5 text-muted-foreground" />
            </Button>
            
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="w-5 h-5 text-muted-foreground" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </Button>

            {/* Profile Avatar */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={profileImage} alt="Profile" />
                    <AvatarFallback className="bg-gradient-to-br from-primary to-purple-500 text-white">
                      <User className="w-5 h-5" />
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem onClick={triggerFileInput}>
                  <Upload className="mr-2 h-4 w-4" />
                  <span>Change Profile Picture</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Monitor className="mr-2 h-4 w-4" />
                  <span>Dashboard</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Theme Toggle */}
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
};
