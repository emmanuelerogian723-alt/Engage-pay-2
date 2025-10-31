// Fix: Added React import to resolve 'Cannot find namespace 'React'' error.
import React from 'react';
import { Campaign, Task, Engager, Badge, SocialPlatform, EngagementType, Submission, WithdrawalRequest, Announcement, Referral, User, UserRole, Creator, Transaction } from './types';
import { InstagramIcon, TikTokIcon, YouTubeIcon, TwitterIcon, StarIcon, TrophyIcon, TrendingUpIcon } from './components/icons';

const MOCK_REFERRALS_1: Referral[] = [
    { id: 'r1', name: 'NewbieNick', avatar: 'https://picsum.photos/seed/r1/40/40', status: 'Active', earningsGenerated: 15.50 },
    { id: 'r2', name: 'TrialTom', avatar: 'https://picsum.photos/seed/r2/40/40', status: 'Pending', earningsGenerated: 0.00 },
];

const MOCK_REFERRALS_2: Referral[] = [
    { id: 'r3', name: 'UserJane', avatar: 'https://picsum.photos/seed/r3/40/40', status: 'Active', earningsGenerated: 8.75 },
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
        id: 'admin01', email: 'emmanuelerog@gmail.com', name: 'Admin', role: UserRole.Admin, avatar: 'https://picsum.photos/seed/admin/40/40',
        walletBalance: 0, transactions: []
    } as Creator,
    'creator01': {
        id: 'creator01', email: 'brand@example.com', name: 'BrandCorp', role: UserRole.Creator, avatar: 'https://picsum.photos/seed/creator1/40/40',
        walletBalance: 2500 - 500 - 1000 - 750 - 300, transactions: MOCK_TRANSACTIONS_1,
    } as Creator,
    'engager01': { 
        id: 'engager01', name: 'CryptoKing', email: 'crypto@king.com', avatar: 'https://picsum.photos/seed/1/40/40', role: UserRole.Engager,
        earnings: 125.50, rank: 1, accountNumber: '...1234', phoneNumber: '...5678', isVerified: true, 
        isSubscribed: true, subscriptionPaymentPending: false, referralCode: 'CRYP70K1NG', referrals: MOCK_REFERRALS_1,
        xp: 550, level: 6
    } as Engager,
    'engager02': { 
        id: 'engager02', name: 'TaskMaster', email: 'task@master.com', avatar: 'https://picsum.photos/seed/2/40/40', role: UserRole.Engager,
        earnings: 119.20, rank: 2, accountNumber: '...5678', phoneNumber: '...1234', isVerified: true, 
        isSubscribed: true, subscriptionPaymentPending: false, referralCode: 'MAST3R22', referrals: MOCK_REFERRALS_2,
        xp: 480, level: 5
    } as Engager,
    'engager03': { 
        id: 'engager03', name: 'EngagePro', email: 'engage@pro.com', avatar: 'https://picsum.photos/seed/3/40/40', role: UserRole.Engager,
        earnings: 115.80, rank: 3, accountNumber: '...9012', phoneNumber: '...3456', isVerified: false, 
        isSubscribed: false, subscriptionPaymentPending: true, referralCode: 'PR0ENGAGE', referrals: [],
        xp: 120, level: 2
    } as Engager,
    'engager04': { 
        id: 'engager04', name: 'SocialWhiz', email: 'social@whiz.com', avatar: 'https://picsum.photos/seed/4/40/40', role: UserRole.Engager,
        earnings: 98.00, rank: 4, accountNumber: '...3456', phoneNumber: '...7890', isVerified: true, 
        isSubscribed: false, subscriptionPaymentPending: false, referralCode: 'WHIZKID4', referrals: [],
        xp: 90, level: 1
    } as Engager,
    'engager05': { 
        id: 'engager05', name: 'PointCollector', email: 'point@collector.com', avatar: 'https://picsum.photos/seed/5/40/40', role: UserRole.Engager,
        earnings: 92.60, rank: 5, accountNumber: '...7890', phoneNumber: '...2345', isVerified: false, 
        isSubscribed: true, subscriptionPaymentPending: false, referralCode: 'P01NT5', referrals: [],
        xp: 210, level: 3
    } as Engager,
};

export const MOCK_LEADERBOARD: Engager[] = Object.values(MOCK_USERS).filter(u => u.role === UserRole.Engager) as Engager[];

