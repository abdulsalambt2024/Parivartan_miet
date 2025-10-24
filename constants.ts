import { Role, User, Post, Announcement, Achievement, Event, ChatMessage } from './types';

// FIX: Replaced corrupted/truncated base64 string with a valid one to resolve parsing error.
export const PARIVARTAN_LOGO = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';

export const ADMIN_USERNAME = "beinghayat";
export const ADMIN_PASSWORD = "hayat@Miet";

export const VIEWER_USER: User = {
  id: 'guest',
  name: 'Viewer',
  username: 'viewer',
  role: Role.GUEST,
  avatarUrl: `https://ui-avatars.com/api/?name=V&background=d1d5db&color=fff`,
};

export const MOCK_USERS: User[] = [
  {
    id: 'user-1',
    name: 'Hayat',
    username: ADMIN_USERNAME,
    password: ADMIN_PASSWORD,
    email: 'admin@parivartan-miet.org',
    role: Role.ADMIN,
    avatarUrl: 'https://storage.googleapis.com/aistudio-hosting/prompts/images/hayat.jpg',
  },
  {
    id: 'user-2',
    name: 'Priya Sharma',
    username: 'priyasharma',
    password: 'password2',
    email: 'priya.s@parivartan-miet.org',
    role: Role.MEMBER,
    avatarUrl: 'https://storage.googleapis.com/aistudio-hosting/prompts/images/priya.jpg',
  },
  {
    id: 'user-3',
    name: 'Rohan Verma',
    username: 'rohanverma',
    password: 'password3',
    email: 'rohan.v@parivartan-miet.org',
    role: Role.MEMBER,
    avatarUrl: 'https://storage.googleapis.com/aistudio-hosting/prompts/images/rohan.jpg',
  },
    {
    id: 'user-4',
    name: 'Aisha Khan',
    username: 'aishakhan',
    password: 'password4',
    email: 'aisha.k@parivartan-miet.org',
    role: Role.MEMBER,
    avatarUrl: 'https://storage.googleapis.com/aistudio-hosting/prompts/images/aisha.jpg',
  },
];

export const MOCK_POSTS: Post[] = [
  {
    id: 'post-1',
    authorId: 'user-2',
    content: "Our weekend teaching drive was a massive success! So proud of everyone who volunteered. The kids were so enthusiastic and eager to learn. ❤️ #Parivartan #EducationForAll",
    imageUrl: 'https://storage.googleapis.com/aistudio-hosting/prompts/images/class.jpg',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
  },
  {
    id: 'post-2',
    authorId: 'user-3',
    content: "Planning for the upcoming book donation camp is underway. We need more volunteers for sorting and distribution. Let's make it bigger than last year! 📚",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
  },
  {
    id: 'post-3',
    authorId: 'user-1',
    content: "Let's give a warm welcome to our new members! We're thrilled to have you join our mission to bring education to every child.",
    imageUrl: 'https://storage.googleapis.com/aistudio-hosting/prompts/images/welcome.jpg',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48),
  },
];

export const MOCK_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'ann-1',
    authorId: 'user-1',
    title: 'Urgent: Volunteer Requirement for Weekend Classes',
    content: "We have an urgent requirement for volunteers for this weekend's teaching drive (Saturday & Sunday). We are short by 5 members. Please sign up in the events section if you are available. Your support is crucial!",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72),
  },
  {
    id: 'ann-2',
    authorId: 'user-1',
    title: 'Stationery Donation Drive - Collection Point Update',
    content: "The collection point for the stationery donation drive has been moved from the main gate to the library entrance. Please drop off all donations there. Thank you for your contributions!",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 120),
  },
];

export const MOCK_ACHIEVEMENTS: Achievement[] = [
    {
        id: 'ach-1',
        authorId: 'user-2',
        title: 'Education Excellence Award 2023',
        description: 'Our group was recognized by the District Education Board for our outstanding contribution to child literacy.',
        imageUrl: 'https://storage.googleapis.com/aistudio-hosting/prompts/images/award.jpg',
        date: new Date('2023-11-20'),
    },
    {
        id: 'ach-2',
        authorId: 'user-3',
        title: '1000+ Students Taught',
        description: 'We reached a major milestone this year, having provided free education to over one thousand underprivileged students since our inception.',
        imageUrl: 'https://storage.googleapis.com/aistudio-hosting/prompts/images/students.jpg',
        date: new Date('2024-01-15'),
    },
];

export const MOCK_EVENTS: Event[] = [
    {
        id: 'event-1',
        authorId: 'user-2',
        title: 'Community Book Drive',
        description: 'Join us for our annual book drive! We are collecting new and gently used books for children in local shelters. Volunteers needed for sorting and distribution.',
        date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14), // Two weeks from now
        imageUrl: 'https://storage.googleapis.com/aistudio-hosting/prompts/images/books.jpg',
        registrationLink: 'https://forms.gle/example',
    },
    {
        id: 'event-2',
        authorId: 'user-1',
        title: 'Winter Clothes Distribution',
        description: 'We distributed warm clothes to over 200 families in the community. Thank you to all the donors and volunteers who made this possible!',
        date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30), // One month ago
        imageUrl: 'https://storage.googleapis.com/aistudio-hosting/prompts/images/winter.jpg',
        registrationLink: 'https://forms.gle/example',
    },
];


export const MOCK_CHAT_MESSAGES: ChatMessage[] = [
    {
        id: 'chat-1',
        authorId: 'user-2',
        content: 'Hey everyone, just confirming the meeting for the book drive is at 4 PM today.',
        createdAt: new Date(Date.now() - 1000 * 60 * 10),
    },
    {
        id: 'chat-2',
        authorId: 'user-1',
        content: 'Confirmed! I\'ve booked the main hall. See you all there.',
        createdAt: new Date(Date.now() - 1000 * 60 * 8),
    },
    {
        id: 'chat-3',
        authorId: 'user-3',
        imageUrl: 'https://storage.googleapis.com/aistudio-hosting/prompts/images/signup-sheet.jpg',
        content: 'Great, I will bring the volunteer sign-up sheets. Here\'s how they look.',
        createdAt: new Date(Date.now() - 1000 * 60 * 5),
    }
];