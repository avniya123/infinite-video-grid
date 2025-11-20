import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SheetClose } from '@/components/ui/sheet';
import { getDrawerCloseButtonClassName } from '@/config/drawer';

interface DrawerCloseButtonProps {
  /**
   * Visual variant of the close button
   * @default 'standard'
   */
  variant?: 'standard' | 'compact' | 'large' | 'withBackground' | 'onDark';
  
  /**
   * Additional CSS classes
   */
  className?: string;
  
  /**
   * Accessible label for screen readers
   * @default 'Close drawer'
   */
  ariaLabel?: string;
}

/**
 * Standardized close button component for all drawers
 * 
 * This component ensures consistent close button styling across all drawers.
 * Always use square buttons (not round icon buttons) for drawer close actions.
 * 
 * @example
 * ```tsx
 * // In drawer header
 * <DrawerCloseButton />
 * 
 * // With custom variant
 * <DrawerCloseButton variant="large" />
 * 
 * // On dark overlay (video player)
 * <DrawerCloseButton variant="onDark" />
 * ```
 */
export function DrawerCloseButton({ 
  variant = 'standard',
  className = '',
  ariaLabel = 'Close drawer'
}: DrawerCloseButtonProps) {
  const buttonClassName = `${getDrawerCloseButtonClassName(variant)} ${className}`.trim();
  
  return (
    <SheetClose asChild>
      <Button 
        variant="ghost" 
        size="sm"
        className={buttonClassName}
        aria-label={ariaLabel}
      >
        <X className="w-4 h-4" />
      </Button>
    </SheetClose>
  );
}
