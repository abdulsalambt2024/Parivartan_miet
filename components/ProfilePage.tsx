import React, { useState, useMemo, useRef, useEffect } from 'react';
// FIX: Changed import for 'Role' from type-only to a value import to allow its use in runtime enum comparisons.
import { Role, type User, type Post } from '../types';
import { PlusIcon, TrashIcon, VerifiedIcon, SpeakerIcon, EditIcon } from './Icons';
import CreateMember from './CreateMember';
import { generateSpeech } from '../services/geminiService';

// --- SHARED POST CARD COMPONENT ---
interface PostCardProps {
    post: Post;
    author?: User;
    onDelete: (postId: string) => void;
    canDelete: boolean;
    highlightedItemId: string | null;
}

export const PostCard: React.FC<PostCardProps> = ({ post, author, onDelete, canDelete, highlightedItemId }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const cardRef = useRef<HTMLDivElement>(null);
    
    useEffect(() => {
        if (post.id === highlightedItemId) {
            cardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, [highlightedItemId, post.id]);

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
    <div ref={cardRef} className={`bg-white dark:bg-gray-800 rounded-xl dark:border dark:border-gray-700 overflow-hidden transform hover:scale-[1.01] transition-all duration-500 ${post.id === highlightedItemId ? 'ring-4 ring-secondary ring-offset-2 dark:ring-offset-gray-900 shadow-xl' : 'shadow-md hover:shadow-xl'}`}>
        <div className="p-6">
             <div className="flex items-start mb-4">
                <img className="w-10 h-10 rounded-full mr-4 object-cover" src={author?.avatarUrl} alt={author?.name} />
                <div className="flex-grow">
                    <div className="flex items-center space-x-2">
                        <div className="font-bold text-dark dark:text-light text-lg">{author?.name}</div>
                        {author?.role === Role.ADMIN && <VerifiedIcon className="w-5 h-5 text-blue-500" title="Admin" />}
                    </div>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">{post.createdAt.toLocaleString()}</p>
                </div>
                <div className="flex items-center">
                    <button onClick={() => handlePlaySound(post.content)} disabled={isPlaying} className="text-gray-500 hover:text-primary dark:text-gray-400 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50">
                        <SpeakerIcon className="w-5 h-5" />
                    </button>
                    {canDelete && (
                        <button onClick={() => onDelete(post.id)} className="text-gray-500 hover:text-red-700 dark:text-gray-400 p-2 rounded-full hover:bg-red-100 dark:hover:bg-gray-700">
                            <TrashIcon className="w-5 h-5" />
                        </button>
                    )}
                </div>
            </div>
            <p className="text-gray-700 dark:text-gray-300">{post.content}</p>
        </div>
        {post.imageUrl && (
            <img className="h-64 w-full object-cover" src={post.imageUrl} alt="Post image" />
        )}
    </div>
)};


// --- EDIT PROFILE MODAL ---
interface EditProfileModalProps {
  user: User;
  onClose: () => void;
  onSave: (user: User) => void;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({ user, onClose, onSave }) => {
  const [name, setName] = useState(user.name);
  const [username, setUsername] = useState(user.username);
  const [avatar, setAvatar] = useState(user.avatarUrl);

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result as string);
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ ...user, name, username, avatarUrl: avatar });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md transform transition-all" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-dark dark:text-light">Edit Profile</h2>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4">
            <div className="flex flex-col items-center space-y-2">
                <img src={avatar} alt="Avatar preview" className="w-24 h-24 rounded-full object-cover"/>
                <input type="file" accept="image/*" onChange={handleAvatarUpload} id="avatar-upload" className="hidden"/>
                <label htmlFor="avatar-upload" className="cursor-pointer text-sm text-primary hover:underline">Change Photo</label>
            </div>
            <div>
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Full Name</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full p-2 border border-gray-300 rounded-lg bg-transparent dark:border-gray-600"/>
            </div>
             <div>
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Username</label>
                <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full p-2 border border-gray-300 rounded-lg bg-transparent dark:border-gray-600"/>
            </div>
          </div>
          <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-b-2xl flex justify-end space-x-3 border-t dark:border-gray-700">
            <button type="button" onClick={onClose} className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 dark:bg-gray-600 dark:text-light dark:hover:bg-gray-500 transition">Cancel</button>
            <button type="submit" className="px-6 py-2 bg-secondary text-dark rounded-lg font-bold hover:opacity-90 transition">Save Changes</button>
          </div>
        </form>
      </div>
    </div>
  );
};


