import { useState, useEffect } from 'react';
import { Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { toast } from 'sonner';

interface OTPVerificationProps {
  email: string;
  onVerified: () => void;
  onBack: () => void;
}

export const OTPVerification = ({ email, onVerified, onBack }: OTPVerificationProps) => {
  const [otp, setOtp] = useState('');
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setCanResend(true);
    }
  }, [timer]);

  const handleVerify = () => {
    if (otp.length === 6) {
      // Verify OTP logic here
      toast.success('Email verified successfully!');
      onVerified();
    } else {
      toast.error('Please enter a valid 6-digit code');
    }
  };

  const handleResend = () => {
    if (canResend) {
      setTimer(60);
      setCanResend(false);
      toast.success('Verification code sent!');
    }
  };

  return (
    <div className="space-y-6">
      {/* Email Icon */}
      <div className="flex justify-center">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
          <Mail className="w-8 h-8 text-primary" />
        </div>
      </div>

      <div className="space-y-2 text-center">
        <h3 className="text-lg font-semibold">Check your email</h3>
        <p className="text-sm text-muted-foreground">
          We've sent a verification code to
        </p>
        <p className="text-sm font-medium">{email}</p>
      </div>

      {/* OTP Input */}
      <div className="flex justify-center">
        <InputOTP maxLength={6} value={otp} onChange={setOtp}>
          <InputOTPGroup>
            <InputOTPSlot index={0} className="w-12 h-12 text-lg rounded-lg" />
            <InputOTPSlot index={1} className="w-12 h-12 text-lg rounded-lg" />
            <InputOTPSlot index={2} className="w-12 h-12 text-lg rounded-lg" />
            <InputOTPSlot index={3} className="w-12 h-12 text-lg rounded-lg" />
            <InputOTPSlot index={4} className="w-12 h-12 text-lg rounded-lg" />
            <InputOTPSlot index={5} className="w-12 h-12 text-lg rounded-lg" />
          </InputOTPGroup>
        </InputOTP>
      </div>

      {/* Timer */}
      <div className="text-center">
        {!canResend ? (
          <p className="text-sm text-muted-foreground">
            Resend code in <span className="font-medium text-primary">{timer}s</span>
          </p>
        ) : (
          <button
            onClick={handleResend}
            className="text-sm text-primary hover:underline font-medium"
          >
            Resend code
          </button>
        )}
      </div>

      {/* Verify Button */}
      <Button
        onClick={handleVerify}
        className="w-full h-11 rounded-lg bg-primary hover:bg-primary/90"
        disabled={otp.length !== 6}
      >
        Verify Email
      </Button>

      <button
        type="button"
        onClick={onBack}
        className="w-full text-sm text-muted-foreground hover:text-foreground"
      >
        ← Back
      </button>
    </div>
  );
};
