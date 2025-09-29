// =====================================================
// COMPACT MOBILE NAVIGATION - MOBILE-FIRST
// Bottom navigation bar for mobile devices
// =====================================================

import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Home, 
  FileText, 
  Users, 
  Bell, 
  User,
  Plus,
  History,
  Settings
} from 'lucide-react';

const CompactMobileNav = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Don't render if no user
  if (!user) {
    return null;
  }

  const navigationItems = [
    {
      name: 'Dashboard',
      icon: Home,
      path: '/dashboard',
      badge: null
    },
    {
      name: 'File ITR',
      icon: FileText,
      path: '/itr/start',
      badge: 'HOT'
    },
    {
      name: 'Members',
      icon: Users,
      path: '/add-members',
      badge: null
    },
    {
      name: 'History',
      icon: History,
      path: '/filing-history',
      badge: null
    },
    {
      name: 'Profile',
      icon: User,
      path: '/financial-profile',
      badge: null
    }
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-neutral-200 shadow-lg">
      <div className="flex items-center justify-around px-2 py-2">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          
          return (
            <button
              key={item.name}
              onClick={() => navigate(item.path)}
              className={`
                relative flex flex-col items-center justify-center p-2 min-w-0 flex-1
                transition-all duration-200 active:scale-95
                ${active 
                  ? 'text-primary-600' 
                  : 'text-neutral-500 hover:text-neutral-700'
                }
              `}
            >
              {/* Badge */}
              {item.badge && (
                <span className="absolute -top-1 -right-1 px-1.5 py-0.5 bg-error-500 text-white text-xs font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center">
                  {item.badge}
                </span>
              )}
              
              {/* Icon */}
              <div className={`
                p-2 rounded-lg transition-all duration-200
                ${active 
                  ? 'bg-primary-100' 
                  : 'hover:bg-neutral-100'
                }
              `}>
                <Icon className="w-5 h-5" />
              </div>
              
              {/* Label */}
              <span className={`
                text-xs font-medium mt-1 truncate max-w-[60px]
                ${active ? 'text-primary-600' : 'text-neutral-500'}
              `}>
                {item.name}
              </span>
              
              {/* Active indicator */}
              {active && (
                <div className="absolute -top-0.5 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-primary-500 rounded-full" />
              )}
            </button>
          );
        })}
      </div>
      
      {/* Safe area for devices with home indicator */}
      <div className="h-safe-area-inset-bottom bg-white" />
    </div>
  );
};

export default CompactMobileNav;
