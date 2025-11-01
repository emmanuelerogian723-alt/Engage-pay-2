import React, { useState, useRef } from 'react';
import { UserRole, Engager, Campaign, Badge, User, Creator, SocialLinks } from '../types';
import { MOCK_BADGES, MOCK_CAMPAIGNS, PLATFORM_ICONS } from '../constants';
import { ArrowLeftIcon, CheckCircleIcon, DollarSignIcon, BarChartIcon, TrendingUpIcon, TrophyIcon, UploadIcon, ShareIcon, CopyIcon, StarIcon, InstagramIcon, TwitterIcon, LinkedInIcon } from './icons';

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
        <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold font-display">Your Progress</h3>
                <span className="font-bold text-lg bg-primary-100 dark:bg-primary-950 text-primary-600 dark:text-primary-300 px-3 py-1 rounded-full flex items-center space-x-1 ring-1 ring-inset ring-primary-600/20">
                    <StarIcon className="w-4 h-4" />
                    <span>Level {level}</span>
                </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 mb-2 relative">
                <div className="bg-gradient-to-r from-primary-400 to-primary-600 h-4 rounded-full" style={{ width: `${progress}%` }}></div>
                <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white drop-shadow-sm">{currentLevelXp} / {requiredXpForNextLevel} XP</span>
            </div>
            <p className="text-sm text-center text-gray-500 dark:text-gray-400">
                Only <span className="font-bold">{requiredXpForNextLevel - currentLevelXp} XP</span> to the next level!
            </p>
        </div>
    )
};

