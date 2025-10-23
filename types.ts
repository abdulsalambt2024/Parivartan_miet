export enum Role {
  ADMIN = 'ADMIN',
  MEMBER = 'MEMBER',
  GUEST = 'GUEST',
}

export interface User {
  id: string;
  name: string;
  username: string;
  email?: string;
  role: Role;
  avatarUrl: string;
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
}