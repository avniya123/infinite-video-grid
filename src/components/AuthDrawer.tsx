import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { OTPVerification } from './OTPVerification';

interface AuthDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AuthDrawer = ({ open, onOpenChange }: AuthDrawerProps) => {
  const navigate = useNavigate();
  const [view, setView] = useState<'login' | 'forgot' | 'otp'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Login logic here
  };

  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setView('otp');
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md p-0 border-none">
        <div className="h-full bg-card flex flex-col">
          {/* Header */}
          <SheetHeader className="px-6 py-4 border-b border-border">
            <div className="flex items-center justify-between">
              <SheetTitle className="text-xl font-semibold">
                {view === 'login' && 'Welcome Back'}
                {view === 'forgot' && 'Forgot Password'}
                {view === 'otp' && 'Verify Email'}
              </SheetTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onOpenChange(false)}
                className="h-8 w-8 rounded-full"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </SheetHeader>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-6 py-8">
            {view === 'login' && (
              <form onSubmit={handleLogin} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-11 rounded-lg"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-11 rounded-lg"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => setView('forgot')}
                  className="text-sm text-primary hover:underline"
                >
                  Forgot password?
                </button>

                <Button
                  type="submit"
                  className="w-full h-11 rounded-lg bg-primary hover:bg-primary/90"
                >
                  Sign In
                </Button>

                <div className="text-center text-sm text-muted-foreground">
                  Don't have an account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      onOpenChange(false);
                      navigate('/signup');
                    }}
                    className="text-primary hover:underline font-medium"
                  >
                    Sign up
                  </button>
                </div>
              </form>
            )}

            {view === 'forgot' && (
              <form onSubmit={handleForgotPassword} className="space-y-6">
                <p className="text-sm text-muted-foreground">
                  Enter your email address and we'll send you a verification code
                </p>

                <div className="space-y-2">
                  <Label htmlFor="forgot-email">Email</Label>
                  <Input
                    id="forgot-email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-11 rounded-lg"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full h-11 rounded-lg bg-primary hover:bg-primary/90"
                >
                  Send Code
                </Button>

                <button
                  type="button"
                  onClick={() => setView('login')}
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  ← Back to login
                </button>
              </form>
            )}

            {view === 'otp' && (
              <OTPVerification
                email={email}
                onVerified={() => onOpenChange(false)}
                onBack={() => setView('forgot')}
              />
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
