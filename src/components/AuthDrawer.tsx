import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Chrome, AlertCircle, Facebook, Twitter, Github, Eye, EyeOff, Loader2 } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { DRAWER_PRESETS, getDrawerHeaderClassName } from '@/config/drawer';
import { DrawerCloseButton } from '@/components/DrawerCloseButton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { OTPVerification } from './OTPVerification';
import { PasswordStrength } from './PasswordStrength';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { loginSchema, signupSchema } from '@/lib/validations';

interface AuthDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AuthDrawer = ({ open, onOpenChange }: AuthDrawerProps) => {
  const navigate = useNavigate();
  const [view, setView] = useState<'login' | 'signup' | 'forgot' | 'otp' | 'phone-login' | 'phone-otp'>('login');
  const [loading, setLoading] = useState(false);
  
  // Login state
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [loginErrors, setLoginErrors] = useState<{ email?: string; password?: string }>({});
  const [rememberMe, setRememberMe] = useState(false);
  
  // Signup state
  const [signupData, setSignupData] = useState({
    fullName: '',
    email: '',
    phone: '',
    dob: '',
    password: '',
    confirmPassword: '',
    pincode: '',
  });
  const [signupErrors, setSignupErrors] = useState<Partial<Record<keyof typeof signupData, string>>>({});

  // Forgot password state
  const [forgotEmail, setForgotEmail] = useState('');
  
  // Test OTP state (for dummy testing)
  const [testOTP, setTestOTP] = useState('');
  
  // Phone login state
  const [phoneNumber, setPhoneNumber] = useState('');
  const [phoneOTP, setPhoneOTP] = useState('');

  // Password visibility state
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Location lookup state
  const [locationData, setLocationData] = useState<{
    city: string;
    state: string;
    country: string;
    district?: string;
  } | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState('US');
  const [locationError, setLocationError] = useState<string>('');

  // Load remember me preference on mount
  useEffect(() => {
    const savedRememberMe = localStorage.getItem('rememberMe');
    if (savedRememberMe === 'true') {
      setRememberMe(true);
    }
  }, []);

  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLoginData(prev => ({ ...prev, [name]: value }));
    // Clear error for this field
    if (loginErrors[name as keyof typeof loginErrors]) {
      setLoginErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSignupChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSignupData(prev => ({ ...prev, [name]: value }));
    // Clear error for this field
    if (signupErrors[name as keyof typeof signupErrors]) {
      setSignupErrors(prev => ({ ...prev, [name]: undefined }));
    }

    // Trigger location lookup when pincode changes and has correct length for country
    if (name === 'pincode') {
      const requiredLength = selectedCountry === 'IN' ? 6 : 5; // India: 6 digits, US: 5 digits
      
      if (value.length === requiredLength) {
        lookupPincode(value).catch(err => {
          console.error('Pincode lookup failed:', err);
          setLocationError('Unable to verify pincode. Please continue with manual entry.');
        });
      } else if (value.length < requiredLength) {
        setLocationData(null);
        setLocationError('');
      }
    }
  };

