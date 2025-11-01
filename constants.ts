// Fix: Added React import to resolve 'Cannot find namespace 'React'' error.
import React from 'react';
import { Campaign, Task, Engager, Badge, SocialPlatform, EngagementType, Submission, WithdrawalRequest, Announcement, Referral, User, UserRole, Creator, Transaction, DepositRequest } from './types';
import { InstagramIcon, TikTokIcon, YouTubeIcon, TwitterIcon, StarIcon, TrophyIcon, TrendingUpIcon, FlameIcon, CommentIcon } from './components/icons';

const MOCK_REFERRALS_1: Referral[] = [
    { id: 'r1', name: 'NewbieNick', avatar: 'https://i.pravatar.cc/40?u=r1', status: 'Active', earningsGenerated: 15.50 },
    { id: 'r2', name: 'TrialTom', avatar: 'https://i.pravatar.cc/40?u=r2', status: 'Pending', earningsGenerated: 0.00 },
];

const MOCK_REFERRALS_2: Referral[] = [
    { id: 'r3', name: 'UserJane', avatar: 'https://i.pravatar.cc/40?u=r3', status: 'Active', earningsGenerated: 8.75 },
];

const MOCK_TRANSACTIONS_1: Transaction[] = [
    { id: 'txn1', type: 'deposit', description: 'Initial Funding', amount: 2500, date: '2023-10-20T10:00:00Z' },
    { id: 'txn2', type: 'campaign', description: 'Summer Collection Launch', amount: -500, date: '2023-10-21T11:30:00Z' },
    { id: 'txn3', type: 'campaign', description: 'New Gaming Channel', amount: -1000, date: '2023-10-22T15:00:00Z' },
    { id: 'txn4', type: 'campaign', description: 'Viral Dance Challenge', amount: -750, date: '2023-10-23T09:00:00Z' },
    { id: 'txn5', type: 'campaign', description: 'Tech Product Review', amount: -300, date: '2023-10-24T18:00:00Z' },
];

export const MOCK_USERS: Record<string, User> = {
    'admin01': {
        id: 'admin01', email: 'emmanuelerog@gmail.com', name: 'Admin', role: UserRole.Admin, avatar: 'https://i.pravatar.cc/40?u=admin',
        walletBalance: 0, transactions: []
    } as Creator,
    'creator01': {
        id: 'creator01', email: 'brand@example.com', name: 'BrandCorp', role: UserRole.Creator, avatar: 'https://i.pravatar.cc/40?u=creator1',
        walletBalance: 2500 - 500 - 1000 - 750 - 300, transactions: MOCK_TRANSACTIONS_1,
        socialLinks: {
            instagram: 'https://instagram.com/brandcorp',
            twitter: 'https://twitter.com/brandcorp',
        }
    } as Creator,
    'engager01': { 
        id: 'engager01', name: 'CryptoKing', email: 'crypto@king.com', avatar: 'https://i.pravatar.cc/40?u=1', role: UserRole.Engager,
        earnings: 125.50, rank: 1, accountNumber: '...1234', phoneNumber: '...5678', isVerified: true, 
        isSubscribed: true, subscriptionPaymentPending: false, referralCode: 'CRYP70K1NG', referrals: MOCK_REFERRALS_1,
        xp: 550, level: 6, taskStreak: 2,
        socialLinks: {
            twitter: 'https://twitter.com/cryptoking',
            linkedin: 'https://linkedin.com/in/cryptoking'
        }
    } as Engager,
    'engager02': { 
        id: 'engager02', name: 'TaskMaster', email: 'task@master.com', avatar: 'https://i.pravatar.cc/40?u=2', role: UserRole.Engager,
        earnings: 119.20, rank: 2, accountNumber: '...5678', phoneNumber: '...1234', isVerified: true, 
        isSubscribed: true, subscriptionPaymentPending: false, referralCode: 'MAST3R22', referrals: MOCK_REFERRALS_2,
        xp: 480, level: 5, taskStreak: 4,
        socialLinks: {
            instagram: 'https://instagram.com/taskmaster'
        }
    } as Engager,
    'engager03': { 
        id: 'engager03', name: 'EngagePro', email: 'engage@pro.com', avatar: 'https://i.pravatar.cc/40?u=3', role: UserRole.Engager,
        earnings: 115.80, rank: 3, accountNumber: '...9012', phoneNumber: '...3456', isVerified: false, 
        isSubscribed: false, subscriptionPaymentPending: true, referralCode: 'PR0ENGAGE', referrals: [],
        xp: 120, level: 2, taskStreak: 0
    } as Engager,
    'engager04': { 
        id: 'engager04', name: 'SocialWhiz', email: 'social@whiz.com', avatar: 'https://i.pravatar.cc/40?u=4', role: UserRole.Engager,
        earnings: 98.00, rank: 4, accountNumber: '...3456', phoneNumber: '...7890', isVerified: true, 
        isSubscribed: false, subscriptionPaymentPending: false, referralCode: 'WHIZKID4', referrals: [],
        xp: 90, level: 1, taskStreak: 1
    } as Engager,
    'engager05': { 
        id: 'engager05', name: 'PointCollector', email: 'point@collector.com', avatar: 'https://i.pravatar.cc/40?u=5', role: UserRole.Engager,
        earnings: 92.60, rank: 5, accountNumber: '...7890', phoneNumber: '...2345', isVerified: false, 
        isSubscribed: true, subscriptionPaymentPending: false, referralCode: 'P01NT5', referrals: [],
        xp: 210, level: 3, taskStreak: 0
    } as Engager,
};

