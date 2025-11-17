// --- ES Modules for Supabase and GenAI (loaded in index.html) ---
const { createClient } = supabase;
const { GoogleGenAI, Modality } = window;


// --- CONSTANTS ---
const SUPABASE_URL = 'https://tygqwnndhncikuvwblnc.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR5Z3F3bm5kaG5jaWt1dndibG5jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMzMTMzODgsImV4cCI6MjA3ODg4OTM4OH0.2Aitr7aIt-JlmCfzMbpwbh7iWobgoeiOolxqqkRaPzA';
const SUPER_ADMIN_EMAILS = ['hayatamr9608@gmail.com', 'abdul.salam.bt.2024@miet.ac.in'];

// Enums as objects
const Role = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  ADMIN: 'ADMIN',
  MEMBER: 'MEMBER',
  VIEWER: 'VIEWER',
};

const Page = {
  HOME: 'HOME',
  ANNOUNCEMENTS: 'ANNOUNCEMENTS',
  ACHIEVEMENTS: 'ACHIEVEMENTS',
  EVENTS: 'EVENTS',
  ADMIN: 'ADMIN',
  PROFILE: 'PROFILE',
  DONATIONS: 'DONATIONS',
  CHAT: 'CHAT',
  AI_STUDIO: 'AI_STUDIO',
  HELP: 'HELP',
  ADMIN_CONTENT: 'ADMIN_CONTENT',
};

// --- INITIALIZE CLIENTS ---
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });


// --- APPLICATION STATE ---
let state = {
  session: null,
  currentUser: null,
  authView: 'login', // 'login' | 'signup' | 'forgot_password' | 'awaiting_confirmation'
  authError: '',
  confirmEmail: '',
  
  users: [],
  posts: [],
  announcements: [],
  achievements: [],
  events: [],
  reactions: [],
  comments: [],
  
  currentPage: Page.HOME,
  loading: true,
  isSidebarOpen: false,
  isCreatingPost: false,
  isCreatingEvent: false,
  isAiChatOpen: false,
  aiChatMessages: [{ role: 'model', text: "Hello! I'm the PARIVARTAN assistant. How can I help you today?" }],
  isAiSending: false,
};

// Helper to update state and re-render
function setState(newState) {
  state = { ...state, ...newState };
  renderApp();
}

// --- ICON COMPONENTS (as functions returning HTML strings) ---
const Icons = {
    HomeIcon: (className = 'w-6 h-6') => `<svg class="${className}" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>`,
    AnnouncementIcon: (className = 'w-6 h-6') => `<svg class="${className}" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-2.236 9.168-5.584C18.354 5.166 18 6.518 18 8a3 3 0 01-3 3h-1.572c-1.85 0-3.583.77-4.839 2.025L5.436 13.683z"></path></svg>`,
    TrophyIcon: (className = "w-6 h-6") => `<svg class="${className}" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-12v4m-2-2h4m5 4h.01M15 21h4.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>`,
    CalendarIcon: (className = 'w-6 h-6') => `<svg class="${className}" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>`,
    DollarIcon: (className = 'w-6 h-6') => `<svg class="${className}" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01M12 6v-1.5M12 18v-1.5m0-11.5a9 9 0 110 18 9 9 0 010-18z"></path></svg>`,
    ChatIcon: (className = 'w-6 h-6') => `<svg class="${className}" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>`,
    SparklesIcon: (className = "w-5 h-5") => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="${className}"><path fill-rule="evenodd" d="M10.868 2.884c.321-.772.14-1.65-.44-2.228a1.75 1.75 0 00-2.443.002L6.152 2.92c-.305.282-.476.68-.476 1.096v1.33c0 .417-.172.816-.476 1.097L3.367 8.277a1.75 1.75 0 00-.001 2.445l1.833 1.833c.282.305.68.477 1.097.477h1.33c.416 0 .815.172 1.097.476l2.167 2.167a1.75 1.75 0 002.445-.001l1.833-1.833c.305-.282.477-.68.477-1.097v-1.33a1.533 1.533 0 01.476-1.097l1.833-1.833a1.75 1.75 0 00-.001-2.445l-1.833-1.833a1.533 1.533 0 01-.477-1.097v-1.33c0-.416-.172-.815-.476-1.097L10.868 2.884zM10 12a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd" /></svg>`,
    AdminIcon: (className = 'w-6 h-6') => `<svg class="${className}" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>`,
    PhotographIcon: (className = 'w-6 h-6') => `<svg class="${className}" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>`,
    UserIcon: (className = 'w-6 h-6') => `<svg class="${className}" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>`,
    QuestionMarkCircleIcon: (className = 'w-6 h-6') => `<svg class="${className}" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>`,
    LogoutIcon: (className = 'w-6 h-6') => `<svg class="${className}" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>`,
    EyeOffIcon: (className = 'w-6 h-6') => `<svg class="${className}" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a10.05 10.05 0 012.6-4.225m3.385-1.926A10.05 10.05 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.05 10.05 0 01-2.6 4.225m-3.385 1.926L10.5 15.5m-2.12-2.12L6.3 11.3M3 3l18 18"></path></svg>`,
    EyeIcon: (className = 'w-6 h-6') => `<svg class="${className}" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>`,
    PlusIcon: (className = 'w-6 h-6') => `<svg class="${className}" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>`,
    CalendarIcon: (className = 'w-6 h-6') => `<svg class="${className}" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>`,
    MenuIcon: (className = 'w-6 h-6') => `<svg class="${className}" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>`,
    XIcon: (className = 'w-6 h-6') => `<svg class="${className}" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>`,
    TrashIcon: (className = 'w-6 h-6') => `<svg class="${className}" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>`,
    BlueTickIcon: (title) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="#3b82f6" class="w-5 h-5 ml-1"><title>${title}</title><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" /></svg>`,
    GreenTickIcon: (title) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="#22c55e" class="w-5 h-5 ml-1"><title>${title}</title><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" /></svg>`,
    ThumbsUpIcon: (solid, className = 'w-6 h-6') => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="${solid ? "currentColor" : "none"}" class="${className}"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M7.73 17.5H3.25a1.25 1.25 0 0 1-1.25-1.25V9.75a1.25 1.25 0 0 1 1.25-1.25h4.48M7.73 17.5v-7.5m0 0a2.5 2.5 0 0 1 5-2.27V5a2.5 2.5 0 0 1 5 0v1.25a2.5 2.5 0 0 1-2.5 2.5h-1.34l-.49 4.38a1.25 1.25 0 0 1-1.24 1.12h-4.43Z" /></svg>`,
    ChatAlt2Icon: (className = 'w-6 h-6') => `<svg class="${className}" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path></svg>`,
    PaperAirplaneIcon: (className = 'w-5 h-5') => `<svg xmlns="http://www.w3.org/2000/svg" class="${className}" viewBox="0 0 24 24" fill="currentColor"><path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" /></svg>`,
};

