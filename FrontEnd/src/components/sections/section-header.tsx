import { FC, ReactNode } from 'react';
import Link from 'next/link';

interface SectionHeaderProps {
  title: string;
  viewAllLink?: string;
  children?: ReactNode;
}

export const SectionHeader: FC<SectionHeaderProps> = ({ 
  title, 
  viewAllLink,
  children 
}) => {
  return (
    <div className="flex justify-between items-center mb-6 border-b border-gray-200 pb-2">
      <h2 className="text-2xl font-semibold text-gray-800 tracking-tight">
        {title}
      </h2>
      <div className="flex items-center space-x-4">
        {viewAllLink && (
          <Link 
            href={viewAllLink} 
            className="text-blue-600 text-sm font-medium hover:text-blue-800 transition-colors duration-200"
          >
            View All →
          </Link>
        )}
        {children}
      </div>
    </div>
  );
};