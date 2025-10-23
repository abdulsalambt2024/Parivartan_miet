import { Role, User, Post, Announcement, Achievement, Event } from './types';

export const PARIVARTAN_LOGO = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAOEAAADhCAMAAAAJbSJIAAAAgVBMVEX///8BAQEAAAACAgKZmZn8/Pz39/fw8PAICAjt7e0KCgrLy8vGxsaioqKysrKbm5vT09N6enppaWlxcXFSUlJwcHCBgYE+Pj5bW1uLi4shISEzMzNERETg4OBmZmaSkpJPT085OTlCQkJpaWpTUlNNS0tEREVsa2xGQ0Q/OzxMSUs+OjzmjhGvAAAIc0lEQVR4nO2d63aqPBCGZ/oGJKAsuFDxqlhbW2vb//+DHaQtoSxtCSHTOfves352AmmSyczk5CSwLAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACA/4T0+KzX682l0+kLNx19sFartZlMJpvP55837Wkzl8ulx3HH8TzP8jyt1+t9eZ5l2Zbl+bbdrdfruizLshzL8tzvtluuDMNwDI/DNE3TNE2/7wR+lGVZVlW1rhuG39f28/m8y3u9Xi/HcZwnTNO0mqbh+r7v+t5uWZb1et2WZTmO4/m23W632+12u21bluW53m63Wq3GNE3TNE3DMIzDMIzjOF3Xbdu2LGuaplVVVVVVVVVVVVVVVVXV/zV9v3L/DbPZ7Eul0h/PZDLFNE3TNE3DNE3TNE3TNE3z+/evlMvlfr/f7/f7/b5s2/Y8z/M8z/M8z/O8bNu2bdu2bdu2bdsul8vlcvnev19++OGHH3744Ycffvjhhx9++OGHn7/ffvvtgw8++OCDDz744IMPPvjggw8++OCDDz744IMPPvjgw/dfbrfbbrebpiabzbar1arValUqlWw2y3M9z/O8bdu2bdu2bdu2bdu2bdsul8vlcrler9fr9Xq9Xq/X63WaplVVVVVVVVVVVVVVVVW/fT/8sKO7Xq+3m0wm2Ww2m81mMpnMZrPZbDabzWbz+/evlMvlSqXS7/f7/X6/3+/3+/2+bNu2bdu2bdu2bdu2bdsul8vlcrler9fr9Xq9Xq/XaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmab5+/4vjOE7TNE3TNF3Xbdu2bdu2bdu2bdsul8vlcrler9fr9Xq9Xq/XaZqmab5+lWVZlmVZlmVZlmVZlmVZlmVZlmVZlmVZlmVZlmVZlmVZlmX5+v0vj+P4+/u+67qu67qu67qu67qu67qu67qu67qu67pu27Zt27Zt27Zt27Zt25Zl+fr9L8/zNE3TNE3TNE3TNE3TNE3TNE3TNE3TNE3TNE3TNE3TNE3TNE3TNE3z9fvf3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3df//9L4/jeJ6maZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqmaZqma';

export const DEFAULT_PASSWORD = "ABDUL";
export const ADMIN_USERNAME = "beinghayat";
export const ADMIN_PASSWORD = "hayat@Miet";

export const GUEST_USER: User = {
  id: 'guest',
  name: 'Guest',
  username: 'guest',
  role: Role.GUEST,
  avatarUrl: `https://ui-avatars.com/api/?name=Guest&background=random&color=fff`,
};

export const MOCK_USERS: User[] = [
  {
    id: 'user-1',
    name: 'Hayat',
    username: ADMIN_USERNAME,
    email: 'admin@parivartan-miet.org',
    role: Role.ADMIN,
    avatarUrl: 'https://picsum.photos/id/1005/200/200',
  },
  {
    id: 'user-2',
    name: 'Priya Sharma',
    username: 'priyasharma',
    email: 'priya.s@parivartan-miet.org',
    role: Role.MEMBER,
    avatarUrl: 'https://picsum.photos/id/1011/200/200',
  },
  {
    id: 'user-3',
    name: 'Rohan Verma',
    username: 'rohanverma',
    email: 'rohan.v@parivartan-miet.org',
    role: Role.MEMBER,
    avatarUrl: 'https://picsum.photos/id/1012/200/200',
  },
    {
    id: 'user-4',
    name: 'Aisha Khan',
    username: 'aishakhan',
    email: 'aisha.k@parivartan-miet.org',
    role: Role.MEMBER,
    avatarUrl: 'https://picsum.photos/id/1027/200/200',
  },
];

export const MOCK_POSTS: Post[] = [
  {
    id: 'post-1',
    authorId: 'user-2',
    content: "Our weekend teaching drive was a massive success! So proud of everyone who volunteered. The kids were so enthusiastic and eager to learn.",
    imageUrl: 'https://picsum.photos/seed/class1/800/400',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
  },
  {
    id: 'post-2',
    authorId: 'user-3',
    content: "Planning for the upcoming book donation camp is underway. We need more volunteers for sorting and distribution. Please sign up if you can help!",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
  },
  {
    id: 'post-3',
    authorId: 'user-1',
    content: "Let's give a warm welcome to our new members! We're thrilled to have you join our mission.",
    imageUrl: 'https://picsum.photos/seed/welcome/800/400',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48),
  },
];

export const MOCK_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'ann-1',
    title: 'Monthly Meeting Schedule',
    content: "This month's general body meeting will be held on the 15th at 4 PM in the main auditorium. Agenda will be shared shortly. All members are requested to attend.",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72),
  },
  {
    id: 'ann-2',
    title: 'Annual Fundraiser Gala',
    content: "Our Annual Fundraiser Gala is scheduled for next month. We are looking for volunteers to help with the organizing committee. Please contact the admin team if you're interested.",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 120),
  },
];

export const MOCK_ACHIEVEMENTS: Achievement[] = [
    {
        id: 'ach-1',
        title: 'Education Excellence Award 2023',
        description: 'Our group was recognized by the District Education Board for our outstanding contribution to child literacy.',
        imageUrl: 'https://picsum.photos/seed/award1/600/400',
        date: new Date('2023-11-20'),
    },
    {
        id: 'ach-2',
        title: '1000+ Students Taught',
        description: 'We reached a major milestone this year, having provided free education to over one thousand underprivileged students since our inception.',
        imageUrl: 'https://picsum.photos/seed/students/600/400',
        date: new Date('2024-01-15'),
    },
];

export const MOCK_EVENTS: Event[] = [
    {
        id: 'event-1',
        title: 'Community Book Drive',
        description: 'Join us for our annual book drive! We are collecting new and gently used books for children in local shelters. Volunteers needed for sorting and distribution.',
        date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14), // Two weeks from now
        imageUrl: 'https://picsum.photos/seed/books/600/400',
        registrationLink: 'https://forms.gle/example',
    },
    {
        id: 'event-2',
        title: 'Winter Clothes Distribution',
        description: 'We distributed warm clothes to over 200 families in the community. Thank you to all the donors and volunteers who made this possible!',
        date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30), // One month ago
        imageUrl: 'https://picsum.photos/seed/winter/600/400',
        registrationLink: 'https://forms.gle/example',
    },
];