// --- GEMINI SERVICE ---
const geminiService = {
  moderateContent: async (text) => {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Analyze the following text for a social platform of a college NGO. Is it vulgar, abusive, hateful, or inappropriate? Respond with only one word: 'SAFE' or 'UNSAFE'. Text: "${text}"`,
        config: { temperature: 0 },
      });
      const result = response.text.trim().toUpperCase();
      return result === 'UNSAFE' ? 'UNSAFE' : 'SAFE';
    } catch (error) {
      console.error("Error during content moderation:", error);
      return 'SAFE'; // Fail open
    }
  },
  getAiChatResponse: async (history, newMessage) => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [...history, { role: 'user', parts: [{ text: newMessage }] }],
            config: {
                systemInstruction: "You are a helpful AI assistant for PARIVARTAN, a college NGO dedicated to teaching underprivileged students. Be friendly, encouraging, and provide concise information about the group's activities, mission, and how to get involved. Do not answer questions outside of this scope.",
            },
        });
        return response.text;
    } catch (error) {
        console.error("Error getting AI chat response:", error);
        return "I'm sorry, I'm having a little trouble right now. Please try asking again in a moment.";
    }
  },
  generatePostContent: async (prompt) => {
    try {
      const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: `You are a content writer for a college NGO that teaches underprivileged students. Write a social media post based on the following idea. Keep it positive, engaging, and under 100 words. Idea: "${prompt}"`,
      });
      return response.text;
    } catch (error) {
      console.error("Error generating content with Gemini:", error);
      return "An error occurred while generating content. Please try again.";
    }
  },
};

// --- HTML TEMPLATE FUNCTIONS ---

function renderVerifiedBadge(user) {
    if (!user) return '';
    if (user.role === Role.ADMIN || user.role === Role.SUPER_ADMIN) {
        return Icons.BlueTickIcon("Admin");
    }
    if (user.role === Role.MEMBER) {
        return Icons.GreenTickIcon("Member");
    }
    return '';
}

function renderLoginForm() {
  const rememberedEmail = localStorage.getItem('rememberedEmail') || '';
  return `
    <div class="min-h-screen bg-gradient-to-br from-primary to-sky-400 flex items-center justify-center p-4">
        <div class="w-full max-w-md bg-card rounded-2xl shadow-2xl p-8 space-y-6">
            <div class="text-center">
                <h1 class="text-3xl font-extrabold text-foreground">Welcome to PARIVARTAN</h1>
                <p class="text-sm text-muted-foreground mt-2">ENLIGHTEN A CHILD DISCOVER A PERSONALITY</p>
            </div>
            ${state.authError ? `<div class="bg-destructive/20 border border-destructive/50 text-destructive px-4 py-3 rounded-lg" role="alert">${state.authError}</div>` : ''}
            <form id="login-form" class="space-y-6">
                <div>
                    <label for="email" class="text-sm font-bold text-muted-foreground tracking-wide">Email</label>
                    <input id="email" type="email" value="${rememberedEmail}" class="w-full bg-transparent text-base py-2 border-b border-border focus:outline-none focus:border-secondary" placeholder="Enter your email" required/>
                </div>
                <div>
                    <div class="relative">
                        <div class="flex justify-between items-center">
                            <label for="password"class="text-sm font-bold text-muted-foreground tracking-wide">Password</label>
                            <button type="button" data-action="switch-auth" data-view="forgot_password" class="text-sm text-primary hover:underline font-semibold">
                                Forgot Password?
                            </button>
                        </div>
                        <input id="password" type="password" class="w-full bg-transparent text-base py-2 border-b border-border focus:outline-none focus:border-secondary" placeholder="Enter your password" required/>
                         <button type="button" data-action="toggle-password" class="absolute right-0 bottom-2 text-muted-foreground">
                           ${Icons.EyeIcon('w-5 h-5')}
                        </button>
                    </div>
                    <div class="flex items-center mt-4">
                        <input id="remember-me" name="remember-me" type="checkbox" ${rememberedEmail ? 'checked' : ''} class="h-4 w-4 text-primary focus:ring-ring border-border rounded bg-card" />
                        <label for="remember-me" class="ml-2 block text-sm text-muted-foreground">Remember me</label>
                    </div>
                </div>
                <div>
                    <button type="submit" class="w-full flex justify-center bg-primary text-primary-foreground p-3 rounded-full tracking-wide font-semibold shadow-lg cursor-pointer transition ease-in duration-300 hover:bg-opacity-90 disabled:bg-muted">
                        Log In
                    </button>
                </div>
            </form>
            <div class="text-center text-sm space-y-2">
                <p class="text-muted-foreground">
                    Don't have an account?
                    <button data-action="switch-auth" data-view="signup" class="text-primary hover:underline font-semibold">
                        Sign Up
                    </button>
                </p>
                <p>
                    <button data-action="guest-login" class="text-muted-foreground hover:text-foreground font-semibold">
                        Continue as a Viewer
                    </button>
                </p>
            </div>
        </div>
    </div>
  `;
}

function renderSignUpForm() {
    return `
    <div class="min-h-screen bg-gradient-to-br from-primary to-sky-400 flex items-center justify-center p-4">
        <div class="w-full max-w-md bg-card rounded-2xl shadow-2xl p-8 space-y-6">
            <div class="text-center">
                <h1 class="text-3xl font-extrabold text-foreground">Create Account</h1>
                <p class="text-muted-foreground mt-2">Join the PARIVARTAN family!</p>
            </div>
            ${state.authError ? `<div class="bg-destructive/20 border border-destructive/50 text-destructive px-4 py-3 rounded-lg" role="alert">${state.authError}</div>` : ''}
            <form id="signup-form" class="space-y-4">
                <div>
                    <label for="name" class="text-sm font-bold text-muted-foreground tracking-wide">Full Name</label>
                    <input id="name" type="text" class="w-full bg-transparent text-base py-2 border-b border-border focus:outline-none focus:border-secondary" placeholder="Enter your full name" required/>
                </div>
                <div>
                    <label for="email" class="text-sm font-bold text-muted-foreground tracking-wide">Email</label>
                    <input id="email" type="email" class="w-full bg-transparent text-base py-2 border-b border-border focus:outline-none focus:border-secondary" placeholder="Enter your email address" required/>
                </div>
                <div class="relative">
                    <label for="password"class="text-sm font-bold text-muted-foreground tracking-wide">Password</label>
                    <input id="password" type="password" class="w-full bg-transparent text-base py-2 border-b border-border focus:outline-none focus:border-secondary" placeholder="Create a password (min. 6 characters)" required/>
                    <button type="button" data-action="toggle-password" class="absolute right-0 bottom-2 text-muted-foreground">
                       ${Icons.EyeIcon('w-5 h-5')}
                    </button>
                </div>
                <div>
                    <button type="submit" class="w-full flex justify-center bg-secondary text-secondary-foreground p-3 rounded-full tracking-wide font-semibold shadow-lg cursor-pointer transition ease-in duration-300 hover:bg-amber-400 disabled:bg-muted">
                        Sign Up
                    </button>
                </div>
            </form>
             <div class="text-center text-sm">
                <p class="text-muted-foreground">
                    Already have an account?
                    <button data-action="switch-auth" data-view="login" class="text-primary hover:underline font-semibold">
                        Log In
                    </button>
                </p>
             </div>
        </div>
    </div>
    `;
}

function renderAwaitingConfirmation() {
    return `
    <div class="min-h-screen bg-gradient-to-br from-primary to-sky-400 flex items-center justify-center p-4">
        <div class="w-full max-w-md bg-card rounded-2xl shadow-2xl p-8 text-center space-y-6">
            <h1 class="text-3xl font-extrabold text-foreground">Confirm Your Email</h1>
            <p class="text-muted-foreground">
                We've sent a confirmation link to <span class="font-semibold text-foreground">${state.confirmEmail}</span>. Please check your inbox (and spam folder!) and click the link to activate your account.
            </p>
            <p class="text-sm text-muted-foreground">This page will automatically update once you're confirmed.</p>
        </div>
    </div>
    `;
}

function renderSidebar() {
    const { currentPage, currentUser, isSidebarOpen } = state;

    const navItem = (icon, label, page) => `
        <button
            data-action="navigate" data-page="${page}"
            class="w-full flex items-center space-x-3 px-4 py-2 rounded-lg transition-colors text-left
                ${currentPage === page
                    ? 'bg-primary text-primary-foreground font-semibold'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                }"
        >
            ${icon.replace('w-6 h-6', 'w-5 h-5')}
            <span>${label}</span>
        </button>
    `;

    return `
    <aside class="fixed inset-y-0 left-0 z-40 w-64 bg-card border-r border-border transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 transition-transform duration-300 ease-in-out">
        <div class="flex items-center justify-between p-4 border-b border-border">
            <h1 class="text-xl font-bold text-primary">PARIVARTAN</h1>
            <button data-action="toggle-sidebar" class="md:hidden text-muted-foreground">
                ${Icons.XIcon()}
            </button>
        </div>
        <nav class="flex flex-col p-4 space-y-2 flex-grow">
            ${navItem(Icons.HomeIcon(), "Home", Page.HOME)}
            ${navItem(Icons.AnnouncementIcon(), "Announcements", Page.ANNOUNCEMENTS)}
            ${navItem(Icons.TrophyIcon(), "Achievements", Page.ACHIEVEMENTS)}
            ${navItem(Icons.CalendarIcon(), "Events", Page.EVENTS)}
            ${navItem(Icons.DollarIcon(), "Donations", Page.DONATIONS)}
            ${navItem(Icons.ChatIcon(), "Group Chat", Page.CHAT)}
            ${navItem(Icons.SparklesIcon(), "AI Studio", Page.AI_STUDIO)}
            ${(currentUser?.role === Role.ADMIN || currentUser?.role === Role.SUPER_ADMIN) ? `
                <div class="pt-4 mt-4 border-t border-border">
                    <span class="px-4 text-xs font-semibold text-muted-foreground uppercase">Admin</span>
                </div>
                ${navItem(Icons.AdminIcon(), "Admin Panel", Page.ADMIN)}
                ${navItem(Icons.PhotographIcon(), "Content Mgmt", Page.ADMIN_CONTENT)}
            ` : ''}
        </nav>
        <div class="p-4 border-t border-border mt-auto">
            ${navItem(Icons.UserIcon(), "Profile", Page.PROFILE)}
            ${navItem(Icons.QuestionMarkCircleIcon(), "Help", Page.HELP)}
            <button data-action="logout" class="w-full flex items-center space-x-3 px-4 py-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground rounded-lg transition-colors">
                ${Icons.LogoutIcon().replace('w-6 h-6', 'w-5 h-5')}
                <span>Logout</span>
            </button>
        </div>
    </aside>
    `;
}

function renderPostCard(post) {
    const { users, currentUser, reactions, comments } = state;
    const author = users.find(u => u.id === post.authorId);
    
    const postReactions = reactions.filter(r => r.postId === post.id);
    const postComments = comments.filter(c => c.postId === post.id).sort((a,b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

    const currentUserReaction = postReactions.find(r => r.userId === currentUser?.id);

    const reactionTypes = { like: '👍', love: '❤️', celebrate: '🎉', insightful: '💡', funny: '😂' };
    
    const reactionCounts = postReactions.reduce((acc, reaction) => {
        acc[reaction.type] = (acc[reaction.type] || 0) + 1;
        return acc;
    }, {});
    const sortedReactions = Object.entries(reactionCounts).sort(([, a], [, b]) => b - a);
    
    const reactionSummary = postReactions.length === 0 ? '' : `
        <div class="flex items-center space-x-1">
            ${sortedReactions.slice(0, 3).map(([type]) => `<span class="text-lg -ml-1">${reactionTypes[type]}</span>`).join('')}
            <span class="text-sm text-muted-foreground pl-1">${postReactions.length}</span>
        </div>
    `;

    const commentSectionId = `comments-${post.id}`;
    const showComments = document.getElementById(commentSectionId)?.style.display !== 'none';

    return `
    <div class="bg-card rounded-xl shadow-md p-6" data-post-id="${post.id}">
        <div class="flex items-center justify-between">
            <div class="flex items-center">
                <img src="${author?.avatarUrl || `https://api.dicebear.com/8.x/initials/svg?seed=${author?.name}`}" alt="${author?.name}" class="w-12 h-12 rounded-full mr-4" />
                <div>
                    <div class="flex items-center">
                        <p class="font-bold">${author?.name}</p>
                        ${renderVerifiedBadge(author)}
                    </div>
                    <p class="text-sm text-muted-foreground">${new Date(post.createdAt).toLocaleString()}</p>
                </div>
            </div>
            ${(currentUser?.id === post.authorId || currentUser?.role === Role.SUPER_ADMIN) ? `
                <button data-action="delete-post" data-post-id="${post.id}" class="text-muted-foreground hover:text-destructive p-2 rounded-full">${Icons.TrashIcon('w-5 h-5')}</button>
            ` : ''}
        </div>
        <p class="mt-4 whitespace-pre-wrap">${post.content}</p>
        ${post.imageUrl ? `<img src="${post.imageUrl}" alt="Post content" class="mt-4 rounded-lg max-h-96 w-full object-cover"/>` : ''}

        ${(postReactions.length > 0 || postComments.length > 0) ? `
            <div class="mt-4 flex justify-between items-center text-sm text-muted-foreground">
                ${reactionSummary}
                <button data-action="toggle-comments" data-post-id="${post.id}" class="hover:underline">${postComments.length > 0 ? `${postComments.length} comments` : ''}</button>
            </div>
        `: ''}
        
        <div class="mt-2 pt-2 border-t border-border flex justify-around">
            <div class="group relative">
                <button 
                    data-action="react-post" data-post-id="${post.id}" data-reaction-type="like"
                    class="flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-lg w-full transition-colors ${currentUserReaction ? 'text-primary font-semibold' : 'text-muted-foreground hover:bg-accent'}"
                >
                    ${Icons.ThumbsUpIcon(!!currentUserReaction, 'w-5 h-5')}
                    <span>${currentUserReaction ? currentUserReaction.type.charAt(0).toUpperCase() + currentUserReaction.type.slice(1) : 'Like'}</span>
                </button>
                <div class="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 flex space-x-1 bg-card p-1.5 rounded-full shadow-lg border border-border opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none group-hover:pointer-events-auto">
                    ${Object.entries(reactionTypes).map(([type, emoji]) => `
                        <button data-action="react-post" data-post-id="${post.id}" data-reaction-type="${type}" class="p-1 rounded-full hover:bg-accent transition-transform hover:scale-125 text-2xl">
                            ${emoji}
                        </button>
                    `).join('')}
                </div>
            </div>
             <button data-action="toggle-comments" data-post-id="${post.id}" class="flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-lg text-muted-foreground hover:bg-accent transition-colors">
                ${Icons.ChatAlt2Icon('w-5 h-5')} <span>Comment</span>
            </button>
        </div>

        <div id="${commentSectionId}" class="mt-4 pt-4 border-t border-border space-y-4" style="display: none;">
            <!-- Comments will be rendered here if toggled -->
        </div>
    </div>
    `;
}

function renderCommentSection(postId) {
    const { users, currentUser, comments } = state;
    const postComments = comments.filter(c => c.postId === postId).sort((a,b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    
    return `
        ${postComments.map(comment => {
            const commentAuthor = users.find(u => u.id === comment.authorId);
            return `
            <div class="flex items-start space-x-3">
                <img src="${commentAuthor?.avatarUrl || `https://api.dicebear.com/8.x/initials/svg?seed=${commentAuthor?.name}`}" alt="${commentAuthor?.name}" class="w-8 h-8 rounded-full" />
                <div class="flex-1">
                    <div class="bg-muted px-4 py-2 rounded-xl">
                        <div class="flex items-center justify-between">
                            <div class="flex items-center">
                                <p class="font-semibold text-sm">${commentAuthor?.name}</p>
                                ${renderVerifiedBadge(commentAuthor)}
                            </div>
                             ${(currentUser?.id === comment.authorId || currentUser?.role === Role.SUPER_ADMIN) ? `
                                <button data-action="delete-comment" data-comment-id="${comment.id}" class="text-muted-foreground hover:text-destructive">${Icons.TrashIcon('w-4 h-4')}</button>
                            `: ''}
                        </div>
                        <p class="text-sm">${comment.content}</p>
                    </div>
                    <p class="text-xs text-muted-foreground mt-1">${new Date(comment.createdAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</p>
                </div>
            </div>
            `;
        }).join('')}
        <form data-action="add-comment" data-post-id="${postId}" class="flex items-start space-x-3 pt-4">
            <img src="${currentUser?.avatarUrl || `https://api.dicebear.com/8.x/initials/svg?seed=${currentUser?.name}`}" alt="Your avatar" class="w-8 h-8 rounded-full" />
            <div class="flex-1">
                <input 
                    type="text" 
                    name="comment"
                    placeholder="Write a comment..."
                    class="w-full bg-input border border-border rounded-full px-4 py-2 text-sm focus:ring-2 focus:ring-ring"
                />
            </div>
        </form>
    `;
}


function renderHomePage() {
    const { posts } = state;
    const sortedPosts = [...posts].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return `
    <div class="p-4 md:p-8">
      <h1 class="text-3xl font-bold mb-6">Home Feed</h1>
      <div id="post-feed" class="space-y-6 max-w-3xl mx-auto">
        ${sortedPosts.map(renderPostCard).join('')}
      </div>
    </div>
    `;
}

function renderHelpPage() {
    return `
    <div class="p-4 md:p-8">
        <h1 class="text-3xl font-bold mb-6">Help & Support</h1>
        <div class="bg-card rounded-xl shadow-md p-8 space-y-4">
            <p class="text-lg">For any issues, queries, or support, please feel free to contact us:</p>
            <div>
                <h2 class="text-xl font-semibold text-primary">Phone</h2>
                <a href="tel:9608353448" class="text-muted-foreground hover:underline">9608353448</a>
            </div>
            <div>
                <h2 class="text-xl font-semibold text-primary">Emails</h2>
                <a href="mailto:abdul.salam.bt.2024@miet.ac.in" class="text-muted-foreground block hover:underline">abdul.salam.bt.2024@miet.ac.in</a>
                <a href="mailto:hayatamr9608@gmail.com" class="text-muted-foreground block hover:underline">hayatamr9608@gmail.com</a>
            </div>
        </div>
    </div>
    `;
}

function renderPageContent() {
    switch (state.currentPage) {
        case Page.HOME:
            return renderHomePage();
        case Page.HELP:
            return renderHelpPage();
        // Add other pages here
        default:
            return `<div class="p-8"><h1 class="text-2xl font-bold">${state.currentPage}</h1><p>This page is under construction.</p></div>`;
    }
}

function renderCreatePostModal() {
    if (!state.isCreatingPost) return '';
    const { currentUser } = state;
    return `
    <div id="create-post-modal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-2xl transform transition-all">
        <div class="p-6 border-b border-gray-200">
            <h2 class="text-2xl font-bold text-dark">Create a New Post</h2>
        </div>
        <form id="create-post-form">
          <div class="p-6 space-y-4">
            <textarea
              name="content"
              class="w-full h-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition"
              placeholder="What's on your mind, ${currentUser.name.split(' ')[0]}?"
              required
            ></textarea>
            <div class="p-4 bg-gray-50 rounded-lg space-y-2">
              <label class="text-sm font-semibold text-gray-600">✨ Generate with AI</label>
              <div class="flex items-center space-x-2">
                <input
                  type="text"
                  name="aiPrompt"
                  class="flex-grow p-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-primary focus:border-primary"
                  placeholder="e.g., A post about our weekend teaching drive"
                />
                <button
                  type="button"
                  data-action="generate-post-content"
                  class="bg-primary text-white px-4 py-2 rounded-lg font-semibold flex items-center justify-center space-x-2 hover:bg-opacity-90 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  ${Icons.SparklesIcon()}<span>Generate</span>
                </button>
              </div>
            </div>
          </div>
          <div class="p-6 bg-gray-50 rounded-b-2xl flex justify-end space-x-3">
            <button type="button" data-action="close-modal" class="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 transition">Cancel</button>
            <button type="submit" class="px-6 py-2 bg-secondary text-dark rounded-lg font-bold hover:opacity-90 transition">Post</button>
          </div>
        </form>
      </div>
    </div>
    `;
}

function renderAiChatBot() {
    if (!state.isAiChatOpen) return '';
    
    return `
     <div class="fixed bottom-24 right-6 w-full max-w-sm h-[60vh] z-40">
        <div class="bg-card rounded-2xl shadow-2xl flex flex-col h-full border border-border">
            <header class="p-4 border-b border-border flex justify-between items-center">
                <div class="flex items-center space-x-2">
                    ${Icons.SparklesIcon('w-6 h-6 text-primary')}
                    <h3 class="font-bold text-lg">AI Assistant</h3>
                </div>
                <button data-action="toggle-ai-chat" class="text-muted-foreground hover:text-foreground">
                    ${Icons.XIcon('w-5 h-5')}
                </button>
            </header>
            <div id="ai-chat-messages" class="flex-1 p-4 overflow-y-auto space-y-4">
                ${state.aiChatMessages.map(msg => `
                    <div class="flex items-end gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}">
                        ${msg.role === 'model' ? `<img src="https://api.dicebear.com/8.x/bottts-neutral/svg?seed=parivartan-ai" alt="AI Avatar" class="w-8 h-8 rounded-full bg-muted" />` : ''}
                        <div class="max-w-xs md:max-w-sm px-4 py-2 rounded-2xl ${msg.role === 'user' ? 'bg-primary text-primary-foreground rounded-br-none' : 'bg-muted rounded-bl-none'}">
                            <p class="text-sm whitespace-pre-wrap">${msg.text}</p>
                        </div>
                    </div>
                `).join('')}
                ${state.isAiSending ? `
                    <div class="flex items-end gap-2 justify-start">
                         <img src="https://api.dicebear.com/8.x/bottts-neutral/svg?seed=parivartan-ai" alt="AI Avatar" class="w-8 h-8 rounded-full bg-muted" />
                        <div class="max-w-xs md:max-w-sm px-4 py-2 rounded-2xl bg-muted rounded-bl-none">
                           <div class="flex space-x-1">
                             <span class="w-2 h-2 bg-muted-foreground rounded-full animate-pulse" style="animation-delay:-0.3s"></span>
                             <span class="w-2 h-2 bg-muted-foreground rounded-full animate-pulse" style="animation-delay:-0.15s"></span>
                             <span class="w-2 h-2 bg-muted-foreground rounded-full animate-pulse"></span>
                           </div>
                        </div>
                    </div>
                `: ''}
            </div>
            <form id="ai-chat-form" class="p-4 border-t border-border">
                <div class="relative">
                    <input
                        type="text"
                        name="ai-input"
                        placeholder="Ask anything..."
                        class="w-full bg-input border border-border rounded-full py-2 pl-4 pr-12 text-sm focus:ring-2 focus:ring-ring"
                    />
                    <button type="submit" class="absolute right-1 top-1/2 -translate-y-1/2 p-2 bg-primary text-primary-foreground rounded-full hover:bg-opacity-90 disabled:bg-muted">
                        ${Icons.PaperAirplaneIcon()}
                    </button>
                </div>
            </form>
        </div>
    </div>
    `;
}


// --- Main Render Function ---
function renderApp() {
    const appEl = document.getElementById('app');
    if (!appEl) return;

    if (state.loading) {
        appEl.innerHTML = `<div class="min-h-screen flex items-center justify-center bg-background"><p>Loading...</p></div>`;
        return;
    }
    
    if (!state.session && !state.currentUser) {
        switch(state.authView) {
            case 'signup':
                appEl.innerHTML = renderSignUpForm();
                break;
            case 'awaiting_confirmation':
                appEl.innerHTML = renderAwaitingConfirmation();
                break;
            case 'login':
            default:
                appEl.innerHTML = renderLoginForm();
        }
        return;
    }
    
    if (state.session && !state.currentUser) {
        appEl.innerHTML = renderAwaitingConfirmation();
        return;
    }

    appEl.innerHTML = `
        <div class="flex min-h-screen bg-background text-foreground">
            ${renderSidebar()}
            <div class="flex-1 flex flex-col">
                <header class="sticky top-0 z-30 bg-card/80 backdrop-blur-sm border-b border-border p-4 flex items-center justify-between md:justify-end">
                    <button data-action="toggle-sidebar" class="md:hidden text-muted-foreground">
                        ${Icons.MenuIcon()}
                    </button>
                    <div class="flex items-center space-x-4">
                         <button data-action="open-create-post" class="hidden md:flex items-center space-x-2 bg-primary text-primary-foreground px-4 py-2 rounded-full font-semibold hover:bg-opacity-90 transition">
                            ${Icons.PlusIcon('w-5 h-5')}
                            <span>Create Post</span>
                        </button>
                         <button data-action="open-create-event" class="hidden md:flex items-center space-x-2 bg-secondary text-secondary-foreground px-4 py-2 rounded-full font-semibold hover:opacity-90 transition">
                            ${Icons.CalendarIcon('w-5 h-5')}
                            <span>New Event</span>
                        </button>
                    </div>
                </header>
                <main id="main-content" class="flex-1 overflow-y-auto">
                    ${renderPageContent()}
                </main>
            </div>
            <div id="modal-container">
                ${renderCreatePostModal()}
            </div>
            <div id="chatbot-container">
                ${renderAiChatBot()}
            </div>
            ${!state.isAiChatOpen ? `
                <button
                    data-action="toggle-ai-chat"
                    class="fixed bottom-6 right-6 bg-primary text-primary-foreground rounded-full p-4 shadow-lg hover:bg-opacity-90 transition transform hover:scale-110 z-40"
                    aria-label="Open AI Assistant"
                >
                    ${Icons.SparklesIcon('w-8 h-8')}
                </button>
            ` : ''}
        </div>
    `;
    
    // After rendering the main page, if a comment section was open, re-render and open it
    const openCommentSections = document.querySelectorAll('[data-comments-open="true"]');
    openCommentSections.forEach(el => {
        const postId = el.dataset.postId;
        const container = document.getElementById(`comments-${postId}`);
        if(container) {
            container.innerHTML = renderCommentSection(postId);
            container.style.display = 'block';
            container.dataset.commentsOpen = "true";
        }
    });
    
    const chatMessagesEl = document.getElementById('ai-chat-messages');
    if (chatMessagesEl) {
        chatMessagesEl.scrollTop = chatMessagesEl.scrollHeight;
    }
}


// --- EVENT HANDLERS & LOGIC ---

async function handleLogin(email, password) {
  try {
    setState({ authError: '' });

    const { error } = await supabaseClient.auth.signInWithPassword({ email, password });

    if (error) throw error;
    
  } catch (error) {
    console.error("Login failed:", error.message);
    let errorMessage = `An unexpected error occurred: ${error.message}`;
    if (error.message.includes("Invalid login credentials")) {
        errorMessage = "Incorrect email or password. Please check your details and try again.";
    }
    setState({ authError: errorMessage });
  }
}

async function handleSignUp(name, email, password) {
    const { data, error } = await supabaseClient.auth.signUp({ 
        email, 
        password,
        options: {
            data: {
                name: name,
                avatar_url: `https://api.dicebear.com/8.x/initials/svg?seed=${name}`
            }
        }
    });
    if (error) {
      setState({ authError: error.message });
    } else if (data.user) {
      setState({ authView: 'awaiting_confirmation', confirmEmail: email });
    }
}

async function handleLogout() {
    await supabaseClient.auth.signOut();
    setState({ currentUser: null, session: null, currentPage: Page.HOME });
}

function handleGuestLogin() {
    const guestUser = { id: 'guest', name: 'Guest Viewer', username: 'guest', role: Role.VIEWER, avatarUrl: `https://api.dicebear.com/8.x/initials/svg?seed=Guest` };
    setState({ currentUser: guestUser });
    fetchAllData();
}

async function handleAddPost(content, imageUrl) {
    const { data, error } = await supabaseClient.from('posts').insert([{ authorId: state.currentUser.id, content, imageUrl }]).select();
    if (data) {
        setState({ posts: [data[0], ...state.posts], isCreatingPost: false });
    }
    if (error) console.error("Error adding post:", error);
}

async function handleDeletePost(postId) {
    if (!window.confirm("Are you sure you want to delete this post?")) return;
    const { error } = await supabaseClient.from('posts').delete().match({ id: postId });
    if (!error) {
        setState({ posts: state.posts.filter(p => p.id !== postId) });
    }
}

async function handleReaction(postId, type) {
    if (!state.currentUser || state.currentUser.role === Role.VIEWER) {
        alert("You must be logged in to react.");
        return;
    }
    const { currentUser, reactions } = state;
    const existingReaction = reactions.find(r => r.postId === postId && r.userId === currentUser.id);

    if (existingReaction && existingReaction.type === type) {
        const { error } = await supabaseClient.from('reactions').delete().match({ id: existingReaction.id });
        if (!error) {
            setState({ reactions: reactions.filter(r => r.id !== existingReaction.id) });
        }
    } else {
        const reactionData = { post_id: postId, user_id: currentUser.id, type: type };
        const { data, error } = await supabaseClient.from('reactions').upsert(reactionData, { onConflict: 'post_id, user_id' }).select().single();
        if (!error && data) {
            const newReactions = [...reactions.filter(r => !(r.postId === postId && r.userId === currentUser.id)), data];
            setState({ reactions: newReactions });
        }
    }
}

async function handleAddComment(postId, content) {
    if (!state.currentUser || state.currentUser.role === Role.VIEWER) {
        alert("You must be logged in to comment.");
        return;
    }
    const moderationResult = await geminiService.moderateContent(content);
    if (moderationResult === 'UNSAFE') {
        alert("This comment violates our community guidelines and cannot be posted. Please revise your comment.");
        return;
    }
    const commentData = { post_id: postId, author_id: state.currentUser.id, content: content };
    const { data, error } = await supabaseClient.from('comments').insert(commentData).select().single();
    if (data) {
        setState({ comments: [...state.comments, data] });
    }
    if (error) console.error("Error adding comment:", error);
}

async function handleDeleteComment(commentId) {
    if (!window.confirm("Are you sure you want to delete this comment?")) return;
    const { error } = await supabaseClient.from('comments').delete().match({ id: commentId });
    if (!error) {
        setState({ comments: state.comments.filter(c => c.id !== commentId) });
    }
}

async function handleAiSendMessage(message) {
    const userMessage = { role: 'user', text: message };
    const newMessages = [...state.aiChatMessages, userMessage];
    setState({ aiChatMessages: newMessages, isAiSending: true });

    const history = state.aiChatMessages.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.text }]
    }));

    const aiResponseText = await geminiService.getAiChatResponse(history, message);
    const modelMessage = { role: 'model', text: aiResponseText };
    setState({ 
        aiChatMessages: [...newMessages, modelMessage], 
        isAiSending: false 
    });
}

