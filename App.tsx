import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { MOCK_USERS, MOCK_POSTS, MOCK_ANNOUNCEMENTS, MOCK_ACHIEVEMENTS, MOCK_EVENTS, MOCK_CHAT_MESSAGES, MOCK_TASKS, ADMIN_USERNAME, ADMIN_PASSWORD, VIEWER_USER, PARIVARTAN_LOGO } from './constants';
import { Role, User, Post, Announcement, Achievement, Event, Page, Notification, ChatMessage, Task, TaskStatus } from './types';
import { HomeIcon, AnnouncementIcon, AchievementIcon, LogoutIcon, PlusIcon, TrashIcon, CalendarIcon, LoginIcon, EditIcon, SearchIcon, BellIcon, UserIcon, ChatIcon, SparklesIcon, SpeakerIcon, TaskIcon } from './components/Icons';
import CreatePost from './components/CreatePost';
import CreateEvent from './components/CreateEvent';
import CreateAnnouncement from './components/CreateAnnouncement';
import CreateAchievement from './components/CreateAchievement';
import ProfilePage from './components/ProfilePage';
import ChatPage from './components/ChatPage';
import AiMagicPage from './components/AiMagicPage';
import TasksPage from './components/TasksPage';
import { generateSpeech } from './services/geminiService';

// --- HELPER & GENERIC COMPONENTS ---

const useClickOutside = (ref: React.RefObject<HTMLElement>, handler: () => void) => {
    useEffect(() => {
        const listener = (event: MouseEvent | TouchEvent) => {
            if (!ref.current || ref.current.contains(event.target as Node)) {
                return;
            }
            handler();
        };
        document.addEventListener('mousedown', listener);
        document.addEventListener('touchstart', listener);
        return () => {
            document.removeEventListener('mousedown', listener);
            document.removeEventListener('touchstart', listener);
        };
    }, [ref, handler]);
};

const LoadingSpinner = () => (
    <div className="flex items-center justify-center h-full">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>
);


// --- LOGIN AND AUTH COMPONENTS ---

