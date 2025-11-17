
import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../constants';
import { Icons } from './Icons';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export default function Account({ session, onProfileUpdated }) {
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');

  useEffect(() => {
    let ignore = false;
    async function getProfile() {
      setLoading(true);
      const { user } = session;

      const { data, error } = await supabase
        .from('profiles')
        .select(`name, avatar_url`)
        .eq('id', user.id)
        .single();

      if (!ignore) {
        if (error && error.code !== 'PGRST116') {
          console.warn(error);
        } else if (data) {
          setName(data.name || '');
          setAvatarUrl(data.avatar_url || '');
        }
      }

      setLoading(false);
    }

    getProfile();

    return () => {
      ignore = true;
    };
  }, [session]);

  async function updateProfile(event) {
    event.preventDefault();
    setLoading(true);
    const { user } = session;

    const updates = {
      id: user.id,
      name,
      avatar_url: avatarUrl,
      updated_at: new Date(),
    };

    const { error } = await supabase.from('profiles').upsert(updates);

    if (error) {
      alert(error.message);
    } else {
      onProfileUpdated();
    }
    setLoading(false);
  }
  
  async function signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) console.error('Error signing out:', error)
  }

  return (
    <div className="max-w-md mx-auto p-8 bg-card rounded-lg shadow-lg mt-10 border border-border">
        <h1 className="text-2xl font-bold mb-6 text-center">User Profile</h1>
        <form onSubmit={updateProfile} className="space-y-4">
            <div>
                <label htmlFor="email" className="block text-sm font-medium text-muted-foreground">Email</label>
                <input id="email" type="text" value={session.user.email} disabled className="mt-1 block w-full bg-input border border-border rounded-md shadow-sm p-2 text-muted-foreground" />
            </div>
            <div>
                <label htmlFor="name" className="block text-sm font-medium text-muted-foreground">Name</label>
                <input
                    id="name"
                    type="text"
                    value={name || ''}
                    onChange={(e) => setName(e.target.value)}
                    className="mt-1 block w-full bg-input border border-border rounded-md shadow-sm p-2 focus:ring-ring focus:border-ring"
                />
            </div>
            <div>
                <label htmlFor="avatarUrl" className="block text-sm font-medium text-muted-foreground">Avatar URL</label>
                <input
                    id="avatarUrl"
                    type="text"
                    value={avatarUrl || ''}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    className="mt-1 block w-full bg-input border border-border rounded-md shadow-sm p-2 focus:ring-ring focus:border-ring"
                />
            </div>
            <div className="flex items-center justify-between pt-2">
                 <button
                    type="submit"
                    className="px-4 py-2 bg-primary text-primary-foreground font-semibold rounded-md hover:opacity-90 disabled:opacity-50"
                    disabled={loading}
                >
                    {loading ? 'Saving...' : 'Update Profile'}
                </button>
                 <button
                    type="button"
                    className="px-4 py-2 bg-muted text-muted-foreground font-semibold rounded-md hover:bg-destructive hover:text-destructive-foreground"
                    onClick={signOut}
                >
                    Sign Out
                </button>
            </div>
        </form>
    </div>
  );
}
