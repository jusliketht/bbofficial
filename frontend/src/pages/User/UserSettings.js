// =====================================================
// MOBILE-FIRST SETTINGS PAGE
// Touch-friendly settings management for all devices
// =====================================================

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  ArrowLeft, 
  Bell, 
  Shield, 
  Moon, 
  Sun, 
  Globe, 
  Smartphone, 
  Mail, 
  Lock, 
  Eye,
  Clock, 
  EyeOff,
  Check,
  X,
  Save,
  AlertCircle,
  CheckCircle,
  Settings,
  User,
  FileText,
  Trash2,
  Download,
  Upload,
  Wifi,
  WifiOff
} from 'lucide-react';
import api from '../../services/api';

const UserSettings = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('general');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Settings state
  const [settings, setSettings] = useState({
    // General Settings
    theme: 'light',
    language: 'en',
    timezone: 'Asia/Kolkata',
    
    // Notification Settings
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    reminderNotifications: true,
    
    // Privacy Settings
    profileVisibility: 'private',
    dataSharing: false,
    analyticsTracking: false,
    
    // Security Settings
    twoFactorAuth: false,
    sessionTimeout: 30,
    loginAlerts: true
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = useState({});

  // Update settings mutation
  const updateSettingsMutation = useMutation({
    mutationFn: async (newSettings) => {
      const response = await api.patch('/users/settings', newSettings);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['userSettings', user?.user_id]);
    }
  });

  // Change password mutation
  const changePasswordMutation = useMutation({
    mutationFn: async (passwordData) => {
      const response = await api.patch('/users/change-password', passwordData);
      return response.data;
    }
  });

  useEffect(() => {
    const handleOnlineStatus = () => setIsOnline(navigator.onLine);
    window.addEventListener('online', handleOnlineStatus);
    window.addEventListener('offline', handleOnlineStatus);
    
    return () => {
      window.removeEventListener('online', handleOnlineStatus);
      window.removeEventListener('offline', handleOnlineStatus);
    };
  }, []);

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSaveSettings = async () => {
    setLoading(true);
    try {
      await updateSettingsMutation.mutateAsync(settings);
      // Show success message
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    const newErrors = {};
    
    if (!passwordData.currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    }
    if (!passwordData.newPassword) {
      newErrors.newPassword = 'New password is required';
    }
    if (passwordData.newPassword.length < 8) {
      newErrors.newPassword = 'Password must be at least 8 characters';
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;
    
    setLoading(true);
    try {
      await changePasswordMutation.mutateAsync(passwordData);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      // Show success message
    } catch (error) {
      console.error('Error changing password:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Setting item component
  const SettingItem = ({ icon: Icon, title, description, children }) => (
    <div className="bg-white rounded-xl p-4 border border-gray-100 mb-3">
      <div className="flex items-start space-x-3">
        <div className="p-2 rounded-lg bg-blue-50">
          <Icon className="h-4 w-4 text-blue-600" />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-gray-900 mb-1">{title}</h3>
          <p className="text-xs text-gray-500 mb-3">{description}</p>
          {children}
        </div>
      </div>
    </div>
  );

  // Toggle switch component
  const ToggleSwitch = ({ checked, onChange, disabled = false }) => (
    <button
      onClick={onChange}
      disabled={disabled}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
        checked ? 'bg-blue-600' : 'bg-gray-300'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );

  const tabs = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Privacy', icon: Shield },
    { id: 'security', label: 'Security', icon: Lock }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => navigate('/dashboard')}
                className="p-2 rounded-lg hover:bg-gray-100 active:scale-95 transition-transform"
              >
                <ArrowLeft className="h-5 w-5 text-gray-700" />
              </button>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">Settings</h1>
                <p className="text-xs text-gray-500">Manage your preferences</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs ${
                isOnline ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}>
                {isOnline ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
                <span>{isOnline ? 'Online' : 'Offline'}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="bg-white border-b">
        <div className="px-4 py-2">
          <div className="flex space-x-1 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="px-4 py-4">
        {/* General Settings */}
        {activeTab === 'general' && (
          <div className="space-y-4">
            <SettingItem
              icon={Moon}
              title="Theme"
              description="Choose your preferred theme"
            >
              <div className="flex space-x-3">
                <button
                  onClick={() => handleSettingChange('theme', 'light')}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm ${
                    settings.theme === 'light' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  <Sun className="h-4 w-4" />
                  <span>Light</span>
                </button>
                <button
                  onClick={() => handleSettingChange('theme', 'dark')}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm ${
                    settings.theme === 'dark' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  <Moon className="h-4 w-4" />
                  <span>Dark</span>
                </button>
              </div>
            </SettingItem>

            <SettingItem
              icon={Globe}
              title="Language"
              description="Select your preferred language"
            >
              <select
                value={settings.language}
                onChange={(e) => handleSettingChange('language', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="en">English</option>
                <option value="hi">Hindi</option>
                <option value="ta">Tamil</option>
                <option value="te">Telugu</option>
              </select>
            </SettingItem>

            <SettingItem
              icon={Globe}
              title="Timezone"
              description="Set your timezone for accurate timestamps"
            >
              <select
                value={settings.timezone}
                onChange={(e) => handleSettingChange('timezone', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                <option value="Asia/Dubai">Asia/Dubai (GST)</option>
                <option value="America/New_York">America/New_York (EST)</option>
                <option value="Europe/London">Europe/London (GMT)</option>
              </select>
            </SettingItem>
          </div>
        )}

        {/* Notification Settings */}
        {activeTab === 'notifications' && (
          <div className="space-y-4">
            <SettingItem
              icon={Mail}
              title="Email Notifications"
              description="Receive notifications via email"
            >
              <ToggleSwitch
                checked={settings.emailNotifications}
                onChange={() => handleSettingChange('emailNotifications', !settings.emailNotifications)}
              />
            </SettingItem>

            <SettingItem
              icon={Smartphone}
              title="Push Notifications"
              description="Receive push notifications on your device"
            >
              <ToggleSwitch
                checked={settings.pushNotifications}
                onChange={() => handleSettingChange('pushNotifications', !settings.pushNotifications)}
              />
            </SettingItem>

            <SettingItem
              icon={Bell}
              title="SMS Notifications"
              description="Receive notifications via SMS"
            >
              <ToggleSwitch
                checked={settings.smsNotifications}
                onChange={() => handleSettingChange('smsNotifications', !settings.smsNotifications)}
              />
            </SettingItem>

            <SettingItem
              icon={Bell}
              title="Reminder Notifications"
              description="Get reminders for important deadlines"
            >
              <ToggleSwitch
                checked={settings.reminderNotifications}
                onChange={() => handleSettingChange('reminderNotifications', !settings.reminderNotifications)}
              />
            </SettingItem>
          </div>
        )}

        {/* Privacy Settings */}
        {activeTab === 'privacy' && (
          <div className="space-y-4">
            <SettingItem
              icon={User}
              title="Profile Visibility"
              description="Control who can see your profile information"
            >
              <select
                value={settings.profileVisibility}
                onChange={(e) => handleSettingChange('profileVisibility', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="private">Private</option>
                <option value="public">Public</option>
                <option value="contacts">Contacts Only</option>
              </select>
            </SettingItem>

            <SettingItem
              icon={Shield}
              title="Data Sharing"
              description="Allow sharing of anonymized data for service improvement"
            >
              <ToggleSwitch
                checked={settings.dataSharing}
                onChange={() => handleSettingChange('dataSharing', !settings.dataSharing)}
              />
            </SettingItem>

            <SettingItem
              icon={Shield}
              title="Analytics Tracking"
              description="Help us improve by sharing usage analytics"
            >
              <ToggleSwitch
                checked={settings.analyticsTracking}
                onChange={() => handleSettingChange('analyticsTracking', !settings.analyticsTracking)}
              />
            </SettingItem>
          </div>
        )}

        {/* Security Settings */}
        {activeTab === 'security' && (
          <div className="space-y-4">
            <SettingItem
              icon={Lock}
              title="Two-Factor Authentication"
              description="Add an extra layer of security to your account"
            >
              <div className="flex items-center justify-between">
                <ToggleSwitch
                  checked={settings.twoFactorAuth}
                  onChange={() => handleSettingChange('twoFactorAuth', !settings.twoFactorAuth)}
                />
                <span className="text-xs text-gray-500">
                  {settings.twoFactorAuth ? 'Enabled' : 'Disabled'}
                </span>
              </div>
            </SettingItem>

            <SettingItem
              icon={Clock}
              title="Session Timeout"
              description="Automatically log out after inactivity"
            >
              <select
                value={settings.sessionTimeout}
                onChange={(e) => handleSettingChange('sessionTimeout', parseInt(e.target.value))}
                className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={15}>15 minutes</option>
                <option value={30}>30 minutes</option>
                <option value={60}>1 hour</option>
                <option value={120}>2 hours</option>
              </select>
            </SettingItem>

            <SettingItem
              icon={Bell}
              title="Login Alerts"
              description="Get notified when someone logs into your account"
            >
              <ToggleSwitch
                checked={settings.loginAlerts}
                onChange={() => handleSettingChange('loginAlerts', !settings.loginAlerts)}
              />
            </SettingItem>

            {/* Change Password */}
            <div className="bg-white rounded-xl p-4 border border-gray-100">
              <div className="flex items-start space-x-3 mb-4">
                <div className="p-2 rounded-lg bg-red-50">
                  <Lock className="h-4 w-4 text-red-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-gray-900 mb-1">Change Password</h3>
                  <p className="text-xs text-gray-500">Update your account password</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-gray-700 mb-1 block">Current Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                      className={`w-full p-2 pr-10 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.currentPassword ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="Enter current password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4 text-gray-400" /> : <Eye className="h-4 w-4 text-gray-400" />}
                    </button>
                  </div>
                  {errors.currentPassword && (
                    <p className="text-xs text-red-600 mt-1">{errors.currentPassword}</p>
                  )}
                </div>

                <div>
                  <label className="text-xs font-medium text-gray-700 mb-1 block">New Password</label>
                  <input
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                    className={`w-full p-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.newPassword ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Enter new password"
                  />
                  {errors.newPassword && (
                    <p className="text-xs text-red-600 mt-1">{errors.newPassword}</p>
                  )}
                </div>

                <div>
                  <label className="text-xs font-medium text-gray-700 mb-1 block">Confirm New Password</label>
                  <input
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    className={`w-full p-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Confirm new password"
                  />
                  {errors.confirmPassword && (
                    <p className="text-xs text-red-600 mt-1">{errors.confirmPassword}</p>
                  )}
                </div>

                <button
                  onClick={handlePasswordChange}
                  disabled={loading}
                  className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 active:scale-95 transition-transform disabled:opacity-50"
                >
                  {loading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Changing Password...</span>
                    </div>
                  ) : (
                    'Change Password'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Save Button */}
        <div className="mt-6">
          <button
            onClick={handleSaveSettings}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-xl hover:bg-blue-700 active:scale-95 transition-transform disabled:opacity-50"
          >
            {loading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Saving Settings...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center space-x-2">
                <Save className="h-4 w-4" />
                <span>Save Settings</span>
              </div>
            )}
          </button>
        </div>

        {/* Danger Zone */}
        <div className="mt-8 bg-red-50 rounded-xl p-4 border border-red-200">
          <h3 className="text-sm font-semibold text-red-800 mb-3">Danger Zone</h3>
          <button
            onClick={handleLogout}
            className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 active:scale-95 transition-transform"
          >
            <div className="flex items-center justify-center space-x-2">
              <X className="h-4 w-4" />
              <span>Logout</span>
            </div>
          </button>
        </div>
      </main>

      {/* Bottom Navigation - Mobile Only */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 md:hidden">
        <div className="flex justify-around">
          <button 
            onClick={() => navigate('/dashboard')}
            className="flex flex-col items-center p-2 text-gray-600 hover:text-blue-600"
          >
            <FileText className="h-5 w-5 mb-1" />
            <span className="text-xs">Dashboard</span>
          </button>
          <button 
            onClick={() => navigate('/notifications')}
            className="flex flex-col items-center p-2 text-gray-600 hover:text-blue-600"
          >
            <Bell className="h-5 w-5 mb-1" />
            <span className="text-xs">Alerts</span>
          </button>
          <button 
            onClick={() => navigate('/profile')}
            className="flex flex-col items-center p-2 text-gray-600 hover:text-blue-600"
          >
            <User className="h-5 w-5 mb-1" />
            <span className="text-xs">Profile</span>
          </button>
          <button className="flex flex-col items-center p-2 text-blue-600">
            <Settings className="h-5 w-5 mb-1" />
            <span className="text-xs font-medium">Settings</span>
          </button>
        </div>
      </nav>

      {/* Bottom padding for mobile navigation */}
      <div className="h-20 md:hidden"></div>
    </div>
  );
};

export default UserSettings;