const StatCard: React.FC<{ icon: React.ElementType, label: string, value: string | number, color: string }> = ({ icon: Icon, label, value, color }) => (
    <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl shadow-sm flex items-center space-x-4 border border-gray-200 dark:border-gray-800">
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
     <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl shadow-sm flex flex-col items-center justify-center text-center border border-gray-200 dark:border-gray-800" title={badge.description}>
        <div className={`p-3 mb-2 rounded-full bg-gray-100 dark:bg-gray-800 ${badge.color}`}>
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
            case 'Active': return 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300 ring-1 ring-inset ring-green-600/20';
            case 'Paused': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300 ring-1 ring-inset ring-yellow-600/20';
            case 'Completed': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300 ring-1 ring-inset ring-blue-600/20';
            default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700/50 dark:text-gray-200 ring-1 ring-inset ring-gray-500/20';
        }
    };
    
    return (
        <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl shadow-sm hover:shadow-lg transition-shadow duration-200 border border-gray-200 dark:border-gray-800">
            <div className="flex justify-between items-start">
                <div>
                    <div className="flex items-center space-x-2 mb-2">
                        <PlatformIcon className="w-5 h-5 text-gray-500" />
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">{campaign.name}</h3>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{campaign.engagementType} on {campaign.platform}</p>
                </div>
                <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${getStatusChipStyle(campaign.status)}`}>{campaign.status}</span>
            </div>
            <div className="mt-4">
                <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 mb-1">
                    <span>Progress</span>
                    <span>{campaign.completedTasks.toLocaleString()} / {campaign.totalTasks.toLocaleString()}</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div className="bg-primary-500 h-2 rounded-full" style={{ width: `${progress}%` }}></div>
                </div>
            </div>
        </div>
    );
};

const SocialLinksEdit: React.FC<{ currentUser: User, onUpdateUser: (updatedUser: User) => void; }> = ({ currentUser, onUpdateUser }) => {
    const [socials, setSocials] = useState<SocialLinks>(currentUser.socialLinks || {});
    const [successMessage, setSuccessMessage] = useState('');

    const handleSocialsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setSocials(prev => ({ ...prev, [name]: value }));
    };

    const handleSaveSocials = () => {
        onUpdateUser({ ...currentUser, socialLinks: socials });
        setSuccessMessage('Social links updated successfully!');
        setTimeout(() => setSuccessMessage(''), 3000);
    };

    const socialPlatforms = [
        { name: 'instagram', icon: InstagramIcon, placeholder: 'https://instagram.com/username' },
        { name: 'twitter', icon: TwitterIcon, placeholder: 'https://twitter.com/username' },
        { name: 'linkedin', icon: LinkedInIcon, placeholder: 'https://linkedin.com/in/username' },
    ];

    return (
        <section>
            <h3 className="text-xl font-bold font-display mb-4">Social Profiles</h3>
            <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm space-y-4 border border-gray-200 dark:border-gray-800">
                {successMessage && <div className="bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 text-sm font-semibold p-3 rounded-lg">{successMessage}</div>}
                {socialPlatforms.map(platform => (
                    <div key={platform.name}>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 capitalize flex items-center space-x-2">
                            <platform.icon className="w-5 h-5" />
                            <span>{platform.name}</span>
                        </label>
                        <input
                            type="text"
                            name={platform.name}
                            placeholder={platform.placeholder}
                            value={socials[platform.name as keyof SocialLinks] || ''}
                            onChange={handleSocialsChange}
                            className="mt-1 block w-full bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-700 rounded-md p-2 focus:ring-primary-500 focus:border-primary-500"
                        />
                    </div>
                ))}
                <button onClick={handleSaveSocials} className="w-full bg-primary-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors duration-200">
                    Save Socials
                </button>
            </div>
        </section>
    );
};


const EngagerProfile: React.FC<{ currentUser: Engager, onUpdateUser: (updatedUser: User) => void; }> = ({ currentUser, onUpdateUser }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [copied, setCopied] = useState(false);
    const referralLink = `https://erogiansocial.app/ref/${currentUser.referralCode}`;
    const [accountNumber, setAccountNumber] = useState(currentUser?.accountNumber || '');
    const [phoneNumber, setPhoneNumber] = useState(currentUser?.phoneNumber || '');
    const [successMessage, setSuccessMessage] = useState('');

    const handleAvatarClick = () => fileInputRef.current?.click();

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => onUpdateUser({ ...currentUser, avatar: e.target?.result as string });
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

    const earnedBadges = MOCK_BADGES.filter(badge => badge.hasBadge(currentUser));

    return (
        <div className="space-y-8">
            <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6 border border-gray-200 dark:border-gray-800">
                 <div className="relative group">
                    <img src={currentUser.avatar} alt={currentUser.name} className="w-24 h-24 rounded-full border-4 border-primary-500" />
                    <button onClick={handleAvatarClick} className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 flex items-center justify-center rounded-full transition-opacity">
                        <UploadIcon className="w-8 h-8 text-white opacity-0 group-hover:opacity-100" />
                    </button>
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                </div>
                <div>
                    <div className="flex items-center justify-center sm:justify-start space-x-2">
                        <h2 className="text-3xl font-bold font-display text-gray-900 dark:text-white">{currentUser.name}</h2>
                        {currentUser.isVerified && <CheckCircleIcon className="w-6 h-6 text-blue-500"><title>Verified User</title></CheckCircleIcon>}
                    </div>
                     <p className="text-gray-500 dark:text-gray-400 text-center sm:text-left">Top Engager - Level {currentUser.level}</p>
                    <div className="flex items-center space-x-3 mt-2 justify-center sm:justify-start">
                        {currentUser.socialLinks?.instagram && <a href={currentUser.socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-pink-500"><InstagramIcon className="w-6 h-6"/></a>}
                        {currentUser.socialLinks?.twitter && <a href={currentUser.socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-sky-500"><TwitterIcon className="w-6 h-6"/></a>}
                        {currentUser.socialLinks?.linkedin && <a href={currentUser.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-600"><LinkedInIcon className="w-6 h-6"/></a>}
                    </div>
                </div>
            </div>
            
            <section> <GamificationStats xp={currentUser.xp} level={currentUser.level} name={currentUser.name} /> </section>

            <section>
                <h3 className="text-xl font-bold font-display mb-4">Statistics</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <StatCard icon={DollarSignIcon} label="Total Earnings" value={`$${currentUser.earnings.toFixed(2)}`} color="bg-green-500" />
                    <StatCard icon={BarChartIcon} label="Tasks Completed" value={342} color="bg-blue-500" />
                    <StatCard icon={TrophyIcon} label="Current Rank" value={`#${currentUser.rank}`} color="bg-yellow-500" />
                </div>
            </section>
            
            <section>
                <h3 className="text-xl font-bold font-display mb-4">Achievements</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {earnedBadges.map(badge => (
                        <BadgeCard key={badge.name} badge={badge} />
                    ))}
                </div>
            </section>


             <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <section className="lg:col-span-1">
                    <h3 className="text-xl font-bold font-display mb-4">Payout Details</h3>
                    <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm space-y-4 h-full border border-gray-200 dark:border-gray-800">
                        {successMessage && <div className="bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 text-sm font-semibold p-3 rounded-lg">{successMessage}</div>}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Account Number</label>
                            <input type="text" placeholder="Enter bank account number" value={accountNumber} onChange={e => setAccountNumber(e.target.value)} className="mt-1 block w-full bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-700 rounded-md p-2 focus:ring-primary-500 focus:border-primary-500" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Phone Number</label>
                            <input type="tel" placeholder="Enter phone number" value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} className="mt-1 block w-full bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-700 rounded-md p-2 focus:ring-primary-500 focus:border-primary-500" />
                        </div>
                         <button onClick={handleSaveDetails} className="w-full bg-primary-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors duration-200">
                             Save Details
                         </button>
                    </div>
                </section>
                <section className="lg:col-span-2">
                    <h3 className="text-xl font-bold font-display mb-4">Referral Program</h3>
                    <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm space-y-4 h-full border border-gray-200 dark:border-gray-800">
                        <p className="text-sm text-gray-600 dark:text-gray-400">Share your referral link to earn a commission on every task your friends complete!</p>
                        <div className="relative">
                            <input type="text" readOnly value={referralLink} className="w-full bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-700 rounded-lg p-2 pr-12 text-sm" />
                            <button onClick={handleCopy} className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500 hover:text-primary-500">
                                {copied ? <CheckCircleIcon className="w-5 h-5 text-green-500" /> : <CopyIcon className="w-5 h-5" />}
                            </button>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-2">Your Referrals ({currentUser.referrals.length})</h4>
                            <ul className="space-y-2 max-h-24 overflow-y-auto">
                                {currentUser.referrals.map(ref => (
                                    <li key={ref.id} className="flex items-center justify-between text-sm">
                                        <div className="flex items-center space-x-2">
                                            <img src={ref.avatar} alt={ref.name} className="w-6 h-6 rounded-full" />
                                            <span>{ref.name}</span>
                                        </div>
                                        <span className={`font-semibold ${ref.status === 'Active' ? 'text-green-500' : 'text-gray-500'}`}>{ref.status}</span>
                                    </li>
                                ))}
                                {currentUser.referrals.length === 0 && <p className="text-xs text-gray-500">No referrals yet.</p>}
                            </ul>
                        </div>
                    </div>
                </section>
             </div>
             <SocialLinksEdit currentUser={currentUser} onUpdateUser={onUpdateUser} />
        </div>
    );
};

const CreatorProfile: React.FC<{ currentUser: Creator, onUpdateUser: (updatedUser: User) => void; }> = ({ currentUser, onUpdateUser }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleAvatarClick = () => fileInputRef.current?.click();

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => onUpdateUser({ ...currentUser, avatar: e.target?.result as string });
            reader.readAsDataURL(file);
        }
    };
    
    const userCampaigns = MOCK_CAMPAIGNS.filter(c => c.creatorId === currentUser.id);
    const totalSpend = currentUser.transactions.filter(t=>t.type==='campaign').reduce((acc, t) => acc + Math.abs(t.amount), 0);

    return (
        <div className="space-y-8">
            <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6 border border-gray-200 dark:border-gray-800">
                <div className="relative group">
                    <img src={currentUser.avatar} alt={currentUser.name} className="w-24 h-24 rounded-full border-4 border-primary-500" />
                    <button onClick={handleAvatarClick} className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 flex items-center justify-center rounded-full transition-opacity">
                        <UploadIcon className="w-8 h-8 text-white opacity-0 group-hover:opacity-100" />
                    </button>
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                </div>
                <div>
                    <h2 className="text-3xl font-bold font-display text-gray-900 dark:text-white text-center sm:text-left">{currentUser.name}</h2>
                    <p className="text-gray-500 dark:text-gray-400 text-center sm:text-left">Creator</p>
                    <div className="flex items-center space-x-3 mt-2 justify-center sm:justify-start">
                         {currentUser.socialLinks?.instagram && <a href={currentUser.socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-pink-500"><InstagramIcon className="w-6 h-6"/></a>}
                        {currentUser.socialLinks?.twitter && <a href={currentUser.socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-sky-500"><TwitterIcon className="w-6 h-6"/></a>}
                        {currentUser.socialLinks?.linkedin && <a href={currentUser.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-600"><LinkedInIcon className="w-6 h-6"/></a>}
                    </div>
                </div>
            </div>

            <section>
                <h3 className="text-xl font-bold font-display mb-4">Statistics</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <StatCard icon={DollarSignIcon} label="Wallet Balance" value={`$${currentUser.walletBalance.toFixed(2)}`} color="bg-green-500" />
                    <StatCard icon={TrendingUpIcon} label="Total Spend" value={`$${totalSpend.toLocaleString()}`} color="bg-purple-500" />
                    <StatCard icon={BarChartIcon} label="Active Campaigns" value={userCampaigns.filter(c => c.status === 'Active').length} color="bg-blue-500" />
                </div>
            </section>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <section className="lg:col-span-2">
                    <h3 className="text-xl font-bold font-display mb-4">My Campaigns</h3>
                    {userCampaigns.length > 0 ? (
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                            {userCampaigns.map(campaign => (
                                <CampaignCard key={campaign.id} campaign={campaign} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800">
                            <p className="text-gray-500 dark:text-gray-400">You haven't created any campaigns yet.</p>
                        </div>
                    )}
                </section>
                
                <div className="lg:col-span-1">
                    <SocialLinksEdit currentUser={currentUser} onUpdateUser={onUpdateUser} />
                </div>
            </div>
        </div>
    );
};

const UserProfile: React.FC<UserProfileProps> = ({ currentUser, onNavigateBack, onUpdateUser, users }) => {
    if (!currentUser) {
        return (
            <div className="text-center p-8">
                <p>No user selected.</p>
                <button onClick={onNavigateBack} className="mt-4 text-primary-600 hover:underline">Go Back</button>
            </div>
        );
    }
    
    const isEngager = currentUser.role === UserRole.Engager;

    return (
        <div className="space-y-8 animate-fade-in">
            <div>
                <button onClick={onNavigateBack} className="flex items-center space-x-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white font-semibold mb-4">
                    <ArrowLeftIcon className="w-5 h-5" />
                    <span>Back to Dashboard</span>
                </button>
            </div>

            {isEngager ? 
                <EngagerProfile currentUser={currentUser as Engager} onUpdateUser={onUpdateUser} /> :
                <CreatorProfile currentUser={currentUser as Creator} onUpdateUser={onUpdateUser} />
            }
        </div>
    );
};

export default UserProfile;