import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserRole, User, Announcement, Submission, WithdrawalRequest, Campaign, Engager, Creator, Transaction, Notification, DepositRequest, Task } from '../types';
import { MOCK_ANNOUNCEMENTS, MOCK_SUBMISSIONS, MOCK_WITHDRAWAL_REQUESTS, MOCK_USERS, MOCK_CAMPAIGNS, MOCK_DEPOSIT_REQUESTS, MOCK_TASKS } from '../constants';

// Helper for local storage
const useStickyState = <T,>(defaultValue: T, key: string): [T, React.Dispatch<React.SetStateAction<T>>] => {
  const [value, setValue] = useState<T>(() => {
    try {
      const stickyValue = window.localStorage.getItem(key);
      if (stickyValue !== null) {
        return JSON.parse(stickyValue);
      }
    } catch (error) {
      console.error(`Error reading localStorage key “${key}”:`, error);
    }
    return defaultValue;
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error setting localStorage key “${key}”:`, error);
    }
  }, [key, value]);

  return [value, setValue];
};

// Context Shape
interface AppContextState {
  users: Record<string, User>;
  setUsers: React.Dispatch<React.SetStateAction<Record<string, User>>>;
  currentUser: User | null;
  announcements: Announcement[];
  setAnnouncements: React.Dispatch<React.SetStateAction<Announcement[]>>;
  submissions: Submission[];
  setSubmissions: React.Dispatch<React.SetStateAction<Submission[]>>;
  withdrawalRequests: WithdrawalRequest[];
  setWithdrawalRequests: React.Dispatch<React.SetStateAction<WithdrawalRequest[]>>;
  depositRequests: DepositRequest[];
  setDepositRequests: React.Dispatch<React.SetStateAction<DepositRequest[]>>;
  campaigns: Campaign[];
  setCampaigns: React.Dispatch<React.SetStateAction<Campaign[]>>;
  notifications: Notification[];
  setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>;
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  isAuthModalOpen: boolean;
  setAuthModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  login: (email: string, pass: string) => void;
  signUp: (role: UserRole, name: string, email: string) => void;
  logout: () => void;
  updateUser: (updatedUser: User) => void;
  submitPayment: () => void;
  requestDeposit: (amount: number, paymentMethod: 'Card' | 'Bank Transfer') => void;
}

// Context Creation
const AppContext = createContext<AppContextState | undefined>(undefined);

// Provider Component
export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [users, setUsers] = useStickyState<Record<string, User>>(MOCK_USERS, 'erogiansocial-users');
  const [currentUserId, setCurrentUserId] = useStickyState<string | null>(null, 'erogiansocial-currentUser');
  const [announcements, setAnnouncements] = useStickyState<Announcement[]>(MOCK_ANNOUNCEMENTS, 'erogiansocial-announcements');
  const [submissions, setSubmissions] = useStickyState<Submission[]>(MOCK_SUBMISSIONS, 'erogiansocial-submissions');
  const [withdrawalRequests, setWithdrawalRequests] = useStickyState<WithdrawalRequest[]>(MOCK_WITHDRAWAL_REQUESTS, 'erogiansocial-withdrawals');
  const [depositRequests, setDepositRequests] = useStickyState<DepositRequest[]>(MOCK_DEPOSIT_REQUESTS, 'erogiansocial-deposits');
  const [campaigns, setCampaigns] = useStickyState<Campaign[]>(MOCK_CAMPAIGNS, 'erogiansocial-campaigns');
  const [notifications, setNotifications] = useStickyState<Notification[]>([], 'erogiansocial-notifications');
  const [tasks, setTasks] = useStickyState<Task[]>(MOCK_TASKS, 'erogiansocial-tasks');
  const [isAuthModalOpen, setAuthModalOpen] = useState(false);

  const currentUser = currentUserId ? users[currentUserId] : null;

  useEffect(() => {
    if (!currentUserId) {
      setAuthModalOpen(true);
    }
  }, [currentUserId]);

  const login = (email: string, pass: string) => {
    let foundUser: User | null = null;
    const lowerCaseEmail = email.toLowerCase();
    if ((lowerCaseEmail === 'emmanuelerog@gmail.com' || lowerCaseEmail === 'emmanuelerogian723@gmail.com') && pass === 'Erog@0291') {
        foundUser = Object.values(users).find(u => u.role === UserRole.Admin) || null;
    } else {
        foundUser = Object.values(users).find(u => u.email.toLowerCase() === lowerCaseEmail) || null;
    }
    
    if (foundUser) {
        setCurrentUserId(foundUser.id);
        setAuthModalOpen(false);
    } else {
        alert("Login failed: User not found or incorrect password.");
    }
  };

  const signUp = (role: UserRole, name: string, email: string) => {
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
    setAuthModalOpen(false);
  };

  const logout = () => {
    setCurrentUserId(null);
    setAuthModalOpen(true);
  };

  const updateUser = (updatedUser: User) => {
    setUsers(prev => ({ ...prev, [updatedUser.id]: updatedUser }));
  };

  const submitPayment = () => {
    if (currentUser && 'xp' in currentUser) {
      updateUser({ ...currentUser, subscriptionPaymentPending: true });
    }
  };

  const requestDeposit = (amount: number, paymentMethod: 'Card' | 'Bank Transfer') => {
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

  const value = {
    users, setUsers,
    currentUser,
    announcements, setAnnouncements,
    submissions, setSubmissions,
    withdrawalRequests, setWithdrawalRequests,
    depositRequests, setDepositRequests,
    campaigns, setCampaigns,
    notifications, setNotifications,
    tasks, setTasks,
    isAuthModalOpen, setAuthModalOpen,
    login,
    signUp,
    logout,
    updateUser,
    submitPayment,
    requestDeposit,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

// Custom Hook
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
