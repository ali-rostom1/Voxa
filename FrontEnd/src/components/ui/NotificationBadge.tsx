import { FC, ReactElement } from 'react';
import { LucideIcon } from 'lucide-react';

export const NotificationBadge: FC<{ count?: number; icon: LucideIcon }> = ({ count = 0, icon }) => {
    return (
      <button className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
        {icon}
        {count > 0 && (
          <span className="absolute top-0 right-0 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs text-white">
            {count > 9 ? '9+' : count}
          </span>
        )}
      </button>
    );
};