// --- DATA FETCHING ---
async function fetchAllData() {
    try {
        const [postsRes, usersRes, announcementsRes, achievementsRes, eventsRes, reactionsRes, commentsRes] = await Promise.all([
            supabaseClient.from('posts').select('*'),
            supabaseClient.from('profiles').select('*'),
            supabaseClient.from('announcements').select('*'),
            supabaseClient.from('achievements').select('*'),
            supabaseClient.from('events').select('*'),
            supabaseClient.from('reactions').select('*'),
            supabaseClient.from('comments').select('*'),
        ]);
        
        setState({
            posts: postsRes.data || [],
            users: usersRes.data || [],
            announcements: announcementsRes.data || [],
            achievements: achievementsRes.data || [],
            events: eventsRes.data || [],
            reactions: reactionsRes.data || [],
            comments: commentsRes.data || [],
            loading: false,
        });

    } catch (error) {
        console.error("Error fetching data:", error);
        setState({ loading: false });
    }
}

// --- GLOBAL EVENT LISTENER ---
document.addEventListener('click', (e) => {
    const actionTarget = e.target.closest('[data-action]');
    if (!actionTarget) return;

    const { action, view, page, postId, reactionType, commentId } = actionTarget.dataset;

    switch (action) {
        case 'switch-auth':
            setState({ authView: view, authError: '' });
            break;
        case 'toggle-password': {
            const input = actionTarget.previousElementSibling;
            if (input.type === 'password') {
                input.type = 'text';
                actionTarget.innerHTML = Icons.EyeOffIcon('w-5 h-5');
            } else {
                input.type = 'password';
                actionTarget.innerHTML = Icons.EyeIcon('w-5 h-5');
            }
            break;
        }
        case 'guest-login':
            handleGuestLogin();
            break;
        case 'logout':
            handleLogout();
            break;
        case 'navigate':
            setState({ currentPage: page, isSidebarOpen: false });
            break;
        case 'toggle-sidebar':
            setState({ isSidebarOpen: !state.isSidebarOpen });
            break;
        case 'open-create-post':
            setState({ isCreatingPost: true });
            break;
        case 'close-modal':
            setState({ isCreatingPost: false, isCreatingEvent: false });
            break;
        case 'delete-post':
            handleDeletePost(postId);
            break;
        case 'react-post':
            handleReaction(postId, reactionType);
            break;
        case 'delete-comment':
            handleDeleteComment(commentId);
            break;
        case 'toggle-comments': {
            const container = document.getElementById(`comments-${postId}`);
            if (container) {
                if (container.style.display === 'none') {
                    container.innerHTML = renderCommentSection(postId);
                    container.style.display = 'block';
                    container.dataset.commentsOpen = "true";
                } else {
                    container.style.display = 'none';
                    container.innerHTML = '';
                    delete container.dataset.commentsOpen;
                }
            }
            break;
        }
        case 'toggle-ai-chat':
            setState({ isAiChatOpen: !state.isAiChatOpen });
            break;
        case 'generate-post-content': {
            const modal = document.getElementById('create-post-modal');
            const promptInput = modal.querySelector('input[name="aiPrompt"]');
            const contentTextarea = modal.querySelector('textarea[name="content"]');
            if(promptInput.value) {
                actionTarget.disabled = true;
                actionTarget.innerHTML = 'Generating...';
                geminiService.generatePostContent(promptInput.value).then(text => {
                    contentTextarea.value = text;
                    actionTarget.disabled = false;
                    actionTarget.innerHTML = `${Icons.SparklesIcon()}<span>Generate</span>`;
                });
            }
            break;
        }
    }
});

