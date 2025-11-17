

import React, { useState, useEffect, useCallback } from 'react';
import { createClient, Session } from '@supabase/supabase-js';
import { GoogleGenAI } from '@google/genai';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './constants';
import { Page, Role } from './types';
import { Icons } from './components/Icons';
import { initializeGemini } from './services/geminiService';
import CreatePost from './components/CreatePost';
import CreateEvent from './components/CreateEvent';
import NotificationToast from './components/NotificationToast';
import Auth from './components/Auth';
import Account from './components/Account';
import SetupGuide from './components/SetupGuide';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Main App Component
export default function App() {
    const [loading, setLoading] = useState(true);
    const [session, setSession] = useState<Session | null>(null);
    const [profile, setProfile] = useState(null);
    const [currentPage, setCurrentPage] = useState(Page.HOME);
    const [posts, setPosts] = useState([]);
    const [events, setEvents] = useState([]);
    const [notification, setNotification] = useState({ show: false, message: '', type: '' });
    const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [needsSetup, setNeedsSetup] = useState(false);
    const [isSetupModalOpen, setSetupModalOpen] = useState(false);

    const showNotification = useCallback((message, type = 'success') => {
        setNotification({ show: true, message, type });
        setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
    }, []);

    const fetchAppData = useCallback(async () => {
        // Reset setup state on refetch
        setNeedsSetup(false);

        const fetchPosts = async () => {
            const { data, error } = await supabase
                .from('posts')
                .select('*, profile:profiles(name, avatar_url, role)')
                .order('created_at', { ascending: false });
            if (error) {
                 if (error.message.includes("does not exist") || error.message.includes("schema cache")) {
                    setNeedsSetup(true);
                    return;
                 }
                console.error('Error fetching posts:', error.message);
                showNotification('Could not fetch posts.', 'error');
            }
            setPosts(data || []);
        };

        const fetchEvents = async () => {
            const { data, error } = await supabase
                .from('events')
                .select('*')
                .order('event_date', { ascending: true });
            if (error) {
                if (error.message.includes("does not exist") || error.message.includes("schema cache")) {
                    setNeedsSetup(true);
                    return;
                }
                console.error('Error fetching events:', error.message);
                showNotification('Could not fetch events.', 'error');
            }
            setEvents(data || []);
        };

        await Promise.all([fetchPosts(), fetchEvents()]);
    }, [showNotification]);


    const getProfile = useCallback(async (user) => {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();
        
        if (error && error.code !== 'PGRST116') { // PGRST116: no rows found
             if (error.message.includes("does not exist") || error.message.includes("schema cache")) {
                setNeedsSetup(true);
             } else {
                console.error('Error fetching profile:', error);
             }
        }
        setProfile(data);
        if (data) { // If profile exists, fetch app data
            await fetchAppData();
        }
    }, [fetchAppData]);


    useEffect(() => {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        initializeGemini(ai);

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            setLoading(true);
            setSession(session);
            if (session?.user) {
                await getProfile(session.user);
            } else {
                setProfile(null);
                // Even logged out users can see content if tables exist
                await fetchAppData();
            }
            setLoading(false);
        });
        
        // Initial load
        supabase.auth.getSession().then(({ data: { session } }) => {
            setLoading(true);
            setSession(session);
             if (session?.user) {
                getProfile(session.user).finally(() => setLoading(false));
            } else {
                fetchAppData().finally(() => setLoading(false));
            }
        });

        return () => subscription.unsubscribe();
    }, [getProfile, fetchAppData]);
    
    const NavLink = ({ page, icon, label }) => (
        <a
            href="#"
            onClick={(e) => {
                e.preventDefault();
                setCurrentPage(page);
                setMobileMenuOpen(false);
            }}
            className={`flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${currentPage === page ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}
        >
            <span dangerouslySetInnerHTML={{ __html: icon }} className="mr-3" />
            {label}
        </a>
    );

    const Sidebar = () => (
        <aside className="hidden md:flex md:flex-shrink-0">
            <div className="flex flex-col w-64 border-r border-border bg-card p-4">
                <div className="flex items-center h-16 flex-shrink-0 px-4">
                     <h1 className="text-2xl font-bold text-primary">PARIVARTAN</h1>
                </div>
                <nav className="flex-1 space-y-2 mt-6">
                    <NavLink page={Page.HOME} icon={Icons.HomeIcon()} label="Home" />
                    <NavLink page={Page.ANNOUNCEMENTS} icon={Icons.AnnouncementIcon()} label="Announcements" />
                    <NavLink page={Page.ACHIEVEMENTS} icon={Icons.TrophyIcon()} label="Achievements" />
                    <NavLink page={Page.EVENTS} icon={Icons.CalendarIcon()} label="Events" />
                    <NavLink page={Page.DONATIONS} icon={Icons.DollarIcon()} label="Donations" />
                    <NavLink page={Page.CHAT} icon={Icons.ChatIcon()} label="Group Chat" />
                </nav>
            </div>
        </aside>
    );

    const Header = () => (
        <header className="flex items-center justify-between md:justify-end h-16 px-4 md:px-6 border-b border-border bg-card">
             <button className="md:hidden" onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}>
                <span dangerouslySetInnerHTML={{__html: isMobileMenuOpen ? Icons.XIcon() : Icons.MenuIcon()}} />
            </button>
            <div className="flex items-center space-x-4">
                {profile ? (
                    <button onClick={() => setCurrentPage(Page.PROFILE)} className="flex items-center space-x-2">
                        <p className="font-medium">{profile.name}</p>
                        <img src={profile.avatar_url || `https://api.dicebear.com/8.x/initials/svg?seed=${profile.name}`} alt="User avatar" className="w-10 h-10 rounded-full" />
                    </button>
                ) : (
                     <p className="font-medium text-muted-foreground">Guest</p>
                )}
            </div>
        </header>
    );

    const HomePage = () => (
        <div className="max-w-3xl mx-auto">
            {profile ? <CreatePost profile={profile} onPostCreated={fetchAppData} showNotification={showNotification} /> : <div className="p-4 text-center bg-muted rounded-lg border border-border">Sign in to create a post.</div>}
            <div className="mt-8 space-y-6">
                {posts.length > 0 ? posts.map(post => (
                    <div key={post.id} className="bg-card p-5 rounded-lg shadow-sm border border-border">
                         <div className="flex items-center mb-4">
                            <img src={post.profile?.avatar_url || `https://api.dicebear.com/8.x/initials/svg?seed=${post.profile?.name || 'A'}`} alt="author" className="w-10 h-10 rounded-full mr-3" />
                            <div>
                                <p className="font-semibold">{post.profile?.name || 'Anonymous'}</p>
                                <p className="text-xs text-muted-foreground">{new Date(post.created_at).toLocaleString()}</p>
                            </div>
                        </div>
                        <p className="text-card-foreground whitespace-pre-wrap">{post.content}</p>
                        {post.image_url && <img src={post.image_url} alt="post content" className="mt-4 rounded-lg max-h-96 w-full object-cover" />}
                    </div>
                )) : <p className="text-center text-muted-foreground">No posts yet. Be the first to share something!</p>}
            </div>
        </div>
    );
    
    const EventsPage = () => (
         <div className="max-w-3xl mx-auto">
            {profile && [Role.ADMIN, Role.SUPER_ADMIN].includes(profile.role) ? (
                <CreateEvent profile={profile} onEventCreated={fetchAppData} showNotification={showNotification} />
            ) : (
                <h2 className="text-2xl font-bold text-center mb-6">Upcoming Events</h2>
            )}
             <div className="mt-8 space-y-6">
                 {events.length > 0 ? events.map(event => (
                    <div key={event.id} className="bg-card p-5 rounded-lg shadow-sm border border-border">
                         <h2 className="text-xl font-bold text-primary mb-2">{event.title}</h2>
                         <p className="text-card-foreground mb-4">{event.description}</p>
                         <div className="text-sm text-muted-foreground space-y-1">
                            <p><strong>Date:</strong> {new Date(event.event_date).toLocaleDateString()}</p>
                            <p><strong>Time:</strong> {event.event_time}</p>
                            <p><strong>Location:</strong> {event.location}</p>
                         </div>
                    </div>
                 )) : <p className="text-center text-muted-foreground">No upcoming events. Stay tuned!</p>}
            </div>
        </div>
    );
    
     const ProfilePage = () => (
        // FIX: Removed the 'key' prop, which was causing a TypeScript error.
        // The Account component's useEffect hook already handles session changes, making the key redundant.
        <Account session={session} onProfileUpdated={() => getProfile(session.user)} />
    );

    const renderPage = () => {
        if (!session) return <Auth />;
        if (!profile) return <ProfilePage />;

        switch (currentPage) {
            case Page.HOME: return <HomePage />;
            case Page.EVENTS: return <EventsPage />;
            case Page.PROFILE: return <ProfilePage />;
            case Page.ANNOUNCEMENTS: return <div className="text-center p-8">Announcements Page - Coming Soon!</div>;
            case Page.ACHIEVEMENTS: return <div className="text-center p-8">Achievements Page - Coming Soon!</div>;
            case Page.DONATIONS: return <div className="text-center p-8">Donations Page - Coming Soon!</div>;
            case Page.CHAT: return <div className="text-center p-8">Group Chat - Coming Soon!</div>;
            default: return <HomePage />;
        }
    };

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center bg-background"><p>Loading...</p></div>;
    }
    
    if (!session || !profile) {
        return <div className="min-h-screen bg-background"><Auth /></div>;
    }

    return (
        <>
            {needsSetup && (
                 <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4" role="alert">
                    <p className="font-bold">Database Setup Required</p>
                    <p>Your database tables are not set up. <a href="#" onClick={(e) => { e.preventDefault(); setSetupModalOpen(true); }} className="font-bold underline">Click here</a> for instructions.</p>
                </div>
            )}
            <div className="flex h-screen bg-background text-foreground">
                <Sidebar />
                <div className="flex-1 flex flex-col overflow-hidden">
                    <Header />
                    <main className="flex-1 overflow-x-hidden overflow-y-auto bg-background p-4 md:p-6 lg:p-8">
                        {renderPage()}
                    </main>
                </div>
            </div>
            {isSetupModalOpen && <SetupGuide onClose={() => setSetupModalOpen(false)} onRetry={fetchAppData} />}
            {notification.show && <NotificationToast message={notification.message} type={notification.type} onClose={() => setNotification({ ...notification, show: false })} />}
        </>
    );
}