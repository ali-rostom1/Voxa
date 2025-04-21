import { Category } from '@/types';
import { FC } from 'react';


interface CategoryCardProps {
    category: Category;
  }

export const CategoryCard: FC<CategoryCardProps> = ({ category }) => {
  return (
    <div 
      className="flex flex-col items-center justify-center p-4 rounded-lg cursor-pointer transition-transform hover:scale-105"
      style={{ backgroundColor: category.color }}
    >
      <div className="text-white text-2xl mb-2"><i className={`${category.icon}`}></i></div>
      
      <span className="text-white text-sm font-medium">{category.title}</span>
    </div>
  );
};