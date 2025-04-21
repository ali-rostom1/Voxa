import { FC } from 'react';
import { Category } from '@/types';
import { CategoryCard } from '@/components/ui/category-card';
import { SectionHeader } from '@/components/sections/section-header';  

interface CategoriesSectionProps {
  categories: Category[];
}

export const CategoriesSection: FC<CategoriesSectionProps> = ({ categories }) => {
  return (
    <section className="mb-8">
      <SectionHeader title="Browse by Category" />
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {categories.map((category) => (
            
          <CategoryCard key={category.id} category={category} />
        ))}
      </div>
    </section>
  );
};