import { FC, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { User, Settings, LogOut, ChevronDown } from 'lucide-react';
import { UserProfile } from '@/types';
import { useAuth } from '@/context/AuthContext';


export const UserMenu: FC<{ user: UserProfile | null }> = ({ user }) => {
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const { logout } = useAuth();
  
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
          setIsOpen(false);
        }
      };
  
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, []);
  
    const toggleMenu = () => setIsOpen(!isOpen);
  
    if (!user) {
      return (
        <Link href="/login">
          <button className="flex items-center justify-center py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Sign In
          </button>
        </Link>
      );
    }
  
    return (
      <div className="relative" ref={menuRef}>
        <button
          onClick={toggleMenu}
          className="flex items-center space-x-2 p-2 rounded-full hover:bg-gray-800"
        >
          <div className="w-8 h-8 relative rounded-full overflow-hidden bg-gray-700">
            {user.pfp_path ? (
              <Image 
                src={user.pfp_path} 
                alt={user.name} 
                fill 
                className="object-cover" 
              />
            ) : (
              <User className="w-full h-full p-1 text-gray-500" />
            )}
          </div>
          <ChevronDown size={16} className="text-gray-500" />
        </button>
  
        {isOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-gray-900 rounded-lg shadow-lg py-1 z-50 border border-gray-700 text-white">
            <div className="px-4 py-2 border-b border-gray-700">
              <p className="text-sm font-semibold">{user.name}</p>
              <p className="text-xs text-gray-500 truncate">{user.email}</p>
            </div>
            <div className="py-1">
              <Link href="/profile">
                <div className="flex items-center px-4 py-2 text-sm hover:bg-gray-800">
                  <User size={16} className="mr-2" />
                  Profile
                </div>
              </Link>
              <Link href="/settings">
                <div className="flex items-center px-4 py-2 text-sm hover:bg-gray-800">
                  <Settings size={16} className="mr-2" />
                  Settings
                </div>
              </Link>
            </div>
            <div className="border-t border-gray-700 py-1">
              <button onClick={logout} className="flex w-full items-center px-4 py-2 text-sm text-red-500 hover:bg-gray-800">
                <LogOut size={16} className="mr-2" />
                Sign Out
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };