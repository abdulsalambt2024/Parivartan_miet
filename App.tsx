import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { MOCK_USERS, MOCK_POSTS, MOCK_ANNOUNCEMENTS, MOCK_ACHIEVEMENTS, MOCK_EVENTS, DEFAULT_PASSWORD, ADMIN_USERNAME, ADMIN_PASSWORD, GUEST_USER, PARIVARTAN_LOGO } from './constants';
import { Role, User, Post, Announcement, Achievement, Event, Page } from './types';
import { HomeIcon, AnnouncementIcon, AchievementIcon, AdminIcon, LogoutIcon, PlusIcon, TrashIcon, CalendarIcon, LoginIcon } from './components/Icons';
import CreatePost from './components/CreatePost';
import CreateEvent from './components/CreateEvent';
import { generatePostContent } from './services/geminiService';


// COMPONENTS DEFINED OUTSIDE TO PREVENT RE-RENDERING ISSUES

const LoginSelectionScreen = ({ onSelectRole, onGuestLogin }: { onSelectRole: (role: 'admin' | 'member') => void, onGuestLogin: () => void }) => (
    <div className="min-h-screen bg-gradient-to-br from-primary to-accent flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 space-y-8 text-center">
            <img src={PARIVARTAN_LOGO} alt="PARIVARTAN Logo" className="w-40 mx-auto mb-2"/>
            <h1 className="text-3xl font-extrabold text-dark">Welcome to PARIVARTAN</h1>
            <p className="text-gray-600">Please select your login type to continue.</p>
            <div className="space-y-4 pt-4">
                <button onClick={() => onSelectRole('admin')} className="w-full text-lg font-bold bg-primary text-white p-4 rounded-xl shadow-lg transition duration-300 hover:bg-primary/90">
                    Admin Login
                </button>
                <button onClick={() => onSelectRole('member')} className="w-full text-lg font-bold bg-secondary text-dark p-4 rounded-xl shadow-lg transition duration-300 hover:bg-yellow-400">
                    Member Login
                </button>
                <button onClick={onGuestLogin} className="w-full text-lg font-bold bg-gray-200 text-gray-800 p-4 rounded-xl shadow-lg transition duration-300 hover:bg-gray-300">
                    Continue as Guest
                </button>
            </div>
            <div className="text-center text-gray-500 text-sm pt-6">
                Made with ❤️ by 
                <a href="https://www.instagram.com/beinghayat.er?igsh=MXV5dXFsZW5ycHY2cw==" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-semibold"> Hayat</a> 
                &nbsp;&amp;&nbsp;
                <a href="https://www.instagram.com/parivartan_miet?igsh=OHlnY3R5aDR5eGt6" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-semibold">PARIVARTAN</a>
            </div>
        </div>
    </div>
);


const LoginForm = ({ onLogin, onForgotPassword, onBack, mode }: { onLogin: (username: string, pass: string) => void; onForgotPassword: () => void; onBack: () => void, mode: 'admin' | 'member' }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        try {
            onLogin(username, password);
        } catch (err: any) {
            setError(err.message);
        }
    };

    const title = mode === 'admin' ? 'Admin Login' : 'Member Login';
    const buttonColor = mode === 'admin' ? 'bg-primary' : 'bg-secondary';
    const textColor = mode === 'admin' ? 'text-white' : 'text-dark';

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary to-accent flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 space-y-6">
                <div className="text-center">
                    <img src={PARIVARTAN_LOGO} alt="PARIVARTAN Logo" className="w-24 mx-auto mb-4"/>
                    <h1 className="text-3xl font-extrabold text-dark">{title}</h1>
                </div>
                {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg" role="alert">{error}</div>}
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="username" className="text-sm font-bold text-gray-700 tracking-wide">Username</label>
                        <input id="username" type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full text-base py-2 border-b border-gray-300 focus:outline-none focus:border-secondary" placeholder="Enter your username" required/>
                    </div>
                    <div>
                        <div className="flex justify-between items-center">
                            <label htmlFor="password"className="text-sm font-bold text-gray-700 tracking-wide">Password</label>
                            <button type="button" onClick={onForgotPassword} className="text-xs text-primary hover:text-accent">Forgot Password?</button>
                        </div>
                        <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full text-base py-2 border-b border-gray-300 focus:outline-none focus:border-secondary" placeholder="Enter your password" required/>
                    </div>
                    <div>
                        <button type="submit" className={`w-full flex justify-center ${buttonColor} ${textColor} p-3 rounded-full tracking-wide font-semibold shadow-lg cursor-pointer transition ease-in duration-300 hover:bg-opacity-90`}>
                            Log In
                        </button>
                    </div>
                </form>
                 <div className="text-center">
                    <button onClick={onBack} className="text-sm text-primary hover:underline">
                        &larr; Back to selection
                    </button>
                 </div>
            </div>
        </div>
    );
};


