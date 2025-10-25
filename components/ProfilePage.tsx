import React, { useState, useMemo } from 'react';
// FIX: Changed import for 'Role' from type-only to a value import to allow its use in runtime enum comparisons.
import { Role, type User, type Post } from '../types';
import { PlusIcon, TrashIcon } from './Icons';
import CreateMember from './CreateMember';

// Re-defining PostCard here to avoid circular dependency or excessive prop drilling
// In a larger app, this would be a shared component.
interface PostCardProps {
    post: Post;
    author?: User;
    onDelete: (postId: string) => void;
    canDelete: boolean;
}

const PostCard: React.FC<PostCardProps> = ({ post, author, onDelete, canDelete }) => (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
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
         {post.imageUrl && (
            <img className="h-64 w-full object-cover" src={post.imageUrl} alt="Post image" />
        )}
    </div>
);


const AdminPanel = ({ users, onAddUser, onDeleteUser }: { users: User[], onAddUser: (user: Omit<User, 'id' | 'role' | 'avatarUrl' | 'email'>) => void, onDeleteUser: (userId: string) => void }) => {
    const [isAddingMember, setIsAddingMember] = useState(false);
    return (
        <div className="mt-12">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-dark">Member Management</h2>
                <button
                    onClick={() => setIsAddingMember(true)}
                    className="flex items-center space-x-2 bg-secondary text-dark font-bold px-6 py-3 rounded-full shadow-lg hover:opacity-90 transition"
                >
                    <PlusIcon className="w-5 h-5" />
                    <span>Add Member</span>
                </button>
            </div>
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
                            {user.role === Role.MEMBER && (
                                <button
                                    onClick={() => onDeleteUser(user.id)}
                                    className="text-gray-500 hover:text-red-500 p-2 rounded-full hover:bg-red-100 transition"
                                    aria-label={`Remove ${user.name}`}
                                >
                                    <TrashIcon className="w-5 h-5" />
                                </button>
                            )}
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
    onDeletePost: (postId: string) => void;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ currentUser, users, posts, onAddUser, onDeleteUser, onDeletePost }) => {
    const userPosts = useMemo(() => posts.filter(p => p.authorId === currentUser.id), [posts, currentUser.id]);
    const usersById = useMemo(() => new Map(users.map(u => [u.id, u])), [users]);
    const isAdmin = currentUser.role === Role.ADMIN;

    return (
        <div className="p-8">
            <div className="bg-white rounded-2xl shadow-lg p-8 flex items-center space-x-8 mb-8">
                <img src={currentUser.avatarUrl} alt={currentUser.name} className="w-32 h-32 rounded-full object-cover border-4 border-secondary"/>
                <div>
                    <h1 className="text-4xl font-extrabold text-dark">{currentUser.name}</h1>
                    <p className="text-gray-500 text-lg">@{currentUser.username}</p>
                    <span className={`mt-2 inline-block px-4 py-1 text-md font-semibold rounded-full ${isAdmin ? 'bg-primary/10 text-primary' : 'bg-gray-200 text-gray-800'}`}>
                        {currentUser.role}
                    </span>
                </div>
            </div>

            <h2 className="text-3xl font-bold text-dark mb-6">My Posts</h2>
            <div className="grid gap-8">
                {userPosts.length > 0 ? userPosts.map(post => (
                    <PostCard
                        key={post.id}
                        post={post}
                        author={usersById.get(post.authorId)}
                        onDelete={onDeletePost}
                        canDelete={true} // It's their own post
                    />
                )) : <p className="text-gray-500 bg-white p-6 rounded-xl shadow-md">You haven't created any posts yet.</p>}
            </div>

            {isAdmin && (
                <AdminPanel users={users} onAddUser={onAddUser} onDeleteUser={onDeleteUser} />
            )}
        </div>
    )
};

export default ProfilePage;