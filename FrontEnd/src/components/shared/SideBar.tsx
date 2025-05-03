'use client';

import { useState, useEffect, FC, ReactElement } from 'react';
import Link from 'next/link';
import { usePathname,useRouter } from 'next/navigation';
import { NavItem, SidebarItemProps } from '@/types';
import { useSidebarStore } from '@/stores/SideBarState';
import {
  Home,
  Compass,
  TrendingUp,
  History,
  LogIn,
  LogOut,
  ChevronLeft,
  ChevronRight,
  X,
  ThumbsUpIcon,
  Bookmark,
  ListMusic,
} from 'lucide-react';
import { useAuthStore } from '@/stores/AuthStore';
import Cookies from 'js-cookie';

const SidebarItem: FC<SidebarItemProps> = ({
  icon: Icon,
  label,
  href,
  active,
  collapsed,
}): ReactElement => {
  return (
    <Link href={href}>
      <div
        className={`flex items-center p-3 rounded-lg cursor-pointer transition-colors duration-200 hover:bg-blue-900 ${
          active ? 'bg-blue-900 text-blue-400' : 'text-gray-300'
        }`}
      >
        <div className="flex items-center justify-center">
          <Icon size={20} />
        </div>
        {!collapsed && <span className="ml-3">{label}</span>}
      </div>
    </Link>
  );
};

export const SideBar = () => {
  const { user, isAuthenticated, logout } = useAuthStore();
  const pathname = usePathname();
  const router = useRouter();
  const { collapsed, isMobile, sidebarOpen, toggleSidebar, closeSidebar } = useSidebarStore();

  const staticNavItems: NavItem[] = [
    { icon: Home, label: 'Home', href: '/' },
    { icon: Compass, label: 'Explore', href: '/explore' },
    { icon: TrendingUp, label: 'Trending', href: '/trending' },
    { icon: History, label: 'History', href: '/history' },
    { icon: Bookmark , label: 'Saved' , href: '/saved'},
    { icon: ThumbsUpIcon , label: 'Liked', href: '/liked'},
    { icon: ListMusic  , label: 'Playlists' , href: '/playlists'}
  ];


  const handleLogout = () => {
    // Clear cookies
    Cookies.remove('access_token');
    Cookies.remove('refresh_token');
    logout();
    router.push('/login');
  };

  const sidebarClasses = `
    fixed top-0 left-0 h-full bg-gray-900 shadow-lg
    transition-all duration-300 z-101
    ${isMobile ? (sidebarOpen ? 'translate-x-0' : '-translate-x-full') : 'translate-x-0'}
    ${collapsed && !isMobile ? 'w-16' : 'w-64'}
  `;

  return (
    <>
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={closeSidebar}
        />
      )}

      {isMobile && !sidebarOpen && (
        <button
          onClick={toggleSidebar}
          className="fixed top-4 left-4 z-50 p-2 rounded-full bg-blue-600 text-white"
        >
          <ChevronRight size={20} />
        </button>
      )}

      <aside className={sidebarClasses}>
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-b border-gray-700">
            {!collapsed && <h1 className="text-xl font-bold text-blue-600">Voxa</h1>}
            <button
              onClick={toggleSidebar}
              className="p-1 rounded-full hover:bg-gray-700"
            >
              {isMobile ? (
                <X className="text-gray-300" size={20} />
              ) : collapsed ? (
                <ChevronRight className="text-gray-300" size={20} />
              ) : (
                <ChevronLeft className="text-gray-300" size={20} />
              )}
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto py-4">
            <div className={`flex flex-col gap-1 px-3 ${collapsed ? 'items-center' : ''}`}>
              {/* Static items */}
              {staticNavItems.map((item) => (
                <SidebarItem
                  key={item.href}
                  icon={item.icon}
                  label={item.label}
                  href={item.href}
                  active={pathname === item.href}
                  collapsed={collapsed}
                />
              ))}
            </div>
          </nav>

          {isAuthenticated ? (
            <div className="p-4 border-t border-gray-700">
              <button
                onClick={handleLogout}
                className={`flex items-center justify-center w-full p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors ${
                  collapsed ? 'p-2' : 'py-2 px-4'
                }`}
              >
                <LogOut size={18} />
                {!collapsed && <span className="ml-2">Sign Out</span>}
              </button>
            </div>
          ) : (
            <div className="p-4 border-t border-gray-700">
              <Link href="/login">
                <button
                  className={`flex items-center justify-center w-full p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors ${
                    collapsed ? 'p-2' : 'py-2 px-4'
                  }`}
                >
                  <LogIn size={18} />
                  {!collapsed && <span className="ml-2">Sign In</span>}
                </button>
              </Link>
            </div>
          )}
        </div>
      </aside>

      <div
        className={`transition-all duration-300 ${
          isMobile ? 'ml-0' : collapsed ? 'ml-16' : 'ml-64'
        }`}
      ></div>
    </>
  );
};

export default SideBar;