export enum Role {
  ADMIN = 'ADMIN',
  MEMBER = 'MEMBER',
  GUEST = 'GUEST', // Represents Viewer
}

export interface User {
  id: string;
  name: string;
  username: string;
  email?: string;
  role: Role;
  avatarUrl: string;
  password?: string;
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
  authorId: string;
  title: string;
  content: string;
  createdAt: Date;
}

export interface Achievement {
  id: string;
  authorId: string;
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

export interface Notification {
    id: string;
    content: string;
    createdAt: Date;
    read: boolean;
    linkTo?: { page: Page, id: string };
}

export interface ChatMessage {
    id: string;
    authorId: string;
    content?: string;
    imageUrl?: string;
    createdAt: Date;
}

export enum Page {
  HOME = 'HOME',
  ANNOUNCEMENTS = 'ANNOUNCEMENTS',
  ACHIEVEMENTS = 'ACHIEVEMENTS',
  EVENTS = 'EVENTS',
  PROFILE = 'PROFILE',
  CHAT = 'CHAT',
}