export const MOCK_LEADERBOARD: Engager[] = Object.values(MOCK_USERS).filter(u => u.role === UserRole.Engager) as Engager[];

export const MOCK_CAMPAIGNS: Campaign[] = [
  { id: '1', creatorId: 'creator01', creatorName: 'BrandCorp', creatorAvatar: 'https://i.pravatar.cc/40?u=creator1', name: 'Summer Collection Launch', platform: SocialPlatform.Instagram, engagementType: EngagementType.Like, budget: 500, completedTasks: 1250, totalTasks: 2500, status: 'Active', link: 'https://instagram.com/p/12345' },
  { id: '2', creatorId: 'creator01', creatorName: 'BrandCorp', creatorAvatar: 'https://i.pravatar.cc/40?u=creator1', name: 'New Gaming Channel', platform: SocialPlatform.YouTube, engagementType: EngagementType.Follow, budget: 1000, completedTasks: 850, totalTasks: 1000, status: 'Active', link: 'https://youtube.com/c/PixelPlayhouse' },
  { id: '3', creatorId: 'creator01', creatorName: 'BrandCorp', creatorAvatar: 'https://i.pravatar.cc/40?u=creator1', name: 'Viral Dance Challenge', platform: SocialPlatform.TikTok, engagementType: EngagementType.Share, budget: 750, completedTasks: 15000, totalTasks: 15000, status: 'Completed', link: 'https://tiktok.com/v/67890' },
  { id: '4', creatorId: 'creator01', creatorName: 'BrandCorp', creatorAvatar: 'https://i.pravatar.cc/40?u=creator1', name: 'Tech Product Review', platform: SocialPlatform.Twitter, engagementType: EngagementType.Comment, budget: 300, completedTasks: 120, totalTasks: 600, status: 'Paused', link: 'https://twitter.com/TechGuru/status/54321' },
];

export const MOCK_TASKS: Task[] = [
  { id: 't1', campaignId: '1', platform: SocialPlatform.Instagram, engagementType: EngagementType.Like, payout: 0.05, description: "Like @StyleMaven's latest post about their summer collection.", link: 'https://instagram.com/p/12345' },
  { id: 't2', campaignId: '2', platform: SocialPlatform.YouTube, engagementType: EngagementType.Follow, payout: 0.15, description: "Subscribe to 'PixelPlayhouse' gaming channel.", link: 'https://youtube.com/c/PixelPlayhouse' },
  { id: 't3', campaignId: '3', platform: SocialPlatform.TikTok, engagementType: EngagementType.View, payout: 0.02, description: "Watch the full #GrooveMaster challenge video.", link: 'https://tiktok.com/v/67890' },
  { id: 't4', campaignId: '4', platform: SocialPlatform.Twitter, engagementType: EngagementType.Comment, payout: 0.10, description: "Reply to @TechGuru's latest tweet with a thoughtful question.", link: 'https://twitter.com/TechGuru/status/54321' },
  { id: 't5', campaignId: '1', platform: SocialPlatform.Instagram, engagementType: EngagementType.Follow, payout: 0.12, description: "Follow @TravelScapes for amazing travel photos.", link: 'https://instagram.com/TravelScapes' },
  { id: 't6', campaignId: '2', platform: SocialPlatform.YouTube, engagementType: EngagementType.Share, payout: 0.20, description: "Share the latest 'LearnCode' tutorial on your story.", link: 'https://youtube.com/watch?v=abcdef' },
];