const AdminPanel = ({ users, currentUser, onAddUser, onDeleteUser, onUpdateUserRole, onEditUser }: { users: User[], currentUser: User, onAddUser: (user: Omit<User, 'id' | 'role' | 'avatarUrl' | 'email'>) => void, onDeleteUser: (userId: string) => void, onUpdateUserRole: (userId: string, newRole: Role) => void, onEditUser: (user: User) => void }) => {
    const [isAddingMember, setIsAddingMember] = useState(false);
    return (
        <div className="mt-12">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-dark dark:text-light">Member Management</h2>
                <button
                    onClick={() => setIsAddingMember(true)}
                    className="flex items-center space-x-2 bg-secondary text-dark font-bold px-6 py-3 rounded-full shadow-lg hover:opacity-90 transition"
                >
                    <PlusIcon className="w-5 h-5" />
                    <span>Add Member</span>
                </button>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden dark:border dark:border-gray-700">
                <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                    {users.filter(u => u.role !== Role.GUEST).map(user => (
                        <li key={user.id} className="p-4 flex items-center space-x-4">
                            <img className="w-12 h-12 rounded-full object-cover" src={user.avatarUrl} alt={user.name} />
                            <div className="flex-grow">
                                <p className="font-semibold text-dark dark:text-light">{user.name}</p>
                                <p className="text-gray-500 dark:text-gray-400">@{user.username}</p>
                            </div>
                            <span className={`px-3 py-1 text-sm font-semibold rounded-full ${user.role === Role.ADMIN ? 'bg-primary/10 text-primary' : 'bg-gray-200 text-gray-800 dark:bg-gray-600 dark:text-gray-200'}`}>{user.role}</span>
                            <div className="flex items-center space-x-2 w-52 justify-end">
                                {user.role === Role.MEMBER && (
                                    <button
                                        onClick={() => onUpdateUserRole(user.id, Role.ADMIN)}
                                        className="text-xs bg-blue-100 text-blue-700 font-semibold px-3 py-1 rounded-full hover:bg-blue-200 dark:bg-blue-900/50 dark:text-blue-300 dark:hover:bg-blue-900"
                                    >
                                        Promote to Admin
                                    </button>
                                )}
                                <button
                                    onClick={() => onEditUser(user)}
                                    className="text-gray-500 hover:text-primary p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                                    aria-label={`Edit ${user.name}`}
                                >
                                    <EditIcon className="w-5 h-5" />
                                </button>
                                {user.id !== currentUser.id && ( // Prevent self-deletion
                                    <button
                                        onClick={() => onDeleteUser(user.id)}
                                        className="text-gray-500 hover:text-red-500 p-2 rounded-full hover:bg-red-100 dark:hover:bg-gray-700 transition"
                                        aria-label={`Remove ${user.name}`}
                                    >
                                        <TrashIcon className="w-5 h-5" />
                                    </button>
                                )}
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
            {isAddingMember && <CreateMember onClose={() => setIsAddingMember(false)} onSave={onAddUser} />}
        </div>
    );
};

interface ProfilePageProps {
    currentUser: User;
    users: User[];
    posts: Post[];
    onAddUser: (user: Omit<User, 'id' | 'role' | 'avatarUrl' | 'email'>) => void;
    onDeleteUser: (userId: string) => void;
    onUpdateUserRole: (userId: string, newRole: Role) => void;
    onDeletePost: (postId: string) => void;
    onUpdateUser: (user: User) => void;
    highlightedItemId: string | null;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ currentUser, users, posts, onAddUser, onDeleteUser, onUpdateUserRole, onDeletePost, onUpdateUser, highlightedItemId }) => {
    const userPosts = useMemo(() => posts.filter(p => p.authorId === currentUser.id), [posts, currentUser.id]);
    const usersById = useMemo(() => new Map(users.map(u => [u.id, u])), [users]);
    const isAdmin = currentUser.role === Role.ADMIN;
    const [editingUser, setEditingUser] = useState<User | null>(null);

    return (
        <div className="p-8">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 flex items-center space-x-8 mb-8 dark:border dark:border-gray-700 relative">
                <img src={currentUser.avatarUrl} alt={currentUser.name} className="w-32 h-32 rounded-full object-cover border-4 border-secondary"/>
                <div>
                    <h1 className="text-4xl font-extrabold text-dark dark:text-light">{currentUser.name}</h1>
                    <p className="text-gray-500 dark:text-gray-400 text-lg">@{currentUser.username}</p>
                    <span className={`mt-2 inline-block px-4 py-1 text-md font-semibold rounded-full ${isAdmin ? 'bg-primary/10 text-primary' : 'bg-gray-200 text-gray-800 dark:bg-gray-600 dark:text-gray-200'}`}>
                        {currentUser.role}
                    </span>
                </div>
                <div className="absolute top-4 right-4">
                    <button 
                        onClick={() => setEditingUser(currentUser)} 
                        className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                        aria-label="Edit your profile"
                    >
                        <EditIcon className="w-6 h-6"/>
                    </button>
                </div>
            </div>

            <h2 className="text-3xl font-bold text-dark dark:text-light mb-6">My Posts</h2>
            <div className="grid gap-8">
                {userPosts.length > 0 ? userPosts.map(post => (
                    <PostCard
                        key={post.id}
                        post={post}
                        author={usersById.get(post.authorId)}
                        onDelete={onDeletePost}
                        canDelete={true} // It's their own post
                        highlightedItemId={highlightedItemId}
                    />
                )) : <p className="text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md dark:border dark:border-gray-700">You haven't created any posts yet.</p>}
            </div>

            {isAdmin && (
                <AdminPanel users={users} currentUser={currentUser} onAddUser={onAddUser} onDeleteUser={onDeleteUser} onUpdateUserRole={onUpdateUserRole} onEditUser={setEditingUser} />
            )}
            
            {editingUser && <EditProfileModal user={editingUser} onClose={() => setEditingUser(null)} onSave={onUpdateUser} />}
        </div>
    )
};

export default ProfilePage;