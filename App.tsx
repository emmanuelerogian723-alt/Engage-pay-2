import React, { useState, useEffect, useMemo } from 'react';
import Header from './components/Header';
import CreatorDashboard from './components/CreatorDashboard';
import EngagerDashboard from './components/EngagerDashboard';
import AdminDashboard from './components/AdminDashboard';
import UserProfile from './components/UserProfile';
import { UserRole, User, Announcement, Submission, WithdrawalRequest, Campaign, Engager, Creator, Transaction, Notification, DepositRequest, Task } from './types';
import Chatbot from './components/Chatbot';
import AuthModal from './components/SignUpModal';
import { ChatIcon, TrendingUpIcon } from './components/icons';
import { MOCK_ANNOUNCEMENTS, MOCK_SUBMISSIONS, MOCK_WITHDRAWAL_REQUESTS, MOCK_USERS, MOCK_CAMPAIGNS, MOCK_DEPOSIT_REQUESTS, MOCK_TASKS } from './constants';

// Helper for local storage
const useStickyState = <T,>(defaultValue: T, key: string): [T, React.Dispatch<React.SetStateAction<T>>] => {
  const [value, setValue] = useState<T>(() => {
    const stickyValue = window.localStorage.getItem(key);
    return stickyValue !== null
      ? JSON.parse(stickyValue)
      : defaultValue;
  });

  useEffect(() => {
    window.localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue];
};

const App: React.FC = () => {
  // Global State
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [isChatOpen, setChatOpen] = useState(false);
  const [isAuthModalOpen, setAuthModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState<'dashboard' | 'profile'>('dashboard');
  
  // "Database" state with persistence
  const [users, setUsers] = useStickyState<Record<string, User>>(MOCK_USERS, 'erogiansocial-users');
  const [currentUserId, setCurrentUserId] = useStickyState<string | null>(null, 'erogiansocial-currentUser');
  const [announcements, setAnnouncements] = useStickyState<Announcement[]>(MOCK_ANNOUNCEMENTS, 'erogiansocial-announcements');
  const [submissions, setSubmissions] = useStickyState<Submission[]>(MOCK_SUBMISSIONS, 'erogiansocial-submissions');
  const [withdrawalRequests, setWithdrawalRequests] = useStickyState<WithdrawalRequest[]>(MOCK_WITHDRAWAL_REQUESTS, 'erogiansocial-withdrawals');
  const [depositRequests, setDepositRequests] = useStickyState<DepositRequest[]>(MOCK_DEPOSIT_REQUESTS, 'erogiansocial-deposits');
  const [campaigns, setCampaigns] = useStickyState<Campaign[]>(MOCK_CAMPAIGNS, 'erogiansocial-campaigns');
  const [notifications, setNotifications] = useStickyState<Notification[]>([], 'erogiansocial-notifications');
  const [tasks, setTasks] = useStickyState<Task[]>(MOCK_TASKS, 'erogiansocial-tasks');


  const currentUser = currentUserId ? users[currentUserId] : null;
  // This state is for the ADMIN VIEW SWITCHER ONLY. The actual user role is stored in the user object.
  const [viewRole, setViewRole] = useState<UserRole>(currentUser?.role || UserRole.Engager);

  useEffect(() => {
    if (!currentUserId) {
      setAuthModalOpen(true);
    }
  }, [currentUserId]);

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

  const handleLogin = (email: string, pass: string) => {
      let foundUser: User | null = null;
      const lowerCaseEmail = email.toLowerCase();
      if ((lowerCaseEmail === 'emmanuelerog@gmail.com' || lowerCaseEmail === 'emmanuelerogian723@gmail.com') && pass === 'Erog@0291') {
          foundUser = Object.values(users).find(u => u.role === UserRole.Admin) || null;
      } else {
          foundUser = Object.values(users).find(u => u.email.toLowerCase() === lowerCaseEmail) || null;
      }
      
      if (foundUser) {
          setCurrentUserId(foundUser.id);
          setViewRole(foundUser.role);
          setAuthModalOpen(false);
          setCurrentPage('dashboard');
      } else {
          alert("Login failed: User not found or incorrect password.");
      }
  };

  const handleSignUp = (role: UserRole, name: string, email: string) => {
       const newId = `user${Date.now()}`;
       let newUser: User;

       if (role === UserRole.Creator) {
           newUser = {
               id: newId, email, name, role, avatar: `https://i.pravatar.cc/40?u=${newId}`,
               walletBalance: 0, transactions: []
           } as Creator;
       } else {
           newUser = {
               id: newId, email, name, role, avatar: `https://i.pravatar.cc/40?u=${newId}`,
               isSubscribed: false, subscriptionPaymentPending: false,
               referrals: [], referralCode: `${name.toUpperCase().slice(0,4)}${Math.floor(Math.random()*1000)}`,
               earnings: 0, rank: Object.keys(users).length + 1, isVerified: false,
               xp: 0, level: 1, taskStreak: 0,
           } as Engager;
       }
       setUsers(prev => ({ ...prev, [newId]: newUser }));
       setCurrentUserId(newId);
       setViewRole(role);
       setAuthModalOpen(false);
       setCurrentPage('dashboard');
  };
  
  const handleLogout = () => {
      setCurrentUserId(null);
      setViewRole(UserRole.Engager); // Reset to default view
      setCurrentPage('dashboard');
      setAuthModalOpen(true); // Show login screen after logout
  };

  const handleUpdateUser = (updatedUser: User) => {
      setUsers(prev => ({ ...prev, [updatedUser.id]: updatedUser }));
  };

  const handlePaymentSubmitted = () => {
      if (currentUser && 'xp' in currentUser) {
          handleUpdateUser({ ...currentUser, subscriptionPaymentPending: true });
      }
  };
  
  const handleDepositRequest = (amount: number, paymentMethod: 'Card' | 'Bank Transfer') => {
      if (!currentUser) return;
      const newRequest: DepositRequest = {
          id: `dep-${Date.now()}`,
          userId: currentUser.id,
          amount,
          paymentMethod,
          status: 'Pending',
          requestedAt: new Date().toISOString(),
      };
      setDepositRequests(prev => [newRequest, ...prev]);
      alert('Your deposit request has been submitted and is pending review.');
  };

  const userCreatorCampaigns = useMemo(() => {
      if(currentUser?.role === UserRole.Creator || (currentUser?.role === UserRole.Admin && viewRole === UserRole.Creator)) {
        return campaigns.filter(c => c.creatorId === currentUser.id)
      }
      return [];
  }, [campaigns, currentUser, viewRole]);

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
        return <UserProfile currentUser={currentUser} onNavigateBack={() => setCurrentPage('dashboard')} onUpdateUser={handleUpdateUser} users={users} />;
    }

    const effectiveRole = currentUser.role === UserRole.Admin ? viewRole : currentUser.role;

    switch (effectiveRole) {
      case UserRole.Creator:
        return <CreatorDashboard 
                    announcements={announcements} 
                    currentUser={currentUser as Creator} 
                    campaigns={userCreatorCampaigns}
                    setCampaigns={setCampaigns}
                    setTasks={setTasks}
                    onUpdateUser={handleUpdateUser}
                    depositRequests={depositRequests}
                    onDepositRequest={handleDepositRequest}
                />;
      case UserRole.Engager:
        return <EngagerDashboard 
                    announcements={announcements} 
                    currentUser={currentUser as Engager} 
                    tasks={tasks}
                    onPaymentSubmitted={handlePaymentSubmitted} 
                    setSubmissions={setSubmissions}
                    setWithdrawalRequests={setWithdrawalRequests}
                    onUpdateUser={handleUpdateUser}
                />;
      case UserRole.Admin:
        return <AdminDashboard 
                    announcements={announcements} setAnnouncements={setAnnouncements}
                    submissions={submissions} setSubmissions={setSubmissions}
                    withdrawalRequests={withdrawalRequests} setWithdrawalRequests={setWithdrawalRequests}
                    depositRequests={depositRequests} setDepositRequests={setDepositRequests}
                    users={users} setUsers={setUsers}
                    campaigns={campaigns}
                    notifications={notifications} setNotifications={setNotifications}
                />;
      default:
        return <EngagerDashboard announcements={announcements} currentUser={currentUser as Engager} tasks={tasks} onPaymentSubmitted={handlePaymentSubmitted} setSubmissions={setSubmissions} setWithdrawalRequests={setWithdrawalRequests} onUpdateUser={handleUpdateUser}/>;
    }
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-950 min-h-screen text-gray-800 dark:text-gray-200 font-sans transition-colors duration-300">
      <Header
        currentUser={currentUser}
        viewRole={viewRole}
        setUserRole={(role) => {
            setViewRole(role);
            setCurrentPage('dashboard');
        }}
        theme={theme}
        toggleTheme={toggleTheme}
        onAuthClick={() => setAuthModalOpen(true)}
        onProfileClick={() => setCurrentPage('profile')}
        onLogoClick={() => setCurrentPage('dashboard')}
        onLogout={handleLogout}
        notifications={notifications}
        setNotifications={setNotifications}
      />
      <main className="p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
            {renderCurrentPage()}
        </div>
      </main>
      
      {isAuthModalOpen && <AuthModal isOpen={isAuthModalOpen} onClose={() => setAuthModalOpen(false)} onLogin={handleLogin} onSignUp={handleSignUp} />}
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

export default App;