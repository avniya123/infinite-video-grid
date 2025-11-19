import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Chrome } from 'lucide-react';
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
import { toast } from 'sonner';

interface AuthDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AuthDrawer = ({ open, onOpenChange }: AuthDrawerProps) => {
  const navigate = useNavigate();
  const [view, setView] = useState<'login' | 'signup' | 'forgot' | 'otp'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [signupData, setSignupData] = useState({
    fullName: '',
    email: '',
    phone: '',
    dob: '',
    password: '',
    confirmPassword: '',
    address: '',
    pincode: '',
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Login logic here
  };

  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setView('otp');
  };

  const handleSignupChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSignupData({ ...signupData, [e.target.name]: e.target.value });
  };

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    if (signupData.password !== signupData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    toast.success('Account created successfully!');
    onOpenChange(false);
  };

  const handleGoogleAuth = () => {
    toast.info('Google authentication coming soon!');
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
                {view === 'signup' && 'Create Account'}
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
                    onClick={() => setView('signup')}
                    className="text-primary hover:underline font-medium"
                  >
                    Sign up
                  </button>
                </div>
              </form>
            )}

            {view === 'signup' && (
              <form onSubmit={handleSignup} className="space-y-4">
                <p className="text-sm text-muted-foreground text-center">
                  Your Social Campaigns
                </p>

                <Button
                  type="button"
                  variant="outline"
                  onClick={handleGoogleAuth}
                  className="w-full h-11 rounded-xl border-2 hover:bg-muted/50 transition-all"
                >
                  <Chrome className="w-5 h-5 mr-2" />
                  Sign up with Google
                </Button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    name="fullName"
                    placeholder="John Doe"
                    value={signupData.fullName}
                    onChange={handleSignupChange}
                    className="h-11 rounded-xl"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    name="email"
                    type="email"
                    placeholder="john@example.com"
                    value={signupData.email}
                    onChange={handleSignupChange}
                    className="h-11 rounded-xl"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="+1 (555) 000-0000"
                    value={signupData.phone}
                    onChange={handleSignupChange}
                    className="h-11 rounded-xl"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dob">Date of Birth</Label>
                  <Input
                    id="dob"
                    name="dob"
                    type="date"
                    value={signupData.dob}
                    onChange={handleSignupChange}
                    className="h-11 rounded-xl"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <Input
                    id="signup-password"
                    name="password"
                    type="password"
                    placeholder="Create a strong password"
                    value={signupData.password}
                    onChange={handleSignupChange}
                    className="h-11 rounded-xl"
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Must be at least 8 characters with uppercase, lowercase, and numbers
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    placeholder="Re-enter your password"
                    value={signupData.confirmPassword}
                    onChange={handleSignupChange}
                    className="h-11 rounded-xl"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    name="address"
                    placeholder="123 Main Street"
                    value={signupData.address}
                    onChange={handleSignupChange}
                    className="h-11 rounded-xl"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pincode">Area Pincode / Zipcode</Label>
                  <Input
                    id="pincode"
                    name="pincode"
                    placeholder="10001"
                    value={signupData.pincode}
                    onChange={handleSignupChange}
                    className="h-11 rounded-xl"
                    required
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full h-11 rounded-xl bg-primary hover:bg-primary/90"
                >
                  Create Account
                </Button>

                <div className="text-center text-sm text-muted-foreground">
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => setView('login')}
                    className="text-primary hover:underline font-medium"
                  >
                    Sign in
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
