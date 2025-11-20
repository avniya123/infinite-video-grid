import { ReactNode, useState } from 'react';
import { Header } from '@/components/Header';

interface LayoutProps {
  children: ReactNode;
  showCategoryFilters?: boolean;
  selectedSubcategory?: string | null;
  selectedMainCategory?: string | null;
  onSubcategorySelect?: (subcategory: string | null) => void;
  onMainCategorySelect?: (mainCategory: string | null) => void;
}

export const Layout = ({ 
  children, 
  showCategoryFilters = false,
  selectedSubcategory,
  selectedMainCategory,
  onSubcategorySelect,
  onMainCategorySelect
}: LayoutProps) => {
  return (
    <div className="min-h-screen bg-background">
      <Header 
        selectedSubcategory={showCategoryFilters ? selectedSubcategory : undefined}
        selectedMainCategory={showCategoryFilters ? selectedMainCategory : undefined}
        onSubcategorySelect={showCategoryFilters ? onSubcategorySelect : undefined}
        onMainCategorySelect={showCategoryFilters ? onMainCategorySelect : undefined}
      />
      <main>
        {children}
      </main>
    </div>
  );
};
