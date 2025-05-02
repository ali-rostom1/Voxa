'use client';

import { FC, use, useEffect, useState } from 'react';
import { Search, Bell, Mail, Menu, User } from 'lucide-react';
import { NotificationBadge } from '@/components/ui/NotificationBadge';
import { SearchBar } from '@/components/ui/SearchBar';
import { UploadButton } from '@/components/ui/UploadButton';
import { UserMenu } from '@/components/ui/UserMenu';
import { Category, VoxaHeaderProps } from '@/types';
import { useSidebarStore } from '@/stores/SideBarState';
import { useAuthStore } from '@/stores/AuthStore';
import { UploadVideoModal } from '@/components/shared/upload-modal';
import apiClient from '@/lib/apiClient';
import Link from 'next/link';

export const VoxaHeader: FC<VoxaHeaderProps> = ({
  className = '',
  notifications = 0,
  messages = 0,
  onSearch,
}) => {
  const { user, isAuthenticated, loading } = useAuthStore();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const { toggleSidebar, isMobile } = useSidebarStore();
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await apiClient.get('/api/v1/categories');
        if (response.status === 200) {
          const data = response.data.data.data.map((category: any) => ({
            id: category.id,
            title: category.name,
          }));
          setCategories(data || []);
        } else {
          console.error('Failed to fetch categories');
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    fetchCategories();
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 w-full bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 ${className}`}
    >
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

          <div onClick={() => setIsOpen(true)}>
            <UploadButton isMobile={isMobile} />
          </div>

          {loading ? (
            <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
          ) : isAuthenticated ? (
            <UserMenu user={user} />
          ) : (
            <Link href="/login">
              <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">
                Sign In
              </button>
            </Link>
          )}
        </div>
      </div>
      <UploadVideoModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        categories={categories}
      />
      <div className="md:hidden py-2">
        <SearchBar onSearch={onSearch} />
      </div>
    </header>
  );
};