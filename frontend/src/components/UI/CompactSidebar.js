// =====================================================
// COMPACT SIDEBAR - MOBILE-FIRST NAVIGATION
// Dense, efficient navigation with maximum information density
// =====================================================

import React, { useState, useMemo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Home, 
  FileText, 
  Calculator, 
  User, 
  LogOut, 
  Menu, 
  X,
  Bell,
  Settings,
  Building2,
  Users,
  BarChart3,
  Shield,
  UserCheck,
  ClipboardList,
  MessageSquare,
  DollarSign,
  Activity,
  ChevronDown,
  ChevronRight,
  Search,
  Filter,
  Bot,
  Palette,
  Keyboard,
  Type,
  Play,
  Crown,
  ArrowUpRight
} from 'lucide-react';

const CompactSidebar = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState({});
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Handle missing user gracefully
  if (!user) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-neutral-900 mb-4">Loading...</h2>
          <p className="text-neutral-600">Please wait while we load your dashboard.</p>
        </div>
      </div>
    );
  }

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const navigation = useMemo(() => {
    const userRole = user?.role || 'user';
    
    const roleNavigation = {
      'super_admin': [
        { 
          name: 'Dashboard', 
          href: '/dashboard', 
          icon: Home,
          badge: null
        },
        { 
          name: 'Platform', 
          icon: BarChart3,
          section: 'platform',
          items: [
            { name: 'Overview', href: '/admin/platform-overview', icon: BarChart3 },
            { name: 'Analytics', href: '/admin/analytics', icon: Activity },
            { name: 'System Health', href: '/admin/system-health', icon: Activity }
          ]
        },
        { 
          name: 'Users', 
          icon: Users,
          section: 'users',
          items: [
            { name: 'All Users', href: '/admin/users', icon: Users },
            { name: 'CA Firms', href: '/admin/ca-firms', icon: Building2 },
            { name: 'Members', href: '/admin/members', icon: UserCheck }
          ]
        },
        { 
          name: 'Operations', 
          icon: ClipboardList,
          section: 'operations',
          items: [
            { name: 'Tickets', href: '/admin/tickets', icon: ClipboardList },
            { name: 'SLA Monitor', href: '/admin/sla', icon: BarChart3 },
            { name: 'Escalations', href: '/admin/escalations', icon: Bell }
          ]
        },
        { 
          name: 'Compliance', 
          href: '/admin/compliance', 
          icon: Shield,
          badge: 'NEW'
        },
        { 
          name: 'Billing', 
          href: '/admin/billing', 
          icon: DollarSign
        },
        { 
          name: 'Settings', 
          href: '/settings', 
          icon: Settings
        }
      ],
      'ca_firm_admin': [
        { name: 'Dashboard', href: '/dashboard', icon: Home },
        { name: 'CA Bot', href: '/ca-bot', icon: Bot, badge: 'NEW' },
        { name: 'File ITR', href: '/itr/start', icon: FileText, badge: 'HOT' },
        { name: 'History', href: '/filing-history', icon: ClipboardList },
        { name: 'Members', href: '/add-members', icon: Users },
        { name: 'Profile', href: '/financial-profile', icon: User },
        { name: 'Tickets', href: '/service-tickets', icon: MessageSquare },
        { name: 'Clients', href: '/client-management', icon: UserCheck },
        { name: 'Billing', href: '/billing-invoicing', icon: DollarSign },
        { name: 'Settings', href: '/settings', icon: Settings }
      ],
      'CA': [
        { name: 'Dashboard', href: '/dashboard', icon: Home },
        { name: 'CA Bot', href: '/ca-bot', icon: Bot, badge: 'NEW' },
        { name: 'File ITR', href: '/itr/start', icon: FileText, badge: 'HOT' },
        { name: 'History', href: '/filing-history', icon: ClipboardList },
        { name: 'Members', href: '/add-members', icon: Users },
        { name: 'Profile', href: '/financial-profile', icon: User },
        { name: 'Tickets', href: '/service-tickets', icon: MessageSquare },
        { name: 'Clients', href: '/client-management', icon: UserCheck },
        { name: 'Settings', href: '/settings', icon: Settings }
      ],
      'user': [
        { name: 'Dashboard', href: '/dashboard', icon: Home },
        { name: 'CA Bot', href: '/ca-bot', icon: Bot, badge: 'NEW' },
        { name: 'File ITR', href: '/itr/start', icon: FileText, badge: 'HOT' },
        { name: 'History', href: '/filing-history', icon: ClipboardList },
        { name: 'Members', href: '/add-members', icon: Users },
        { name: 'Profile', href: '/financial-profile', icon: User },
        { name: 'Tickets', href: '/service-tickets', icon: MessageSquare },
        { name: 'Settings', href: '/settings', icon: Settings },
        { name: 'Upgrade to Professional', href: '/upgrade', icon: Crown, badge: 'PRO', className: 'text-purple-600 hover:text-purple-700 border-l-2 border-purple-200 bg-purple-50' },
        { 
          name: 'Design System', 
          icon: Palette,
          section: 'design',
          items: [
            { name: 'Style Guide', href: '/style-guide', icon: Palette },
            { name: 'Keyboard Test', href: '/keyboard-test', icon: Keyboard },
            { name: 'Content Review', href: '/content-review', icon: Type }
          ]
        },
        { 
          name: 'Testing', 
          icon: Play,
          section: 'testing',
          items: [
            { name: 'Test Runner', href: '/test-runner', icon: Play },
            { name: 'Test Report', href: '/test-report', icon: FileText }
          ]
        }
      ]
    };
    
    const adminRoles = ['admin', 'super_admin', 'platform_admin', 'system_admin'];
    const isAdminUser = adminRoles.includes(userRole);
    
    if (isAdminUser && !roleNavigation[userRole]) {
      return roleNavigation['super_admin'];
    }
    
    return roleNavigation[userRole] || roleNavigation['user'];
  }, [user?.role]);

  const isActive = (path) => location.pathname === path;

  const renderNavItem = (item, level = 0) => {
    const hasChildren = item.items && item.items.length > 0;
    const isExpanded = expandedSections[item.section];
    const isItemActive = isActive(item.href) || (hasChildren && item.items.some(subItem => isActive(subItem.href)));

    if (hasChildren) {
      return (
        <div key={item.name} className="mb-1">
          <button
            onClick={() => toggleSection(item.section)}
            className={`
              w-full flex items-center justify-between px-3 py-2.5 text-sm font-medium rounded-lg
              transition-all duration-200 group
              ${isItemActive 
                ? 'bg-primary-100 text-primary-700 border border-primary-200' 
                : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
              }
            `}
          >
            <div className="flex items-center space-x-3">
              <item.icon className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">{item.name}</span>
            </div>
            {isExpanded ? (
              <ChevronDown className="w-4 h-4 flex-shrink-0" />
            ) : (
              <ChevronRight className="w-4 h-4 flex-shrink-0" />
            )}
          </button>
          
          {isExpanded && (
            <div className="ml-4 mt-1 space-y-1">
              {item.items.map((subItem) => renderNavItem(subItem, level + 1))}
            </div>
          )}
        </div>
      );
    }

    return (
      <Link
        key={item.name}
        to={item.href}
        className={`
          flex items-center justify-between px-3 py-2.5 text-sm font-medium rounded-lg
          transition-all duration-200 group relative
          ${isActive(item.href)
            ? 'bg-primary-100 text-primary-700 border border-primary-200'
            : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
          }
        `}
        onClick={() => setSidebarOpen(false)}
      >
        <div className="flex items-center space-x-3 flex-1 min-w-0">
          <item.icon className="w-4 h-4 flex-shrink-0" />
          <span className="truncate">{item.name}</span>
        </div>
        
        {item.badge && (
          <span className={`
            inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium
            ${item.badge === 'HOT' 
              ? 'bg-error-100 text-error-800' 
              : 'bg-primary-100 text-primary-800'
            }
          `}>
            {item.badge}
          </span>
        )}
        
        {/* Active indicator */}
        {isActive(item.href) && (
          <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-1 h-6 bg-primary-500 rounded-l-full" />
        )}
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Mobile sidebar overlay */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div 
          className="fixed inset-0 bg-neutral-900/50 backdrop-blur-sm" 
          onClick={() => setSidebarOpen(false)} 
        />
        <div className="fixed inset-y-0 left-0 flex w-72 flex-col bg-white shadow-2xl">
          {/* Mobile header */}
          <div className="flex h-16 items-center justify-between px-4 border-b border-neutral-200">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">B</span>
              </div>
              <div>
                <h1 className="text-lg font-bold text-neutral-900">Burnblack</h1>
                <p className="text-xs text-neutral-500 capitalize">
                  {user?.role?.replace('_', ' ')}
                </p>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-2 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Mobile navigation */}
          <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => renderNavItem(item))}
          </nav>

          {/* Mobile footer - with bottom padding for mobile nav */}
          <div className="border-t border-neutral-200 p-4 pb-20 lg:pb-4">
            <button
              onClick={handleLogout}
              className="flex w-full items-center px-3 py-2.5 text-sm font-medium text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 rounded-lg transition-colors"
            >
              <LogOut className="mr-3 h-4 w-4" />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow bg-white border-r border-neutral-200">
          {/* Desktop header */}
          <div className="flex h-16 items-center px-4 border-b border-neutral-200">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">B</span>
              </div>
              <div>
                <h1 className="text-lg font-bold text-neutral-900">Burnblack</h1>
                <p className="text-xs text-neutral-500 capitalize">
                  {user?.role?.replace('_', ' ')}
                </p>
              </div>
            </div>
          </div>

          {/* Desktop navigation */}
          <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => renderNavItem(item))}
          </nav>

          {/* Desktop footer */}
          <div className="border-t border-neutral-200 p-4">
            <button
              onClick={handleLogout}
              className="flex w-full items-center px-3 py-2.5 text-sm font-medium text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 rounded-lg transition-colors"
            >
              <LogOut className="mr-3 h-4 w-4" />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <div className="sticky top-0 z-40 flex h-16 items-center justify-between bg-white border-b border-neutral-200 px-4 lg:px-6">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="flex items-center space-x-4">
            {/* Search */}
            <div className="hidden md:flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="pl-10 pr-4 py-2 text-sm border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Notifications */}
            <button className="relative p-2 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors">
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-error-500 rounded-full"></span>
            </button>

            {/* User menu */}
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center">
                <span className="text-white font-medium text-sm">
                  {user?.name?.charAt(0) || 'U'}
                </span>
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-medium text-neutral-900">{user?.name || 'User'}</p>
                <p className="text-xs text-neutral-500 capitalize">{user?.role?.replace('_', ' ')}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 pb-20 lg:pb-0">
          {children}
        </main>
      </div>
    </div>
  );
};

export default CompactSidebar;