  const lookupPincode = async (pincode: string) => {
    const requiredLength = selectedCountry === 'IN' ? 6 : 5;
    if (!pincode || pincode.length < requiredLength) return;
    
    setLocationLoading(true);
    setLocationError('');
    setLocationData(null);
    
    try {
      const { data, error } = await supabase.functions.invoke('lookup-pincode', {
        body: { pincode, countryCode: selectedCountry }
      }).catch(err => {
        // Catch network/invocation errors
        console.error('Function invoke error:', err);
        return { data: null, error: { message: 'Network error' } };
      });

      if (error) {
        const errorMsg = error.message?.toLowerCase() || '';
        if (errorMsg.includes('pincode not found') || errorMsg.includes('404')) {
          setLocationError(`Pincode not found for ${selectedCountry}. Please check the pincode and country.`);
        } else {
          setLocationError('Unable to verify pincode. Please continue with manual entry.');
        }
        return;
      }

      if (data?.error) {
        setLocationError(`Pincode not found for ${selectedCountry}. Please check the pincode and country.`);
        return;
      }

      if (data?.city && data?.state && data?.country) {
        setLocationData(data);
        setLocationError('');
      } else {
        setLocationError('Unable to verify pincode. Please continue with manual entry.');
      }
    } catch (error: any) {
      console.error('Error looking up pincode:', error);
      setLocationError('Unable to verify pincode. Please continue with manual entry.');
    } finally {
      setLocationLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate
    const result = loginSchema.safeParse(loginData);
    if (!result.success) {
      const errors: { email?: string; password?: string } = {};
      result.error.errors.forEach((err) => {
        if (err.path[0] === 'email' || err.path[0] === 'password') {
          errors[err.path[0]] = err.message;
        }
      });
      setLoginErrors(errors);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginData.email,
        password: loginData.password,
      });

      if (error) throw error;

      if (data.user) {
        // Store remember me preference
        if (rememberMe) {
          localStorage.setItem('rememberMe', 'true');
        } else {
          localStorage.removeItem('rememberMe');
        }
        
        toast.success('Welcome back!');
        handleDrawerChange(false);
        navigate('/');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate
    const result = signupSchema.safeParse(signupData);
    if (!result.success) {
      const errors: Partial<Record<keyof typeof signupData, string>> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) {
          errors[err.path[0] as keyof typeof signupData] = err.message;
        }
      });
      setSignupErrors(errors);
      toast.error('Please fix the errors in the form');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: signupData.email,
        password: signupData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            full_name: signupData.fullName,
            phone: signupData.phone,
            dob: signupData.dob,
            pincode: signupData.pincode,
            city: locationData?.city || null,
            district: locationData?.district || null,
            state: locationData?.state || null,
            country: locationData?.country || null,
          },
        },
      });

      if (error) throw error;

      if (data.user) {
        // Generate dummy OTP for testing
        const dummyOTP = Math.floor(100000 + Math.random() * 900000).toString();
        setTestOTP(dummyOTP);
        setForgotEmail(signupData.email);
        
        // Show the test OTP to the user
        toast.success(`Account created! Test OTP: ${dummyOTP}`, {
          duration: 10000,
        });
        console.log('🔐 Test OTP Code:', dummyOTP);
        
        setView('otp');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!forgotEmail) {
      toast.error('Please enter your email');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail, {
        redirectTo: `${window.location.origin}/`,
      });

      if (error) throw error;

      toast.success('Password reset email sent!');
      setView('otp');
    } catch (error: any) {
      toast.error(error.message || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  const handleSocialAuth = async (provider: 'google' | 'facebook' | 'twitter' | 'github') => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/`,
        },
      });

      if (error) throw error;
    } catch (error: any) {
      const providerName = provider.charAt(0).toUpperCase() + provider.slice(1);
      toast.error(`${providerName} authentication failed. Please ensure it's configured in your backend settings.`);
    }
  };

  const handleGoogleAuth = () => handleSocialAuth('google');
  const handleFacebookAuth = () => handleSocialAuth('facebook');
  const handleTwitterAuth = () => handleSocialAuth('twitter');
  const handleGithubAuth = () => handleSocialAuth('github');

  const handlePhoneLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!phoneNumber || phoneNumber.length < 10) {
      toast.error('Please enter a valid phone number');
      return;
    }

    setLoading(true);
    try {
      // Generate dummy OTP for testing
      const dummyOTP = Math.floor(100000 + Math.random() * 900000).toString();
      setTestOTP(dummyOTP);

      toast.success(`Test OTP sent to ${phoneNumber}: ${dummyOTP}`, {
        duration: 10000,
      });
      console.log('🔐 Phone Login Test OTP:', dummyOTP);

      setView('phone-otp');
    } catch (error: any) {
      toast.error(error.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneOTPVerify = async (otp: string) => {
    if (otp.length !== 6) {
      toast.error('Please enter a valid 6-digit code');
      return;
    }

    if (otp !== testOTP) {
      toast.error('Invalid OTP code');
      return;
    }

    toast.success('Phone verified! Please complete signup or login.');
    setView('login');
  };

  // Reset form when drawer closes
  const handleDrawerChange = (isOpen: boolean) => {
    if (!isOpen) {
      // Reset all states when closing
      setView('login');
      setLoginData({ email: '', password: '' });
      setLoginErrors({});
      setSignupData({
        fullName: '',
        email: '',
        phone: '',
        dob: '',
        password: '',
        confirmPassword: '',
        pincode: '',
      });
      setSignupErrors({});
      setForgotEmail('');
      setTestOTP('');
      setPhoneNumber('');
      setPhoneOTP('');
      setLoading(false);
    }
    onOpenChange(isOpen);
  };

  return (
    <Sheet open={open} onOpenChange={handleDrawerChange}>
      <SheetContent side="right" className={DRAWER_PRESETS.auth}>
        <div className="h-full bg-card flex flex-col">
          {/* Header */}
          <SheetHeader className={getDrawerHeaderClassName('sticky')}>
            <div className="flex items-center justify-between">
              <SheetTitle className="text-xl font-semibold">
                {view === 'login' && 'Welcome Back'}
                {view === 'signup' && 'Create Account'}
                {view === 'forgot' && 'Forgot Password'}
                {view === 'otp' && 'Verify Email'}
                {view === 'phone-login' && 'Login with Phone'}
                {view === 'phone-otp' && 'Verify Phone'}
              </SheetTitle>
              <DrawerCloseButton />
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
                    name="email"
                    type="email"
                    placeholder="Enter your email"
                    value={loginData.email}
                    onChange={handleLoginChange}
                    className={`h-11 rounded-lg ${loginErrors.email ? 'border-red-500' : ''}`}
                  />
                  {loginErrors.email && (
                    <p className="text-xs text-red-500 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {loginErrors.email}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type={showLoginPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={loginData.password}
                      onChange={handleLoginChange}
                      className={`h-11 rounded-lg pr-10 ${loginErrors.password ? 'border-red-500' : ''}`}
                    />
                    <button
                      type="button"
                      onMouseEnter={() => setShowLoginPassword(true)}
                      onMouseLeave={() => setShowLoginPassword(false)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      aria-label="Show password on hover"
                    >
                      <Eye className="h-5 w-5" />
                    </button>
                  </div>
                  {loginErrors.password && (
                    <p className="text-xs text-red-500 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {loginErrors.password}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="remember"
                      checked={rememberMe}
                      onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                    />
                    <Label
                      htmlFor="remember"
                      className="text-sm font-normal cursor-pointer"
                    >
                      Remember me
                    </Label>
                  </div>
                  <button
                    type="button"
                    onClick={() => setView('forgot')}
                    className="text-sm text-primary hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-11 rounded-lg bg-primary hover:bg-primary/90"
                >
                  {loading ? 'Signing in...' : 'Sign In'}
                </Button>

                {/* Social Login */}
                <div className="space-y-3">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-border" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      className="h-11 rounded-lg"
                      onClick={handleGoogleAuth}
                    >
                      <Chrome className="mr-2 h-5 w-5" />
                      Google
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      className="h-11 rounded-lg"
                      onClick={handleFacebookAuth}
                    >
                      <Facebook className="mr-2 h-5 w-5" />
                      Facebook
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      className="h-11 rounded-lg"
                      onClick={handleTwitterAuth}
                    >
                      <Twitter className="mr-2 h-5 w-5" />
                      Twitter
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      className="h-11 rounded-lg"
                      onClick={handleGithubAuth}
                    >
                      <Github className="mr-2 h-5 w-5" />
                      GitHub
                    </Button>
                  </div>
                </div>

                <p className="text-center text-sm text-muted-foreground">
                  Don't have an account?{' '}
                  <button
                    type="button"
                    onClick={() => setView('signup')}
                    className="text-primary hover:underline font-medium"
                  >
                    Sign up
                  </button>
                </p>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => setView('phone-login')}
                    className="text-sm text-primary hover:underline font-medium"
                  >
                    Login with Phone Number
                  </button>
                </div>
              </form>
            )}

            {view === 'signup' && (
              <form onSubmit={handleSignup} className="space-y-4">
                {/* Social Signup Buttons */}
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground text-center">
                    Sign up with your social account
                  </p>

                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      className="h-11 rounded-lg"
                      onClick={handleGoogleAuth}
                    >
                      <Chrome className="mr-2 h-5 w-5" />
                      Google
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      className="h-11 rounded-lg"
                      onClick={handleFacebookAuth}
                    >
                      <Facebook className="mr-2 h-5 w-5" />
                      Facebook
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      className="h-11 rounded-lg"
                      onClick={handleTwitterAuth}
                    >
                      <Twitter className="mr-2 h-5 w-5" />
                      Twitter
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      className="h-11 rounded-lg"
                      onClick={handleGithubAuth}
                    >
                      <Github className="mr-2 h-5 w-5" />
                      GitHub
                    </Button>
                  </div>
                </div>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">Or continue with email</span>
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
                  <div className="relative">
                    <Input
                      id="signup-password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a strong password"
                      value={signupData.password}
                      onChange={handleSignupChange}
                      className="h-11 rounded-xl pr-10"
                      required
                    />
                    <button
                      type="button"
                      onMouseEnter={() => setShowPassword(true)}
                      onMouseLeave={() => setShowPassword(false)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      aria-label="Show password on hover"
                    >
                      <Eye className="h-5 w-5" />
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Must be at least 8 characters with uppercase, lowercase, and numbers
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Re-enter your password"
                      value={signupData.confirmPassword}
                      onChange={handleSignupChange}
                      className="h-11 rounded-xl pr-10"
                      required
                    />
                    <button
                      type="button"
                      onMouseEnter={() => setShowConfirmPassword(true)}
                      onMouseLeave={() => setShowConfirmPassword(false)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      aria-label="Show password on hover"
                    >
                      <Eye className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Select value={selectedCountry} onValueChange={(value) => {
                    setSelectedCountry(value);
                    setLocationData(null);
                    setLocationError('');
                    // Re-lookup if pincode exists
                    if (signupData.pincode.length >= 4) {
                      setTimeout(() => lookupPincode(signupData.pincode), 100);
                    }
                  }}>
                    <SelectTrigger className="h-11 rounded-xl">
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent className="bg-background z-50">
                      <SelectItem value="US">United States 🇺🇸</SelectItem>
                      <SelectItem value="IN">India 🇮🇳</SelectItem>
                      <SelectItem value="GB">United Kingdom 🇬🇧</SelectItem>
                      <SelectItem value="CA">Canada 🇨🇦</SelectItem>
                      <SelectItem value="AU">Australia 🇦🇺</SelectItem>
                      <SelectItem value="DE">Germany 🇩🇪</SelectItem>
                      <SelectItem value="FR">France 🇫🇷</SelectItem>
                      <SelectItem value="ES">Spain 🇪🇸</SelectItem>
                      <SelectItem value="IT">Italy 🇮🇹</SelectItem>
                      <SelectItem value="MX">Mexico 🇲🇽</SelectItem>
                      <SelectItem value="BR">Brazil 🇧🇷</SelectItem>
                      <SelectItem value="JP">Japan 🇯🇵</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">Select your country before entering pincode</p>
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
                  {locationLoading && (
                    <p className="text-xs text-muted-foreground flex items-center gap-2">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      Looking up location...
                    </p>
                  )}
                  {locationError && !locationLoading && (
                    <p className="text-xs text-amber-600 dark:text-amber-500 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3 flex-shrink-0" />
                      <span>{locationError}</span>
                    </p>
                  )}
                  {locationData && !locationLoading && !locationError && (
                    <div className="text-xs text-muted-foreground p-2 bg-muted/30 rounded-md">
                      <p className="flex items-center gap-1">
                        {locationData.city}{locationData.district && `, ${locationData.district}`}, {locationData.state}, {locationData.country}
                      </p>
                    </div>
                  )}
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
                  Enter your email address and we'll send you a password reset link
                </p>

                <div className="space-y-2">
                  <Label htmlFor="forgot-email">Email</Label>
                  <Input
                    id="forgot-email"
                    type="email"
                    placeholder="Enter your email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    className="h-11 rounded-lg"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-11 rounded-lg bg-primary hover:bg-primary/90"
                >
                  {loading ? 'Sending...' : 'Send Reset Link'}
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
                email={forgotEmail}
                expectedOTP={testOTP}
                onVerified={() => {
                  handleDrawerChange(false);
                  navigate('/profile');
                }}
                onBack={() => setView('signup')}
              />
            )}

            {/* Phone Login */}
            {view === 'phone-login' && (
              <div className="space-y-6">
                <form onSubmit={handlePhoneLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="+1 (555) 000-0000"
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-11 rounded-lg"
                    disabled={loading}
                  >
                    {loading ? 'Sending OTP...' : 'Send OTP'}
                  </Button>

                  <button
                    type="button"
                    onClick={() => setView('login')}
                    className="w-full text-sm text-muted-foreground hover:text-foreground"
                  >
                    ← Back to Login
                  </button>
                </form>
              </div>
            )}

            {/* Phone OTP Verification */}
            {view === 'phone-otp' && (
              <OTPVerification
                email={phoneNumber}
                expectedOTP={testOTP}
                onVerified={() => handlePhoneOTPVerify(testOTP)}
                onBack={() => setView('phone-login')}
              />
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
