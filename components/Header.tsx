import React, { useState, useMemo } from 'react';
import { User, UserRole, Notification } from '../types';
import { SunIcon, MoonIcon, TrendingUpIcon, BellIcon, LogoutIcon } from './icons';

interface HeaderProps {
  currentUser: User | null;
  viewRole: UserRole; // This is the role the admin is currently viewing as
  setUserRole: (role: UserRole) => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  onAuthClick: () => void;
  onProfileClick: () => void;
  onLogoClick: () => void;
  onLogout: () => void;
  notifications: Notification[];
  setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>;
}

const Header: React.FC<HeaderProps> = ({ currentUser, viewRole, setUserRole, theme, toggleTheme, onAuthClick, onProfileClick, onLogoClick, onLogout, notifications, setNotifications }) => {
  const [isNotificationsOpen, setNotificationsOpen] = useState(false);
  const roles = Object.values(UserRole);

  const userNotifications = useMemo(() => {
    if (!currentUser) return [];
    return notifications
        .filter(n => n.userId === currentUser.id)
        .sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [currentUser, notifications]);

  const hasUnread = useMemo(() => userNotifications.some(n => !n.read), [userNotifications]);
  
  const handleMarkAsRead = (notificationId: string) => {
      setNotifications(prev => 
          prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );
  };

  const handleMarkAllAsRead = () => {
      if (!currentUser) return;
      setNotifications(prev => 
          prev.map(n => n.userId === currentUser.id ? { ...n, read: true } : n)
      );
  };


  const getRoleButtonStyle = (role: UserRole) => {
    return viewRole === role
      ? 'bg-primary-500 text-white'
      : 'bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700';
  };

  return (
    <header className="bg-white dark:bg-gray-900 shadow-sm p-4 sticky top-0 z-50 border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <button onClick={onLogoClick} className="flex items-center space-x-3 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-900 focus:ring-primary-500 rounded-lg p-1 -ml-1">
          <TrendingUpIcon className="w-8 h-8 text-primary-500" />
          <h1 className="text-2xl font-bold font-display text-gray-900 dark:text-white">Erogian Social</h1>
        </button>
        
        {currentUser && currentUser.role === UserRole.Admin && (
            <div className="absolute left-1/2 -translate-x-1/2 hidden md:flex">
                <div className="bg-gray-100 dark:bg-gray-950 p-1 rounded-full flex items-center space-x-1 border border-gray-200 dark:border-gray-800">
                    {roles.map((role) => (
                    <button
                        key={role}
                        onClick={() => setUserRole(role)}
                        className={`px-3 py-1 text-sm font-semibold rounded-full transition-colors duration-200 ${getRoleButtonStyle(role)}`}
                    >
                        {role}
                    </button>
                    ))}
                </div>
            </div>
        )}

        <div className="flex items-center space-x-2 sm:space-x-4">
            <button
                onClick={toggleTheme}
                className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-900 focus:ring-primary-500"
                aria-label="Toggle theme"
            >
                {theme === 'light' ? <MoonIcon className="h-6 w-6" /> : <SunIcon className="h-6 w-6" />}
            </button>
          
            {currentUser ? (
                <>
                    <div className="relative">
                         <button
                            onClick={() => setNotificationsOpen(!isNotificationsOpen)}
                            className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-900 focus:ring-primary-500"
                            aria-label="Toggle notifications"
                        >
                            <BellIcon className="h-6 w-6" />
                            {hasUnread && 
                                <span className="absolute top-1 right-1 block h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white dark:ring-gray-900"></span>
                            }
                        </button>
                        {isNotificationsOpen && (
                             <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-xl border dark:border-gray-700">
                                <div className="p-3 font-bold border-b dark:border-gray-700 flex justify-between items-center">
                                    <span>Notifications</span>
                                    {hasUnread && (
                                      <button onClick={handleMarkAllAsRead} className="text-xs font-semibold text-primary-600 dark:text-primary-400 hover:underline">
                                          Mark all as read
                                      </button>
                                    )}
                                </div>
                                <ul className="py-1 max-h-96 overflow-y-auto">
                                    {userNotifications.length > 0 ? userNotifications.map(n => (
                                        <li key={n.id}>
                                            <button onClick={() => handleMarkAsRead(n.id)} className={`w-full text-left px-4 py-3 text-sm transition-colors ${!n.read ? 'font-bold bg-primary-50 dark:bg-primary-950' : 'font-medium'} text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700`}>
                                                {n.message}
                                            </button>
                                        </li>
                                    )) : (
                                        <li className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 text-center">No new notifications.</li>
                                    )}
                                </ul>
                            </div>
                        )}
                    </div>
                    <button
                        onClick={onProfileClick}
                        className="flex items-center space-x-2 p-1 pr-3 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-900 focus:ring-primary-500"
                        aria-label="Open user profile"
                    >
                        <img src={currentUser.avatar} alt="User Avatar" className="h-8 w-8 rounded-full" />
                        <span className="hidden sm:inline font-semibold text-sm">{currentUser.name}</span>
                    </button>
                     <button
                        onClick={onLogout}
                        className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-900 focus:ring-primary-500"
                        aria-label="Logout"
                    >
                        <LogoutIcon className="h-6 w-6" />
                    </button>
                </>
            ) : (
                <button 
                    onClick={onAuthClick}
                    className="px-4 py-2 text-sm font-semibold text-white bg-primary-600 rounded-full hover:bg-primary-500 transition-colors duration-200">
                        Login / Sign Up
                </button>
            )}
        </div>
      </div>
    </header>
  );
};

export default Header;