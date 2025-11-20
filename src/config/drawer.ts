/**
 * Global Drawer Configuration
 * 
 * Centralized configuration for all drawer/sheet components to ensure
 * consistent sizing, styling, and behavior across the application.
 */

export const DRAWER_CONFIG = {
  /**
   * Drawer Sizes
   * Use these constants for consistent drawer widths across the app
   */
  sizes: {
    /** Small drawer - For auth, simple forms (384px / 24rem) */
    sm: 'w-full sm:max-w-md',
    
    /** Medium drawer - For settings, profiles (512px / 32rem) */
    md: 'w-full sm:max-w-lg',
    
    /** Large drawer - Default size for content-heavy drawers (672px / 42rem) */
    lg: 'w-full sm:max-w-2xl',
    
    /** Extra large drawer - For complex forms, tables (896px / 56rem) */
    xl: 'w-full sm:max-w-3xl',
    
    /** Full width - Takes entire screen width */
    full: 'w-full',
  },

  /**
   * Common Drawer Styles
   * Reusable style combinations for different drawer types
   */
  styles: {
    /** Standard drawer with padding and scroll */
    standard: 'overflow-y-auto p-0',
    
    /** Drawer with no padding (for custom layouts) */
    noPadding: 'overflow-y-auto p-0',
    
    /** Drawer with fixed content (no scroll) */
    fixed: 'p-0',
    
    /** Auth-specific styling */
    auth: 'p-0 border-none overflow-y-auto',
  },

  /**
   * Header Styles
   * Consistent header styling for drawer content
   */
  header: {
    /** Standard header with border */
    standard: 'p-6 pb-4 border-b',
    
    /** Compact header */
    compact: 'p-4 pb-3 border-b',
    
    /** Large header */
    large: 'p-8 pb-6 border-b',
    
    /** Header with sticky positioning */
    sticky: 'px-6 py-4 border-b border-border sticky top-0 bg-card z-10',
  },

  /**
   * Content Padding
   * Standard padding for drawer content areas
   */
  content: {
    /** Standard content padding */
    standard: 'p-6 space-y-6',
    
    /** Compact padding */
    compact: 'p-4 space-y-4',
    
    /** Large padding */
    large: 'p-8 space-y-8',
    
    /** No padding (for custom layouts) */
    none: '',
  },

  /**
   * Close Button Styles
   * Standardized close button styling for all drawers
   * Use square buttons (8x8) instead of round icon buttons
   */
  closeButton: {
    /** Standard square close button (8x8) */
    standard: 'h-8 w-8 p-0',
    
    /** Compact square close button (6x6) */
    compact: 'h-6 w-6 p-0',
    
    /** Large square close button (10x10) */
    large: 'h-10 w-10 p-0',
    
    /** Close button with background (for overlays) */
    withBackground: 'h-8 w-8 p-0 bg-background/80 hover:bg-background backdrop-blur-sm',
    
    /** Close button on dark overlay (for video players) */
    onDark: 'h-8 w-8 p-0 bg-black/50 hover:bg-black/70 text-white backdrop-blur-sm',
  },

  /**
   * Animation Settings
   * Consistent animation durations and easings
   */
  animation: {
    duration: 300, // milliseconds
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },

  /**
   * Z-Index Values
   * Ensure drawers appear above other content
   */
  zIndex: {
    drawer: 50,
    overlay: 40,
  },
} as const;

/**
 * Helper function to combine drawer size and style
 * @param size - Drawer size from DRAWER_CONFIG.sizes
 * @param style - Drawer style from DRAWER_CONFIG.styles
 * @returns Combined className string
 */
export function getDrawerClassName(
  size: keyof typeof DRAWER_CONFIG.sizes = 'lg',
  style: keyof typeof DRAWER_CONFIG.styles = 'standard'
): string {
  return `${DRAWER_CONFIG.sizes[size]} ${DRAWER_CONFIG.styles[style]}`;
}

/**
 * Helper function to get header className
 * @param variant - Header variant from DRAWER_CONFIG.header
 * @returns Header className string
 */
export function getDrawerHeaderClassName(
  variant: keyof typeof DRAWER_CONFIG.header = 'standard'
): string {
  return DRAWER_CONFIG.header[variant];
}

/**
 * Helper function to get content className
 * @param variant - Content variant from DRAWER_CONFIG.content
 * @returns Content className string
 */
export function getDrawerContentClassName(
  variant: keyof typeof DRAWER_CONFIG.content = 'standard'
): string {
  return DRAWER_CONFIG.content[variant];
}

/**
 * Helper function to get close button className
 * @param variant - Close button variant from DRAWER_CONFIG.closeButton
 * @returns Close button className string
 */
export function getDrawerCloseButtonClassName(
  variant: keyof typeof DRAWER_CONFIG.closeButton = 'standard'
): string {
  return DRAWER_CONFIG.closeButton[variant];
}

/**
 * Drawer Size Presets
 * Pre-configured combinations for common drawer types
 */
export const DRAWER_PRESETS = {
  /** Authentication drawers (login, signup) */
  auth: getDrawerClassName('sm', 'auth'),
  
  /** Settings and profile drawers */
  settings: getDrawerClassName('lg', 'noPadding'),
  
  /** Content viewing drawers (video player, variations) */
  content: getDrawerClassName('lg', 'noPadding'),
  
  /** Form drawers (user management, filters) */
  form: getDrawerClassName('lg', 'noPadding'),
  
  /** Full-width drawers */
  fullscreen: getDrawerClassName('full', 'noPadding'),
} as const;
