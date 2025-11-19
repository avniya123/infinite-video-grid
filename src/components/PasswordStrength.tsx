import { useMemo } from 'react';
import { Check, X } from 'lucide-react';

interface PasswordStrengthProps {
  password: string;
}

export const PasswordStrength = ({ password }: PasswordStrengthProps) => {
  const strength = useMemo(() => {
    if (!password) return { level: 0, text: '', color: '' };
    
    let score = 0;
    
    // Length check
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    
    // Character variety checks
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^a-zA-Z0-9]/.test(password)) score++;
    
    if (score <= 2) return { level: 1, text: 'Weak', color: 'bg-red-500' };
    if (score <= 4) return { level: 2, text: 'Medium', color: 'bg-yellow-500' };
    return { level: 3, text: 'Strong', color: 'bg-green-500' };
  }, [password]);

  const requirements = useMemo(() => [
    { met: password.length >= 8, text: 'At least 8 characters' },
    { met: /[a-z]/.test(password), text: 'Lowercase letter' },
    { met: /[A-Z]/.test(password), text: 'Uppercase letter' },
    { met: /[0-9]/.test(password), text: 'Number' },
  ], [password]);

  if (!password) return null;

  return (
    <div className="space-y-2 mt-2">
      {/* Strength bar */}
      <div className="flex gap-1.5">
        {[1, 2, 3].map((level) => (
          <div
            key={level}
            className={`h-1.5 flex-1 rounded-full transition-all ${
              level <= strength.level ? strength.color : 'bg-muted'
            }`}
          />
        ))}
      </div>
      
      {/* Strength text */}
      <p className={`text-xs font-medium ${
        strength.level === 1 ? 'text-red-500' :
        strength.level === 2 ? 'text-yellow-500' :
        'text-green-500'
      }`}>
        Password strength: {strength.text}
      </p>

      {/* Requirements */}
      <div className="space-y-1">
        {requirements.map((req, index) => (
          <div key={index} className="flex items-center gap-1.5 text-xs">
            {req.met ? (
              <Check className="w-3 h-3 text-green-500" />
            ) : (
              <X className="w-3 h-3 text-muted-foreground" />
            )}
            <span className={req.met ? 'text-green-500' : 'text-muted-foreground'}>
              {req.text}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
