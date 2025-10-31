// Fix: Added React import to resolve 'Cannot find namespace 'React'' error.
import React from 'react';

export enum UserRole {
  Creator = 'Creator',
  Engager = 'Engager',
  Admin = 'Admin',
}

// Base User Interface
export interface BaseUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar: string;
}

// Specific User Types
export interface Creator extends BaseUser {
  role: UserRole.Creator | UserRole.Admin; // Admin can also be a creator
  walletBalance: number;
  transactions: Transaction[];
}

export interface Engager extends BaseUser {
  role: UserRole.Engager;
  isSubscribed: boolean;
  subscriptionPaymentPending?: boolean;
  referralCode: string;
  referrals: Referral[];
  earnings: number;
  rank: number;
  xp: number;
  level: number;
  accountNumber?: string;
  phoneNumber?: string;
  isVerified: boolean;
}

// Union type for any user
export type User = Creator | Engager;

export enum SocialPlatform {
  Instagram = 'Instagram',
  YouTube = 'YouTube',
  TikTok = 'TikTok',
  Facebook = 'Facebook',
  Twitter = 'Twitter',
  LinkedIn = 'LinkedIn',
}

export enum EngagementType {
  Like = 'Like',
  Follow = 'Follow',
  Comment = 'Comment',
  View = 'View',
  Share = 'Share',
}

export interface Campaign {
  id: string;
  creatorId: string;
  name: string;
  platform: SocialPlatform;
  engagementType: EngagementType;
  budget: number;
  completedTasks: number;
  totalTasks: number;
  status: 'Active' | 'Paused' | 'Completed';
}

export interface Task {
  id: string;
  platform: SocialPlatform;
  engagementType: EngagementType;
  payout: number;
  description: string;
  link: string; // New: Link to the social media post
}

export interface Submission {
    id: string;
    taskId: string;
    taskDescription: string;
    userId: string; // Changed from user object to user ID
    screenshotUrl: string;
    status: 'Pending' | 'Approved' | 'Rejected';
    submittedAt: string;
}

export interface WithdrawalRequest {
  id: string;
  userId: string; // Changed from user object to user ID
  amount: number;
  bankCountry: string;
  bankName: string;
  accountNumber: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  requestedAt: string;
}

export interface Announcement {
    id: string;
    title: string;
    content: string;
    createdAt: string;
    author: string;
}

export interface Referral {
  id: string;
  name: string;
  avatar: string;
  status: 'Pending' | 'Active';
  earningsGenerated: number;
}

export interface Transaction {
    id: string;
    type: 'deposit' | 'campaign';
    description: string;
    amount: number; // Positive for deposit, negative for campaign
    date: string;
}

export interface Badge {
  name:string;
  icon: React.ElementType;
  color: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  grounding?: { uri: string; title: string }[];
}

export interface Notification {
    id: string;
    userId: string;
    message: string;
    read: boolean;
    createdAt: string;
}