
import React from 'react';

const sqlScripts = [
  {
    title: '1. Create `profiles` table',
    description: 'Stores user profile data, including their role.',
    code: `CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'MEMBER' NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add a check constraint for allowed roles
ALTER TABLE profiles ADD CONSTRAINT role_check CHECK (role IN ('SUPER_ADMIN', 'ADMIN', 'MEMBER', 'VIEWER'));`
  },
  {
    title: '2. Create `posts` table',
    description: 'Stores posts created by users.',
    code: `CREATE TABLE posts (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  profile_id UUID NOT NULL REFERENCES profiles (id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);`
  },
  {
    title: '3. Create `events` table',
    description: 'Stores event information created by admins.',
    code: `CREATE TABLE events (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  created_by UUID NOT NULL REFERENCES profiles (id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  event_date DATE NOT NULL,
  event_time TIME NOT NULL,
  location TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);`
  },
  {
    title: '4. Set up Storage Buckets',
    description: 'Create buckets for post images and user avatars.',
    code: `-- In the Supabase dashboard, go to Storage and create two new buckets:
-- 1. Name: post_images (make this a public bucket)
-- 2. Name: avatars (make this a public bucket)`
  },
  {
    title: '5. Enable Row Level Security (RLS)',
    description: 'Secure your tables with policies.',
    code: `-- Enable RLS for all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view all profiles
CREATE POLICY "Allow all users to view profiles" ON profiles FOR SELECT USING (true);

-- Policy: Users can insert/update their own profile
CREATE POLICY "Allow users to manage their own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Allow users to update their own profile" ON profiles FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Policy: Users can view all posts and events
CREATE POLICY "Allow all users to view posts" ON posts FOR SELECT USING (true);
CREATE POLICY "Allow all users to view events" ON events FOR SELECT USING (true);

-- Policy: Authenticated users can create posts
CREATE POLICY "Allow authenticated users to create posts" ON posts FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Policy: Admins/Super Admins can create events
CREATE POLICY "Allow admins to create events" ON events FOR INSERT WITH CHECK (
  (SELECT role FROM profiles WHERE id = auth.uid()) IN ('ADMIN', 'SUPER_ADMIN')
);`
  },
];


export default function SetupGuide({ onClose, onRetry }) {
  const handleCopy = (code) => {
    navigator.clipboard.writeText(code);
    alert('Copied to clipboard!');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-card text-card-foreground rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] flex flex-col">
        <div className="p-6 border-b border-border">
          <h2 className="text-2xl font-bold">Database Setup Guide</h2>
          <p className="text-muted-foreground mt-1">
            Your application tables are not set up. Please run the following SQL scripts in your Supabase SQL Editor.
          </p>
        </div>
        <div className="p-6 overflow-y-auto space-y-6">
          {sqlScripts.map((script, index) => (
            <div key={index}>
              <h3 className="font-semibold text-lg">{script.title}</h3>
              <p className="text-sm text-muted-foreground mb-2">{script.description}</p>
              <div className="bg-muted p-4 rounded-md relative">
                <pre className="text-sm whitespace-pre-wrap"><code>{script.code}</code></pre>
                <button
                  onClick={() => handleCopy(script.code)}
                  className="absolute top-2 right-2 px-2 py-1 text-xs bg-primary text-primary-foreground rounded hover:opacity-80"
                >
                  Copy
                </button>
              </div>
            </div>
          ))}
        </div>
        <div className="p-6 border-t border-border flex justify-end space-x-4">
          <button onClick={onClose} className="px-4 py-2 bg-muted text-muted-foreground font-semibold rounded-md hover:bg-border">
            Close
          </button>
           <button onClick={() => { onRetry(); onClose(); }} className="px-4 py-2 bg-primary text-primary-foreground font-semibold rounded-md hover:opacity-90">
            I've run the scripts, Retry
          </button>
        </div>
      </div>
    </div>
  );
}