document.addEventListener('submit', e => {
    e.preventDefault();
    const form = e.target;

    switch(form.id) {
        case 'login-form': {
            const email = form.querySelector('#email').value;
            const password = form.querySelector('#password').value;
            const rememberMe = form.querySelector('#remember-me').checked;
            if (rememberMe) {
                localStorage.setItem('rememberedEmail', email);
            } else {
                localStorage.removeItem('rememberedEmail');
            }
            handleLogin(email, password);
            break;
        }
        case 'signup-form': {
            const name = form.querySelector('#name').value;
            const email = form.querySelector('#email').value;
            const password = form.querySelector('#password').value;
            if (password.length < 6) {
                setState({ authError: "Password must be at least 6 characters long." });
                return;
            }
            handleSignUp(name, email, password);
            break;
        }
        case 'create-post-form': {
            const content = form.querySelector('textarea[name="content"]').value;
            if (!content.trim()) return;
            handleAddPost(content, null); // For simplicity, image upload not implemented in this version
            break;
        }
        case 'ai-chat-form': {
            const input = form.querySelector('input[name="ai-input"]');
            if(input.value.trim()) {
                handleAiSendMessage(input.value);
                input.value = '';
            }
            break;
        }
    }

    if (form.dataset.action === 'add-comment') {
        const { postId } = form.dataset;
        const input = form.querySelector('input[name="comment"]');
        if (input.value.trim()) {
            handleAddComment(postId, input.value.trim());
            input.value = '';
        }
    }
});


// --- INITIALIZATION ---
function initialize() {
    supabaseClient.auth.onAuthStateChange(async (_event, session) => {
        setState({ session: session });
        if (session) {
            const { data: profile } = await supabaseClient.from('profiles').select('*').eq('id', session.user.id).single();
            if (profile) {
                setState({ currentUser: profile });
                fetchAllData();
            }
        } else {
            setState({ currentUser: null, loading: false });
        }
    });

    supabaseClient.auth.getSession().then(({ data: { session } }) => {
        setState({ session: session });
        if (session) {
             supabaseClient.from('profiles').select('*').eq('id', session.user.id).single().then(({data}) => {
                if (data) {
                    setState({ currentUser: data });
                }
                fetchAllData();
             });
        } else {
            setState({ loading: false });
        }
    });
}

// Start the app
initialize();
