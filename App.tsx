import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import CreatorDashboard from './components/CreatorDashboard';
import EngagerDashboard from './components/EngagerDashboard';
import AdminDashboard from './components/AdminDashboard';
import UserProfile from './components/UserProfile';
import { UserRole, User, Announcement, Submission, WithdrawalRequest, Campaign, Engager, Creator, Transaction, Notification } from './types';
import Chatbot from './components/Chatbot';
import AuthModal from './components/SignUpModal';
import { ChatIcon } from './components/icons';
import { MOCK_ANNOUNCEMENTS, MOCK_SUBMISSIONS, MOCK_WITHDRAWAL_REQUESTS, MOCK_USERS, MOCK_CAMPAIGNS } from './constants';

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
  const [users, setUsers] = useStickyState<Record<string, User>>(MOCK_USERS, 'engagepay-users');
  const [currentUserId, setCurrentUserId] = useStickyState<string | null>(null, 'engagepay-currentUser');
  const [announcements, setAnnouncements] = useStickyState<Announcement[]>(MOCK_ANNOUNCEMENTS, 'engagepay-announcements');
  const [submissions, setSubmissions] = useStickyState<Submission[]>(MOCK_SUBMISSIONS, 'engagepay-submissions');
  const [withdrawalRequests, setWithdrawalRequests] = useStickyState<WithdrawalRequest[]>(MOCK_WITHDRAWAL_REQUESTS, 'engagepay-withdrawals');
  const [campaigns, setCampaigns] = useStickyState<Campaign[]>(MOCK_CAMPAIGNS, 'engagepay-campaigns');
  const [notifications, setNotifications] = useStickyState<Notification[]>([], 'engagepay-notifications');


  const currentUser = currentUserId ? users[currentUserId] : null;
  // This state is for the ADMIN VIEW SWITCHER ONLY. The actual user role is stored in the user object.
  const [viewRole, setViewRole] = useState<UserRole>(currentUser?.role || UserRole.Engager);

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
      if (email.toLowerCase() === 'emmanuelerog@gmail.com' && pass === 'Erog@0291') {
          foundUser = Object.values(users).find(u => u.role === UserRole.Admin) || null;
      } else {
          // Simulate finding any other user by email
          foundUser = Object.values(users).find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
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
               id: newId, email, name, role, avatar: `https://picsum.photos/seed/${newId}/40/40`,
               walletBalance: 0, transactions: []
           } as Creator;
       } else {
           newUser = {
               id: newId, email, name, role, avatar: `https://picsum.photos/seed/${newId}/40/40`,
               isSubscribed: false, subscriptionPaymentPending: false,
               referrals: [], referralCode: `${name.toUpperCase().slice(0,4)}${Math.floor(Math.random()*1000)}`,
               earnings: 0, rank: Object.keys(users).length + 1, isVerified: false,
               xp: 0, level: 1,
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
  };

  const handleUpdateUser = (updatedUser: User) => {
      setUsers(prev => ({ ...prev, [updatedUser.id]: updatedUser }));
  };

  const handlePaymentSubmitted = () => {
      if (currentUser && 'xp' in currentUser) {
          handleUpdateUser({ ...currentUser, subscriptionPaymentPending: true });
      }
  };

  const renderCurrentPage = () => {
    if (currentPage === 'profile' && currentUser) {
        return <UserProfile currentUser={currentUser} onNavigateBack={() => setCurrentPage('dashboard')} onUpdateUser={handleUpdateUser} users={users} />;
    }
    
    // If not logged in, show a generic landing/engager page
    if (!currentUser) {
        return <EngagerDashboard announcements={announcements} currentUser={null} onPaymentSubmitted={() => {}} setSubmissions={setSubmissions} setWithdrawalRequests={setWithdrawalRequests} onUpdateUser={()=>{}} />;
    }

    const effectiveRole = currentUser.role === UserRole.Admin ? viewRole : currentUser.role;

    switch (effectiveRole) {
      case UserRole.Creator:
        return <CreatorDashboard 
                    announcements={announcements} 
                    currentUser={currentUser as Creator} 
                    campaigns={campaigns.filter(c => c.creatorId === currentUser.id)}
                    setCampaigns={setCampaigns}
                    onUpdateUser={handleUpdateUser}
                />;
      case UserRole.Engager:
        return <EngagerDashboard 
                    announcements={announcements} 
                    currentUser={currentUser as Engager} 
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
                    users={users} setUsers={setUsers}
                    campaigns={campaigns}
                    notifications={notifications} setNotifications={setNotifications}
                />;
      default:
        return <EngagerDashboard announcements={announcements} currentUser={currentUser as Engager} onPaymentSubmitted={handlePaymentSubmitted} setSubmissions={setSubmissions} setWithdrawalRequests={setWithdrawalRequests} onUpdateUser={handleUpdateUser}/>;
    }
  };

  return (
    <div className="bg-gray-100 dark:bg-gray-900 min-h-screen text-gray-800 dark:text-gray-200 font-sans transition-colors duration-300">
      <Header
        currentUser={currentUser}
        viewRole={viewRole}
        setUserRole={(role) => {
            setViewRole(role);
            setCurrentPage('dashboard'); // Switch back to dashboard when role changes
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
      <main className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        {renderCurrentPage()}
      </main>
      
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setAuthModalOpen(false)} onLogin={handleLogin} onSignUp={handleSignUp} />
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