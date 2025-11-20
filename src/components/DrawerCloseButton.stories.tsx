/**
 * DrawerCloseButton Component Documentation
 * 
 * This file provides examples and usage guidelines for the standardized
 * drawer close button component.
 */

import { DrawerCloseButton } from './DrawerCloseButton';

/**
 * USAGE GUIDELINES
 * ================
 * 
 * The DrawerCloseButton should be used in ALL drawer headers to ensure
 * consistent close button styling across the application.
 * 
 * ## Standard Usage (Most Drawers)
 * 
 * ```tsx
 * import { DrawerCloseButton } from '@/components/DrawerCloseButton';
 * 
 * <SheetHeader className={getDrawerHeaderClassName('standard')}>
 *   <div className="flex items-center justify-between">
 *     <SheetTitle>Drawer Title</SheetTitle>
 *     <DrawerCloseButton />
 *   </div>
 * </SheetHeader>
 * ```
 * 
 * ## With Background (Floating Close Button)
 * 
 * ```tsx
 * <div className="absolute top-4 right-4 z-50">
 *   <DrawerCloseButton variant="withBackground" />
 * </div>
 * ```
 * 
 * ## On Dark Overlay (Video Player)
 * 
 * ```tsx
 * <div className="absolute top-4 right-4 z-50">
 *   <DrawerCloseButton variant="onDark" />
 * </div>
 * ```
 * 
 * ## Available Variants
 * 
 * - **standard**: Default 8x8 square button (most common)
 * - **compact**: Smaller 6x6 square button
 * - **large**: Larger 10x10 square button
 * - **withBackground**: Standard with semi-transparent background
 * - **onDark**: White button on dark/video overlay
 * 
 * ## Important Notes
 * 
 * 1. ALWAYS use square buttons (h-8 w-8 p-0), never round icon buttons
 * 2. Button size should be specified with h-* and w-* classes, not size="icon"
 * 3. All drawers should have exactly ONE close button visible
 * 4. The default SheetContent close button is disabled (removed from ui/sheet.tsx)
 * 5. Close buttons should be in the top-right corner of the drawer
 * 
 * ## DO NOT
 * 
 * ```tsx
 * // ❌ WRONG - Round icon button
 * <Button variant="ghost" size="icon">
 *   <X className="w-4 h-4" />
 * </Button>
 * 
 * // ❌ WRONG - Custom styling without using config
 * <Button className="rounded-full">
 *   <X />
 * </Button>
 * 
 * // ❌ WRONG - Multiple close buttons
 * <SheetClose><X /></SheetClose>
 * <Button onClick={close}><X /></Button>
 * ```
 * 
 * ## DO
 * 
 * ```tsx
 * // ✅ CORRECT - Use the standardized component
 * <DrawerCloseButton />
 * 
 * // ✅ CORRECT - With appropriate variant
 * <DrawerCloseButton variant="onDark" />
 * 
 * // ✅ CORRECT - Single close button per drawer
 * <SheetHeader>
 *   <div className="flex items-center justify-between">
 *     <SheetTitle>Title</SheetTitle>
 *     <DrawerCloseButton />
 *   </div>
 * </SheetHeader>
 * ```
 */

// This file is for documentation purposes only
export {};
