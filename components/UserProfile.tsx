import React, { useState, useRef } from 'react';
import { UserRole, Engager, Campaign, Badge, User, Creator } from '../types';
import { MOCK_BADGES, MOCK_CAMPAIGNS, PLATFORM_ICONS } from '../constants';
import { ArrowLeftIcon, CheckCircleIcon, DollarSignIcon, BarChartIcon, TrendingUpIcon, TrophyIcon, UploadIcon, ShareIcon, CopyIcon, StarIcon } from './icons';

interface UserProfileProps {
    currentUser: User | null;
    onNavigateBack: () => void;
    onUpdateUser: (updatedUser: User) => void;
    users: Record<string, User>; // Pass all users to find referral data
}

// Reusable components
const GamificationStats: React.FC<{xp: number, level: number, name: string}> = ({ xp, level, name }) => {
    const xpForCurrentLevel = (level - 1) * 100;
    const xpForNextLevel = level * 100;
    const currentLevelXp = xp - xpForCurrentLevel;
    const requiredXpForNextLevel = 100;
    const progress = (currentLevelXp / requiredXpForNextLevel) * 100;

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold">Your Progress</h3>
                <span className="font-bold text-lg bg-primary-100 dark:bg-primary-900/50 text-primary-600 dark:text-primary-300 px-3 py-1 rounded-full flex items-center space-x-1">
                    <StarIcon className="w-4 h-4" />
                    <span>Level {level}</span>
                </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 mb-2 relative">
                <div className="bg-gradient-to-r from-primary-400 to-primary-600 h-4 rounded-full" style={{ width: `${progress}%` }}></div>
                <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white drop-shadow-sm">{currentLevelXp} / {requiredXpForNextLevel} XP</span>
            </div>
            <p className="text-sm text-center text-gray-500 dark:text-gray-400">
                You are doing great, {name}! Only <span className="font-bold">{requiredXpForNextLevel - currentLevelXp} XP</span> to the next level.
            </p>
        </div>
    )
};

const StatCard: React.FC<{ icon: React.ElementType, label: string, value: string | number, color: string }> = ({ icon: Icon, label, value, color }) => (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md flex items-center space-x-4">
        <div className={`p-3 rounded-full ${color}`}>
            <Icon className="h-6 w-6 text-white" />
        </div>
        <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">{value}</p>
        </div>
    </div>
);

const BadgeCard: React.FC<{ badge: Badge }> = ({ badge }) => (
     <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md flex flex-col items-center justify-center text-center">
        <div className={`p-3 mb-2 rounded-full bg-gray-100 dark:bg-gray-700 ${badge.color}`}>
            <badge.icon className="w-8 h-8" />
        </div>
        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">{badge.name}</p>
    </div>
);

const CampaignCard: React.FC<{ campaign: Campaign }> = ({ campaign }) => {
    const progress = (campaign.completedTasks / campaign.totalTasks) * 100;
    const PlatformIcon = PLATFORM_ICONS[campaign.platform];

    const getStatusChipStyle = (status: string) => {
        switch (status) {
            case 'Active': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
            case 'Paused': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
            case 'Completed': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
            default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
        }
    };
    
    return (
        <div className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200">
            <div className="flex justify-between items-start">
                <div>
                    <div className="flex items-center space-x-2 mb-2">
                        <PlatformIcon className="w-5 h-5 text-gray-500" />
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">{campaign.name}</h3>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{campaign.engagementType} on {campaign.platform}</p>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusChipStyle(campaign.status)}`}>{campaign.status}</span>
            </div>
            <div className="mt-4">
                <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 mb-1">
                    <span>Progress</span>
                    <span>{campaign.completedTasks.toLocaleString()} / {campaign.totalTasks.toLocaleString()} Engagers</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                    <div className="bg-primary-600 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
                </div>
            </div>
        </div>
    );
};


