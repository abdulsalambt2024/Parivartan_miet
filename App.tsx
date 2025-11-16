
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { createClient, Session } from '@supabase/supabase-js';
import { 
    BADGES, SUPER_ADMIN_EMAILS
} from './constants';
import { 
    Role, User, Post, Announcement, Achievement, Event, Page, UserBadge, Badge, AppNotification, NotificationType,
    Campaign, Donor, ChatMessage, SlideshowItem, PopupMessage, Task, EventAttendee
} from './types';
import { 
    HomeIcon, AnnouncementIcon, AchievementIcon, AdminIcon, LogoutIcon, PlusIcon, TrashIcon, CalendarIcon, 
    LoginIcon, UserIcon, SparklesIcon, TrophyIcon, DollarIcon, ChatIcon, QuestionMarkCircleIcon, BellIcon,
    PencilIcon, CameraIcon, CheckIcon, DoubleCheckIcon, EyeIcon, EyeOffIcon,
    BlueTickIcon, GreenTickIcon, MenuIcon, XIcon, PhotographIcon, ChatAlt2Icon, SunIcon, MoonIcon, SearchIcon
} from './components/Icons';
import CreatePost from './components/CreatePost';
import CreateEvent from './components/CreateEvent';
import NotificationToast from './components/NotificationToast';
import { generateImage, enhanceImage } from './services/geminiService';


// --- Supabase Client Setup ---
const supabaseUrl = 'https://tygqwnndhncikuvwblnc.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR5Z3F3bm5kaG5jaWt1dndibG5jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMzMTMzODgsImV4cCI6MjA3ODg4OTM4OH0.2Aitr7aIt-JlmCfzMbpwbh7iWobgoeiOolxqqkRaPzA';
const supabase = createClient(supabaseUrl, supabaseAnonKey);


// Since new files cannot be added, all new components are defined here.

const VerifiedBadge = ({ user }: { user: User | undefined }) => {
    if (!user) return null;
    if (user.role === Role.ADMIN || user.role === Role.SUPER_ADMIN) {
        return <BlueTickIcon title="Admin" />;
    }
    if (user.role === Role.MEMBER) {
        return <GreenTickIcon title="Member" />;
    }
    return null;
};

const CreateModal = ({ title, onClose, children, onSubmit, submitText = "Create" }: { title: string; onClose: () => void; children?: React.ReactNode; onSubmit: (e: React.FormEvent) => void; submitText?: string }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-card text-card-foreground rounded-2xl shadow-2xl w-full max-w-2xl transform transition-all">
            <div className="p-6 border-b border-border">
                <h2 className="text-2xl font-bold">{title}</h2>
            </div>
            <form onSubmit={onSubmit}>
                <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                    {children}
                </div>
                <div className="p-6 bg-muted rounded-b-2xl flex justify-end space-x-3">
                    <button type="button" onClick={onClose} className="px-6 py-2 bg-accent text-accent-foreground rounded-lg font-semibold hover:bg-muted transition">Cancel</button>
                    <button type="submit" className="px-6 py-2 bg-secondary text-secondary-foreground rounded-lg font-bold hover:opacity-90 transition">{submitText}</button>
                </div>
            </form>
        </div>
    </div>
);

const ImageUploadField = ({ label, image, onImageUpload }: { label: string; image: string | null; onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void; }) => (
    <div>
        <label className="block text-sm font-medium text-muted-foreground mb-1">{label}</label>
        <input
            type="file"
            accept="image/*"
            onChange={onImageUpload}
            className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
        />
        {image && <img src={image} alt="Preview" className="mt-4 rounded-lg max-h-48 w-auto object-cover" />}
    </div>
);

const CreateAnnouncement = ({ onClose, onAdd }: { onClose: () => void; onAdd: (data: Omit<Announcement, 'id' | 'createdAt'>) => void; }) => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [image, setImage] = useState<string | null>(null);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onloadend = () => setImage(reader.result as string);
            reader.readAsDataURL(e.target.files[0]);
        }
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onAdd({ title, content, imageUrl: image || undefined });
        onClose();
    };

    return (
        <CreateModal title="Create New Announcement" onClose={onClose} onSubmit={handleSubmit}>
            <InputField label="Title" name="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
            <InputField label="Content" name="content" value={content} onChange={(e) => setContent(e.target.value)} type="textarea" required />
            <ImageUploadField label="Image (Optional)" image={image} onImageUpload={handleImageUpload} />
        </CreateModal>
    );
};

const CreateAchievement = ({ onClose, onAdd }: { onClose: () => void; onAdd: (data: Omit<Achievement, 'id'>) => void; }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [date, setDate] = useState('');
    const [image, setImage] = useState<string | null>(null);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onloadend = () => setImage(reader.result as string);
            reader.readAsDataURL(e.target.files[0]);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!image) { alert("Image is required for an achievement."); return; }
        onAdd({ title, description, date: new Date(date), imageUrl: image });
        onClose();
    };
    
    return (
        <CreateModal title="Create New Achievement" onClose={onClose} onSubmit={handleSubmit}>
            <InputField label="Title" name="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
            <InputField label="Description" name="description" value={description} onChange={(e) => setDescription(e.target.value)} type="textarea" required />
            <InputField label="Date" name="date" value={date} onChange={(e) => setDate(e.target.value)} type="date" required />
            <ImageUploadField label="Image (Required)" image={image} onImageUpload={handleImageUpload} />
        </CreateModal>
    );
};

const CreateCampaign = ({ onClose, onAdd }: { onClose: () => void; onAdd: (data: Omit<Campaign, 'id' | 'raised'>) => void; }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [goal, setGoal] = useState('');
    const [upiId, setUpiId] = useState('');
    const [qrCodeImage, setQrCodeImage] = useState<string | null>(null);

    const handleQrCodeUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onloadend = () => setQrCodeImage(reader.result as string);
            reader.readAsDataURL(e.target.files[0]);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const goalAmount = parseFloat(goal);
        if (isNaN(goalAmount) || goalAmount <= 0) { alert("Please enter a valid goal amount."); return; }
        if (!qrCodeImage) { alert("Please upload a QR code image."); return; }
        onAdd({ title, description, goal: goalAmount, upiId, qrCodeUrl: qrCodeImage });
        onClose();
    };

    return (
        <CreateModal title="Create Donation Campaign" onClose={onClose} onSubmit={handleSubmit}>
            <InputField label="Campaign Title" name="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
            <InputField label="Description" name="description" value={description} onChange={(e) => setDescription(e.target.value)} type="textarea" required />
            <InputField label="Goal Amount (₹)" name="goal" value={goal} onChange={(e) => setGoal(e.target.value)} type="number" required />
            <InputField label="UPI ID" name="upiId" value={upiId} onChange={(e) => setUpiId(e.target.value)} placeholder="your-upi-id@bank" required />
            <ImageUploadField label="Upload QR Code (Required)" image={qrCodeImage} onImageUpload={handleQrCodeUpload} />
        </CreateModal>
    );
};

const CreateSlideshowItem = ({ onClose, onAdd }: { onClose: () => void; onAdd: (data: Omit<SlideshowItem, 'id' | 'createdAt' | 'isActive'>) => void; }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [image, setImage] = useState<string | null>(null);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onloadend = () => setImage(reader.result as string);
            reader.readAsDataURL(e.target.files[0]);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!image) { alert("Image is required for a slideshow item."); return; }
        onAdd({ title, description, imageUrl: image });
        onClose();
    };

    return (
        <CreateModal title="Create New Slideshow Item" onClose={onClose} onSubmit={handleSubmit}>
            <InputField label="Title" name="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
            <InputField label="Description" name="description" value={description} onChange={(e) => setDescription(e.target.value)} type="textarea" required />
            <ImageUploadField label="Image (Required, 1200x400 recommended)" image={image} onImageUpload={handleImageUpload} />
        </CreateModal>
    );
};

const CreatePopupMessage = ({ onClose, onAdd, onEdit, existingMessage }: { onClose: () => void; onAdd: (data: Omit<PopupMessage, 'id'>) => void; onEdit?: (data: PopupMessage) => void; existingMessage?: PopupMessage | null; }) => {
    const [title, setTitle] = useState(existingMessage?.title || '');
    const [content, setContent] = useState(existingMessage?.content || '');
    const [scheduledDate, setScheduledDate] = useState(existingMessage ? new Date(existingMessage.scheduledDate).toISOString().substring(0,10) : '');
    const [image, setImage] = useState<string | null>(existingMessage?.imageUrl || null);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onloadend = () => setImage(reader.result as string);
            reader.readAsDataURL(e.target.files[0]);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (existingMessage && onEdit) {
            onEdit({ ...existingMessage, title, content, scheduledDate: new Date(scheduledDate), imageUrl: image || undefined });
        } else {
            onAdd({ title, content, scheduledDate: new Date(scheduledDate), imageUrl: image || undefined });
        }
        onClose();
    };
    
    return (
        <CreateModal title={existingMessage ? "Edit Popup Message" : "Schedule a Popup Message"} onClose={onClose} onSubmit={handleSubmit} submitText={existingMessage ? "Save Changes" : "Schedule"}>
            <InputField label="Title" name="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
            <InputField label="Content" name="content" value={content} onChange={(e) => setContent(e.target.value)} type="textarea" required />
            <InputField label="Date to Show" name="scheduledDate" value={scheduledDate} onChange={(e) => setScheduledDate(e.target.value)} type="date" required />
            <ImageUploadField label="Image (Optional)" image={image} onImageUpload={handleImageUpload} />
        </CreateModal>
    );
};


const Slideshow = ({ items }: { items: SlideshowItem[] }) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        if (items.length <= 1) return;
        const interval = setInterval(() => {
            setCurrentIndex((prevIndex) => (prevIndex + 1) % items.length);
        }, 5000);
        return () => clearInterval(interval);
    }, [items.length]);

    if (!items || items.length === 0) return null;

    const currentItem = items[currentIndex];

    return (
        <div className="relative w-full h-64 rounded-xl shadow-lg overflow-hidden mb-8">
            <img src={currentItem.imageUrl} alt={currentItem.title} className="w-full h-full object-cover transition-transform duration-1000 ease-in-out" style={{transform: `scale(1.05)`}}/>
            <div className="absolute inset-0 bg-black bg-opacity-50 flex flex-col justify-end p-8">
                <h2 className="text-3xl font-bold text-white">{currentItem.title}</h2>
                <p className="text-white/90 mt-2">{currentItem.description}</p>
            </div>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
                {items.map((_, index) => (
                    <button key={index} onClick={() => setCurrentIndex(index)} className={`w-3 h-3 rounded-full ${currentIndex === index ? 'bg-white' : 'bg-white/50'}`}></button>
                ))}
            </div>
        </div>
    );
};

const TwoFactorAuthSetup = ({ onConfirm, onClose }: { onConfirm: () => void; onClose: () => void }) => (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
        <div className="bg-card text-card-foreground rounded-2xl shadow-2xl w-full max-w-md p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Setup Two-Factor Authentication</h2>
            <p className="text-muted-foreground mb-6">Scan this QR code with your Google Authenticator app, then click 'Done' to finish setup.</p>
            <div className="flex justify-center mb-6">
                 {/* In a real app, this QR code would be dynamically generated for the user */}
                <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=otpauth://totp/PARIVARTAN?secret=JBSWY3DPEHPK3PXP&issuer=PARIVARTAN" alt="Mock QR Code"/>
            </div>
            <p className="text-sm text-muted-foreground mb-6">After scanning, the app will provide you with a code to use during login.</p>
            <div className="flex justify-center space-x-4">
                 <button onClick={onClose} className="px-6 py-2 bg-accent text-accent-foreground rounded-lg font-semibold hover:bg-muted transition">Cancel</button>
                <button onClick={onConfirm} className="px-6 py-2 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-opacity-90 transition">Done</button>
            </div>
        </div>
    </div>
);