export const MOCK_CAMPAIGNS: Campaign[] = [
  { id: '1', creatorId: 'creator01', name: 'Summer Collection Launch', platform: SocialPlatform.Instagram, engagementType: EngagementType.Like, budget: 500, completedTasks: 1250, totalTasks: 2500, status: 'Active' },
  { id: '2', creatorId: 'creator01', name: 'New Gaming Channel', platform: SocialPlatform.YouTube, engagementType: EngagementType.Follow, budget: 1000, completedTasks: 850, totalTasks: 1000, status: 'Active' },
  { id: '3', creatorId: 'creator01', name: 'Viral Dance Challenge', platform: SocialPlatform.TikTok, engagementType: EngagementType.Share, budget: 750, completedTasks: 15000, totalTasks: 15000, status: 'Completed' },
  { id: '4', creatorId: 'creator01', name: 'Tech Product Review', platform: SocialPlatform.Twitter, engagementType: EngagementType.Comment, budget: 300, completedTasks: 120, totalTasks: 600, status: 'Paused' },
];

export const MOCK_TASKS: Task[] = [
  { id: 't1', platform: SocialPlatform.Instagram, engagementType: EngagementType.Like, payout: 0.05, description: "Like @StyleMaven's latest post about their summer collection.", link: 'https://instagram.com/p/12345' },
  { id: 't2', platform: SocialPlatform.YouTube, engagementType: EngagementType.Follow, payout: 0.15, description: "Subscribe to 'PixelPlayhouse' gaming channel.", link: 'https://youtube.com/c/PixelPlayhouse' },
  { id: 't3', platform: SocialPlatform.TikTok, engagementType: EngagementType.View, payout: 0.02, description: "Watch the full #GrooveMaster challenge video.", link: 'https://tiktok.com/v/67890' },
  { id: 't4', platform: SocialPlatform.Twitter, engagementType: EngagementType.Comment, payout: 0.10, description: "Reply to @TechGuru's latest tweet with a thoughtful question.", link: 'https://twitter.com/TechGuru/status/54321' },
  { id: 't5', platform: SocialPlatform.Instagram, engagementType: EngagementType.Follow, payout: 0.12, description: "Follow @TravelScapes for amazing travel photos.", link: 'https://instagram.com/TravelScapes' },
  { id: 't6', platform: SocialPlatform.YouTube, engagementType: EngagementType.Share, payout: 0.20, description: "Share the latest 'LearnCode' tutorial on your story.", link: 'https://youtube.com/watch?v=abcdef' },
];

export const MOCK_SUBMISSIONS: Submission[] = [
    { id: 's1', taskId: 't1', taskDescription: "Like @StyleMaven's post", userId: 'engager03', screenshotUrl: 'https://picsum.photos/seed/s1/300/200', status: 'Pending', submittedAt: '2023-10-27T10:00:00Z' },
    { id: 's2', taskId: 't4', taskDescription: "Reply to @TechGuru's tweet", userId: 'engager05', screenshotUrl: 'https://picsum.photos/seed/s2/300/200', status: 'Pending', submittedAt: '2023-10-27T10:05:00Z' },
    { id: 's3', taskId: 't2', taskDescription: "Subscribe to 'PixelPlayhouse'", userId: 'engager01', screenshotUrl: 'https://picsum.photos/seed/s3/300/200', status: 'Approved', submittedAt: '2023-10-26T15:30:00Z' },
];

export const MOCK_WITHDRAWAL_REQUESTS: WithdrawalRequest[] = [
    { id: 'w1', userId: 'engager01', amount: 50.00, bankCountry: 'United States', bankName: 'Bank of America', accountNumber: '...1234', status: 'Pending', requestedAt: '2023-10-28T09:00:00Z' },
    { id: 'w2', userId: 'engager02', amount: 75.50, bankCountry: 'Canada', bankName: 'TD Bank', accountNumber: '...5678', status: 'Approved', requestedAt: '2023-10-27T14:00:00Z' },
];

export const MOCK_ANNOUNCEMENTS: Announcement[] = [
    { id: 'a1', title: 'Platform Maintenance', content: 'We will be undergoing scheduled maintenance on Sunday from 2 AM to 4 AM UTC.', createdAt: '2023-10-25T12:00:00Z', author: 'Admin' },
];


export const MOCK_BADGES: Badge[] = [
    { name: 'Top Earner', icon: TrophyIcon, color: 'text-yellow-400' },
    { name: 'Streak Master', icon: TrendingUpIcon, color: 'text-green-400' },
    { name: 'Super Sharer', icon: StarIcon, color: 'text-blue-400' },
    { name: 'Task Novice', icon: StarIcon, color: 'text-gray-400' },
    { name: 'Comment King', icon: StarIcon, color: 'text-purple-400' },
];

export const PLATFORM_ICONS: Record<SocialPlatform, React.ElementType> = {
    [SocialPlatform.Instagram]: InstagramIcon,
    [SocialPlatform.YouTube]: YouTubeIcon,
    [SocialPlatform.TikTok]: TikTokIcon,
    [SocialPlatform.Twitter]: TwitterIcon,
    [SocialPlatform.Facebook]: () => null, // Add actual icon if needed
    [SocialPlatform.LinkedIn]: () => null, // Add actual icon if needed
};