const EngagerProfile: React.FC<{ currentUser: Engager, onUpdateUser: (updatedUser: User) => void; }> = ({ currentUser, onUpdateUser }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [copied, setCopied] = useState(false);
    const referralLink = `https://engagepay.app/ref/${currentUser.referralCode}`;
    const [accountNumber, setAccountNumber] = useState(currentUser?.accountNumber || '');
    const [phoneNumber, setPhoneNumber] = useState(currentUser?.phoneNumber || '');
    const [successMessage, setSuccessMessage] = useState('');

    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const newAvatarUrl = e.target?.result as string;
                onUpdateUser({ ...currentUser, avatar: newAvatarUrl });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(referralLink).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };
    
    const handleSaveDetails = () => {
      onUpdateUser({ ...currentUser, accountNumber, phoneNumber });
      setSuccessMessage('Details saved successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    };

    return (
        <div className="space-y-8">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">
                 <div className="relative group">
                    <img src={currentUser.avatar} alt={currentUser.name} className="w-24 h-24 rounded-full border-4 border-primary-500" />
                    <button onClick={handleAvatarClick} className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 flex items-center justify-center rounded-full transition-opacity">
                        <UploadIcon className="w-8 h-8 text-white opacity-0 group-hover:opacity-100" />
                    </button>
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                </div>
                <div>
                    <div className="flex items-center justify-center sm:justify-start space-x-2">
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{currentUser.name}</h2>
                        {/* Fix: Replaced `title` prop with a `<title>` child element for SVG accessibility. */}
                        {currentUser.isVerified && <CheckCircleIcon className="w-6 h-6 text-blue-500"><title>Verified User</title></CheckCircleIcon>}
                    </div>
                    <p className="text-gray-500 dark:text-gray-400 text-center sm:text-left">Top Engager - Level {currentUser.level}</p>
                </div>
            </div>
            
            <section>
                <GamificationStats xp={currentUser.xp} level={currentUser.level} name={currentUser.name} />
            </section>

            <section>
                <h3 className="text-xl font-bold mb-4">Statistics</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <StatCard icon={DollarSignIcon} label="Total Earnings" value={`$${currentUser.earnings.toFixed(2)}`} color="bg-green-500" />
                    <StatCard icon={BarChartIcon} label="Tasks Completed" value={342} color="bg-blue-500" />
                    <StatCard icon={TrophyIcon} label="Current Rank" value={`#${currentUser.rank}`} color="bg-yellow-500" />
                </div>
            </section>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <section>
                    <h3 className="text-xl font-bold mb-4 flex items-center space-x-2">
                        <ShareIcon className="w-6 h-6" />
                        <span>Referral Program</span>
                    </h3>
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md h-full">
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Invite friends and earn 5% of their lifetime earnings!</p>
                        <div className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-700 rounded-lg p-2">
                            <input type="text" readOnly value={referralLink} className="flex-grow bg-transparent outline-none text-gray-700 dark:text-gray-300" />
                            <button onClick={handleCopy} className="bg-primary-600 text-white px-4 py-2 rounded-md text-sm font-semibold hover:bg-primary-700 transition-colors w-24">
                               {copied ? 'Copied!' : 'Copy'}
                            </button>
                        </div>
                    </div>
                </section>
                 <section>
                    <h3 className="text-xl font-bold mb-4">Payout Details</h3>
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md space-y-4 h-full">
                        {successMessage && <div className="bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 text-sm font-semibold p-3 rounded-lg">{successMessage}</div>}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Account Number</label>
                            <input type="text" placeholder="Enter your bank account number" value={accountNumber} onChange={e => setAccountNumber(e.target.value)} className="mt-1 block w-full bg-gray-100 dark:bg-gray-700 border-transparent rounded-md p-2 focus:ring-primary-500 focus:border-primary-500" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Phone Number</label>
                            <input type="tel" placeholder="Enter your phone number" value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} className="mt-1 block w-full bg-gray-100 dark:bg-gray-700 border-transparent rounded-md p-2 focus:ring-primary-500 focus:border-primary-500" />
                        </div>
                         <button onClick={handleSaveDetails} className="w-full bg-primary-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors duration-200">
                            Save Details
                        </button>
                    </div>
                </section>
            </div>

            <section>
                <h3 className="text-xl font-bold mb-4">My Referrals</h3>
                <div className="bg-white dark:bg-gray-800 p-2 rounded-lg shadow-md">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-700/50">
                                <tr>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">User</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status</th>
                                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Earnings Generated</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {currentUser.referrals.length > 0 ? currentUser.referrals.map(ref => (
                                    <tr key={ref.id}>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm flex items-center">
                                            <img src={ref.avatar} alt={ref.name} className="w-8 h-8 rounded-full mr-3" />
                                            <span className="font-medium text-gray-900 dark:text-white">{ref.name}</span>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${ref.status === 'Active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'}`}>
                                                {ref.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-right font-semibold text-primary-500">${ref.earningsGenerated.toFixed(2)}</td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={3} className="text-center py-4 text-sm text-gray-500 dark:text-gray-400">You haven't referred anyone yet.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>

            <section>
                <h3 className="text-xl font-bold mb-4">My Badges</h3>
                 <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {MOCK_BADGES.map(badge => <BadgeCard key={badge.name} badge={badge} />)}
                </div>
            </section>
        </div>
    );
};

const CreatorProfile: React.FC<{ currentUser: Creator, onUpdateUser: (updatedUser: User) => void; }> = ({ currentUser, onUpdateUser }) => {
     const fileInputRef = useRef<HTMLInputElement>(null);

    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const newAvatarUrl = e.target?.result as string;
                onUpdateUser({ ...currentUser, avatar: newAvatarUrl });
            };
            reader.readAsDataURL(file);
        }
    };
    
    return (
     <div className="space-y-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">
             <div className="relative group">
                    <img src={currentUser.avatar} alt={currentUser.name} className="w-24 h-24 rounded-full border-4 border-primary-500" />
                    <button onClick={handleAvatarClick} className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 flex items-center justify-center rounded-full transition-opacity">
                        <UploadIcon className="w-8 h-8 text-white opacity-0 group-hover:opacity-100" />
                    </button>
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                </div>
            <div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white text-center sm:text-left">{currentUser.name}</h2>
                <p className="text-gray-500 dark:text-gray-400 text-center sm:text-left">Brand Creator</p>
            </div>
        </div>

        <section>
            <h3 className="text-xl font-bold mb-4">Overall Analytics</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard icon={DollarSignIcon} label="Total Spend" value={`$${currentUser.transactions.filter(t=>t.type==='campaign').reduce((acc, t) => acc + Math.abs(t.amount), 0).toLocaleString()}`} color="bg-green-500" />
                <StatCard icon={TrendingUpIcon} label="Total Engagements" value="17,220" color="bg-blue-500" />
                <StatCard icon={BarChartIcon} label="Active Campaigns" value="2" color="bg-purple-500" />
            </div>
        </section>

        <section>
            <h3 className="text-xl font-bold mb-4">My Campaigns</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {MOCK_CAMPAIGNS.map(campaign => (
                    <CampaignCard key={campaign.id} campaign={campaign} />
                ))}
            </div>
        </section>
    </div>
    );
}

const UserProfile: React.FC<UserProfileProps> = ({ currentUser, onNavigateBack, onUpdateUser }) => {
    if (!currentUser) {
        return (
             <div>
                <div className="mb-6">
                    <button onClick={onNavigateBack} className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white font-semibold">
                        <ArrowLeftIcon className="w-5 h-5" />
                        <span>Back to Dashboard</span>
                    </button>
                </div>
                <p>Please log in to view your profile.</p>
            </div>
        )
    }

    const renderProfile = () => {
        switch(currentUser.role) {
            case UserRole.Engager:
                return <EngagerProfile currentUser={currentUser as Engager} onUpdateUser={onUpdateUser} />;
            case UserRole.Creator:
            case UserRole.Admin:
                 return <CreatorProfile currentUser={currentUser as Creator} onUpdateUser={onUpdateUser} />;
            default:
                return null;
        }
    };
    
    return (
        <div>
            <div className="mb-6">
                 <button onClick={onNavigateBack} className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white font-semibold">
                    <ArrowLeftIcon className="w-5 h-5" />
                    <span>Back to Dashboard</span>
                </button>
            </div>
            {renderProfile()}
        </div>
    );
};

export default UserProfile;