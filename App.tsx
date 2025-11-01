import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import CreatorDashboard from './components/CreatorDashboard';
import EngagerDashboard from './components/EngagerDashboard';
import AdminDashboard from './components/AdminDashboard';
import UserProfile from './components/UserProfile';
import { UserRole } from './types';
import Chatbot from './components/Chatbot';
import AuthModal from './components/SignUpModal';
import { ChatIcon, TrendingUpIcon } from './components/icons';
import { AppProvider, useAppContext } from './contexts/AppContext';

const AppContent: React.FC = () => {
  const { currentUser, isAuthModalOpen, setAuthModalOpen, logout } = useAppContext();

  // Local UI State
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [isChatOpen, setChatOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState<'dashboard' | 'profile'>('dashboard');
  
  // This state is for the ADMIN VIEW SWITCHER ONLY. The actual user role is stored in the user object.
  const [viewRole, setViewRole] = useState<UserRole>(currentUser?.role || UserRole.Engager);

  // When user changes, reset viewRole and currentPage
  useEffect(() => {
    if(currentUser) {
        setViewRole(currentUser.role);
        setCurrentPage('dashboard');
    } else {
        setViewRole(UserRole.Engager); // Reset to default view on logout
        setCurrentPage('dashboard');
    }
  }, [currentUser]);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };
  
  const handleLogout = () => {
      logout();
      setViewRole(UserRole.Engager);
      setCurrentPage('dashboard');
  };

  const renderCurrentPage = () => {
    if (!currentUser) {
        if (!isAuthModalOpen) {
            return (
                <div className="flex flex-col justify-center items-center text-center h-[calc(100vh-200px)] animate-fade-in">
                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary-900 via-gray-950 to-gray-950 opacity-50 -z-10"></div>
                    <div className="relative p-8 rounded-lg">
                        <TrendingUpIcon className="w-16 h-16 text-primary-400 mx-auto mb-6" />
                        <h1 className="text-4xl md:text-5xl font-bold font-display text-white mb-4">Welcome to Erogian Social</h1>
                        <p className="text-lg text-gray-300 max-w-2xl mx-auto">
                            The ultimate platform to boost your social presence and earn rewards by completing simple tasks.
                        </p>
                        <button 
                            onClick={() => setAuthModalOpen(true)}
                            className="mt-8 px-8 py-3 text-lg font-semibold text-white bg-primary-600 rounded-full shadow-lg hover:bg-primary-500 transform hover:scale-105 transition-all duration-300">
                                Get Started
                        </button>
                    </div>
                </div>
            );
        }
        return null; // Return null while auth modal is open for a clean overlay
    }

    if (currentPage === 'profile') {
        return <UserProfile onNavigateBack={() => setCurrentPage('dashboard')} />;
    }

    const effectiveRole = currentUser.role === UserRole.Admin ? viewRole : currentUser.role;

    switch (effectiveRole) {
      case UserRole.Creator:
        return <CreatorDashboard />;
      case UserRole.Engager:
        return <EngagerDashboard />;
      case UserRole.Admin:
        return <AdminDashboard />;
      default:
        return <EngagerDashboard />;
    }
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-950 min-h-screen text-gray-800 dark:text-gray-200 font-sans transition-colors duration-300">
      <Header
        viewRole={viewRole}
        setUserRole={(role) => {
            setViewRole(role);
            setCurrentPage('dashboard');
        }}
        theme={theme}
        toggleTheme={toggleTheme}
        onProfileClick={() => setCurrentPage('profile')}
        onLogoClick={() => setCurrentPage('dashboard')}
        onLogout={handleLogout}
      />
      <main className="p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
            {renderCurrentPage()}
        </div>
      </main>
      
      {isAuthModalOpen && <AuthModal isOpen={isAuthModalOpen} onClose={() => setAuthModalOpen(false)} />}
      <Chatbot isOpen={isChatOpen} onClose={() => setChatOpen(false)} />

      <button
        onClick={() => setChatOpen(true)}
        className={`fixed bottom-6 right-6 bg-primary-600 text-white p-4 rounded-full shadow-lg hover:bg-primary-700 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 ${isChatOpen ? 'opacity-0 scale-0' : 'opacity-100 scale-100'}`}
        aria-label="Open chat"
      >
        <ChatIcon className="h-8 w-8" />
      </button>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
};

export default App;
