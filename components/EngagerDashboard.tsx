import React, { useState, useMemo } from 'react';
import { MOCK_LEADERBOARD, PLATFORM_ICONS } from '../constants';
import { Task, Engager, Announcement, Submission, WithdrawalRequest, SocialPlatform } from '../types';
import { LikeIcon, CommentIcon, FollowIcon, ViewIcon, ShareIcon, WalletIcon, LinkIcon, UploadIcon, CloseIcon, MegaphoneIcon, SearchIcon, StarIcon, CheckCircleIcon, FlameIcon, LockIcon, CreditCardIcon } from './icons';
import { useAppContext } from '../contexts/AppContext';

const ENGAGEMENT_ICONS: { [key:string]: React.ElementType } = {
  Like: LikeIcon, Comment: CommentIcon, Follow: FollowIcon, View: ViewIcon, Share: ShareIcon,
};

const GamificationStats: React.FC<{xp: number, level: number}> = ({ xp, level }) => {
    const xpForNextLevel = level * 100;
    const progress = (xp / xpForNextLevel) * 100;

    return (
        <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 h-full">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold font-display">Your Progress</h3>
                <span className="font-bold text-lg bg-primary-100 dark:bg-primary-950 text-primary-600 dark:text-primary-300 px-3 py-1 rounded-full flex items-center space-x-1 ring-1 ring-inset ring-primary-600/20">
                    <StarIcon className="w-4 h-4" />
                    <span>Level {level}</span>
                </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 mb-2 relative">
                <div className="bg-gradient-to-r from-primary-400 to-primary-600 h-4 rounded-full" style={{ width: `${progress}%` }}></div>
                <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white drop-shadow-sm">{xp} / {xpForNextLevel} XP</span>
            </div>
            <p className="text-sm text-center text-gray-500 dark:text-gray-400">
                Only <span className="font-bold">{xpForNextLevel - xp} XP</span> to the next level!
            </p>
        </div>
    )
};

const StreakTracker: React.FC<{ currentStreak: number, goal: number }> = ({ currentStreak, goal }) => {
    const progress = (currentStreak / goal) * 100;

    return (
        <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm h-full flex flex-col justify-center border border-gray-200 dark:border-gray-800">
            <h3 className="text-lg font-bold font-display mb-2 flex items-center space-x-2">
                <FlameIcon className="w-6 h-6 text-orange-500" />
                <span>Task Streak</span>
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                Complete {goal} tasks in a row for a <span className="font-bold text-orange-400">50 XP</span> bonus!
            </p>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 relative">
                <div className="bg-gradient-to-r from-orange-400 to-red-500 h-4 rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
                <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white drop-shadow-sm">{currentStreak} / {goal}</span>
            </div>
        </div>
    );
};

const Wallet: React.FC<{ onWithdraw: () => void, balance: number }> = ({ onWithdraw, balance }) => (
    <div className="bg-gradient-to-br from-primary-600 to-primary-800 text-white p-6 rounded-2xl shadow-lg h-full flex flex-col justify-between">
        <div>
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold opacity-80">My Wallet</h3>
                <WalletIcon className="w-8 h-8 opacity-70" />
            </div>
            <p className="text-4xl font-bold tracking-tight">${balance.toFixed(2)}</p>
            <p className="text-sm opacity-80 mt-1">Available for withdrawal</p>
        </div>
        <button onClick={onWithdraw} className="mt-6 w-full bg-white/10 backdrop-blur-sm text-white font-bold py-2.5 px-4 rounded-lg hover:bg-white/20 border border-white/20 transition-colors duration-200">
            Withdraw Funds
        </button>
    </div>
);