const HelpPage = () => (
    <div className="p-4 md:p-8">
        <h1 className="text-3xl font-bold mb-6">Help & Support</h1>
        <div className="bg-card rounded-xl shadow-md p-8 space-y-4">
            <p className="text-lg">For any issues, queries, or support, please feel free to contact us:</p>
            <div>
                <h2 className="text-xl font-semibold text-primary">Phone</h2>
                <a href="tel:9608353448" className="text-muted-foreground hover:underline">9608353448</a>
            </div>
            <div>
                <h2 className="text-xl font-semibold text-primary">Emails</h2>
                <a href="mailto:abdul.salam.bt.2024@miet.ac.in" className="text-muted-foreground block hover:underline">abdul.salam.bt.2024@miet.ac.in</a>
                <a href="mailto:hayatamr9608@gmail.com" className="text-muted-foreground block hover:underline">hayatamr9608@gmail.com</a>
            </div>
        </div>
    </div>
);

const SignUpForm = ({ onSignUp, onSwitchToLogin }: { onSignUp: (name: string, email: string, pass: string) => Promise<void>; onSwitchToLogin: () => void; }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (password.length < 6) {
            setError("Password must be at least 6 characters long.");
            return;
        }
        setLoading(true);
        try {
            await onSignUp(name, email, password);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary to-sky-400 flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-card rounded-2xl shadow-2xl p-8 space-y-6">
                <div className="text-center">
                    <h1 className="text-3xl font-extrabold text-foreground">Create Account</h1>
                    <p className="text-muted-foreground mt-2">Join the PARIVARTAN family!</p>
                </div>
                {error && <div className="bg-destructive/20 border border-destructive/50 text-destructive px-4 py-3 rounded-lg" role="alert">{error}</div>}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="name" className="text-sm font-bold text-muted-foreground tracking-wide">Full Name</label>
                        <input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-transparent text-base py-2 border-b border-border focus:outline-none focus:border-secondary" placeholder="Enter your full name" required/>
                    </div>
                    <div>
                        <label htmlFor="email" className="text-sm font-bold text-muted-foreground tracking-wide">Email</label>
                        <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-transparent text-base py-2 border-b border-border focus:outline-none focus:border-secondary" placeholder="Enter your email address" required/>
                    </div>
                    <div className="relative">
                        <label htmlFor="password"className="text-sm font-bold text-muted-foreground tracking-wide">Password</label>
                        <input id="password" type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-transparent text-base py-2 border-b border-border focus:outline-none focus:border-secondary" placeholder="Create a password (min. 6 characters)" required/>
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-0 bottom-2 text-muted-foreground">
                           {showPassword ? <EyeOffIcon className="w-5 h-5"/> : <EyeIcon className="w-5 h-5"/>}
                        </button>
                    </div>
                    <div>
                        <button type="submit" disabled={loading} className="w-full flex justify-center bg-secondary text-secondary-foreground p-3 rounded-full tracking-wide font-semibold shadow-lg cursor-pointer transition ease-in duration-300 hover:bg-amber-400 disabled:bg-muted">
                            {loading ? 'Signing Up...' : 'Sign Up'}
                        </button>
                    </div>
                </form>
                 <div className="text-center text-sm">
                    <p className="text-muted-foreground">
                        Already have an account?{' '}
                        <button onClick={onSwitchToLogin} className="text-primary hover:underline font-semibold">
                            Log In
                        </button>
                    </p>
                 </div>
            </div>
        </div>
    );
};


const LoginForm = ({ onLogin, onForgotPassword, onSwitchToSignUp, onGuestLogin }: { onLogin: (email: string, pass: string) => Promise<void>; onForgotPassword: () => void; onSwitchToSignUp: () => void; onGuestLogin: () => void; }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await onLogin(email, password);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary to-sky-400 flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-card rounded-2xl shadow-2xl p-8 space-y-6">
                <div className="text-center">
                    <h1 className="text-3xl font-extrabold text-foreground">Welcome to PARIVARTAN</h1>
                    <p className="text-xs text-muted-foreground mt-4">ENLIGHTEN A CHILD DISCOVER A PERSONALITY</p>
                </div>
                {error && <div className="bg-destructive/20 border border-destructive/50 text-destructive px-4 py-3 rounded-lg" role="alert">{error}</div>}
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="email" className="text-sm font-bold text-muted-foreground tracking-wide">Email</label>
                        <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-transparent text-base py-2 border-b border-border focus:outline-none focus:border-secondary" placeholder="Enter your email" required/>
                    </div>
                    <div className="relative">
                        <div className="flex justify-between items-center">
                            <label htmlFor="password"className="text-sm font-bold text-muted-foreground tracking-wide">Password</label>
                            <button type="button" onClick={onForgotPassword} className="text-xs text-primary hover:underline">Forgot Password?</button>
                        </div>
                        <input id="password" type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-transparent text-base py-2 border-b border-border focus:outline-none focus:border-secondary" placeholder="Enter your password" required/>
                         <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-0 bottom-2 text-muted-foreground">
                           {showPassword ? <EyeOffIcon className="w-5 h-5"/> : <EyeIcon className="w-5 h-5"/>}
                        </button>
                    </div>
                    <div>
                        <button type="submit" disabled={loading} className="w-full flex justify-center bg-primary text-primary-foreground p-3 rounded-full tracking-wide font-semibold shadow-lg cursor-pointer transition ease-in duration-300 hover:bg-opacity-90 disabled:bg-muted">
                            {loading ? 'Logging In...' : 'Log In'}
                        </button>
                    </div>
                </form>
                <div className="text-center text-sm space-y-2">
                    <p className="text-muted-foreground">
                        Don't have an account?{' '}
                        <button onClick={onSwitchToSignUp} className="text-primary hover:underline font-semibold">
                            Sign Up
                        </button>
                    </p>
                    <p>
                        <button onClick={onGuestLogin} className="text-muted-foreground hover:text-foreground font-semibold">
                            Continue as a Viewer
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

// FIX: Added loading state and updated handleSubmit to provide user feedback and prevent multiple submissions.
const TwoFactorAuthForm = ({ onVerify, onBack }: { onVerify: (code: string) => Promise<void>; onBack: () => void; }) => {
    const [code, setCode] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await onVerify(code);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary to-sky-400 flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-card rounded-2xl shadow-2xl p-8 space-y-6">
                <div className="text-center">
                    <h1 className="text-3xl font-extrabold text-foreground">Two-Factor Authentication</h1>
                    <p className="text-muted-foreground mt-2">Enter the code from your authenticator app.</p>
                </div>
                {error && <div className="bg-destructive/20 border border-destructive/50 text-destructive px-4 py-3 rounded-lg" role="alert">{error}</div>}
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="2fa-code" className="text-sm font-bold text-muted-foreground tracking-wide">6-Digit Code</label>
                        <input
                            id="2fa-code"
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            className="w-full bg-transparent text-center text-2xl tracking-[.5em] py-2 border-b border-border focus:outline-none focus:border-secondary"
                            placeholder="_ _ _ _ _ _"
                            maxLength={6}
                            autoComplete="one-time-code"
                            required
                        />
                    </div>
                    <div>
                        <button type="submit" disabled={loading} className="w-full flex justify-center bg-primary text-primary-foreground p-3 rounded-full tracking-wide font-semibold shadow-lg cursor-pointer transition ease-in duration-300 hover:bg-opacity-90 disabled:bg-muted">
                            {loading ? 'Verifying...' : 'Verify'}
                        </button>
                    </div>
                </form>
                 <div className="text-center">
                    <button onClick={onBack} className="text-sm text-primary hover:underline">
                        &larr; Back to login
                    </button>
                 </div>
            </div>
        </div>
    );
};

const AwaitingConfirmation = ({ email }: { email: string }) => (
    <div className="min-h-screen bg-gradient-to-br from-primary to-sky-400 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-card rounded-2xl shadow-2xl p-8 text-center space-y-6">
            <h1 className="text-3xl font-extrabold text-foreground">Confirm Your Email</h1>
            <p className="text-muted-foreground">
                We've sent a confirmation link to <span className="font-semibold text-foreground">{email}</span>. Please check your inbox (and spam folder!) and click the link to activate your account.
            </p>
            <p className="text-sm text-muted-foreground">This page will automatically update once you're confirmed.</p>
        </div>
    </div>
);


const ForgotPasswordForm = ({ onRequest, onBack }: { onRequest: (email: string) => Promise<void>, onBack: () => void }) => {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);
        try {
            await onRequest(email);
            setSuccess(`If an account exists for ${email}, a password reset link has been sent.`);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary to-sky-400 flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-card rounded-2xl shadow-2xl p-8 space-y-6">
                <div className="text-center">
                    <h1 className="text-3xl font-extrabold text-foreground">Reset Password</h1>
                    <p className="text-muted-foreground mt-2">Enter your email to receive a reset link.</p>
                </div>
                {error && <div className="bg-destructive/20 border border-destructive/50 text-destructive px-4 py-3 rounded-lg" role="alert">{error}</div>}
                {success && <div className="bg-green-500/20 border border-green-500/50 text-green-700 dark:text-green-400 px-4 py-3 rounded-lg" role="alert">{success}</div>}
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="email" className="text-sm font-bold text-muted-foreground tracking-wide">Email</label>
                        <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-transparent text-base py-2 border-b border-border focus:outline-none focus:border-secondary" placeholder="Enter your email" required/>
                    </div>
                    <button type="submit" disabled={loading || !!success} className="w-full flex justify-center bg-primary text-primary-foreground p-3 rounded-full tracking-wide font-semibold shadow-lg cursor-pointer transition ease-in duration-300 hover:bg-opacity-90 disabled:bg-muted">
                        {loading ? 'Sending...' : 'Send Reset Link'}
                    </button>
                </form>
                <div className="text-center">
                    <button onClick={onBack} className="text-sm text-primary hover:underline">
                        &larr; Back to login
                    </button>
                </div>
            </div>
        </div>
    );
};


