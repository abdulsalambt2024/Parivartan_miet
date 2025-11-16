import { Role, User, Post, Announcement, Achievement, Event, Badge, Campaign, Donor, ChatMessage, SlideshowItem, PopupMessage, Task, EventAttendee } from './types';

// These constants are no longer used as auth is fully handled by Supabase.
// export const DEFAULT_PASSWORD = "ABDUL";
// export const ADMIN_USERNAME = "beinghayat";
// export const ADMIN_PASSWORD = "hayat@Miet";
// export const ABDUL_PASSWORD = "abdul@Miet";

// List of emails that should be automatically assigned the SUPER_ADMIN role on sign-up.
export const SUPER_ADMIN_EMAILS = ['hayatamr9608@gmail.com', 'abdul.salam.bt.2024@miet.ac.in'];

// All mock data is removed to rely solely on the Supabase database.
export const MOCK_USERS: User[] = [];

export const MOCK_POSTS: Post[] = [];

export const MOCK_ANNOUNCEMENTS: Announcement[] = [];

export const MOCK_ACHIEVEMENTS: Achievement[] = [];

export const MOCK_EVENTS: Event[] = [];

export const BADGES: Record<string, Badge> = {
    'first-post': { id: 'first-post', name: 'First Post!', description: 'You shared your first post with the community.', icon: '📝' },
    'prolific-poster': { id: 'prolific-poster', name: 'Prolific Poster', description: 'You have created 5 posts. Keep up the great work!', icon: '✍️' },
    'event-creator': { id: 'event-creator', name: 'Community Builder', description: 'You organized your first event.', icon: '🎉' },
    'super-organizer': { id: 'super-organizer', name: 'Super Organizer', description: 'You have organized 3 successful events.', icon: '🏆' },
    'task-master': { id: 'task-master', name: 'Task Master', description: 'Completed 10 tasks.', icon: '✅' },
    'perfect-attender': { id: 'perfect-attender', name: 'Perfect Attender', description: 'Attended 5 consecutive events.', icon: '🗓️' },
};

export const MOCK_CAMPAIGNS: Campaign[] = [];

export const MOCK_DONORS: Donor[] = [];

export const MOCK_CHAT_MESSAGES: ChatMessage[] = [];

export const MOCK_SLIDESHOW_ITEMS: SlideshowItem[] = [];

export const MOCK_POPUP_MESSAGE: PopupMessage | null = null;

export const MOCK_TASKS: Task[] = [];

export const MOCK_EVENT_ATTENDEES: EventAttendee[] = [];