const SideNav = ({ activePage, onNavigate, onLogout, user }: { activePage: Page; onNavigate: (page: Page) => void; onLogout: () => void; user: User }) => {
    const isAdmin = user.role === Role.ADMIN;
    const isGuest = user.role === Role.GUEST;

    const navItems = [
        { page: Page.HOME, icon: HomeIcon, label: 'Home Feed' },
        { page: Page.ANNOUNCEMENTS, icon: AnnouncementIcon, label: 'Announcements' },
        { page: Page.ACHIEVEMENTS, icon: AchievementIcon, label: 'Achievements' },
        { page: Page.EVENTS, icon: CalendarIcon, label: 'Events' },
    ];
    if (isAdmin) {
        navItems.push({ page: Page.ADMIN, icon: AdminIcon, label: 'Admin Panel' });
    }

    return (
        <nav className="w-64 bg-white shadow-lg flex flex-col p-4 space-y-2">
            <div className="p-4 flex items-center justify-center space-x-3 border-b pb-4">
                 <img src={PARIVARTAN_LOGO} alt="Logo" className="w-16 h-auto" />
            </div>
            <div className="flex-grow pt-4">
                {navItems.map(item => (
                    <button
                        key={item.page}
                        onClick={() => onNavigate(item.page)}
                        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left font-semibold transition-colors ${activePage === item.page ? 'bg-primary/10 text-primary' : 'text-gray-600 hover:bg-gray-100'}`}
                    >
                        <item.icon className="w-6 h-6" />
                        <span>{item.label}</span>
                    </button>
                ))}
            </div>
            <button
                onClick={onLogout}
                className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left font-semibold text-gray-600 hover:bg-gray-100 transition-colors"
            >
                {isGuest ? <LoginIcon /> : <LogoutIcon />}
                <span>{isGuest ? 'Login' : 'Logout'}</span>
            </button>
        </nav>
    );
};

const Header = ({ user }: { user: User }) => (
    <header className="bg-white/80 backdrop-blur-sm sticky top-0 z-10 p-4 border-b border-gray-200 flex justify-end items-center">
        <div className="flex items-center space-x-3">
            <span className="font-semibold text-dark">{user.name}</span>
            <img src={user.avatarUrl} alt={user.name} className="w-10 h-10 rounded-full object-cover"/>
        </div>
    </header>
);

interface PostCardProps {
    post: Post;
    author?: User;
    onDelete: (postId: string) => void;
    canDelete: boolean;
}

const PostCard: React.FC<PostCardProps> = ({ post, author, onDelete, canDelete }) => (
    <div className="bg-white rounded-xl shadow-md overflow-hidden transform hover:scale-[1.02] transition-transform duration-300">
        {post.imageUrl && <img className="h-48 w-full object-cover" src={post.imageUrl} alt="Post image" />}
        <div className="p-6">
            <div className="flex items-center mb-4">
                <img className="w-10 h-10 rounded-full mr-4 object-cover" src={author?.avatarUrl} alt={author?.name} />
                <div>
                    <div className="font-bold text-dark text-lg">{author?.name}</div>
                    <p className="text-gray-500 text-sm">{post.createdAt.toLocaleString()}</p>
                </div>
                {canDelete && (
                    <button onClick={() => onDelete(post.id)} className="ml-auto text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-100">
                        <TrashIcon className="w-5 h-5" />
                    </button>
                )}
            </div>
            <p className="text-gray-700">{post.content}</p>
        </div>
    </div>
);

const HomeFeed = ({ posts, users, currentUser, onAddPost, onDeletePost }: { posts: Post[]; users: User[]; currentUser: User; onAddPost: (post: Omit<Post, 'id' | 'createdAt'>) => void; onDeletePost: (postId: string) => void; }) => {
    const [isCreatingPost, setIsCreatingPost] = useState(false);
    const usersById = useMemo(() => new Map(users.map(u => [u.id, u])), [users]);
    const isGuest = currentUser.role === Role.GUEST;

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-dark">Home Feed</h1>
                {!isGuest && (
                    <button
                        onClick={() => setIsCreatingPost(true)}
                        className="flex items-center space-x-2 bg-secondary text-dark font-bold px-6 py-3 rounded-full shadow-lg hover:opacity-90 transition"
                    >
                        <PlusIcon className="w-5 h-5" />
                        <span>Create Post</span>
                    </button>
                )}
            </div>
            <div className="grid gap-8">
                {posts.map(post => (
                    <PostCard
                        key={post.id}
                        post={post}
                        author={usersById.get(post.authorId)}
                        onDelete={onDeletePost}
                        canDelete={currentUser.role === Role.ADMIN || currentUser.id === post.authorId}
                    />
                ))}
            </div>
            {isCreatingPost && <CreatePost currentUser={currentUser} onClose={() => setIsCreatingPost(false)} onAddPost={onAddPost} />}
        </div>
    );
};

const AnnouncementsPage = ({ announcements }: { announcements: Announcement[] }) => (
    <div className="p-8">
        <h1 className="text-3xl font-bold text-dark mb-6">Announcements</h1>
        <div className="space-y-6">
            {announcements.map(ann => (
                <div key={ann.id} className="bg-white rounded-xl shadow-md p-6">
                    <h2 className="text-2xl font-bold text-primary mb-2">{ann.title}</h2>
                    <p className="text-sm text-gray-500 mb-4">{ann.createdAt.toLocaleDateString()}</p>
                    <p className="text-gray-700 whitespace-pre-wrap">{ann.content}</p>
                </div>
            ))}
        </div>
    </div>
);

const AchievementsPage = ({ achievements }: { achievements: Achievement[] }) => (
    <div className="p-8">
        <h1 className="text-3xl font-bold text-dark mb-6">Our Achievements</h1>
        <div className="grid md:grid-cols-2 gap-8">
            {achievements.map(ach => (
                <div key={ach.id} className="bg-white rounded-xl shadow-md overflow-hidden">
                    <img className="h-56 w-full object-cover" src={ach.imageUrl} alt={ach.title} />
                    <div className="p-6">
                        <p className="text-sm text-secondary font-bold mb-1">{ach.date.toLocaleDateString()}</p>
                        <h2 className="text-xl font-bold text-dark mb-2">{ach.title}</h2>
                        <p className="text-gray-600">{ach.description}</p>
                    </div>
                </div>
            ))}
        </div>
    </div>
);

interface EventCardProps {
  event: Event;
  canDelete: boolean;
  onDelete: (eventId: string) => void;
}

const EventCard: React.FC<EventCardProps> = ({ event, canDelete, onDelete }) => {
    const isPast = new Date(event.date) < new Date();
    return (
        <div className="bg-white rounded-xl shadow-md overflow-hidden flex flex-col">
            {event.imageUrl && <img className="h-48 w-full object-cover" src={event.imageUrl} alt={event.title} />}
            <div className="p-6 flex flex-col flex-grow">
                <p className="text-sm text-secondary font-bold mb-1">{event.date.toLocaleString()}</p>
                <h3 className="text-xl font-bold text-dark mb-2">{event.title}</h3>
                <p className="text-gray-600 flex-grow">{event.description}</p>
                <div className="mt-4 flex items-center justify-between">
                    {!isPast ? (
                        <a href={event.registrationLink} target="_blank" rel="noopener noreferrer" className="bg-secondary text-dark font-bold px-4 py-2 rounded-full shadow-md hover:opacity-90 transition">
                            Register Now
                        </a>
                    ) : (
                        <span className="bg-gray-200 text-gray-500 font-bold px-4 py-2 rounded-full cursor-not-allowed">
                            Event Ended
                        </span>
                    )}
                    {canDelete && <button onClick={() => onDelete(event.id)} className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-100"><TrashIcon className="w-5 h-5" /></button>}
                </div>
            </div>
        </div>
    );
};

const EventsPage = ({ events, currentUser, onAddEvent, onDeleteEvent }: { events: Event[], currentUser: User, onAddEvent: (event: Omit<Event, 'id'>) => void, onDeleteEvent: (eventId: string) => void }) => {
    const [isCreatingEvent, setIsCreatingEvent] = useState(false);
    
    const now = new Date();
    const upcomingEvents = events.filter(e => new Date(e.date) >= now).sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const pastEvents = events.filter(e => new Date(e.date) < now).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const isAdmin = currentUser.role === Role.ADMIN;

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-dark">Events</h1>
                {isAdmin && (
                    <button
                        onClick={() => setIsCreatingEvent(true)}
                        className="flex items-center space-x-2 bg-secondary text-dark font-bold px-6 py-3 rounded-full shadow-lg hover:opacity-90 transition"
                    >
                        <PlusIcon className="w-5 h-5" />
                        <span>Create Event</span>
                    </button>
                )}
            </div>
            
            <h2 className="text-2xl font-semibold text-primary mb-4 border-b-2 border-primary/20 pb-2">Upcoming Events</h2>
            {upcomingEvents.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {upcomingEvents.map(event => <EventCard key={event.id} event={event} canDelete={isAdmin} onDelete={onDeleteEvent} />)}
                </div>
            ) : <p className="text-gray-500">No upcoming events scheduled. Check back soon!</p>}

            <h2 className="text-2xl font-semibold text-primary mt-12 mb-4 border-b-2 border-primary/20 pb-2">Past Events</h2>
            {pastEvents.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {pastEvents.map(event => <EventCard key={event.id} event={event} canDelete={isAdmin} onDelete={onDeleteEvent} />)}
                </div>
            ) : <p className="text-gray-500">No past events to show.</p>}

            {isCreatingEvent && <CreateEvent onClose={() => setIsCreatingEvent(false)} onAddEvent={onAddEvent} />}
        </div>
    );
};

const AdminPanel = ({ users }: { users: User[] }) => (
    <div className="p-8">
        <h1 className="text-3xl font-bold text-dark mb-6">Admin Panel - Members</h1>
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <ul className="divide-y divide-gray-200">
                {users.filter(u => u.role !== Role.GUEST).map(user => (
                    <li key={user.id} className="p-4 flex items-center space-x-4">
                        <img className="w-12 h-12 rounded-full object-cover" src={user.avatarUrl} alt={user.name} />
                        <div className="flex-grow">
                            <p className="font-semibold text-dark">{user.name}</p>
                            <p className="text-gray-500">@{user.username}</p>
                        </div>
                        <span className={`px-3 py-1 text-sm font-semibold rounded-full ${user.role === Role.ADMIN ? 'bg-primary/10 text-primary' : 'bg-gray-200 text-gray-800'}`}>{user.role}</span>
                    </li>
                ))}
            </ul>
        </div>
    </div>
);


// MAIN APP COMPONENT

export default function App() {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [loginMode, setLoginMode] = useState<'selection' | 'admin' | 'member'>('selection');
    const [activePage, setActivePage] = useState<Page>(Page.HOME);

    const [users, setUsers] = useState<User[]>(MOCK_USERS);
    const [posts, setPosts] = useState<Post[]>(() => MOCK_POSTS.sort((a,b) => b.createdAt.getTime() - a.createdAt.getTime()));
    const [announcements, setAnnouncements] = useState<Announcement[]>(() => MOCK_ANNOUNCEMENTS.sort((a,b) => b.createdAt.getTime() - a.createdAt.getTime()));
    const [achievements, setAchievements] = useState<Achievement[]>(() => MOCK_ACHIEVEMENTS.sort((a,b) => b.date.getTime() - a.date.getTime()));
    const [events, setEvents] = useState<Event[]>(() => MOCK_EVENTS.sort((a,b) => b.date.getTime() - a.date.getTime()));

    const handleLogin = (username: string, pass: string) => {
        const user = users.find(u => u.username.toLowerCase() === username.toLowerCase());
        if (!user) {
            throw new Error("Invalid username or password.");
        }
    
        const isAdminLogin = user.role === Role.ADMIN && user.username === ADMIN_USERNAME && pass === ADMIN_PASSWORD;
        const isMemberLogin = user.role === Role.MEMBER && pass === DEFAULT_PASSWORD;

        if (isAdminLogin || isMemberLogin) {
            setCurrentUser(user);
            setActivePage(Page.HOME);
        } else {
            throw new Error("Invalid username or password.");
        }
    };
    
    const handleLogout = () => {
      setCurrentUser(null);
      setLoginMode('selection');
    };
    
    const handleForgotPassword = () => alert(`Password recovery not implemented.\n\nAdmin: Use username '${ADMIN_USERNAME}' and the assigned password.\nMembers: Use your username and the default password: ${DEFAULT_PASSWORD}`);

    const handleGuestLogin = () => {
        setCurrentUser(GUEST_USER);
        setActivePage(Page.HOME);
    };

    const handleAddPost = (newPost: Omit<Post, 'id' | 'createdAt'>) => {
        const post: Post = {
            ...newPost,
            id: `post-${Date.now()}`,
            createdAt: new Date(),
        };
        setPosts(prev => [post, ...prev]);
    };

    const handleDeletePost = (postId: string) => {
        setPosts(prev => prev.filter(p => p.id !== postId));
    };
    
    const handleAddEvent = (newEvent: Omit<Event, 'id'>) => {
        const event: Event = {
            ...newEvent,
            id: `event-${Date.now()}`,
        };
        setEvents(prev => [event, ...prev].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    };

    const handleDeleteEvent = (eventId: string) => {
        setEvents(prev => prev.filter(e => e.id !== eventId));
    };

    if (!currentUser) {
        if (loginMode === 'selection') {
            return <LoginSelectionScreen onSelectRole={setLoginMode} onGuestLogin={handleGuestLogin} />;
        }
        return <LoginForm onLogin={handleLogin} onForgotPassword={handleForgotPassword} onBack={() => setLoginMode('selection')} mode={loginMode} />;
    }

    const renderPage = () => {
        switch (activePage) {
            case Page.HOME:
                return <HomeFeed posts={posts} users={users} currentUser={currentUser} onAddPost={handleAddPost} onDeletePost={handleDeletePost} />;
            case Page.ANNOUNCEMENTS:
                return <AnnouncementsPage announcements={announcements} />;
            case Page.ACHIEVEMENTS:
                return <AchievementsPage achievements={achievements} />;
            case Page.EVENTS:
                return <EventsPage events={events} currentUser={currentUser} onAddEvent={handleAddEvent} onDeleteEvent={handleDeleteEvent} />;
            case Page.ADMIN:
                return currentUser.role === Role.ADMIN ? <AdminPanel users={users} /> : <HomeFeed posts={posts} users={users} currentUser={currentUser} onAddPost={handleAddPost} onDeletePost={handleDeletePost} />;
            default:
                return <HomeFeed posts={posts} users={users} currentUser={currentUser} onAddPost={handleAddPost} onDeletePost={handleDeletePost} />;
        }
    };

    return (
        <div className="flex min-h-screen">
            <SideNav activePage={activePage} onNavigate={setActivePage} onLogout={handleLogout} user={currentUser} />
            <main className="flex-1 bg-light">
                <Header user={currentUser} />
                <div className="overflow-y-auto" style={{ height: 'calc(100vh - 65px)' }}>
                  {renderPage()}
                </div>
            </main>
        </div>
    );
}