
import React from 'react';

const sqlSchemas = {
  profiles: `
-- 1. Create Profiles Table
-- This table stores user profile information.
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'MEMBER'
);
-- 2. Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
-- 3. Create Policies for Profiles
-- Allow users to see their own profile.
CREATE POLICY "Allow individual read access" ON public.profiles FOR SELECT USING (auth.uid() = id);
-- Allow users to update their own profile.
CREATE POLICY "Allow individual update access" ON public.profiles FOR UPDATE USING (auth.uid() = id);
  `,
  posts: `
-- 1. Create Posts Table
CREATE TABLE public.posts (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  content TEXT NOT NULL,
  image_url TEXT,
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE
);
-- 2. Enable Row Level Security
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
-- 3. Create Policies for Posts
-- Allow anyone to read all posts.
CREATE POLICY "Allow public read access" ON public.posts FOR SELECT USING (true);
-- Allow authenticated users to insert their own posts.
CREATE POLICY "Allow individual insert access" ON public.posts FOR INSERT WITH CHECK (auth.uid() = profile_id);
  `,
  events: `
-- 1. Create Events Table
CREATE TABLE public.events (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  title TEXT NOT NULL,
  description TEXT,
  event_date DATE NOT NULL,
  event_time TIME,
  location TEXT,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL
);
-- 2. Enable Row Level Security
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
-- 3. Create Policies for Events
-- Allow anyone to read all events.
CREATE POLICY "Allow public read access" ON public.events FOR SELECT USING (true);
-- Allow authenticated users to insert events.
CREATE POLICY "Allow individual insert access" ON public.events FOR INSERT WITH CHECK (auth.uid() = created_by);
  `,
};

const CodeBlock = ({ code }) => (
  <pre className="bg-gray-800 text-white p-4 rounded-md overflow-x-auto text-sm font-mono">
    <code>{code.trim()}</code>
  </pre>
);

export default function SetupGuide({ onRetry }) {
  return (
    <div className="fixed inset-0 bg-background/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6 md:p-8">
        <h1 className="text-2xl md:text-3xl font-bold text-primary mb-4">Database Setup Required</h1>
        <p className="text-muted-foreground mb-6">
          Welcome! Your database tables seem to be missing. To get the app running, please run the following SQL queries in your Supabase project's <strong>SQL Editor</strong>.
        </p>
        
        <div className="space-y-6">
          <div>
            <h2 className="text-lg md:text-xl font-semibold mb-2">Step 1: Create 'profiles' Table</h2>
            <p className="text-sm text-muted-foreground mb-3">Stores user data and links to Supabase Authentication.</p>
            <CodeBlock code={sqlSchemas.profiles} />
          </div>

          <div>
            <h2 className="text-lg md:text-xl font-semibold mb-2">Step 2: Create 'posts' Table</h2>
            <p className="text-sm text-muted-foreground mb-3">Stores user-generated posts for the main feed.</p>
            <CodeBlock code={sqlSchemas.posts} />
          </div>

          <div>
            <h2 className="text-lg md:text-xl font-semibold mb-2">Step 3: Create 'events' Table</h2>
            <p className="text-sm text-muted-foreground mb-3">Stores event information for the events page.</p>
            <CodeBlock code={sqlSchemas.events} />
          </div>
          
          <div>
            <h2 className="text-lg md:text-xl font-semibold mb-2">Step 4: Create Storage Bucket</h2>
            <p className="text-sm text-muted-foreground mb-3">Used for storing images uploaded with posts. This must be done in the Supabase dashboard UI.</p>
             <div className="bg-gray-800 text-white p-4 rounded-md text-sm space-y-1">
                <p>1. Navigate to <strong>Storage</strong> in your Supabase dashboard.</p>
                <p>2. Click <strong>Create a new bucket</strong>.</p>
                <p>3. Enter <code className="bg-gray-700 px-1 rounded mx-1">post_images</code> as the bucket name.</p>
                <p>4. Check the box for <strong>Public bucket</strong>.</p>
                <p>5. Click <strong>Create bucket</strong>.</p>
                <p className="mt-4 opacity-80">After creating the bucket, you may need to set up Storage policies for uploads.</p>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-muted-foreground mb-4">After you have run the scripts and created the bucket, click the button below to retry.</p>
          <button
            onClick={onRetry}
            className="px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-md hover:opacity-90 transition-opacity"
          >
            I've set up my database, Retry Connection
          </button>
        </div>
      </div>
    </div>
  );
}