const Leaderboard: React.FC = () => (
    <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800">
        <h3 className="text-xl font-bold font-display mb-4">Top Engagers</h3>
        <ul className="space-y-4">
            {MOCK_LEADERBOARD.slice(0, 5).map(user => (
                <li key={user.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <span className="font-bold text-gray-500 dark:text-gray-400 w-6 text-center">{user.rank}</span>
                        <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full" />
                        <div className="flex items-center space-x-1.5">
                            <span className="font-semibold text-gray-700 dark:text-gray-300">{user.name}</span>
                            {user.isVerified && <CheckCircleIcon className="w-4 h-4 text-blue-500"><title>Verified User</title></CheckCircleIcon>}
                        </div>
                    </div>
                    <span className="font-bold text-primary-500">${user.earnings.toFixed(2)}</span>
                </li>
            ))}
        </ul>
    </div>
);

const SubscriptionModal: React.FC<{ onPaymentSubmitted: () => void, onClose: () => void, isPending: boolean }> = ({ onPaymentSubmitted, onClose, isPending }) => (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 animate-fade-in">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md m-4 p-8 text-center relative">
             <button onClick={onClose} className="absolute top-4 right-4 p-1 rounded-full text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700">
                <CloseIcon className="w-6 h-6" />
            </button>
            <CreditCardIcon className="w-16 h-16 text-primary-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Unlock Full Access</h2>
            {isPending ? (
                <>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">Your payment is being reviewed by our team. You will be notified once it's approved. This usually takes less than 24 hours.</p>
                     <button disabled className="w-full bg-yellow-500 text-white font-bold py-3 px-4 rounded-lg cursor-not-allowed opacity-70">
                        Verification Pending
                    </button>
                </>
            ) : (
                <>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">A one-time fee of <span className="font-bold">$1.00</span> is required to access the Task Marketplace and start earning.</p>
                    <div className="text-left bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg mb-6 space-y-2 text-sm border border-gray-200 dark:border-gray-700">
                        <p><strong>Bank:</strong> First City Monument Bank</p>
                        <p><strong>Account Name:</strong> Emmanuel Ene Rejoice Gideon</p>
                        <p><strong>Account Number:</strong> 7415707015</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Please make the transfer and click the button below.</p>
                    </div>
                    <button onClick={onPaymentSubmitted} className="w-full bg-primary-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-primary-700 transition-colors duration-200">
                        I Have Paid $1.00
                    </button>
                </>
            )}
        </div>
    </div>
);


const WithdrawalModal: React.FC<{ isOpen: boolean, onClose: () => void, balance: number, onSubmit: (details: Omit<WithdrawalRequest, 'id' | 'userId' | 'status' | 'requestedAt'>) => void }> = ({ isOpen, onClose, balance, onSubmit }) => {
    const [formData, setFormData] = useState({
        amount: balance.toFixed(2), bankCountry: 'Nigeria', bankName: '', accountNumber: ''
    });
    const [errors, setErrors] = useState<Partial<typeof formData>>({});

    if (!isOpen) return null;
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const validate = () => {
        const newErrors: Partial<typeof formData> = {};
        if (parseFloat(formData.amount) <= 0) newErrors.amount = "Amount must be > 0.";
        else if (parseFloat(formData.amount) > balance) newErrors.amount = "Amount exceeds balance.";
        if (!formData.bankName.trim()) newErrors.bankName = "Bank name is required.";
        if (!/^\d{10}$/.test(formData.accountNumber)) newErrors.accountNumber = "Account number must be 10 digits.";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (validate()) {
            onSubmit({ amount: Number(formData.amount), bankCountry: formData.bankCountry, bankName: formData.bankName, accountNumber: formData.accountNumber });
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 animate-fade-in">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md m-4">
                 <div className="p-5 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                    <h3 className="text-xl font-bold">Request Withdrawal</h3>
                    <button onClick={onClose} className="p-1 rounded-full text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700">
                        <CloseIcon className="w-6 h-6" />
                    </button>
                </div>
                 <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Amount</label>
                            <input name="amount" type="number" step="0.01" max={balance} value={formData.amount} onChange={handleChange} required className="mt-1 block w-full bg-gray-100 dark:bg-gray-900 border-gray-300 dark:border-gray-700 rounded-md p-2 focus:ring-primary-500 focus:border-primary-500" />
                            {errors.amount && <p className="text-red-500 text-xs mt-1">{errors.amount}</p>}
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Bank Country</label>
                            <select name="bankCountry" value={formData.bankCountry} onChange={handleChange} required className="mt-1 block w-full bg-gray-100 dark:bg-gray-900 border-gray-300 dark:border-gray-700 rounded-md p-2 focus:ring-primary-500 focus:border-primary-500">
                                <option>United States</option><option>Canada</option><option>United Kingdom</option><option>Nigeria</option><option>Australia</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Bank Name</label>
                            <input name="bankName" type="text" placeholder="e.g., Chase Bank" value={formData.bankName} onChange={handleChange} required className="mt-1 block w-full bg-gray-100 dark:bg-gray-900 border-gray-300 dark:border-gray-700 rounded-md p-2 focus:ring-primary-500 focus:border-primary-500" />
                            {errors.bankName && <p className="text-red-500 text-xs mt-1">{errors.bankName}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Account Number</label>
                            <input name="accountNumber" type="text" placeholder="Enter your bank account number" value={formData.accountNumber} onChange={handleChange} required className="mt-1 block w-full bg-gray-100 dark:bg-gray-900 border-gray-300 dark:border-gray-700 rounded-md p-2 focus:ring-primary-500 focus:border-primary-500" />
                             {errors.accountNumber && <p className="text-red-500 text-xs mt-1">{errors.accountNumber}</p>}
                        </div>
                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-b-lg">
                        <button type="submit" className="w-full bg-primary-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-primary-700 transition-colors duration-200">
                            Submit Request
                        </button>
                    </div>
                 </form>
            </div>
        </div>
    );
};


const CompleteTaskModal: React.FC<{ task: Task, isOpen: boolean, onClose: () => void, onSubmit: () => void }> = ({ task, isOpen, onClose, onSubmit }) => {
    const [file, setFile] = useState<File | null>(null);

    const handleSubmit = () => { onSubmit(); };

    if(!isOpen) return null;

    return (
         <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 animate-fade-in">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md m-4">
                <div className="p-5 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                    <h3 className="text-xl font-bold">Complete Task</h3>
                    <button onClick={onClose} className="p-1 rounded-full text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700">
                        <CloseIcon className="w-6 h-6" />
                    </button>
                </div>
                <div className="p-6 space-y-4">
                    <p className="text-gray-700 dark:text-gray-300">{task.description}</p>
                    <a href={task.link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center space-x-2 text-primary-600 dark:text-primary-400 hover:underline font-semibold">
                        <LinkIcon className="w-5 h-5"/>
                        <span>Go to Post</span>
                    </a>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Upload Proof (Screenshot)</label>
                        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-md">
                            <div className="space-y-1 text-center">
                                <UploadIcon className="mx-auto h-12 w-12 text-gray-400" />
                                <div className="flex text-sm text-gray-600 dark:text-gray-400">
                                    <label htmlFor="file-upload" className="relative cursor-pointer bg-white dark:bg-gray-800 rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none">
                                        <span>{file ? file.name : 'Upload a file'}</span>
                                        <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)} />
                                    </label>
                                    <p className="pl-1">or drag and drop</p>
                                </div>
                                <p className="text-xs text-gray-500 dark:text-gray-500">PNG, JPG, GIF up to 10MB</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-b-lg">
                    <button onClick={handleSubmit} className="w-full bg-primary-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-primary-700 transition-colors duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed" disabled={!file}>
                        Submit for Review
                    </button>
                </div>
            </div>
        </div>
    )
}

const TaskCard: React.FC<{ task: Task, onSubmit: () => void }> = ({ task, onSubmit }) => {
  const [isModalOpen, setModalOpen] = useState(false);
  const PlatformIcon = PLATFORM_ICONS[task.platform];
  const EngagementIcon = ENGAGEMENT_ICONS[task.engagementType];

  const handleSubmit = () => { onSubmit(); setModalOpen(false); };

  return (
    <>
    <CompleteTaskModal task={task} isOpen={isModalOpen} onClose={() => setModalOpen(false)} onSubmit={handleSubmit} />
    <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between border border-gray-200 dark:border-gray-800">
      <div>
        <div className="flex justify-between items-start mb-3">
            <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400">
                <PlatformIcon className="w-5 h-5" />
                <span className="text-sm font-medium">{task.platform}</span>
            </div>
            <div className="flex items-center space-x-1.5 px-2.5 py-1 bg-primary-50 dark:bg-primary-950 text-primary-600 dark:text-primary-300 rounded-full ring-1 ring-inset ring-primary-600/20">
                <EngagementIcon className="w-4 h-4" />
                <span className="text-xs font-bold">{task.engagementType}</span>
            </div>
        </div>
        <p className="text-gray-700 dark:text-gray-300 font-medium">{task.description}</p>
      </div>
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-800 flex justify-between items-center">
        <span className="text-2xl font-bold text-primary-500">${task.payout.toFixed(2)}</span>
        <button onClick={() => setModalOpen(true)} className="bg-primary-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors duration-200">
            Start Task
        </button>
      </div>
    </div>
    </>
  );
};

const SubscriptionGate: React.FC<{ onOpenModal: () => void; isPending: boolean; }> = ({ onOpenModal, isPending }) => (
    <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 animate-fade-in">
        <div className="w-16 h-16 mx-auto bg-primary-100 dark:bg-primary-950 rounded-full flex items-center justify-center mb-4">
            <LockIcon className="w-8 h-8 text-primary-500"/>
        </div>
        <h2 className="text-2xl font-bold font-display mb-2">{isPending ? 'Verification in Progress' : 'Access Restricted'}</h2>
        <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-6">
            {isPending
                ? "Your subscription payment is currently being verified by our team. You'll be notified upon approval."
                : "You need an active subscription to access the Task Marketplace and start earning."
            }
        </p>
        {!isPending && (
            <button onClick={onOpenModal} className="bg-primary-600 text-white font-semibold px-5 py-2.5 rounded-lg hover:bg-primary-700 transition-colors duration-200">
                Activate Your Account
            </button>
        )}
    </div>
);

const EngagerDashboard: React.FC = () => {
  const {
      announcements,
      currentUser,
      tasks,
      submitPayment,
      setSubmissions,
      setWithdrawalRequests,
      updateUser
  } = useAppContext();

  const [isWithdrawalModalOpen, setWithdrawalModalOpen] = useState(false);
  const [isSubscriptionModalOpen, setSubscriptionModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [submissionConfirmation, setSubmissionConfirmation] = useState('');
  const [platformFilter, setPlatformFilter] = useState<SocialPlatform | 'All'>('All');
  const [sortOrder, setSortOrder] = useState<'Highest Payout' | 'Lowest Payout'>('Highest Payout');

  const STREAK_GOAL = 5;
  const STREAK_BONUS_XP = 50;

  const engagerUser = currentUser as Engager;
  if (!engagerUser) return null; // or a loading spinner

  const handleWithdrawalSubmit = (details: Omit<WithdrawalRequest, 'id' | 'userId' | 'status' | 'requestedAt'>) => {
      const newRequest: WithdrawalRequest = {
          ...details, id: `wr-${Date.now()}`, userId: engagerUser.id, status: 'Pending', requestedAt: new Date().toISOString()
      };
      setWithdrawalRequests(prev => [newRequest, ...prev]);
      alert('Withdrawal request submitted successfully!');
      setWithdrawalModalOpen(false);
  };
  
  const handleTaskSubmit = (task: Task) => {
      const updatedUser = { ...engagerUser };
      updatedUser.taskStreak = (updatedUser.taskStreak || 0) + 1;
      let bonusMessage = '';

      if (updatedUser.taskStreak >= STREAK_GOAL) {
          updatedUser.xp += STREAK_BONUS_XP;
          updatedUser.level = Math.floor(updatedUser.xp / 100) + 1;
          updatedUser.taskStreak = 0; // Reset streak
          bonusMessage = ` Streak Bonus! +${STREAK_BONUS_XP} XP!`;
      }
      updateUser(updatedUser);

      const newSubmission: Submission = {
          id: `sub-${Date.now()}`, taskId: task.id, taskDescription: task.description, userId: engagerUser.id,
          screenshotUrl: 'https://picsum.photos/seed/newsub/300/200', status: 'Pending', submittedAt: new Date().toISOString()
      };
      setSubmissions(prev => [newSubmission, ...prev]);
      setSubmissionConfirmation(`Your submission for "${task.description}" is pending review.${bonusMessage}`);
      setTimeout(() => setSubmissionConfirmation(''), 5000);
  };
  
  const handleSubscriptionSubmit = () => {
    submitPayment();
    setSubscriptionModalOpen(false);
  };

  const filteredTasks = useMemo(() => {
    return tasks
      .filter(task => platformFilter === 'All' || task.platform === platformFilter)
      .filter(task => task.description.toLowerCase().includes(searchQuery.toLowerCase()))
      .sort((a, b) => {
          if(sortOrder === 'Highest Payout') {
              return b.payout - a.payout;
          }
          return a.payout - b.payout;
      });
  }, [tasks, searchQuery, platformFilter, sortOrder]);

  return (
    <div className="space-y-8 animate-fade-in">
      {isWithdrawalModalOpen && <WithdrawalModal isOpen={isWithdrawalModalOpen} onClose={() => setWithdrawalModalOpen(false)} balance={engagerUser.earnings} onSubmit={handleWithdrawalSubmit} />}
      {isSubscriptionModalOpen && <SubscriptionModal onPaymentSubmitted={handleSubscriptionSubmit} onClose={() => setSubscriptionModalOpen(false)} isPending={!!engagerUser.subscriptionPaymentPending} />}
      
      <h1 className="text-3xl font-bold font-display">Welcome back, {engagerUser.name.split(' ')[0]}!</h1>
      
      {announcements.length > 0 && (
           <section className="bg-primary-50 dark:bg-primary-950 p-4 rounded-xl border border-primary-200 dark:border-primary-800">
              <h2 className="text-xl font-bold mb-2 flex items-center space-x-2 text-primary-800 dark:text-primary-200"><MegaphoneIcon className="w-6 h-6"/><span>Admin Announcements</span></h2>
              {announcements.map(ann => (
                  <div key={ann.id} className="p-3 bg-white dark:bg-gray-900 rounded-lg shadow-sm">
                      <h3 className="font-semibold text-gray-800 dark:text-gray-200">{ann.title}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{ann.content}</p>
                  </div>
              ))}
          </section>
      )}

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Wallet onWithdraw={() => setWithdrawalModalOpen(true)} balance={engagerUser.earnings} />
          <GamificationStats xp={engagerUser.xp} level={engagerUser.level} />
          <StreakTracker currentStreak={engagerUser.taskStreak || 0} goal={STREAK_GOAL} />
      </section>
      
      <section>
        <h2 className="text-2xl font-bold font-display mb-4">Task Marketplace</h2>
        
        {!engagerUser.isSubscribed ? (
            <SubscriptionGate onOpenModal={() => setSubscriptionModalOpen(true)} isPending={!!engagerUser.subscriptionPaymentPending} />
        ) : (
            <>
                {submissionConfirmation && (
                    <div className="bg-green-100 dark:bg-green-900/50 border border-green-200 dark:border-green-700 text-green-700 dark:text-green-300 px-4 py-3 rounded-lg relative mb-4 flex justify-between items-center" role="alert">
                        <div>
                            <strong className="font-bold">Success! </strong>
                            <span className="block sm:inline">{submissionConfirmation}</span>
                        </div>
                        <button onClick={() => setSubmissionConfirmation('')} className="p-1 rounded-full hover:bg-green-200 dark:hover:bg-green-800">
                            <CloseIcon className="w-5 h-5" />
                        </button>
                    </div>
                )}

                <div className="relative mb-6">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <SearchIcon className="w-5 h-5 text-gray-400" />
                  </div>
                  <input
                      type="text"
                      placeholder="Search for tasks by keyword..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 rounded-full py-3 pl-12 pr-4 focus:ring-primary-500 focus:border-primary-500 shadow-sm"
                  />
                </div>
                 <div className="flex flex-wrap items-center gap-4 mb-6">
                    <div className="flex items-center space-x-2">
                      <label className="text-sm font-semibold">Filter by:</label>
                      <select value={platformFilter} onChange={e => setPlatformFilter(e.target.value as SocialPlatform | 'All')} className="bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 rounded-md py-2 px-3 text-sm focus:ring-primary-500 focus:border-primary-500 shadow-sm">
                        <option value="All">All Platforms</option>
                        {Object.values(SocialPlatform).map(p => <option key={p} value={p}>{p}</option>)}
                      </select>
                    </div>
                     <div className="flex items-center space-x-2">
                      <label className="text-sm font-semibold">Sort by:</label>
                      <select value={sortOrder} onChange={e => setSortOrder(e.target.value as 'Highest Payout' | 'Lowest Payout')} className="bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 rounded-md py-2 px-3 text-sm focus:ring-primary-500 focus:border-primary-500 shadow-sm">
                        <option>Highest Payout</option>
                        <option>Lowest Payout</option>
                      </select>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredTasks.length > 0 ? (
                    filteredTasks.map(task => (
                        <TaskCard key={task.id} task={task} onSubmit={() => handleTaskSubmit(task)} />
                    ))
                    ) : (
                    <div className="md:col-span-2 lg:col-span-3 text-center py-12 bg-white dark:bg-gray-900 rounded-2xl shadow-sm">
                        <p className="text-gray-500 dark:text-gray-400">No tasks found matching your criteria.</p>
                    </div>
                  )}
                </div>
            </>
        )}
      </section>
      <section>
          <Leaderboard />
      </section>
    </div>
  );
};

export default EngagerDashboard;
