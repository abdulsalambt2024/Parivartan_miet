import React, { useState, useRef, useEffect, useMemo } from 'react';
import type { ChatMessage, User, Role } from '../types';
import { ImageIcon, SendIcon, VerifiedIcon } from './Icons';

interface ChatPageProps {
    currentUser: User;
    users: User[];
    messages: ChatMessage[];
    onSendMessage: (message: Omit<ChatMessage, 'id' | 'createdAt'>) => void;
}

const ChatPage: React.FC<ChatPageProps> = ({ currentUser, users, messages, onSendMessage }) => {
    const [newMessage, setNewMessage] = useState('');
    const [image, setImage] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const usersById = useMemo(() => new Map(users.map(u => [u.id, u])), [users]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImage(reader.result as string);
            };
            reader.readAsDataURL(e.target.files[0]);
        }
    };

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() && !image) return;
        
        onSendMessage({
            authorId: currentUser.id,
            content: newMessage,
            imageUrl: image || undefined
        });

        setNewMessage('');
        setImage(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const MessageItem = ({ msg }: { msg: ChatMessage }) => {
        const author = usersById.get(msg.authorId);
        const isMe = author?.id === currentUser.id;
        const isAdmin = author?.role === Role.ADMIN;

        if (!author) return null;

        return (
            <div className={`flex items-end gap-2 ${isMe ? 'justify-end' : ''}`}>
                {!isMe && <img src={author.avatarUrl} alt={author.name} className="w-8 h-8 rounded-full" />}
                <div className={`max-w-xs md:max-w-md lg:max-w-lg rounded-xl px-4 py-2 ${isMe ? 'bg-primary text-white' : 'bg-white shadow-sm'}`}>
                    {!isMe && (
                        <div className="font-bold text-sm flex items-center gap-1 text-primary">
                          <span>{author.name}</span>
                          {isAdmin && <VerifiedIcon className="w-4 h-4 text-accent" />}
                        </div>
                    )}
                    {msg.imageUrl && <img src={msg.imageUrl} alt="chat attachment" className="rounded-lg my-2 max-h-48" />}
                    {msg.content && <p className="text-base whitespace-pre-wrap">{msg.content}</p>}
                    <p className={`text-xs mt-1 ${isMe ? 'text-blue-200' : 'text-gray-500'} text-right`}>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
                 {isMe && <img src={author.avatarUrl} alt={author.name} className="w-8 h-8 rounded-full" />}
            </div>
        )
    }

    return (
        <div className="flex flex-col h-full bg-light">
            <div className="p-4 border-b bg-white/80 backdrop-blur-sm sticky top-0">
                 <h1 className="text-2xl font-bold text-dark">Group Chat</h1>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map(msg => (
                    <MessageItem key={msg.id} msg={msg} />
                ))}
                <div ref={messagesEndRef} />
            </div>
            <div className="p-4 bg-white border-t">
                 {image && (
                    <div className="relative w-32 mb-2">
                        <img src={image} alt="preview" className="rounded-lg h-32 w-32 object-cover"/>
                        <button 
                            onClick={() => {
                                setImage(null);
                                if (fileInputRef.current) fileInputRef.current.value = '';
                            }} 
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full h-6 w-6 flex items-center justify-center font-bold text-sm"
                        >&times;</button>
                    </div>
                 )}
                <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                    <input type="file" accept="image/*" onChange={handleImageUpload} ref={fileInputRef} className="hidden" id="image-upload" />
                    <button type="button" onClick={() => fileInputRef.current?.click()} className="p-2 text-gray-500 hover:text-primary transition rounded-full hover:bg-gray-100">
                        <ImageIcon className="w-6 h-6" />
                    </button>
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 p-3 border border-gray-300 rounded-full focus:ring-2 focus:ring-primary focus:border-primary transition"
                    />
                    <button type="submit" className="bg-primary text-white rounded-full p-3 hover:bg-opacity-90 transition disabled:bg-gray-400" disabled={!newMessage.trim() && !image}>
                        <SendIcon className="w-6 h-6" />
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ChatPage;
