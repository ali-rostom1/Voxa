import React, { FC } from 'react';

import { Search, Bell, Mail } from 'lucide-react';
import { NotificationBadge } from '@/app/components/ui/NotificationBadge';
import { SearchBar } from '@/app/components/ui/SearchBar';
import { UploadButton } from '@/app/components/ui/UploadButton';
import { UserMenu } from '@/app/components/ui/UserMenu';
import { VoxaHeaderProps } from '@/types';
import { Menu } from 'lucide-react';
import { useSidebarStore } from '@/stores/SideBarState';
import { useAuth } from '@/context/AuthContext';

export const VoxaHeader = ({
  className = '',
  notifications = 0,
  messages = 0,
  onSearch,
} : VoxaHeaderProps) => {
    const { user, loading } = useAuth();
    const { 
      toggleSidebar, 
      isMobile, 
    } = useSidebarStore();
    return (
      <header className={`sticky top-0 z-50 w-full bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 ${className}`}>
        <div className="flex items-center justify-between h-16">
        <div className="flex items-center">
          <button 
            onClick={toggleSidebar}
            className="p-2 mr-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            {isMobile ? (
              <Menu size={20} className="text-gray-600 dark:text-gray-300" />
            ) : null}
          </button>
        </div>
          <div className="hidden md:block flex-grow max-w-xl">
            <SearchBar onSearch={onSearch} />
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="md:hidden">
              <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
                <Search size={20} />
              </button>
            </div>
            
            <NotificationBadge 
              count={notifications} 
              icon={<Bell size={20} className="text-gray-600 dark:text-gray-300" />} 
            />
            
            <NotificationBadge 
              count={messages} 
              icon={<Mail size={20} className="text-gray-600 dark:text-gray-300" />} 
            />
            
              <UploadButton isMobile={isMobile}/>
            
            {loading ? (
              <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
            ) : (
              <UserMenu user={user} />
            )}
          </div>
        </div>
        
        <div className="md:hidden py-2">
          <SearchBar onSearch={onSearch} />
        </div>
      </header>
    );
  };