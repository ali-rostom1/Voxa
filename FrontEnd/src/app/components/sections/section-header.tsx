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
    <div className="flex justify-between items-center mb-4">
      <h2 className="text-2xl font-bold">{title}</h2>
      {viewAllLink && (
        <Link 
          href={viewAllLink} 
          className="text-blue-600 hover:underline text-sm"
        >
          View All →
        </Link>
      )}
      {children}
    </div>
  );
};