export enum Role {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  MEMBER = 'MEMBER',
  VIEWER = 'VIEWER',
}

export interface User {
  id: string;
  name: string;
  username: string;
  email?: string;
  role: Role;
  avatarUrl: string;
  password?: string;
  // New detailed profile fields
  fatherName?: string;
  course?: string;
  branch?: string;
  rollNumber?: string;
  year?: string;
  semester?: string;
  dob?: string; // Date of Birth
  is2FAEnabled?: boolean;
  is2FAVerified?: boolean; // Tracks if the first login post-2FA setup is done
  isConfirmed?: boolean; // For email confirmation
}

export interface Post {
  id:string;
  authorId: string;
  content: string;
  imageUrl?: string;
  createdAt: Date;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  imageUrl?: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  date: Date;
}

export interface Event {
  id: string;
  authorId: string;
  title: string;
  description: string;
  date: Date;
  imageUrl?: string;
  registrationLink: string;
}

export enum Page {
  HOME = 'HOME',
  ANNOUNCEMENTS = 'ANNOUNCEMENTS',
  ACHIEVEMENTS = 'ACHIEVEMENTS',
  EVENTS = 'EVENTS',
  ADMIN = 'ADMIN',
  PROFILE = 'PROFILE',
  DONATIONS = 'DONATIONS',
  CHAT = 'CHAT',
  AI_STUDIO = 'AI_STUDIO',
  HELP = 'HELP',
  ADMIN_CONTENT = 'ADMIN_CONTENT', // New page for managing slideshows and popups
}

export interface Badge {
    id: string;
    name: string;
    description: string;
    icon: string;
}

export interface UserBadge {
    userId: string;
    badgeId: string;
    earnedAt: Date;
}

export enum NotificationType {
  ACHIEVEMENT = 'ACHIEVEMENT',
  ANNOUNCEMENT = 'ANNOUNCEMENT',
  TASK = 'TASK'
}

export interface AppNotification {
    id: number;
    type: NotificationType;
    title: string;
    content: string;
    date: Date;
    read: boolean;
    badge?: Badge; // For achievement notifications
    imageUrl?: string;
}

export interface Campaign {
  id: string;
  title: string;
  description: string;
  goal: number;
  raised: number;
  qrCodeUrl: string;
  upiId: string;
}

export interface Donor {
  id: string;
  name: string;
  amount: number;
  isAnonymous: boolean;
}

export interface ChatMessage {
  id: string;
  authorId: string;
  content: string;
  imageUrl?: string;
  timestamp: Date;
  readBy: string[]; // Array of user IDs who have read the message
}

export interface SlideshowItem {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  isActive: boolean;
  createdAt: Date;
}

export interface PopupMessage {
  id: string;
  title: string;
  content: string;
  imageUrl?: string;
  scheduledDate: Date;
}

export interface Task {
    id: string;
    userId: string;
    title: string;
    completedAt: Date;
}

export interface EventAttendee {
    id: string;
    eventId: string;
    userId: string;
    attendedAt: Date;
}