const LoginSelectionScreen = ({ onSelectRole, onViewerLogin }: { onSelectRole: (role: 'admin' | 'member') => void, onViewerLogin: () => void }) => (
    <div className="min-h-screen bg-gradient-to-br from-primary to-accent flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 space-y-8 text-center">
            <img src={PARIVARTAN_LOGO} alt="PARIVARTAN Logo" className="w-40 mx-auto mb-2"/>
            <h1 className="text-3xl font-extrabold text-dark">Welcome to PARIVARTAN</h1>
            <p className="text-gray-600">The Social Working Group of MIET</p>
            <div className="space-y-4 pt-4">
                <button onClick={() => onSelectRole('admin')} className="w-full text-lg font-bold bg-primary text-white p-4 rounded-xl shadow-lg transition duration-300 hover:bg-primary/90">
                    Admin Login
                </button>
                <button onClick={() => onSelectRole('member')} className="w-full text-lg font-bold bg-secondary text-dark p-4 rounded-xl shadow-lg transition duration-300 hover:bg-yellow-400">
                    Member Login
                </button>
                <button onClick={onViewerLogin} className="w-full text-lg font-bold bg-gray-200 text-gray-800 p-4 rounded-xl shadow-lg transition duration-300 hover:bg-gray-300">
                    Continue as Viewer
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

// --- LAYOUT COMPONENTS ---

const SideNav = ({ activePage, onNavigate, onLogout, user }: { activePage: Page; onNavigate: (page: Page) => void; onLogout: () => void; user: User }) => {
    const isViewer = user.role === Role.GUEST;

    const navItems = [
        { page: Page.HOME, icon: HomeIcon, label: 'Home Feed' },
        { page: Page.ANNOUNCEMENTS, icon: AnnouncementIcon, label: 'Announcements' },
        { page: Page.ACHIEVEMENTS, icon: AchievementIcon, label: 'Achievements' },
        { page: Page.EVENTS, icon: CalendarIcon, label: 'Events' },
    ];
    
    const memberNavItems = [
        { page: Page.TASKS, icon: TaskIcon, label: 'Tasks' },
        { page: Page.CHAT, icon: ChatIcon, label: 'Group Chat' },
        { page: Page.AI_MAGIC, icon: SparklesIcon, label: 'AI Magic' },
        { page: Page.PROFILE, icon: UserIcon, label: 'My Profile' },
    ]

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
                {!isViewer && memberNavItems.map(item => (
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
                {isViewer ? <LoginIcon /> : <LogoutIcon />}
                <span>{isViewer ? 'Login' : 'Logout'}</span>
            </button>
        </nav>
    );
};

const Header = ({ user, onNavigate, onSearch, unreadCount, notifications, onReadNotification }: { user: User, onNavigate: (page: Page) => void, onSearch: (query:string) => void, unreadCount: number, notifications: Notification[], onReadNotification: (id: string) => void }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [showNotifications, setShowNotifications] = useState(false);
    const notificationRef = React.useRef(null);

    useClickOutside(notificationRef, () => setShowNotifications(false));

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSearch(searchQuery);
    }
    
    return (
        <header className="bg-white/80 backdrop-blur-sm sticky top-0 z-20 p-4 border-b border-gray-200 flex justify-between items-center">
            {/* Search Bar */}
            <div className="flex-1 max-w-lg">
                <form onSubmit={handleSearchSubmit} className="relative">
                    <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"/>
                    <input 
                        type="text" 
                        placeholder="Search posts, events, and more..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onFocus={() => onSearch(searchQuery)}
                        className="w-full bg-gray-100 rounded-full pl-10 pr-4 py-2 focus:ring-2 focus:ring-primary focus:outline-none"
                    />
                </form>
            </div>

            {/* User Info and Notifications */}
            <div className="flex items-center space-x-4">
                <div className="relative" ref={notificationRef}>
                    <button onClick={() => setShowNotifications(s => !s)} className="p-2 rounded-full hover:bg-gray-100 relative">
                        <BellIcon className="w-6 h-6 text-gray-600"/>
                        {unreadCount > 0 && <span className="absolute top-0 right-0 block h-4 w-4 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">{unreadCount}</span>}
                    </button>
                    {showNotifications && (
                        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border z-30">
                            <div className="p-3 font-bold border-b">Notifications</div>
                            <div className="max-h-96 overflow-y-auto">
                                {notifications.length > 0 ? notifications.map(n => (
                                    <div key={n.id} onClick={() => onReadNotification(n.id)} className={`p-3 border-b hover:bg-gray-50 cursor-pointer ${!n.read ? 'bg-primary/5' : ''}`}>
                                        <p className="text-sm">{n.content}</p>
                                        <p className="text-xs text-gray-500 mt-1">{n.createdAt.toLocaleString()}</p>
                                    </div>
                                )) : <p className="p-4 text-gray-500 text-sm">No new notifications.</p>}
                            </div>
                        </div>
                    )}
                </div>

                <button onClick={() => onNavigate(Page.PROFILE)} className="flex items-center space-x-3 hover:bg-gray-100 p-2 rounded-full">
                    <span className="font-semibold text-dark hidden sm:block">{user.name}</span>
                    <img src={user.avatarUrl} alt={user.name} className="w-10 h-10 rounded-full object-cover"/>
                </button>
            </div>
        </header>
    );
};


// --- CONTENT COMPONENTS ---

interface PostCardProps {
    post: Post;
    author?: User;
    onDelete: (postId: string) => void;
    canDelete: boolean;
}

const PostCard: React.FC<PostCardProps> = ({ post, author, onDelete, canDelete }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    
    const handlePlaySound = async (text: string) => {
        if (isPlaying) return;
        setIsPlaying(true);
        try {
            const base64Audio = await generateSpeech(text);
            const audioBlob = new Blob([Uint8Array.from(atob(base64Audio), c => c.charCodeAt(0))], { type: 'audio/mpeg' });
            const audioUrl = URL.createObjectURL(audioBlob);
            const audio = new Audio(audioUrl);
            audio.play();
            audio.onended = () => setIsPlaying(false);
        } catch (error) {
            console.error("Failed to play audio", error);
            setIsPlaying(false);
        }
    };
    
    return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-xl overflow-hidden transform hover:scale-[1.01] transition-all duration-300">
        <div className="p-6">
             <div className="flex items-start mb-4">
                <img className="w-10 h-10 rounded-full mr-4 object-cover" src={author?.avatarUrl} alt={author?.name} />
                <div className="flex-grow">
                    <div className="font-bold text-dark text-lg">{author?.name}</div>
                    <p className="text-gray-500 text-sm">{post.createdAt.toLocaleString()}</p>
                </div>
                <div className="flex items-center">
                    <button onClick={() => handlePlaySound(post.content)} disabled={isPlaying} className="text-gray-500 hover:text-primary p-2 rounded-full hover:bg-gray-100 disabled:opacity-50">
                        <SpeakerIcon className="w-5 h-5" />
                    </button>
                    {canDelete && (
                        <button onClick={() => onDelete(post.id)} className="text-gray-500 hover:text-red-700 p-2 rounded-full hover:bg-red-100">
                            <TrashIcon className="w-5 h-5" />
                        </button>
                    )}
                </div>
            </div>
            <p className="text-gray-700">{post.content}</p>
        </div>
        {post.imageUrl && (
            <img className="h-64 w-full object-cover" src={post.imageUrl} alt="Post image" />
        )}
    </div>
)};

const HomeFeed = ({ posts, users, currentUser, onAddPost, onDeletePost }: { posts: Post[]; users: User[]; currentUser: User; onAddPost: (post: Omit<Post, 'id' | 'createdAt'>) => void; onDeletePost: (postId: string) => void; }) => {
    const [isCreatingPost, setIsCreatingPost] = useState(false);
    const usersById = useMemo(() => new Map(users.map(u => [u.id, u])), [users]);
    const isViewer = currentUser.role === Role.GUEST;

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-dark">Home Feed</h1>
                {!isViewer && (
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

const AnnouncementsPage = ({ announcements, currentUser, onSave, onDelete }: { announcements: Announcement[], currentUser: User, onSave: (announcement: Omit<Announcement, 'id' | 'createdAt'>) => void, onDelete: (announcementId: string) => void }) => {
    const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | 'new' | null>(null);
    const [isPlaying, setIsPlaying] = useState<string | null>(null);
    const canManage = currentUser.role === Role.ADMIN || currentUser.role === Role.MEMBER;
    
    const handlePlaySound = async (id: string, text: string) => {
        if (isPlaying) return;
        setIsPlaying(id);
        try {
            const base64Audio = await generateSpeech(text);
            const audioBlob = new Blob([Uint8Array.from(atob(base64Audio), c => c.charCodeAt(0))], { type: 'audio/mpeg' });
            const audioUrl = URL.createObjectURL(audioBlob);
            const audio = new Audio(audioUrl);
            audio.play();
            audio.onended = () => setIsPlaying(null);
        } catch (error) {
            console.error("Failed to play audio", error);
            setIsPlaying(null);
        }
    };
    
    return (
    <div className="p-8">
        <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-dark">Announcements</h1>
            {canManage && (
                <button
                    onClick={() => setEditingAnnouncement('new')}
                    className="flex items-center space-x-2 bg-secondary text-dark font-bold px-6 py-3 rounded-full shadow-lg hover:opacity-90 transition"
                >
                    <PlusIcon className="w-5 h-5" />
                    <span>Create Announcement</span>
                </button>
            )}
        </div>
        <div className="space-y-6">
            {announcements.map(ann => (
                <div key={ann.id} className="bg-white rounded-xl shadow-md p-6">
                    <div className="flex justify-between items-start">
                        <div>
                            <h2 className="text-2xl font-bold text-primary mb-2">{ann.title}</h2>
                            <p className="text-sm text-gray-500 mb-4">{ann.createdAt.toLocaleDateString()}</p>
                        </div>
                        <div className="flex space-x-2 flex-shrink-0 ml-4">
                            <button onClick={() => handlePlaySound(ann.id, `${ann.title}. ${ann.content}`)} disabled={!!isPlaying} className="text-gray-500 hover:text-primary p-2 rounded-full hover:bg-gray-100 disabled:opacity-50">
                                <SpeakerIcon className="w-5 h-5"/>
                            </button>
                            {canManage && (
                                <>
                                <button onClick={() => setEditingAnnouncement(ann)} className="text-gray-500 hover:text-primary p-2 rounded-full hover:bg-gray-100 transition"><EditIcon className="w-5 h-5"/></button>
                                <button onClick={() => onDelete(ann.id)} className="text-gray-500 hover:text-red-500 p-2 rounded-full hover:bg-red-100 transition"><TrashIcon className="w-5 h-5" /></button>
                                </>
                            )}
                        </div>
                    </div>
                    <p className="text-gray-700 whitespace-pre-wrap">{ann.content}</p>
                </div>
            ))}
        </div>
        {editingAnnouncement && <CreateAnnouncement onClose={() => setEditingAnnouncement(null)} onSave={onSave} announcementToEdit={editingAnnouncement === 'new' ? null : editingAnnouncement} />}
    </div>
    );
};

const AchievementsPage = ({ achievements, currentUser, onSave, onDelete }: { achievements: Achievement[], currentUser: User, onSave: (achievement: Omit<Achievement, 'id'>) => void, onDelete: (achievementId: string) => void }) => {
    const [editingAchievement, setEditingAchievement] = useState<Achievement | 'new' | null>(null);
    const canManage = currentUser.role === Role.ADMIN || currentUser.role === Role.MEMBER;

    return (
    <div className="p-8">
        <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-dark">Our Achievements</h1>
            {canManage && (
                 <button
                    onClick={() => setEditingAchievement('new')}
                    className="flex items-center space-x-2 bg-secondary text-dark font-bold px-6 py-3 rounded-full shadow-lg hover:opacity-90 transition"
                >
                    <PlusIcon className="w-5 h-5" />
                    <span>Add Achievement</span>
                </button>
            )}
        </div>
        <div className="grid md:grid-cols-2 gap-8">
            {achievements.map(ach => (
                <div key={ach.id} className="bg-white rounded-xl shadow-md overflow-hidden group">
                    <div className="relative">
                        <img className="h-56 w-full object-cover" src={ach.imageUrl} alt={ach.title} />
                        {(canManage && (currentUser.id === ach.authorId || currentUser.role === Role.ADMIN)) && (
                             <div className="absolute top-2 right-2 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => setEditingAchievement(ach)} className="bg-white/80 p-2 rounded-full text-dark hover:bg-white"><EditIcon className="w-5 h-5"/></button>
                                <button onClick={() => onDelete(ach.id)} className="bg-white/80 p-2 rounded-full text-red-500 hover:bg-white"><TrashIcon className="w-5 h-5" /></button>
                            </div>
                        )}
                    </div>
                    <div className="p-6">
                        <p className="text-sm text-secondary font-bold mb-1">{ach.date.toLocaleDateString()}</p>
                        <h2 className="text-xl font-bold text-dark mb-2">{ach.title}</h2>
                        <p className="text-gray-600">{ach.description}</p>
                    </div>
                </div>
            ))}
        </div>
        {editingAchievement && <CreateAchievement onClose={() => setEditingAchievement(null)} onSave={onSave} achievementToEdit={editingAchievement === 'new' ? null : editingAchievement} />}
    </div>
);
};
interface EventCardProps {
  event: Event;
  canManage: boolean;
  canEditDelete: boolean;
  onDelete: (eventId: string) => void;
  onEdit: (event: Event) => void;
}

const EventCard: React.FC<EventCardProps> = ({ event, canManage, canEditDelete, onDelete, onEdit }) => {
    const isPast = new Date(event.date) < new Date();
    return (
        <div className="bg-white rounded-xl shadow-md overflow-hidden flex flex-col group">
             {event.imageUrl && 
                <div className="relative">
                    <img className="h-48 w-full object-cover" src={event.imageUrl} alt={event.title} />
                     {canEditDelete && (
                         <div className="absolute top-2 right-2 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => onEdit(event)} className="bg-white/80 p-2 rounded-full text-dark hover:bg-white"><EditIcon className="w-5 h-5"/></button>
                            <button onClick={() => onDelete(event.id)} className="bg-white/80 p-2 rounded-full text-red-500 hover:bg-white"><TrashIcon className="w-5 h-5" /></button>
                        </div>
                    )}
                </div>
            }
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
                    {canEditDelete && !event.imageUrl && 
                        <div className="flex space-x-2">
                           <button onClick={() => onEdit(event)} className="text-gray-500 hover:text-primary p-2 rounded-full hover:bg-gray-100 transition"><EditIcon className="w-5 h-5"/></button>
                           <button onClick={() => onDelete(event.id)} className="text-gray-500 hover:text-red-500 p-2 rounded-full hover:bg-red-100 transition"><TrashIcon className="w-5 h-5" /></button>
                        </div>
                    }
                </div>
            </div>
        </div>
    );
};

const EventsPage = ({ events, currentUser, onSaveEvent, onDeleteEvent }: { events: Event[], currentUser: User, onSaveEvent: (event: Omit<Event, 'id'>) => void, onDeleteEvent: (eventId: string) => void }) => {
    const [editingEvent, setEditingEvent] = useState<Event | 'new' | null>(null);
    
    const now = new Date();
    const upcomingEvents = events.filter(e => new Date(e.date) >= now).sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const pastEvents = events.filter(e => new Date(e.date) < now).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const canManage = currentUser.role === Role.ADMIN || currentUser.role === Role.MEMBER;

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-dark">Events</h1>
                {canManage && (
                    <button
                        onClick={() => setEditingEvent('new')}
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
                    {upcomingEvents.map(event => <EventCard key={event.id} event={event} canManage={canManage} canEditDelete={currentUser.id === event.authorId || currentUser.role === Role.ADMIN} onDelete={onDeleteEvent} onEdit={setEditingEvent} />)}
                </div>
            ) : <p className="text-gray-500">No upcoming events scheduled. Check back soon!</p>}

            <h2 className="text-2xl font-semibold text-primary mt-12 mb-4 border-b-2 border-primary/20 pb-2">Past Events</h2>
            {pastEvents.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {pastEvents.map(event => <EventCard key={event.id} event={event} canManage={canManage} canEditDelete={currentUser.id === event.authorId || currentUser.role === Role.ADMIN} onDelete={onDeleteEvent} onEdit={setEditingEvent} />)}
                </div>
            ) : <p className="text-gray-500">No past events to show.</p>}

            {editingEvent && <CreateEvent onClose={() => setEditingEvent(null)} onSaveEvent={onSaveEvent} eventToEdit={editingEvent === 'new' ? null : editingEvent} />}
        </div>
    );
};

const SearchResults = ({ query, posts, announcements, achievements, events, users, onClose, onNavigate }: { query: string; posts: Post[]; announcements: Announcement[]; achievements: Achievement[]; events: Event[]; users: User[]; onClose: () => void; onNavigate: (page: Page) => void; }) => {
    const usersById = useMemo(() => new Map(users.map(u => [u.id, u])), [users]);

    const lowerCaseQuery = query.toLowerCase();

    const filteredPosts = useMemo(() => posts.filter(p => p.content.toLowerCase().includes(lowerCaseQuery) || usersById.get(p.authorId)?.name.toLowerCase().includes(lowerCaseQuery)), [posts, lowerCaseQuery, usersById]);
    const filteredAnnouncements = useMemo(() => announcements.filter(a => a.title.toLowerCase().includes(lowerCaseQuery) || a.content.toLowerCase().includes(lowerCaseQuery)), [announcements, lowerCaseQuery]);
    const filteredAchievements = useMemo(() => achievements.filter(a => a.title.toLowerCase().includes(lowerCaseQuery) || a.description.toLowerCase().includes(lowerCaseQuery)), [achievements, lowerCaseQuery]);
    const filteredEvents = useMemo(() => events.filter(e => e.title.toLowerCase().includes(lowerCaseQuery) || e.description.toLowerCase().includes(lowerCaseQuery)), [events, lowerCaseQuery]);
    
    const hasResults = filteredPosts.length || filteredAnnouncements.length || filteredAchievements.length || filteredEvents.length;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center z-40 p-4" onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl mt-20 h-[70vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b">
                    <h2 className="text-xl font-bold text-dark">Search Results for "{query}"</h2>
                </div>
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {!hasResults && <p className="text-gray-500">No results found.</p>}
                    
                    {filteredPosts.length > 0 && <div>
                        <h3 className="font-bold text-lg text-primary mb-2">Posts</h3>
                        {filteredPosts.map(p => <div key={p.id} className="p-3 bg-gray-50 rounded-lg mb-2"><strong>{usersById.get(p.authorId)?.name}:</strong> {p.content.substring(0,100)}...</div>)}
                    </div>}

                     {filteredAnnouncements.length > 0 && <div>
                        <h3 className="font-bold text-lg text-primary mb-2">Announcements</h3>
                        {filteredAnnouncements.map(a => <div key={a.id} className="p-3 bg-gray-50 rounded-lg mb-2" onClick={() => { onNavigate(Page.ANNOUNCEMENTS); onClose();}} ><strong>{a.title}</strong></div>)}
                    </div>}

                    {filteredAchievements.length > 0 && <div>
                        <h3 className="font-bold text-lg text-primary mb-2">Achievements</h3>
                        {filteredAchievements.map(a => <div key={a.id} className="p-3 bg-gray-50 rounded-lg mb-2 flex items-center gap-3" onClick={() => { onNavigate(Page.ACHIEVEMENTS); onClose();}}>
                            <img src={a.imageUrl} className="w-12 h-12 object-cover rounded"/>
                            <strong>{a.title}</strong>
                        </div>)}
                    </div>}

                     {filteredEvents.length > 0 && <div>
                        <h3 className="font-bold text-lg text-primary mb-2">Events</h3>
                        {filteredEvents.map(e => <div key={e.id} className="p-3 bg-gray-50 rounded-lg mb-2" onClick={() => { onNavigate(Page.EVENTS); onClose();}}><strong>{e.title}</strong></div>)}
                    </div>}
                </div>
            </div>
        </div>
    )
}


// --- MAIN APP COMPONENT ---

export default function App() {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [loginMode, setLoginMode] = useState<'selection' | 'admin' | 'member'>('selection');
    const [activePage, setActivePage] = useState<Page>(Page.HOME);

    // Data State
    const [users, setUsers] = useState<User[]>(MOCK_USERS);
    const [posts, setPosts] = useState<Post[]>(() => MOCK_POSTS.sort((a,b) => b.createdAt.getTime() - a.createdAt.getTime()));
    const [announcements, setAnnouncements] = useState<Announcement[]>(() => MOCK_ANNOUNCEMENTS.sort((a,b) => b.createdAt.getTime() - a.createdAt.getTime()));
    const [achievements, setAchievements] = useState<Achievement[]>(() => MOCK_ACHIEVEMENTS.sort((a,b) => b.date.getTime() - a.date.getTime()));
    const [events, setEvents] = useState<Event[]>(MOCK_EVENTS);
    const [tasks, setTasks] = useState<Task[]>(() => MOCK_TASKS.sort((a,b) => b.createdAt.getTime() - a.createdAt.getTime()));
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => MOCK_CHAT_MESSAGES.sort((a,b) => a.createdAt.getTime() - b.createdAt.getTime()));
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [notifiedTaskIds, setNotifiedTaskIds] = useState<Set<string>>(new Set());

    // UI State
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => setIsLoading(false), 1500);
        return () => clearTimeout(timer);
    }, []);

    const unreadNotificationCount = useMemo(() => notifications.filter(n => !n.read).length, [notifications]);

    // --- NOTIFICATION HANDLER ---
    const createNotification = useCallback((content: string, linkTo?: { page: Page; id: string }) => {
        const newNotification: Notification = {
            id: `notif-${Date.now()}-${Math.random()}`,
            content,
            createdAt: new Date(),
            read: false,
            linkTo,
        };
        setNotifications(prev => {
            if (prev.some(n => n.content === content)) {
                return prev;
            }
            return [newNotification, ...prev];
        });
    }, []);

    const handleReadNotification = (id: string) => {
        const notification = notifications.find(n => n.id === id);
        if (notification?.linkTo) {
            setActivePage(notification.linkTo.page);
        }
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    };

    useEffect(() => {
        if (!currentUser || currentUser.role === Role.GUEST) return;

        const now = new Date();
        const oneDayFromNow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
        const newNotifiedIds = new Set(notifiedTaskIds);

        tasks.forEach(task => {
            if (task.assigneeId === currentUser.id && task.status !== TaskStatus.DONE) {
                const dueDate = new Date(task.dueDate);
                const hasBeenNotified = notifiedTaskIds.has(task.id);

                if (!hasBeenNotified) {
                    if (dueDate < now) {
                        createNotification(`Task "${task.title}" is overdue!`, { page: Page.TASKS, id: task.id });
                        newNotifiedIds.add(task.id);
                    } else if (dueDate <= oneDayFromNow) {
                        createNotification(`Task "${task.title}" is due within 24 hours.`, { page: Page.TASKS, id: task.id });
                        newNotifiedIds.add(task.id);
                    }
                }
            }
        });

        if (newNotifiedIds.size > notifiedTaskIds.size) {
            setNotifiedTaskIds(newNotifiedIds);
        }

    }, [tasks, currentUser, createNotification, notifiedTaskIds]);


    // --- AUTH HANDLERS ---
    const handleLogin = (username: string, pass: string) => {
        const user = users.find(u => u.username.toLowerCase() === username.toLowerCase());
        
        if (user && user.password === pass) {
            setCurrentUser(user);
            setActivePage(Page.HOME);
        } else {
            throw new Error("Invalid username or password.");
        }
    };
    
    const handleLogout = () => {
      setCurrentUser(null);
      setLoginMode('selection');
      setActivePage(Page.HOME);
    };
    
    const handleForgotPassword = () => alert(`Password recovery is not implemented.\nPlease contact an administrator for assistance.`);

    const handleViewerLogin = () => {
        setCurrentUser(VIEWER_USER);
        setActivePage(Page.HOME);
    };

    // --- CONTENT HANDLERS ---
    const handleAddPost = (newPost: Omit<Post, 'id' | 'createdAt'>) => {
        const post: Post = {
            ...newPost,
            id: `post-${Date.now()}`,
            createdAt: new Date(),
        };
        setPosts(prev => [post, ...prev]);
    };

    const handleDeletePost = (postId: string) => {
        if (window.confirm('Are you sure you want to delete this post?')) {
            setPosts(prev => prev.filter(p => p.id !== postId));
        }
    };
    
    const handleSaveEvent = (eventData: Omit<Event, 'id' | 'authorId'> | Event) => {
        if ('id' in eventData) { // Update
            setEvents(prev => prev.map(e => e.id === eventData.id ? {...e, ...eventData} : e));
        } else { // Create
            const newEvent: Event = { ...eventData, id: `event-${Date.now()}`, authorId: currentUser!.id };
            setEvents(prev => [newEvent, ...prev].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
            createNotification(`New Event Posted: "${newEvent.title}"`, { page: Page.EVENTS, id: newEvent.id });
        }
    };

    const handleDeleteEvent = (eventId: string) => {
        if (window.confirm('Are you sure you want to delete this event?')) {
            setEvents(prev => prev.filter(e => e.id !== eventId));
        }
    };

    const handleSaveAnnouncement = (annData: Omit<Announcement, 'id' | 'createdAt' | 'authorId'> | Announcement) => {
        if ('id' in annData) { // Update
             setAnnouncements(prev => prev.map(a => a.id === annData.id ? {...a, ...annData} : a));
        } else { // Create
            const newAnn: Announcement = { ...annData, id: `ann-${Date.now()}`, createdAt: new Date(), authorId: currentUser!.id };
            setAnnouncements(prev => [newAnn, ...prev]);
            createNotification(`New Announcement: "${newAnn.title}"`, { page: Page.ANNOUNCEMENTS, id: newAnn.id });
        }
    };

    const handleDeleteAnnouncement = (annId: string) => {
        if (window.confirm('Are you sure you want to delete this announcement?')) {
            setAnnouncements(prev => prev.filter(a => a.id !== annId));
        }
    };

    const handleSaveAchievement = (achData: Omit<Achievement, 'id' | 'authorId'> | Achievement) => {
        if ('id' in achData) { // Update
            setAchievements(prev => prev.map(a => a.id === achData.id ? {...a, ...achData} : a));
        } else { // Create
            const newAch: Achievement = { ...achData, id: `ach-${Date.now()}`, authorId: currentUser!.id };
            setAchievements(prev => [newAch, ...prev].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
        }
    };

    const handleDeleteAchievement = (achId: string) => {
        if (window.confirm('Are you sure you want to delete this achievement?')) {
            setAchievements(prev => prev.filter(a => a.id !== achId));
        }
    };

    const handleSaveTask = (taskData: Omit<Task, 'id' | 'createdAt' | 'creatorId' | 'status'> | Task) => {
        if ('id' in taskData) { // Update
            const oldTask = tasks.find(t => t.id === taskData.id);
            setTasks(prev => prev.map(t => t.id === taskData.id ? {...t, ...taskData} : t));

            if (oldTask && taskData.assigneeId && oldTask.assigneeId !== taskData.assigneeId) {
                createNotification(`You have been assigned a task: "${taskData.title}"`, { page: Page.TASKS, id: taskData.id });
            }

            setNotifiedTaskIds(prev => {
                const newSet = new Set(prev);
                newSet.delete(taskData.id);
                return newSet;
            });
        } else { // Create
            const newTask: Task = { ...taskData, id: `task-${Date.now()}`, createdAt: new Date(), creatorId: currentUser!.id, status: TaskStatus.TODO };
            setTasks(prev => [newTask, ...prev]);
            if (newTask.assigneeId && newTask.assigneeId !== currentUser!.id) {
                createNotification(`You have been assigned a new task: "${newTask.title}"`, { page: Page.TASKS, id: newTask.id });
            }
        }
    };

    const handleDeleteTask = (taskId: string) => {
        if (window.confirm('Are you sure you want to delete this task?')) {
            setTasks(prev => prev.filter(t => t.id !== taskId));
        }
    };


    // --- USER & CHAT HANDLERS ---
    const handleAddUser = (userData: Omit<User, 'id' | 'role' | 'avatarUrl' | 'email'>) => {
        const newUser: User = {
            id: `user-${Date.now()}`,
            name: userData.name,
            username: userData.username,
            password: userData.password,
            role: Role.MEMBER,
            avatarUrl: `https://ui-avatars.com/api/?name=${userData.name.replace(' ', '+')}&background=random&color=fff`,
            email: `${userData.username.toLowerCase()}@parivartan-miet.org`,
        };
        setUsers(prev => [...prev, newUser]);
    };

    const handleDeleteUser = (userId: string) => {
        if (window.confirm('Are you sure you want to remove this member? This will remove all their posts and tasks.')) {
            setUsers(prev => prev.filter(u => u.id !== userId));
            setPosts(prev => prev.filter(p => p.authorId !== userId));
            setTasks(prev => prev.filter(t => t.creatorId !== userId && t.assigneeId !== userId));
        }
    };
    
    const handleSendMessage = (message: Omit<ChatMessage, 'id' | 'createdAt'>) => {
        const newMsg: ChatMessage = {
            ...message,
            id: `msg-${Date.now()}`,
            createdAt: new Date(),
        };
        setChatMessages(prev => [...prev, newMsg]);
    };
    
    // --- SEARCH HANDLER ---
    const handleSearch = (query: string) => {
        setSearchQuery(query);
        setIsSearchOpen(!!query);
    }


    if (!currentUser) {
        if (loginMode === 'selection') {
            return <LoginSelectionScreen onSelectRole={setLoginMode} onViewerLogin={handleViewerLogin} />;
        }
        return <LoginForm onLogin={handleLogin} onForgotPassword={handleForgotPassword} onBack={() => setLoginMode('selection')} mode={loginMode} />;
    }

    const renderPage = () => {
        switch (activePage) {
            case Page.HOME:
                return <HomeFeed posts={posts} users={users} currentUser={currentUser} onAddPost={handleAddPost} onDeletePost={handleDeletePost} />;
            case Page.ANNOUNCEMENTS:
                return <AnnouncementsPage announcements={announcements} currentUser={currentUser} onSave={handleSaveAnnouncement} onDelete={handleDeleteAnnouncement}/>;
            case Page.ACHIEVEMENTS:
                return <AchievementsPage achievements={achievements} currentUser={currentUser} onSave={handleSaveAchievement} onDelete={handleDeleteAchievement} />;
            case Page.EVENTS:
                return <EventsPage events={events} currentUser={currentUser} onSaveEvent={handleSaveEvent} onDeleteEvent={handleDeleteEvent} />;
            case Page.TASKS:
                return <TasksPage tasks={tasks} users={users} currentUser={currentUser} onSaveTask={handleSaveTask} onDeleteTask={handleDeleteTask} />;
            case Page.PROFILE:
                return <ProfilePage currentUser={currentUser} users={users} posts={posts} onAddUser={handleAddUser} onDeleteUser={handleDeleteUser} onDeletePost={handleDeletePost} />;
            case Page.CHAT:
                 return <ChatPage currentUser={currentUser} users={users} messages={chatMessages} onSendMessage={handleSendMessage} />;
            case Page.AI_MAGIC:
                return <AiMagicPage />;
            default:
                return <HomeFeed posts={posts} users={users} currentUser={currentUser} onAddPost={handleAddPost} onDeletePost={handleDeletePost} />;
        }
    };

    return (
        <div className="flex min-h-screen">
            <SideNav activePage={activePage} onNavigate={setActivePage} onLogout={handleLogout} user={currentUser} />
            <main className="flex-1 bg-light">
                <Header 
                    user={currentUser} 
                    onNavigate={setActivePage}
                    onSearch={handleSearch}
                    unreadCount={unreadNotificationCount}
                    notifications={notifications}
                    onReadNotification={handleReadNotification}
                />
                <div className="overflow-y-auto" style={{ height: 'calc(100vh - 65px)' }}>
                  {isLoading ? <LoadingSpinner /> : renderPage()}
                </div>
            </main>
            {isSearchOpen && <SearchResults query={searchQuery} posts={posts} announcements={announcements} achievements={achievements} events={events} users={users} onClose={() => setIsSearchOpen(false)} onNavigate={setActivePage} />}
        </div>
    );
}