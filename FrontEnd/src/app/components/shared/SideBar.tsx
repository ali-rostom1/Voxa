'use client';

import { useState, useEffect, FC, ReactElement, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/compat/router';
import { NavItem } from '@/types';
import apiClient from '@/lib/apiClient';
import { SidebarItemProps } from '@/types';
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
  Video
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const SidebarItem : FC<SidebarItemProps> = ({ 
    icon: Icon, 
    label,
    href, 
    active, 
    collapsed 
    }) : ReactElement => {
        return (
            <Link href={href}>
            <div className={`flex items-center p-3 rounded-lg cursor-pointer transition-colors duration-200 hover:bg-blue-900 ${
                active ? 'bg-blue-900 text-blue-400' : 'text-gray-300'
            }`}>
                <div className="flex items-center justify-center">
                <Icon size={20} />
                </div>
                {!collapsed && <span className="ml-3">{label}</span>}
            </div>
            </Link>
        );
        };

const LoadingSkeleton = () => (
  <div className="animate-pulse px-3">
    {[1, 2, 3].map((i) => (
      <div key={i} className="flex items-center p-3 mb-2">
        <div className="w-5 h-5 bg-gray-600 rounded-lg"></div>
        <div className="ml-3 h-4 bg-gray-600 rounded w-20"></div>
      </div>
    ))}
  </div>
);

export const SideBar = () => {
  const { user, loading } = useAuth();
  const { logout } = useAuth();
  const router = useRouter();
  const { 
    collapsed, 
    isMobile, 
    sidebarOpen, 
    toggleSidebar, 
    closeSidebar 
  } = useSidebarStore();

  const [categories, setCategories] = useState<NavItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const staticNavItems: NavItem[] = [
    { icon: Home, label: 'Home', href: '/' },
    { icon: Compass, label: 'Explore', href: '/explore' },
    { icon: TrendingUp, label: 'Trending', href: '/trending' },
    { icon: History, label: 'History', href: '/history' },
  ];

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoading(true);
        const response = await apiClient.get('api/v1/categories'); 
        const data = response.data.data.data;
        
        const categoryItems: NavItem[] = data.map((category: any) => ({
          icon: Video,
          label: category.name,
          href: `/category/${category.id}`
        }));

        setCategories(categoryItems);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const navigationItems: NavItem[] = [...staticNavItems, ...categories];

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
            { !collapsed && <h1 className="text-xl font-bold text-blue-600">Voxa</h1>}
            
            <button 
              onClick={toggleSidebar}
              className="p-1 rounded-full hover:bg-gray-700"
            >
              {isMobile ? (
                <X className="text-gray-300" size={20} />
              ) : collapsed ? (
                <ChevronRight className="text-gray-300"  size={20} />
              ) : (
                <ChevronLeft className="text-gray-300" size={20} />
              )}
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto py-4">
            <div className={`space-y-1 px-3 ${collapsed ? 'items-center' : ''}`}>
              {/* Static items */}
              {staticNavItems.map((item) => (
                <SidebarItem
                  key={item.href}
                  icon={item.icon}
                  label={item.label}
                  href={item.href}
                  active={router?.pathname === item.href}
                  collapsed={collapsed}
                />
              ))}
              
              {/* Divider */}
              <div className="my-2 border-t border-gray-700"></div>

              {/* Categories with loading state */}
              {isLoading ? (
                <LoadingSkeleton />
              ) : (
                categories.map((item) => (
                  <SidebarItem
                    key={item.href}
                    icon={item.icon}
                    label={item.label}
                    href={item.href}
                    active={router?.pathname === item.href}
                    collapsed={collapsed}
                  />
                ))
              )}
            </div>
          </nav>
          {loading ? (
            <div className="p-4 border-t border-gray-700">
              <div className="flex items-center justify-center w-full p-2 bg-gray-700 text-white rounded-lg animate-pulse">
                <div className="w-5 h-5 bg-gray-600 rounded-lg"></div>
                <div className="ml-3 h-4 bg-gray-600 rounded w-20"></div>
              </div>
            </div>
          ) : (
            !user ? (
              <div className="p-4 border-t border-gray-700">
                <Link href="/login">
                  <button className={`flex items-center justify-center w-full p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors ${
                    collapsed ? 'p-2' : 'py-2 px-4'
                  }`}>
                    <LogIn size={18} />
                    {(!collapsed) && <span className="ml-2">Sign In</span>}
                  </button>
                </Link>
              </div>
            ) : (
              <div className="p-4 border-t border-gray-700">
                  <button onClick={logout} className={`flex items-center justify-center w-full p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors ${
                    collapsed ? 'p-2' : 'py-2 px-4'
                  }`}>
                    <LogOut size={18} />
                    {(!collapsed) && <span className="ml-2">Sign Out</span>}
                  </button>
              </div>
            )
          )}
        </div>
      </aside>

      <div className={`transition-all duration-300 ${
        isMobile ? 'ml-0' : (collapsed ? 'ml-16' : 'ml-64')
      }`}>
      </div>
    </>
  );
};

export default SideBar;