export const MOCK_SUBMISSIONS: Submission[] = [
    { id: 's1', taskId: 't1', taskDescription: "Like @StyleMaven's post", userId: 'engager03', screenshotUrl: 'https://picsum.photos/seed/s1/300/200', status: 'Pending', submittedAt: '2023-10-27T10:00:00Z' },
    { id: 's2', taskId: 't4', taskDescription: "Reply to @TechGuru's tweet", userId: 'engager05', screenshotUrl: 'https://picsum.photos/seed/s2/300/200', status: 'Pending', submittedAt: '2023-10-27T10:05:00Z' },
    { id: 's3', taskId: 't2', taskDescription: "Subscribe to 'PixelPlayhouse'", userId: 'engager01', screenshotUrl: 'https://picsum.photos/seed/s3/300/200', status: 'Approved', submittedAt: '2023-10-26T15:30:00Z' },
];

export const MOCK_DEPOSIT_REQUESTS: DepositRequest[] = [
    { id: 'd1', userId: 'creator01', amount: 500, paymentMethod: 'Bank Transfer', status: 'Pending', requestedAt: '2023-10-29T11:00:00Z' },
];

export const MOCK_WITHDRAWAL_REQUESTS: WithdrawalRequest[] = [
    { id: 'w1', userId: 'engager01', amount: 50.00, bankCountry: 'United States', bankName: 'Bank of America', accountNumber: '...1234', status: 'Pending', requestedAt: '2023-10-28T09:00:00Z' },
    { id: 'w2', userId: 'engager02', amount: 75.50, bankCountry: 'Canada', bankName: 'TD Bank', accountNumber: '...5678', status: 'Approved', requestedAt: '2023-10-27T14:00:00Z' },
];

export const MOCK_ANNOUNCEMENTS: Announcement[] = [
    { id: 'a1', title: 'Platform Maintenance', content: 'We will be undergoing scheduled maintenance on Sunday from 2 AM to 4 AM UTC.', createdAt: '2023-10-25T12:00:00Z', author: 'Admin' },
];


export const MOCK_BADGES: Badge[] = [
    { name: 'Top Earner', icon: TrophyIcon, color: 'text-yellow-400', description: 'Earn over $100 in total.', hasBadge: (user: Engager) => user.earnings > 100 },
    { name: 'Level 5+ Engager', icon: TrendingUpIcon, color: 'text-green-400', description: 'Reach level 5 or higher.', hasBadge: (user: Engager) => user.level >= 5 },
    { name: 'Hot Streak', icon: FlameIcon, color: 'text-orange-400', description: 'Maintain a task streak of 3 or more.', hasBadge: (user: Engager) => user.taskStreak >= 3 },
    { name: 'Referral King', icon: StarIcon, color: 'text-blue-400', description: 'Successfully refer 2 or more users.', hasBadge: (user: Engager) => user.referrals.length >= 2 },
    { name: 'Task Novice', icon: StarIcon, color: 'text-gray-400', description: 'Complete your first task.', hasBadge: (user: Engager) => user.xp > 0 },
    { name: 'Comment King', icon: CommentIcon, color: 'text-purple-400', description: 'Be among the top 3 engagers.', hasBadge: (user: Engager) => user.rank <= 3 },
];

export const PLATFORM_ICONS: Record<SocialPlatform, React.ElementType> = {
    [SocialPlatform.Instagram]: InstagramIcon,
    [SocialPlatform.YouTube]: YouTubeIcon,
    [SocialPlatform.TikTok]: TikTokIcon,
    [SocialPlatform.Twitter]: TwitterIcon,
    [SocialPlatform.Facebook]: () => null, // Add actual icon if needed
    [SocialPlatform.LinkedIn]: () => null, // Add actual icon if needed
};