const SideMenu = ({ isOpen, onClose, onNavigate, user }: { isOpen: boolean; onClose: () => void; onNavigate: (page: Page) => void; user: User }) => {
    const menuItems = [
        { page: Page.ACHIEVEMENTS, icon: AchievementIcon, label: 'My Achievements', roles: [Role.MEMBER, Role.ADMIN, Role.SUPER_ADMIN]},
        { page: Page.DONATIONS, icon: DollarIcon, label: 'Donations', roles: [Role.VIEWER, Role.MEMBER, Role.ADMIN, Role.SUPER_ADMIN] },
        { page: Page.AI_STUDIO, icon: SparklesIcon, label: 'AI Studio', roles: [Role.MEMBER, Role.ADMIN, Role.SUPER_ADMIN] },
        { page: Page.ADMIN_CONTENT, icon: PhotographIcon, label: 'Manage Content', roles: [Role.ADMIN, Role.SUPER_ADMIN] },
        { page: Page.ADMIN, icon: AdminIcon, label: 'Admin Panel', roles: [Role.ADMIN, Role.SUPER_ADMIN] },
        { page: Page.HELP, icon: QuestionMarkCircleIcon, label: 'Help & Support', roles: [Role.VIEWER, Role.MEMBER, Role.ADMIN, Role.SUPER_ADMIN] },
    ];

    return (
        <>
            <div className={`fixed inset-0 bg-black z-30 transition-opacity duration-300 ${isOpen ? 'bg-opacity-50' : 'bg-opacity-0 pointer-events-none'}`} onClick={onClose}></div>
            <div className={`fixed top-0 left-0 h-full w-72 bg-card text-card-foreground shadow-2xl z-40 transform transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="p-4 flex items-center justify-between border-b border-border">
                    <h1 className="text-2xl font-bold text-primary">Options</h1>
                    <button onClick={onClose} className="p-2 text-muted-foreground hover:text-foreground"><XIcon /></button>
                </div>
                <div className="p-4 border-b border-border">
                  <div className="flex items-center space-x-3">
                    <img src={user.avatarUrl} alt={user.name} className="w-12 h-12 rounded-full object-cover"/>
                    <div>
                      <div className="font-semibold flex items-center">{user.name} <VerifiedBadge user={user} /></div>
                      <p className="text-sm text-muted-foreground">@{user.username}</p>
                    </div>
                  </div>
                </div>
                <nav className="p-4 space-y-2">
                    {menuItems.filter(item => item.roles.includes(user.role)).map(item => (
                        <button
                            key={item.page}
                            onClick={() => { onNavigate(item.page); onClose(); }}
                            className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left font-semibold text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                        >
                            <item.icon className="w-6 h-6" />
                            <span>{item.label}</span>
                        </button>
                    ))}
                </nav>
            </div>
        </>
    );
};


const Header = ({ unreadCount, onNotificationsClick, onMenuClick, theme, toggleTheme }: { unreadCount: number; onNotificationsClick: () => void; onMenuClick: () => void; theme: 'light' | 'dark'; toggleTheme: () => void; }) => (
    <header className="bg-card/80 dark:bg-dark-card/80 backdrop-blur-sm sticky top-0 z-10 p-4 border-b border-border flex justify-between items-center">
        <button onClick={onMenuClick} className="p-2 text-muted-foreground hover:text-primary">
            <MenuIcon className="w-7 h-7" />
        </button>
        <div className="flex items-center space-x-4">
            <button onClick={onNotificationsClick} className="relative text-muted-foreground hover:text-primary">
                <BellIcon className="w-7 h-7" />
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 block h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">{unreadCount}</span>
                )}
            </button>
            <button onClick={toggleTheme} className="p-2 text-muted-foreground hover:text-primary">
                {theme === 'light' ? <MoonIcon className="w-6 h-6" /> : <SunIcon className="w-6 h-6" />}
            </button>
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
    <div className="bg-card rounded-xl shadow-md overflow-hidden transform hover:scale-[1.02] transition-transform duration-300">
        {post.imageUrl && <img className="h-48 w-full object-cover" src={post.imageUrl} alt="Post image" />}
        <div className="p-6">
            <div className="flex items-center mb-4">
                <img className="w-10 h-10 rounded-full mr-4 object-cover" src={author?.avatarUrl} alt={author?.name} />
                <div>
                    <div className="font-bold text-lg flex items-center">{author?.name} <VerifiedBadge user={author} /></div>
                    <p className="text-muted-foreground text-sm">{new Date(post.createdAt).toLocaleString()}</p>
                </div>
                {canDelete && (
                    <button onClick={() => onDelete(post.id)} className="ml-auto text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-destructive/10">
                        <TrashIcon className="w-5 h-5" />
                    </button>
                )}
            </div>
            <p className="text-card-foreground/90">{post.content}</p>
        </div>
    </div>
);

const SearchInput = ({ value, onChange, placeholder }: { value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; placeholder: string; }) => (
    <div className="relative mb-6">
        <input 
            type="text"
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className="w-full p-3 pl-10 bg-card border border-border rounded-full focus:ring-2 focus:ring-ring focus:outline-none"
        />
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            <SearchIcon />
        </div>
    </div>
);

const HomeFeed = ({ posts, users, currentUser, onDeletePost, slideshowItems, searchQuery, setSearchQuery }: { posts: Post[]; users: User[]; currentUser: User; onDeletePost: (postId: string) => void; slideshowItems: SlideshowItem[]; searchQuery: string; setSearchQuery: (q: string) => void; }) => {
    const usersById = useMemo(() => new Map(users.map(u => [u.id, u])), [users]);

    return (
        <div className="p-4 md:p-8">
            {slideshowItems && slideshowItems.length > 0 && <Slideshow items={slideshowItems} />}
            <h1 className="text-3xl font-bold mb-6">Community Feed</h1>
            <SearchInput value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search posts..." />
            <div className="grid gap-8">
                {posts.length > 0 ? posts.map(post => (
                    <PostCard
                        key={post.id}
                        post={post}
                        author={usersById.get(post.authorId)}
                        onDelete={onDeletePost}
                        canDelete={currentUser.role === Role.ADMIN || currentUser.role === Role.SUPER_ADMIN || currentUser.id === post.authorId}
                    />
                )) : <p className="text-muted-foreground text-center">No posts yet. Be the first to share something!</p>}
            </div>
        </div>
    );
};

const AnnouncementsPage = ({ announcements, currentUser, onAdd, onDelete, searchQuery, setSearchQuery }: { announcements: Announcement[], currentUser: User; onAdd: (data: Omit<Announcement, 'id' | 'createdAt'>) => void; onDelete: (id: string) => void; searchQuery: string; setSearchQuery: (q: string) => void; }) => {
    const [isCreating, setIsCreating] = useState(false);
    const canManage = currentUser.role === Role.ADMIN || currentUser.role === Role.SUPER_ADMIN;

    return (
        <div className="p-4 md:p-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Announcements</h1>
                {canManage && (
                    <button onClick={() => setIsCreating(true)} className="flex items-center space-x-2 bg-secondary text-secondary-foreground font-bold px-6 py-3 rounded-full shadow-lg hover:opacity-90 transition">
                        <PlusIcon className="w-5 h-5" />
                        <span>Create Announcement</span>
                    </button>
                )}
            </div>
            <SearchInput value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search announcements..." />
            <div className="space-y-6">
                 {announcements.length > 0 ? announcements.map(ann => (
                    <div key={ann.id} className="bg-card rounded-xl shadow-md p-6 relative">
                        {ann.imageUrl && <img src={ann.imageUrl} alt={ann.title} className="w-full h-40 object-cover rounded-lg mb-4" />}
                        <h2 className="text-2xl font-bold text-primary mb-2">{ann.title}</h2>
                        <p className="text-sm text-muted-foreground mb-4">{new Date(ann.createdAt).toLocaleDateString()}</p>
                        <p className="text-card-foreground/90 whitespace-pre-wrap">{ann.content}</p>
                        {canManage && <button onClick={() => onDelete(ann.id)} className="absolute top-4 right-4 text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-destructive/10"><TrashIcon className="w-5 h-5"/></button>}
                    </div>
                )) : <p className="text-muted-foreground text-center">No announcements have been made.</p>}
            </div>
            {isCreating && <CreateAnnouncement onClose={() => setIsCreating(false)} onAdd={onAdd} />}
        </div>
    );
};

const AchievementsPage = ({ achievements, currentUser, onAdd, onDelete, searchQuery, setSearchQuery }: { achievements: Achievement[], currentUser: User, onAdd: (data: Omit<Achievement, 'id'>) => void; onDelete: (id: string) => void; searchQuery: string; setSearchQuery: (q: string) => void; }) => {
    const [isCreating, setIsCreating] = useState(false);
    const canManage = currentUser.role === Role.ADMIN || currentUser.role === Role.SUPER_ADMIN;

    return (
        <div className="p-4 md:p-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Our Achievements</h1>
                {canManage && (
                    <button onClick={() => setIsCreating(true)} className="flex items-center space-x-2 bg-secondary text-secondary-foreground font-bold px-6 py-3 rounded-full shadow-lg hover:opacity-90 transition">
                        <PlusIcon className="w-5 h-5" />
                        <span>Create Achievement</span>
                    </button>
                )}
            </div>
            <SearchInput value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search achievements..." />
            <div className="grid md:grid-cols-2 gap-8">
                {achievements.length > 0 ? achievements.map(ach => (
                    <div key={ach.id} className="bg-card rounded-xl shadow-md overflow-hidden group relative">
                        <img className="h-56 w-full object-cover" src={ach.imageUrl} alt={ach.title} />
                        <div className="p-6">
                            <p className="text-sm text-secondary font-bold mb-1">{new Date(ach.date).toLocaleDateString()}</p>
                            <h2 className="text-xl font-bold mb-2">{ach.title}</h2>
                            <p className="text-muted-foreground">{ach.description}</p>
                        </div>
                        {canManage && <button onClick={() => onDelete(ach.id)} className="absolute top-4 right-4 text-white bg-black/40 hover:bg-red-600 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"><TrashIcon className="w-5 h-5"/></button>}
                    </div>
                )) : <p className="text-muted-foreground text-center md:col-span-2">No achievements have been recorded yet.</p>}
            </div>
            {isCreating && <CreateAchievement onClose={() => setIsCreating(false)} onAdd={onAdd} />}
        </div>
    );
};

interface EventCardProps {
  event: Event;
  canDelete: boolean;
  onDelete: (eventId: string) => void;
  onAttend: (eventId: string) => void;
  hasAttended: boolean;
  isMember: boolean;
}

const EventCard: React.FC<EventCardProps> = ({ event, canDelete, onDelete, onAttend, hasAttended, isMember }) => {
    const isPast = new Date(event.date) < new Date();
    return (
        <div className="bg-card rounded-xl shadow-md overflow-hidden flex flex-col">
            {event.imageUrl && <img className="h-48 w-full object-cover" src={event.imageUrl} alt={event.title} />}
            <div className="p-6 flex flex-col flex-grow">
                <p className="text-sm text-secondary font-bold mb-1">{new Date(event.date).toLocaleString()}</p>
                <h3 className="text-xl font-bold mb-2">{event.title}</h3>
                <p className="text-muted-foreground flex-grow">{event.description}</p>
                <div className="mt-4 flex items-center justify-between">
                    {!isPast && (
                        <a href={event.registrationLink} target="_blank" rel="noopener noreferrer" className="bg-secondary text-secondary-foreground font-bold px-4 py-2 rounded-full shadow-md hover:opacity-90 transition">
                            Register Now
                        </a>
                    )}
                     {isPast && isMember && (
                        hasAttended ? (
                            <span className="bg-green-100 text-green-800 font-bold px-4 py-2 rounded-full flex items-center">
                                <CheckIcon className="w-4 h-4 mr-2"/> Attended
                            </span>
                        ) : (
                            <button onClick={() => onAttend(event.id)} className="bg-blue-100 text-blue-800 font-bold px-4 py-2 rounded-full shadow-md hover:bg-blue-200 transition">
                                Mark Attendance
                            </button>
                        )
                    )}
                    {canDelete && <button onClick={() => onDelete(event.id)} className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-destructive/10"><TrashIcon className="w-5 h-5" /></button>}
                </div>
            </div>
        </div>
    );
};

const EventsPage = ({ events, currentUser, onAddEvent, onDeleteEvent, onAttendEvent, eventAttendees, searchQuery, setSearchQuery }: { events: Event[], currentUser: User, onAddEvent: (event: Omit<Event, 'id'>) => void, onDeleteEvent: (eventId: string) => void; onAttendEvent: (eventId: string) => void; eventAttendees: EventAttendee[], searchQuery: string; setSearchQuery: (q: string) => void; }) => {
    const [isCreatingEvent, setIsCreatingEvent] = useState(false);
    
    const now = new Date();
    const upcomingEvents = events.filter(e => new Date(e.date) >= now).sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const pastEvents = events.filter(e => new Date(e.date) < now).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const isAdmin = currentUser.role === Role.ADMIN || currentUser.role === Role.SUPER_ADMIN;
    const canCreate = isAdmin || currentUser.role === Role.MEMBER;
    
    const userAttendedEventIds = useMemo(() => new Set(eventAttendees.filter(a => a.userId === currentUser.id).map(a => a.eventId)), [eventAttendees, currentUser.id]);

    return (
        <div className="p-4 md:p-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Events</h1>
                {canCreate && (
                    <button
                        onClick={() => setIsCreatingEvent(true)}
                        className="flex items-center space-x-2 bg-secondary text-secondary-foreground font-bold px-6 py-3 rounded-full shadow-lg hover:opacity-90 transition"
                    >
                        <PlusIcon className="w-5 h-5" />
                        <span>Create Event</span>
                    </button>
                )}
            </div>
            
            <SearchInput value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search events..." />

            <h2 className="text-2xl font-semibold text-primary mb-4 border-b-2 border-primary/20 pb-2">Upcoming Events</h2>
            {upcomingEvents.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {upcomingEvents.map(event => <EventCard key={event.id} event={event} canDelete={isAdmin || currentUser.id === event.authorId} onDelete={onDeleteEvent} onAttend={onAttendEvent} hasAttended={userAttendedEventIds.has(event.id)} isMember={currentUser.role !== Role.VIEWER} />)}
                </div>
            ) : <p className="text-muted-foreground">No upcoming events scheduled. Check back soon!</p>}

            <h2 className="text-2xl font-semibold text-primary mt-12 mb-4 border-b-2 border-primary/20 pb-2">Past Events</h2>
            {pastEvents.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {pastEvents.map(event => <EventCard key={event.id} event={event} canDelete={isAdmin || currentUser.id === event.authorId} onDelete={onDeleteEvent} onAttend={onAttendEvent} hasAttended={userAttendedEventIds.has(event.id)} isMember={currentUser.role !== Role.VIEWER} />)}
                </div>
            ) : <p className="text-muted-foreground">No past events to show.</p>}

            {isCreatingEvent && <CreateEvent currentUser={currentUser} onClose={() => setIsCreatingEvent(false)} onAddEvent={onAddEvent} />}
        </div>
    );
};

const AdminPanel = ({ users, userBadges, currentUser, onPromoteUser, onAddTask, tasks, searchQuery, setSearchQuery }: { users: User[], userBadges: UserBadge[], currentUser: User, onPromoteUser: (userId: string, newRole: Role) => void; onAddTask: (userId: string) => void; tasks: Task[]; searchQuery: string; setSearchQuery: (q: string) => void; }) => {
    const badgesByUserId = useMemo(() => {
        const map = new Map<string, Badge[]>();
        userBadges.forEach(ub => {
            const userBadges = map.get(ub.userId) || [];
            const badgeInfo = BADGES[ub.badgeId];
            if (badgeInfo) userBadges.push(badgeInfo);
            map.set(ub.userId, userBadges);
        });
        return map;
    }, [userBadges]);
    
    const tasksByUserId = useMemo(() => {
        const map = new Map<string, number>();
        tasks.forEach(task => {
            map.set(task.userId, (map.get(task.userId) || 0) + 1);
        });
        return map;
    }, [tasks]);

    const canPromoteTo = (targetUser: User): Role[] => {
      const isSuperAdmin = currentUser.role === Role.SUPER_ADMIN;
      if (isSuperAdmin) {
        if (targetUser.role === Role.SUPER_ADMIN) return [];
        return [Role.VIEWER, Role.MEMBER, Role.ADMIN].filter(r => r !== targetUser.role);
      }
      if (targetUser.role === Role.ADMIN || targetUser.role === Role.SUPER_ADMIN) return [];
      return [Role.VIEWER, Role.MEMBER, Role.ADMIN].filter(r => r !== targetUser.role);
    };


    return (
        <div className="p-4 md:p-8">
            <h1 className="text-3xl font-bold mb-6">Admin Panel - Members</h1>
            <SearchInput value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search members by name or username..." />
            <div className="bg-card rounded-xl shadow-md overflow-hidden">
                <ul className="divide-y divide-border">
                    {users.filter(u => u.role !== Role.VIEWER).map(user => (
                        <li key={user.id} className="p-4 flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
                            <img className="w-16 h-16 rounded-full object-cover" src={user.avatarUrl} alt={user.name} />
                            <div className="flex-grow">
                                <p className="font-semibold text-lg flex items-center">{user.name} <VerifiedBadge user={user} /> <span className="text-muted-foreground text-sm ml-2">@{user.username}</span></p>
                                <p className="text-muted-foreground text-sm">{user.email}</p>
                                <div className="text-muted-foreground text-xs">
                                    {user.course} {user.branch} - {user.year} Year
                                </div>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {(badgesByUserId.get(user.id) || []).map(badge => (
                                        <div key={badge.id} title={badge.description} className="flex items-center text-xs bg-muted p-1 rounded">
                                            <span>{badge.icon}</span>
                                            <span className="ml-1 font-medium">{badge.name}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
                              <div className="flex flex-col items-end">
                                <span className="text-sm">Tasks: {tasksByUserId.get(user.id) || 0}</span>
                                <button onClick={() => onAddTask(user.id)} className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded hover:bg-green-200">Add Task</button>
                              </div>
                              <span className={`px-3 py-1 text-sm font-semibold rounded-full ${user.role === Role.ADMIN || user.role === Role.SUPER_ADMIN ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>{user.role}</span>
                              {currentUser.id !== user.id && canPromoteTo(user).length > 0 && (
                                <select onChange={(e) => onPromoteUser(user.id, e.target.value as Role)} value={user.role} className="p-1 border border-border rounded bg-card text-sm focus:ring-1 focus:ring-ring">
                                  <option value={user.role} disabled>Promote</option>
                                  {canPromoteTo(user).map(role => <option key={role} value={role}>{role}</option>)}
                                </select>
                              )}
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

const ProfilePage = ({ user, userBadges, onUpdateUser, onLogout }: { user: User, userBadges: UserBadge[], onUpdateUser: (updatedUser: Partial<User>) => void, onLogout: () => void }) => {
    const myBadges = useMemo(() => {
        return userBadges
            .filter(ub => ub.userId === user.id)
            .map(ub => BADGES[ub.badgeId])
            .filter(Boolean);
    }, [user.id, userBadges]);
    
    const [isEditing, setIsEditing] = useState(false);
    const [isSettingUp2FA, setIsSettingUp2FA] = useState(false);
    const isViewer = user.role === Role.VIEWER;

    const handleEnable2FA = () => {
        onUpdateUser({ is2FAEnabled: true, is2FAVerified: false });
        setIsSettingUp2FA(false);
    };

    const handleDisable2FA = () => {
        if (window.confirm("Are you sure you want to disable 2FA? This will reduce your account security.")) {
            onUpdateUser({ is2FAEnabled: false, is2FAVerified: false });
        }
    };

    return (
        <div className="p-4 md:p-8">
            {isEditing ? (
                <EditProfileForm user={user} onSave={(updatedUser) => { onUpdateUser(updatedUser); setIsEditing(false); }} onCancel={() => setIsEditing(false)} />
            ) : (
                <>
                    <div className="bg-card rounded-xl shadow-md p-8">
                        <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                             <div className="flex items-start flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-8">
                                <img src={user.avatarUrl} alt={user.name} className="w-32 h-32 rounded-full object-cover ring-4 ring-secondary p-1" />
                                <div>
                                    <h1 className="text-4xl font-bold flex items-center">{user.name} <VerifiedBadge user={user} /></h1>
                                    <p className="text-xl text-muted-foreground">@{user.username}</p>
                                    <p className="mt-2 px-3 py-1 text-base font-semibold rounded-full inline-block bg-primary/10 text-primary">{user.role}</p>
                                </div>
                            </div>
                            {!isViewer && 
                             <button onClick={() => setIsEditing(true)} className="flex items-center space-x-2 self-start bg-accent hover:bg-muted text-accent-foreground font-semibold px-4 py-2 rounded-lg flex-shrink-0">
                                <PencilIcon className="w-5 h-5"/>
                                <span>Edit Profile</span>
                             </button>
                            }
                        </div>
                        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4 border-t border-border pt-6">
                            <div><p className="text-sm text-muted-foreground">Father's Name</p><p className="font-semibold">{user.fatherName || 'N/A'}</p></div>
                            <div><p className="text-sm text-muted-foreground">Date of Birth</p><p className="font-semibold">{user.dob || 'N/A'}</p></div>
                            <div><p className="text-sm text-muted-foreground">Course</p><p className="font-semibold">{user.course || 'N/A'} - {user.branch || 'N/A'}</p></div>
                            <div><p className="text-sm text-muted-foreground">Roll Number</p><p className="font-semibold">{user.rollNumber || 'N/A'}</p></div>
                        </div>
                         {user.role !== Role.VIEWER && (
                            <div className="mt-6 border-t border-border pt-6">
                                <h3 className="text-lg font-semibold">Security</h3>
                                {user.is2FAEnabled ? (
                                    <div className="flex items-center justify-between mt-2 p-3 bg-green-500/10 rounded-lg">
                                        <p className="text-sm font-medium text-green-700 dark:text-green-400">Two-Factor Authentication is enabled.</p>
                                        <button onClick={handleDisable2FA} className="text-sm text-red-600 hover:underline font-semibold">Disable</button>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-between mt-2 p-3 bg-amber-500/10 rounded-lg">
                                        <p className="text-sm font-medium text-amber-700 dark:text-amber-400">Two-Factor Authentication is disabled.</p>
                                        <button onClick={() => setIsSettingUp2FA(true)} className="text-sm text-blue-600 hover:underline font-semibold">Enable Now</button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </>
            )}

            {!isViewer && (
                 <div className="mt-8">
                    <h2 className="text-2xl font-bold mb-4">My Badges ({myBadges.length})</h2>
                    {myBadges.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {myBadges.map(badge => (
                                <div key={badge.id} className="bg-card rounded-xl shadow-md p-6 flex items-center space-x-4">
                                    <span className="text-4xl">{badge.icon}</span>
                                    <div>
                                        <h3 className="font-bold">{badge.name}</h3>
                                        <p className="text-muted-foreground">{badge.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-card rounded-xl shadow-md p-8 text-center text-muted-foreground">
                            <p>You haven't earned any badges yet. Keep participating to unlock achievements!</p>
                        </div>
                    )}
                </div>
            )}
           
            <div className="mt-8 p-4 bg-card rounded-xl shadow-md">
                <button onClick={onLogout} className="w-full flex items-center justify-center space-x-3 px-4 py-3 rounded-lg font-semibold text-red-600 hover:bg-destructive/10 transition-colors">
                    <LogoutIcon />
                    <span>Logout</span>
                </button>
            </div>

            {isSettingUp2FA && <TwoFactorAuthSetup onConfirm={handleEnable2FA} onClose={() => setIsSettingUp2FA(false)} />}
        </div>
    );
};

const EditProfileForm = ({ user, onSave, onCancel }: { user: User; onSave: (updatedUser: User) => void; onCancel: () => void; }) => {
    const [formData, setFormData] = useState(user);
    const [avatarPreview, setAvatarPreview] = useState(user.avatarUrl);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };
    
    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const result = reader.result as string;
                setAvatarPreview(result);
                setFormData({ ...formData, avatarUrl: result });
            };
            reader.readAsDataURL(e.target.files[0]);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className="bg-card rounded-xl shadow-md p-8">
            <h2 className="text-2xl font-bold mb-6">Edit Profile</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex items-center space-x-6">
                    <img src={avatarPreview} alt="Avatar Preview" className="w-24 h-24 rounded-full object-cover" />
                    <div>
                        <label htmlFor="avatar-upload" className="cursor-pointer bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-semibold hover:bg-opacity-90">Change Picture</label>
                        <input id="avatar-upload" type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InputField label="Full Name" name="name" value={formData.name} onChange={handleChange} />
                    <InputField label="Father's Name" name="fatherName" value={formData.fatherName} onChange={handleChange} />
                    <InputField label="Date of Birth" name="dob" type="date" value={formData.dob} onChange={handleChange} />
                    <InputField label="Course" name="course" value={formData.course} onChange={handleChange} />
                    <InputField label="Branch" name="branch" value={formData.branch} onChange={handleChange} />
                    <InputField label="Roll Number" name="rollNumber" value={formData.rollNumber} onChange={handleChange} />
                    <InputField label="Year" name="year" value={formData.year} onChange={handleChange} />
                    <InputField label="Semester" name="semester" value={formData.semester} onChange={handleChange} />
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                    <button type="button" onClick={onCancel} className="px-6 py-2 bg-accent text-accent-foreground rounded-lg font-semibold hover:bg-muted">Cancel</button>
                    <button type="submit" className="px-6 py-2 bg-secondary text-secondary-foreground rounded-lg font-bold hover:opacity-90">Save Changes</button>
                </div>
            </form>
        </div>
    );
};

const InputField = ({ label, name, value, onChange, type = 'text', required = false, placeholder = '' }: { label: string; name: string; value?: string; onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void; type?: string; required?: boolean; placeholder?: string; }) => (
    <div>
        <label className="block text-sm font-medium text-muted-foreground">{label}</label>
        {type === 'textarea' ? (
            <textarea name={name} value={value || ''} onChange={onChange} required={required} placeholder={placeholder} className="mt-1 block w-full px-3 py-2 bg-card border border-border rounded-md shadow-sm focus:outline-none focus:ring-ring focus:border-primary h-24" />
        ) : (
            <input type={type} name={name} value={value || ''} onChange={onChange} required={required} placeholder={placeholder} className="mt-1 block w-full px-3 py-2 bg-card border border-border rounded-md shadow-sm focus:outline-none focus:ring-ring focus:border-primary" />
        )}
    </div>
);


const NotificationContainer = ({ notifications, onClose }: { notifications: AppNotification[], onClose: (id: number) => void }) => (
    <div className="fixed top-20 right-5 z-[100] space-y-3 w-full max-w-sm">
        {notifications.map(notif => (
            <NotificationToast key={notif.id} notification={notif} onClose={() => onClose(notif.id)} />
        ))}
    </div>
);

const DonationsPage = ({ campaigns, donors, currentUser, onDonate, onAdd, searchQuery, setSearchQuery }: { campaigns: Campaign[], donors: Donor[], currentUser: User, onDonate: (campaignId: string, amount: number, isAnonymous: boolean) => void, onAdd: (data: Omit<Campaign, 'id' | 'raised'>) => void; searchQuery: string; setSearchQuery: (q: string) => void; }) => {
    const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
    const [isCreating, setIsCreating] = useState(false);
    const canCreate = currentUser.role === Role.ADMIN || currentUser.role === Role.SUPER_ADMIN;

    const handleDonate = (amount: number, isAnonymous: boolean) => {
        if (selectedCampaign) {
            onDonate(selectedCampaign.id, amount, isAnonymous);
            setSelectedCampaign(null);
        }
    };
    
    return (
        <div className="p-4 md:p-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Donation Campaigns</h1>
                {canCreate && (
                    <button onClick={() => setIsCreating(true)} className="flex items-center space-x-2 bg-secondary text-secondary-foreground font-bold px-6 py-3 rounded-full shadow-lg hover:opacity-90 transition">
                        <PlusIcon className="w-5 h-5" />
                        <span>Create Campaign</span>
                    </button>
                )}
            </div>
            <SearchInput value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search campaigns..." />
            <div className="grid md:grid-cols-2 gap-8">
                {campaigns.length > 0 ? campaigns.map(campaign => (
                    <div key={campaign.id} className="bg-card rounded-xl shadow-md p-6 flex flex-col">
                        <h2 className="text-2xl font-bold text-primary mb-2">{campaign.title}</h2>
                        <p className="text-muted-foreground mb-4 flex-grow">{campaign.description}</p>
                        <div className="w-full bg-muted rounded-full h-2.5 mb-4">
                            <div className="bg-secondary h-2.5 rounded-full" style={{ width: `${Math.min(100, (campaign.raised / campaign.goal) * 100)}%` }}></div>
                        </div>
                        <div className="flex justify-between text-sm font-semibold mb-6">
                            <span>Raised: ₹{campaign.raised.toLocaleString()}</span>
                            <span>Goal: ₹{campaign.goal.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center space-x-6 bg-accent p-4 rounded-lg">
                            <img src={campaign.qrCodeUrl} alt="UPI QR Code" className="w-24 h-24" />
                            <div>
                                <p className="font-semibold">Scan to pay with any UPI app</p>
                                <p className="text-sm text-muted-foreground">UPI ID: <span className="font-mono text-primary">{campaign.upiId}</span></p>
                            </div>
                        </div>
                        <a href={`upi://pay?pa=${campaign.upiId}&pn=PARIVARTAN%20MIET&tn=Donation%20for%20${encodeURIComponent(campaign.title)}`} className="mt-4 block text-center w-full bg-secondary text-secondary-foreground font-bold py-3 rounded-lg hover:opacity-90 transition">
                            Donate Now via UPI
                        </a>
                        <button onClick={() => setSelectedCampaign(campaign)} className="mt-2 w-full text-sm text-primary hover:underline">
                            View Donors
                        </button>
                    </div>
                )) : <p className="text-muted-foreground text-center md:col-span-2">No active donation campaigns.</p>}
            </div>
            
            {selectedCampaign && (
                <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4" onClick={() => setSelectedCampaign(null)}>
                    <div className="bg-card rounded-2xl shadow-2xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
                        <h2 className="text-2xl font-bold mb-4">Donate to {selectedCampaign.title}</h2>
                        <DonationForm onSubmit={handleDonate} />
                        <div className="mt-6">
                            <h3 className="font-bold text-lg mb-2">Recent Donors</h3>
                            <ul className="space-y-2 max-h-40 overflow-y-auto">
                                {donors.map(donor => (
                                    <li key={donor.id} className="flex justify-between p-2 bg-muted rounded">
                                        <span>{donor.isAnonymous ? 'Anonymous' : donor.name}</span>
                                        <span className="font-semibold">₹{donor.amount.toLocaleString()}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            )}
            {isCreating && <CreateCampaign onClose={() => setIsCreating(false)} onAdd={onAdd} />}
        </div>
    );
};

const DonationForm = ({ onSubmit }: { onSubmit: (amount: number, isAnonymous: boolean) => void }) => {
    const [amount, setAmount] = useState('');
    const [isAnonymous, setIsAnonymous] = useState(false);
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const numAmount = parseInt(amount);
        if (numAmount > 0) {
            onSubmit(numAmount, isAnonymous);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="font-semibold">Amount (₹)</label>
                <input type="number" value={amount} onChange={e => setAmount(e.target.value)} className="w-full p-2 border border-border bg-card rounded mt-1" required/>
            </div>
            <div className="flex items-center">
                <input type="checkbox" id="anonymous" checked={isAnonymous} onChange={e => setIsAnonymous(e.target.checked)} className="h-4 w-4 rounded"/>
                <label htmlFor="anonymous" className="ml-2">Donate anonymously</label>
            </div>
            <button type="submit" className="w-full bg-primary text-primary-foreground font-bold py-2 rounded-lg hover:bg-opacity-90">Confirm Donation</button>
        </form>
    );
};

const ChatPage = ({ messages, currentUser, users, onSendMessage }: { messages: ChatMessage[], currentUser: User, users: User[], onSendMessage: (content: string, imageUrl?: string) => void }) => {
    const [newMessage, setNewMessage] = useState('');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const usersById = useMemo(() => new Map(users.map(u => [u.id, u])), [users]);
    const chatEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    const chatMembers = useMemo(() => users.filter(u => u.role === Role.MEMBER || u.role === Role.ADMIN || u.role === Role.SUPER_ADMIN), [users]);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = () => {
        if (newMessage.trim() === '' && !imageFile) return;

        if (imageFile) {
             const reader = new FileReader();
             reader.onloadend = () => {
                 onSendMessage(newMessage, reader.result as string);
                 setNewMessage('');
                 setImageFile(null);
                 if(fileInputRef.current) fileInputRef.current.value = "";
             };
             reader.readAsDataURL(imageFile);
        } else {
            onSendMessage(newMessage);
            setNewMessage('');
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if(e.target.files && e.target.files[0]){
            setImageFile(e.target.files[0]);
        }
    };

    const getMessageStatus = (message: ChatMessage) => {
        if(message.authorId !== currentUser.id) return null;
        const isReadAll = chatMembers.every(member => message.readBy.includes(member.id));
        if (isReadAll) return <DoubleCheckIcon className="w-5 h-5 text-blue-500" />;
        return <DoubleCheckIcon className="w-5 h-5 text-muted-foreground" />;
    };

    return (
        <div className="p-0 h-full flex flex-col bg-background">
            <h1 className="text-3xl font-bold p-4 border-b border-border">Group Chat</h1>
            <div className="flex-grow overflow-y-auto space-y-4 p-4">
                {messages.map(msg => (
                    <div key={msg.id} className={`flex items-end gap-2 ${msg.authorId === currentUser.id ? 'justify-end' : 'justify-start'}`}>
                        {msg.authorId !== currentUser.id && <img src={usersById.get(msg.authorId)?.avatarUrl} className="w-8 h-8 rounded-full"/>}
                        <div className={`max-w-xs md:max-w-md p-3 rounded-2xl ${msg.authorId === currentUser.id ? 'bg-primary text-primary-foreground rounded-br-none' : 'bg-card text-card-foreground rounded-bl-none shadow-sm'}`}>
                           {msg.authorId !== currentUser.id && <p className="font-bold text-sm text-secondary mb-1 flex items-center">{usersById.get(msg.authorId)?.name} <VerifiedBadge user={usersById.get(msg.authorId)} /></p>}
                           {msg.imageUrl && <img src={msg.imageUrl} alt="Chat attachment" className="rounded-lg mb-2 max-h-60" />}
                           <p className="whitespace-pre-wrap">{msg.content}</p>
                           <div className="flex justify-end items-center gap-2 mt-1">
                               <p className="text-xs opacity-70">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                               {getMessageStatus(msg)}
                           </div>
                        </div>
                    </div>
                ))}
                <div ref={chatEndRef} />
            </div>
            <div className="mt-auto p-4 bg-card border-t border-border">
                {imageFile && <p className="text-sm text-muted-foreground mb-2">Image attached: {imageFile.name}</p>}
                <div className="flex items-center space-x-2">
                    <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageChange} className="hidden"/>
                    <button onClick={() => fileInputRef.current?.click()} className="p-2 text-muted-foreground hover:text-primary"><PlusIcon className="w-6 h-6"/></button>
                    <input
                        type="text"
                        value={newMessage}
                        onChange={e => setNewMessage(e.target.value)}
                        onKeyPress={e => e.key === 'Enter' && handleSend()}
                        placeholder="Type a message..."
                        className="flex-grow p-3 border border-border bg-background rounded-full focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                    <button onClick={handleSend} className="bg-primary text-primary-foreground p-3 rounded-full hover:bg-opacity-90">
                        <svg className="w-6 h-6 transform rotate-90" fill="currentColor" viewBox="0 0 20 20"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"></path></svg>
                    </button>
                </div>
            </div>
        </div>
    );
};

const NotificationsPanel = ({ notifications, onMarkAsRead, onMarkAllAsRead, onClose }: { notifications: AppNotification[], onMarkAsRead: (id: number) => void, onMarkAllAsRead: () => void, onClose: () => void }) => {
    return (
        <div className="absolute top-16 right-5 z-50 w-full max-w-sm bg-card rounded-xl shadow-2xl border border-border">
            <div className="p-3 flex justify-between items-center border-b border-border">
                <h3 className="font-bold">Notifications</h3>
                <button onClick={onMarkAllAsRead} className="text-sm text-primary hover:underline">Mark all as read</button>
            </div>
            <div className="max-h-96 overflow-y-auto">
                {notifications.length === 0 ? (
                    <p className="text-center text-muted-foreground p-6">No new notifications.</p>
                ) : (
                    notifications.map(notif => (
                        <div key={notif.id} className={`p-3 border-b border-border flex items-start gap-3 ${!notif.read ? 'bg-primary/5' : ''}`}>
                            <div className={`mt-1 ${notif.type === NotificationType.ACHIEVEMENT ? 'text-secondary' : 'text-sky-500'}`}>
                                {notif.type === NotificationType.ACHIEVEMENT ? <TrophyIcon className="w-5 h-5"/> : <AnnouncementIcon className="w-5 h-5"/>}
                            </div>
                            <div className="flex-grow">
                                <p className="font-semibold">{notif.title}</p>
                                <p className="text-sm text-muted-foreground">{notif.content}</p>
                                <p className="text-xs text-muted-foreground/70 mt-1">{new Date(notif.date).toLocaleString()}</p>
                            </div>
                            {!notif.read && (
                                <button onClick={() => onMarkAsRead(notif.id)} title="Mark as read" className="w-3 h-3 mt-2 bg-primary rounded-full flex-shrink-0"></button>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

const ConfirmationModal = ({ message, onConfirm, onCancel }: { message: string, onConfirm: () => void, onCancel: () => void }) => (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[100] p-4">
        <div className="bg-card rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
            <h3 className="text-lg font-bold mb-4">Are you sure?</h3>
            <p className="text-muted-foreground mb-6">{message}</p>
            <div className="flex justify-center space-x-4">
                <button onClick={onCancel} className="px-6 py-2 bg-accent text-accent-foreground rounded-lg font-semibold hover:bg-muted">Cancel</button>
                <button onClick={onConfirm} className="px-6 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700">Delete</button>
            </div>
        </div>
    </div>
);

const AdminContentPage = ({ slideshowItems, popupMessage, onAddSlideshowItem, onDeleteSlideshowItem, onAddPopupMessage, onEditPopupMessage, onDeletePopupMessage }: { 
    slideshowItems: SlideshowItem[], 
    popupMessage: PopupMessage | null, 
    onAddSlideshowItem: (item: Omit<SlideshowItem, 'id' | 'createdAt' | 'isActive'>) => void,
    onDeleteSlideshowItem: (id: string) => void,
    onAddPopupMessage: (msg: Omit<PopupMessage, 'id'>) => void,
    onEditPopupMessage: (msg: PopupMessage) => void,
    onDeletePopupMessage: (id: string) => void,
}) => {
    const [isCreatingSlideshow, setIsCreatingSlideshow] = useState(false);
    const [isManagingPopup, setIsManagingPopup] = useState(false);

    return (
        <div className="p-4 md:p-8">
            <h1 className="text-3xl font-bold mb-6">Admin Content Management</h1>

            {/* Slideshow Management */}
            <div className="bg-card rounded-xl shadow-md p-6 mb-8">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-semibold text-primary">Homepage Slideshow</h2>
                    <button onClick={() => setIsCreatingSlideshow(true)} className="flex items-center space-x-2 bg-secondary text-secondary-foreground font-bold px-4 py-2 rounded-lg shadow-md hover:opacity-90 transition">
                        <PlusIcon className="w-5 h-5" />
                        <span>Add Slide</span>
                    </button>
                </div>
                <ul className="space-y-3">
                    {slideshowItems.map(item => (
                        <li key={item.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                            <div className="flex items-center space-x-4">
                                <img src={item.imageUrl} className="w-16 h-10 rounded object-cover" />
                                <div>
                                    <p className="font-semibold">{item.title}</p>
                                    <p className="text-sm text-muted-foreground">{item.description}</p>
                                </div>
                            </div>
                            <button onClick={() => onDeleteSlideshowItem(item.id)} className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-destructive/10"><TrashIcon className="w-5 h-5"/></button>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Popup Message Management */}
            <div className="bg-card rounded-xl shadow-md p-6">
                 <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-semibold text-primary">App Popup Message</h2>
                    {!popupMessage && (
                        <button onClick={() => setIsManagingPopup(true)} className="flex items-center space-x-2 bg-secondary text-secondary-foreground font-bold px-4 py-2 rounded-lg shadow-md hover:opacity-90 transition">
                            <PlusIcon className="w-5 h-5" />
                            <span>Schedule Popup</span>
                        </button>
                    )}
                </div>
                {popupMessage ? (
                    <div className="p-3 bg-muted rounded-lg">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="font-semibold">{popupMessage.title}</p>
                                <p className="text-sm text-muted-foreground">{popupMessage.content}</p>
                                <p className="text-xs text-blue-600 mt-1">Scheduled for: {new Date(popupMessage.scheduledDate).toLocaleDateString()}</p>
                            </div>
                             <div className="flex items-center">
                                <button onClick={() => setIsManagingPopup(true)} className="text-primary hover:text-blue-700 p-2 rounded-full hover:bg-primary/10"><PencilIcon className="w-5 h-5"/></button>
                                <button onClick={() => onDeletePopupMessage(popupMessage.id)} className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-destructive/10"><TrashIcon className="w-5 h-5"/></button>
                            </div>
                        </div>
                    </div>
                ) : <p className="text-muted-foreground">No popup message scheduled.</p>}
            </div>

            {isCreatingSlideshow && <CreateSlideshowItem onClose={() => setIsCreatingSlideshow(false)} onAdd={onAddSlideshowItem} />}
            {isManagingPopup && <CreatePopupMessage onClose={() => setIsManagingPopup(false)} onAdd={onAddPopupMessage} onEdit={onEditPopupMessage} existingMessage={popupMessage} />}
        </div>
    );
};

const BottomNav = ({ activePage, onNavigate, user, onPostClick }: { activePage: Page, onNavigate: (page: Page) => void, user: User, onPostClick: () => void }) => {
    const navItems = [
        { page: Page.HOME, icon: HomeIcon, label: 'Home', roles: [Role.VIEWER, Role.MEMBER, Role.ADMIN, Role.SUPER_ADMIN] },
        { page: Page.ANNOUNCEMENTS, icon: AnnouncementIcon, label: 'Alerts', roles: [Role.VIEWER, Role.MEMBER, Role.ADMIN, Role.SUPER_ADMIN] },
        { page: Page.CHAT, icon: ChatIcon, label: 'Chat', roles: [Role.MEMBER, Role.ADMIN, Role.SUPER_ADMIN] },
        { page: Page.PROFILE, icon: UserIcon, label: 'Profile', roles: [Role.VIEWER, Role.MEMBER, Role.ADMIN, Role.SUPER_ADMIN] },
    ];
    
    const canCreatePost = user.role !== Role.VIEWER;

    return (
        <div className="fixed bottom-0 left-0 right-0 h-20 bg-card/90 dark:bg-dark-card/90 backdrop-blur-sm border-t border-border flex justify-around items-center z-20">
            {navItems.filter(item => item.roles.includes(user.role)).map((item, index) => (
                <React.Fragment key={item.page}>
                    {/* Insert FAB placeholder for layout */}
                    {index === 2 && canCreatePost && <div className="w-16 h-16"></div>} 
                    <button
                        onClick={() => onNavigate(item.page)}
                        className={`flex flex-col items-center justify-center space-y-1 w-16 transition-colors ${activePage === item.page ? 'text-primary' : 'text-muted-foreground hover:text-primary'}`}
                    >
                        <item.icon className="w-7 h-7" />
                        <span className="text-xs font-semibold">{item.label}</span>
                    </button>
                </React.Fragment>
            ))}
             {canCreatePost && (
                <div className="absolute left-1/2 -translate-x-1/2 -top-8">
                    <button onClick={onPostClick} className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center text-secondary-foreground shadow-lg transform hover:scale-110 transition-transform">
                        <PlusIcon className="w-8 h-8"/>
                    </button>
                </div>
            )}
        </div>
    );
};


// MAIN APP COMPONENT

export default function App() {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    type AuthMode = 'login' | 'signup' | 'awaiting-confirmation' | 'forgot-password' | '2fa';
    const [authMode, setAuthMode] = useState<AuthMode>('login');
    const [pendingUser, setPendingUser] = useState<{email: string; pass: string} | null>(null);
    const [unconfirmedEmail, setUnconfirmedEmail] = useState<string>('');
    
    const [activePage, setActivePage] = useState<Page>(Page.HOME);
    const [isSideMenuOpen, setIsSideMenuOpen] = useState(false);
    const [theme, setTheme] = useState<'light' | 'dark'>('light');

    // --- Search States ---
    const [postsSearch, setPostsSearch] = useState('');
    const [announcementsSearch, setAnnouncementsSearch] = useState('');
    const [achievementsSearch, setAchievementsSearch] = useState('');
    const [eventsSearch, setEventsSearch] = useState('');
    const [donationsSearch, setDonationsSearch] = useState('');
    const [adminUsersSearch, setAdminUsersSearch] = useState('');

    // --- Data States (from Supabase) ---
    const [users, setUsers] = useState<User[]>([]);
    const [posts, setPosts] = useState<Post[]>([]);
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [achievements, setAchievements] =useState<Achievement[]>([]);
    const [events, setEvents] = useState<Event[]>([]);
    const [userBadges, setUserBadges] = useState<UserBadge[]>([]);
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [donors, setDonors] = useState<Donor[]>([]);
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
    const [slideshowItems, setSlideshowItems] = useState<SlideshowItem[]>([]);
    const [popupMessage, setPopupMessage] = useState<PopupMessage | null>(null);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [eventAttendees, setEventAttendees] = useState<EventAttendee[]>([]);

    // --- UI States ---
    const [toastNotifications, setToastNotifications] = useState<AppNotification[]>([]);
    const [allNotifications, setAllNotifications] = useState<AppNotification[]>([]);
    const [showPopup, setShowPopup] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [isCreatingPost, setIsCreatingPost] = useState(false);
    const [confirmation, setConfirmation] = useState<{ message: string; onConfirm: () => void; } | null>(null);
    
    const unreadCount = useMemo(() => allNotifications.filter(n => !n.read).length, [allNotifications]);


    // --- Theme Management ---
    useEffect(() => {
        const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const initialTheme = savedTheme || (prefersDark ? 'dark' : 'light');
        setTheme(initialTheme);
    }, []);

    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
    };

    // --- Search Filtering Logic ---
    const filteredPosts = useMemo(() => posts.filter(p => p.content.toLowerCase().includes(postsSearch.toLowerCase())), [posts, postsSearch]);
    const filteredAnnouncements = useMemo(() => announcements.filter(a => a.title.toLowerCase().includes(announcementsSearch.toLowerCase()) || a.content.toLowerCase().includes(announcementsSearch.toLowerCase())), [announcements, announcementsSearch]);
    const filteredAchievements = useMemo(() => achievements.filter(a => a.title.toLowerCase().includes(achievementsSearch.toLowerCase()) || a.description.toLowerCase().includes(achievementsSearch.toLowerCase())), [achievements, achievementsSearch]);
    const filteredEvents = useMemo(() => events.filter(e => e.title.toLowerCase().includes(eventsSearch.toLowerCase()) || e.description.toLowerCase().includes(eventsSearch.toLowerCase())), [events, eventsSearch]);
    const filteredCampaigns = useMemo(() => campaigns.filter(c => c.title.toLowerCase().includes(donationsSearch.toLowerCase()) || c.description.toLowerCase().includes(donationsSearch.toLowerCase())), [campaigns, donationsSearch]);
    const filteredAdminUsers = useMemo(() => users.filter(u => u.name.toLowerCase().includes(adminUsersSearch.toLowerCase()) || u.username.toLowerCase().includes(adminUsersSearch.toLowerCase())), [users, adminUsersSearch]);


    // Popup logic
    useEffect(() => {
        if(popupMessage && new Date(popupMessage.scheduledDate).toDateString() === new Date().toDateString()){
            setShowPopup(true);
        }
    }, [popupMessage]);

    // --- Data Fetching ---
    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [
                { data: usersData, error: usersError },
                { data: postsData, error: postsError },
                { data: announcementsData, error: announcementsError },
                { data: achievementsData, error: achievementsError },
                { data: eventsData, error: eventsError },
                { data: campaignsData, error: campaignsError },
                { data: donorsData, error: donorsError },
                { data: chatMessagesData, error: chatMessagesError },
                { data: slideshowItemsData, error: slideshowItemsError },
                { data: popupMessageData, error: popupMessageError },
                { data: userBadgesData, error: userBadgesError },
                { data: tasksData, error: tasksError },
                { data: eventAttendeesData, error: eventAttendeesError },
            ] = await Promise.all([
                supabase.from('profiles').select('*'),
                supabase.from('posts').select('*').order('createdAt', { ascending: false }),
                supabase.from('announcements').select('*').order('createdAt', { ascending: false }),
                supabase.from('achievements').select('*').order('date', { ascending: false }),
                supabase.from('events').select('*').order('date', { ascending: false }),
                supabase.from('campaigns').select('*'),
                supabase.from('donors').select('*'),
                supabase.from('chat_messages').select('*').order('timestamp', { ascending: true }),
                supabase.from('slideshow_items').select('*').order('createdAt', { ascending: false }),
                supabase.from('popup_message').select('*').limit(1).single(),
                supabase.from('user_badges').select('*'),
                supabase.from('tasks').select('*'),
                supabase.from('event_attendees').select('*'),
            ]);

            if (usersError) throw usersError;
            if (postsError) throw postsError;
            if (announcementsError) throw announcementsError;
            if (achievementsError) throw achievementsError;
            if (eventsError) throw eventsError;
            if (campaignsError) throw campaignsError;
            if (donorsError) throw donorsError;
            if (chatMessagesError) throw chatMessagesError;
            if (slideshowItemsError) throw slideshowItemsError;
            if (popupMessageError && popupMessageError.code !== 'PGRST116') throw popupMessageError; // Ignore "no rows found" error
            if (userBadgesError) throw userBadgesError;
            if (tasksError) throw tasksError;
            if (eventAttendeesError) throw eventAttendeesError;

            setUsers(usersData as User[] || []);
            setPosts(postsData as Post[] || []);
            setAnnouncements(announcementsData as Announcement[] || []);
            setAchievements(achievementsData as Achievement[] || []);
            setEvents(eventsData as Event[] || []);
            setCampaigns(campaignsData as Campaign[] || []);
            setDonors(donorsData as Donor[] || []);
            setChatMessages(chatMessagesData as ChatMessage[] || []);
            setSlideshowItems(slideshowItemsData as SlideshowItem[] || []);
            setPopupMessage(popupMessageData as PopupMessage || null);
            setUserBadges(userBadgesData as UserBadge[] || []);
            setTasks(tasksData as Task[] || []);
            setEventAttendees(eventAttendeesData as EventAttendee[] || []);

        } catch (error) {
            console.error("Error fetching data from Supabase:", error);
            alert("Could not load app data. Please check your connection and refresh.");
        } finally {
            setIsLoading(false);
        }
    };


    // --- Supabase Auth Listener ---
    useEffect(() => {
        const handleAuthChange = async (_event: string, session: Session | null) => {
            if (!session?.user) {
                setCurrentUser(null);
                setIsLoading(false);
                setAuthMode('login');
                setPendingUser(null);
                return;
            }

            let { data: profile, error } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();

            if (error && error.code === 'PGRST116') { // Profile doesn't exist, create it
                const userEmail = session.user.email!;
                const isSuperAdmin = SUPER_ADMIN_EMAILS.includes(userEmail);
                const newProfile = {
                    id: session.user.id,
                    name: session.user.user_metadata.name || userEmail.split('@')[0],
                    username: userEmail,
                    email: userEmail,
                    role: isSuperAdmin ? Role.SUPER_ADMIN : Role.VIEWER,
                    avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(session.user.user_metadata.name || userEmail)}&background=random&color=fff`,
                };
                const { data: createdProfile, error: insertError } = await supabase.from('profiles').insert(newProfile).select().single();
                if (insertError) throw insertError;
                profile = createdProfile;
            } else if (error) {
                throw error;
            }
            
            const isSuperAdmin = SUPER_ADMIN_EMAILS.includes(profile.email!);
            if (isSuperAdmin && profile.role !== Role.SUPER_ADMIN) {
                const { data: updatedProfile, error: updateError } = await supabase.from('profiles').update({ role: Role.SUPER_ADMIN }).eq('id', profile.id).select().single();
                if (updateError) throw updateError;
                profile = updatedProfile;
            }

            setCurrentUser(profile as User);
            await fetchData();
            setAuthMode('login');
            setPendingUser(null);
        };

        const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthChange);
        supabase.auth.getSession().then(({ data: { session } }) => {
            if(!session) setIsLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    // --- Realtime Subscriptions ---
    useEffect(() => {
        if (!currentUser) return;
        const chatChannel = supabase.channel('public:chat_messages')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat_messages' }, payload => {
                setChatMessages(prev => [...prev, payload.new as ChatMessage]);
            })
            .subscribe();

        return () => {
            supabase.removeChannel(chatChannel);
        };
    }, [currentUser]);


    const handleAwardBadge = useCallback(async (user: User, badgeId: string) => {
        const hasBadge = userBadges.some(b => b.userId === user.id && b.badgeId === badgeId);
        if (!hasBadge) {
            const newBadge = { userId: user.id, badgeId, earnedAt: new Date() };
            const { data, error } = await supabase.from('user_badges').insert(newBadge).select().single();
            if (error) { console.error(error); return; }
            setUserBadges(prev => [...prev, data as UserBadge]);
            
            const badgeInfo = BADGES[badgeId];
            if (badgeInfo) {
                const newNotif: AppNotification = { 
                    id: Date.now(), 
                    badge: badgeInfo,
                    type: NotificationType.ACHIEVEMENT,
                    title: "Achievement Unlocked!",
                    content: `You've earned the "${badgeInfo.name}" badge.`,
                    date: new Date(),
                    read: false,
                };
                setToastNotifications(prev => [newNotif, ...prev]);
                setAllNotifications(prev => [newNotif, ...prev]);
            }
        }
    }, [userBadges]);
    
    // --- AUTHENTICATION HANDLERS ---
    const handleLogin = async (email: string, pass: string) => {
        // Step 1: Validate credentials first.
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({ email, password: pass });
        if (signInError) throw signInError;
    
        if (signInData.user) {
            // Step 2: Fetch the user's profile to check 2FA status.
            const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('is2FAEnabled, is2FAVerified')
                .eq('id', signInData.user.id)
                .single();
    
            if (profileError) {
                await supabase.auth.signOut(); // Sign out for safety.
                throw profileError;
            }
    
            // Step 3: Decide the next step based on 2FA status.
            if (profile && profile.is2FAEnabled) {
                if (profile.is2FAVerified) {
                    // 2FA is fully active, requires code.
                    // Sign out to invalidate this partial session and show 2FA form.
                    await supabase.auth.signOut();
                    setPendingUser({ email, pass });
                    setAuthMode('2fa');
                } else {
                    // First login after enabling 2FA. Let them in and mark as verified.
                    // The onAuthStateChange listener will handle setting the user.
                    await supabase.from('profiles').update({ is2FAVerified: true }).eq('id', signInData.user.id);
                }
            }
            // If no 2FA, onAuthStateChange handles the successful login session.
        }
    };

    const handle2FAVerify = async (code: string) => {
        // In a real app, you'd verify the code. Here we just complete the login.
        if (pendingUser) {
             const { error } = await supabase.auth.signInWithPassword({ email: pendingUser.email, password: pendingUser.pass });
            if (error) throw error;
             // onAuthStateChange will take over from here.
        } else {
            throw new Error("Login session expired. Please try again.");
        }
    };

    const handleSignUp = async (name: string, email: string, pass: string) => {
        const { data, error } = await supabase.auth.signUp({ email, password: pass, options: { data: { name } } });
        if (error) throw error;
        if (data.user && data.user.identities?.length === 0) {
            throw new Error("This email is already in use but is unconfirmed. Please check your inbox to confirm it.");
        }
        setUnconfirmedEmail(email);
        setAuthMode('awaiting-confirmation');
    };
    
    const handleLogout = async () => {
      await supabase.auth.signOut();
      setCurrentUser(null);
      setPendingUser(null);
      setAuthMode('login');
    };
    
    const handleRequestPasswordReset = async (email: string) => {
        const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin });
        if (error) throw error;
    };

    const handleGuestLogin = () => {
        setCurrentUser({ id: 'viewer-session', name: 'Viewer', username: 'viewer', role: Role.VIEWER, avatarUrl: `https://ui-avatars.com/api/?name=Viewer&background=random&color=fff`, isConfirmed: true });
        setActivePage(Page.HOME);
    };

    // --- CRUD Handlers ---
    const handleAddPost = async (newPostData: Omit<Post, 'id' | 'createdAt'>) => {
        const { data, error } = await supabase.from('posts').insert({...newPostData, createdAt: new Date()}).select().single();
        if (error) { console.error(error); return; }
        setPosts(prev => [data as Post, ...prev]);
        if (currentUser) {
            const userPostCount = posts.filter(p => p.authorId === currentUser.id).length + 1;
            if (userPostCount === 1) handleAwardBadge(currentUser, 'first-post');
            if (userPostCount === 5) handleAwardBadge(currentUser, 'prolific-poster');
        }
    };

    const handleDeletePost = (postId: string) => setConfirmation({
        message: 'Are you sure you want to permanently delete this post?',
        onConfirm: async () => {
            const { error } = await supabase.from('posts').delete().eq('id', postId);
            if (!error) setPosts(prev => prev.filter(p => p.id !== postId));
            setConfirmation(null);
        }
    });
    
    const handleAddEvent = async (newEventData: Omit<Event, 'id'>) => {
        const { data, error } = await supabase.from('events').insert(newEventData).select().single();
        if (error) { console.error(error); return; }
        setEvents(prev => [data as Event, ...prev].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
        if (currentUser) {
            const userEventCount = events.filter(e => e.authorId === currentUser.id).length + 1;
            if (userEventCount === 1) handleAwardBadge(currentUser, 'event-creator');
            if (userEventCount === 3) handleAwardBadge(currentUser, 'super-organizer');
        }
    };

    const handleDeleteEvent = (eventId: string) => setConfirmation({
        message: 'Are you sure you want to permanently delete this event?',
        onConfirm: async () => {
            const { error } = await supabase.from('events').delete().eq('id', eventId);
            if (!error) setEvents(prev => prev.filter(e => e.id !== eventId));
            setConfirmation(null);
        }
    });
    
    const handleAttendEvent = async (eventId: string) => {
        if(!currentUser || currentUser.role === Role.VIEWER) return;

        const newAttendance = { eventId, userId: currentUser.id, attendedAt: new Date() };
        const { data, error } = await supabase.from('event_attendees').insert(newAttendance).select().single();
        if (error) { console.error(error); return; }
        
        const updatedAttendees = [...eventAttendees, data as EventAttendee];
        setEventAttendees(updatedAttendees);

        // Check for 'Perfect Attender' badge
        const userAttendances = updatedAttendees.filter(a => a.userId === currentUser.id);
        const attendedEventIds = new Set(userAttendances.map(a => a.eventId));
        
        const last5PastEvents = events
            .filter(e => new Date(e.date) < new Date())
            .sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .slice(0, 5);

        if (last5PastEvents.length === 5) {
            const attendedAllLast5 = last5PastEvents.every(e => attendedEventIds.has(e.id));
            if (attendedAllLast5) {
                handleAwardBadge(currentUser, 'perfect-attender');
            }
        }
    };

    const handleAddAnnouncement = async (data: Omit<Announcement, 'id' | 'createdAt'>) => {
        const { data: newAnn, error } = await supabase.from('announcements').insert({...data, createdAt: new Date()}).select().single();
        if (error) { console.error(error); return; }
        setAnnouncements(prev => [newAnn as Announcement, ...prev]);
    };

    const handleDeleteAnnouncement = (id: string) => setConfirmation({
        message: 'Are you sure you want to permanently delete this announcement?',
        onConfirm: async () => {
            const { error } = await supabase.from('announcements').delete().eq('id', id);
            if (!error) setAnnouncements(prev => prev.filter(a => a.id !== id));
            setConfirmation(null);
        }
    });
    
    const handleAddAchievement = async (data: Omit<Achievement, 'id'>) => {
        const { data: newAch, error } = await supabase.from('achievements').insert(data).select().single();
        if (error) { console.error(error); return; }
        setAchievements(prev => [newAch as Achievement, ...prev].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    };

    const handleDeleteAchievement = (id: string) => setConfirmation({
        message: 'Are you sure you want to permanently delete this achievement?',
        onConfirm: async () => {
            const { error } = await supabase.from('achievements').delete().eq('id', id);
            if(!error) setAchievements(prev => prev.filter(a => a.id !== id));
            setConfirmation(null);
        }
    });

    const handleAddTask = async (userId: string) => {
        const user = users.find(u => u.id === userId);
        if (!user) return;

        const newTask = { userId, title: `Completed Task #${tasks.filter(t => t.userId === userId).length + 1}`, completedAt: new Date() };
        const { data, error } = await supabase.from('tasks').insert(newTask).select().single();
        if (error) { console.error(error); return; }

        const updatedTasks = [...tasks, data as Task];
        setTasks(updatedTasks);
        
        const userTaskCount = updatedTasks.filter(t => t.userId === userId).length;
        if (userTaskCount === 10) {
            handleAwardBadge(user, 'task-master');
        }
    };

    const handleAddCampaign = async (data: Omit<Campaign, 'id' | 'raised'>) => {
        const { data: newCamp, error } = await supabase.from('campaigns').insert({...data, raised: 0}).select().single();
        if (error) { console.error(error); return; }
        setCampaigns(prev => [newCamp as Campaign, ...prev]);
    };

    const handleAddSlideshowItem = async (data: Omit<SlideshowItem, 'id' | 'createdAt' | 'isActive'>) => {
        const newItemData = { ...data, createdAt: new Date(), isActive: true };
        const { data: newItem, error } = await supabase.from('slideshow_items').insert(newItemData).select().single();
        if (error) { console.error(error); return; }
        setSlideshowItems(prev => [newItem as SlideshowItem, ...prev]);
    };

    const handleDeleteSlideshowItem = (id: string) => setConfirmation({
        message: 'Are you sure you want to permanently delete this slideshow item?',
        onConfirm: async () => {
            const { error } = await supabase.from('slideshow_items').delete().eq('id', id);
            if(!error) setSlideshowItems(prev => prev.filter(item => item.id !== id));
            setConfirmation(null);
        }
    });

    const handleAddPopupMessage = async (data: Omit<PopupMessage, 'id'>) => {
        await supabase.from('popup_message').delete().neq('id', 'dummy-id'); // Clear existing
        const { data: newMsg, error } = await supabase.from('popup_message').insert(data).select().single();
        if(error) { console.error(error); return; }
        setPopupMessage(newMsg as PopupMessage);
    };
    
    const handleEditPopupMessage = async (data: PopupMessage) => {
        const { data: updatedMsg, error } = await supabase.from('popup_message').update(data).eq('id', data.id).select().single();
        if(error) { console.error(error); return; }
        setPopupMessage(updatedMsg as PopupMessage);
    };

    const handleDeletePopupMessage = (id: string) => setConfirmation({
        message: 'Are you sure you want to permanently delete this popup message?',
        onConfirm: async () => {
            const { error } = await supabase.from('popup_message').delete().eq('id', id);
            if(!error) setPopupMessage(null);
            setConfirmation(null);
        }
    });

    const handleCloseToast = (id: number) => setToastNotifications(prev => prev.filter(n => n.id !== id));
    
    const handleUpdateUser = async (updatedUserData: Partial<User>) => {
        if(!currentUser) return;
        const { data, error } = await supabase.from('profiles').update(updatedUserData).eq('id', currentUser.id).select().single();
        if (error) { console.error(error); return; }
        const updatedProfile = data as User;
        setUsers(users.map(u => u.id === updatedProfile.id ? updatedProfile : u));
        if (currentUser?.id === updatedProfile.id) {
            setCurrentUser(updatedProfile);
        }
    };

    const handlePromoteUser = async (userId: string, newRole: Role) => {
      const { data, error } = await supabase.from('profiles').update({ role: newRole }).eq('id', userId).select().single();
      if(error) { console.error(error); return; }
      setUsers(users.map(u => u.id === userId ? data as User : u));
    };
    
    const handleSendMessage = async (content: string, imageUrl?: string) => {
        if(!currentUser) return;
        const newMessage = {
            authorId: currentUser.id,
            content: content,
            imageUrl: imageUrl,
            timestamp: new Date(),
            readBy: [currentUser.id]
        };
        const { error } = await supabase.from('chat_messages').insert(newMessage);
        if(error) console.error(error);
        // Message will be added via realtime subscription
    };
    
    // Notifications are client-side for now
    const handleMarkAsRead = (id: number) => setAllNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    const handleMarkAllAsRead = () => setAllNotifications(prev => prev.map(n => ({ ...n, read: true })));
    
    const handleDonate = async (campaignId: string, amount: number, isAnonymous: boolean) => {
        const campaign = campaigns.find(c => c.id === campaignId);
        if(!campaign) return;
        
        const { data: updatedCampaign, error: campError } = await supabase.from('campaigns').update({ raised: campaign.raised + amount }).eq('id', campaignId).select().single();
        if(campError) { console.error(campError); return; }
        setCampaigns(prev => prev.map(c => c.id === campaignId ? updatedCampaign as Campaign : c));

        const newDonor = { name: isAnonymous ? 'Anonymous' : currentUser?.name || 'Anonymous', amount, isAnonymous, campaignId };
        const { data: createdDonor, error: donorError } = await supabase.from('donors').insert(newDonor).select().single();
        if(donorError) { console.error(donorError); return; }
        setDonors(prev => [createdDonor as Donor, ...prev]);
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-primary to-sky-400 flex flex-col items-center justify-center text-white">
                <h1 className="text-4xl font-extrabold">PARIVARTAN</h1>
                <p className="mt-4">Loading...</p>
            </div>
        );
    }

    if (!currentUser) {
        switch (authMode) {
            case 'signup':
                return <SignUpForm onSignUp={handleSignUp} onSwitchToLogin={() => setAuthMode('login')} />;
            case 'awaiting-confirmation':
                return <AwaitingConfirmation email={unconfirmedEmail} />;
            case 'forgot-password':
                return <ForgotPasswordForm onRequest={handleRequestPasswordReset} onBack={() => setAuthMode('login')} />;
            case '2fa':
                return <TwoFactorAuthForm onVerify={handle2FAVerify} onBack={() => { setPendingUser(null); setAuthMode('login'); }} />;
            case 'login':
            default:
                return <LoginForm onLogin={handleLogin} onForgotPassword={() => setAuthMode('forgot-password')} onSwitchToSignUp={() => setAuthMode('signup')} onGuestLogin={handleGuestLogin} />;
        }
    }

    const renderPage = () => {
        switch (activePage) {
            case Page.HOME:
                return <HomeFeed posts={filteredPosts} users={users} currentUser={currentUser} onDeletePost={handleDeletePost} slideshowItems={slideshowItems} searchQuery={postsSearch} setSearchQuery={setPostsSearch} />;
            case Page.ANNOUNCEMENTS:
                return <AnnouncementsPage announcements={filteredAnnouncements} currentUser={currentUser} onAdd={handleAddAnnouncement} onDelete={handleDeleteAnnouncement} searchQuery={announcementsSearch} setSearchQuery={setAnnouncementsSearch} />;
            case Page.ACHIEVEMENTS:
                return <AchievementsPage achievements={filteredAchievements} currentUser={currentUser} onAdd={handleAddAchievement} onDelete={handleDeleteAchievement} searchQuery={achievementsSearch} setSearchQuery={setAchievementsSearch} />;
            case Page.EVENTS:
                return <EventsPage events={filteredEvents} currentUser={currentUser} onAddEvent={handleAddEvent} onDeleteEvent={handleDeleteEvent} onAttendEvent={handleAttendEvent} eventAttendees={eventAttendees} searchQuery={eventsSearch} setSearchQuery={setEventsSearch} />;
            case Page.ADMIN:
                return <AdminPanel users={filteredAdminUsers} userBadges={userBadges} currentUser={currentUser} onPromoteUser={handlePromoteUser} onAddTask={handleAddTask} tasks={tasks} searchQuery={adminUsersSearch} setSearchQuery={setAdminUsersSearch}/>;
            case Page.PROFILE:
                 return <ProfilePage user={currentUser} userBadges={userBadges} onUpdateUser={handleUpdateUser} onLogout={handleLogout} />;
            case Page.DONATIONS:
                return <DonationsPage campaigns={filteredCampaigns} donors={donors} currentUser={currentUser} onDonate={handleDonate} onAdd={handleAddCampaign} searchQuery={donationsSearch} setSearchQuery={setDonationsSearch} />;
            case Page.CHAT:
                return <ChatPage messages={chatMessages} currentUser={currentUser} users={users} onSendMessage={handleSendMessage} />;
            case Page.HELP:
                return <HelpPage />;
            case Page.ADMIN_CONTENT:
                return <AdminContentPage slideshowItems={slideshowItems} popupMessage={popupMessage} onAddSlideshowItem={handleAddSlideshowItem} onDeleteSlideshowItem={handleDeleteSlideshowItem} onAddPopupMessage={handleAddPopupMessage} onEditPopupMessage={handleEditPopupMessage} onDeletePopupMessage={handleDeletePopupMessage}/>;
            default:
                return <HomeFeed posts={filteredPosts} users={users} currentUser={currentUser} onDeletePost={handleDeletePost} slideshowItems={slideshowItems} searchQuery={postsSearch} setSearchQuery={setPostsSearch} />;
        }
    };

    return (
        <div className="flex h-screen w-screen overflow-hidden">
            <SideMenu isOpen={isSideMenuOpen} onClose={() => setIsSideMenuOpen(false)} onNavigate={setActivePage} user={currentUser} />
            <main className="flex-1 bg-background flex flex-col">
                <Header unreadCount={unreadCount} onNotificationsClick={() => setShowNotifications(prev => !prev)} onMenuClick={() => setIsSideMenuOpen(true)} theme={theme} toggleTheme={toggleTheme}/>
                {showNotifications && <NotificationsPanel notifications={allNotifications} onMarkAsRead={handleMarkAsRead} onMarkAllAsRead={handleMarkAllAsRead} onClose={() => setShowNotifications(false)} />}
                <NotificationContainer notifications={toastNotifications} onClose={handleCloseToast} />
                 {confirmation && <ConfirmationModal message={confirmation.message} onConfirm={confirmation.onConfirm} onCancel={() => setConfirmation(null)} />}
                <div className="flex-grow overflow-y-auto pb-20"> {/* Padding bottom for Nav */}
                  {renderPage()}
                </div>
                 <BottomNav activePage={activePage} onNavigate={setActivePage} user={currentUser} onPostClick={() => setIsCreatingPost(true)} />
            </main>
            {isCreatingPost && <CreatePost currentUser={currentUser} onClose={() => setIsCreatingPost(false)} onAddPost={handleAddPost} />}
        </div>
    );
}