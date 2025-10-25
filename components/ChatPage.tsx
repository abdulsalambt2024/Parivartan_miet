import React, { useState, useRef, useEffect, useMemo } from 'react';
// FIX: Changed import for 'Role' from type-only to a value import to allow its use in runtime enum comparisons.
import { Role, type ChatMessage, type User } from '../types';
import { ImageIcon, SendIcon, VerifiedIcon, MicrophoneIcon } from './Icons';
import { transcribeAudio } from '../services/geminiService';

// FIX: Moved MessageItem component outside of ChatPage to prevent re-definition on each render and fix 'key' prop error.
interface MessageItemProps {
    msg: ChatMessage;
    currentUser: User;
    author: User | undefined;
}

const MessageItem: React.FC<MessageItemProps> = ({ msg, currentUser, author }) => {
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

interface ChatPageProps {
    currentUser: User;
    users: User[];
    messages: ChatMessage[];
    onSendMessage: (message: Omit<ChatMessage, 'id' | 'createdAt'>) => void;
}

const ChatPage: React.FC<ChatPageProps> = ({ currentUser, users, messages, onSendMessage }) => {
    const [newMessage, setNewMessage] = useState('');
    const [image, setImage] = useState<string | null>(null);
    const [isRecording, setIsRecording] = useState(false);
    const [isTranscribing, setIsTranscribing] = useState(false);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);

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
    
    const handleToggleRecording = async () => {
        if (isRecording) {
            mediaRecorderRef.current?.stop();
            setIsRecording(false);
            setIsTranscribing(true);
        } else {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                mediaRecorderRef.current = new MediaRecorder(stream);
                mediaRecorderRef.current.ondataavailable = (event) => {
                    audioChunksRef.current.push(event.data);
                };
                mediaRecorderRef.current.onstop = async () => {
                    const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                    try {
                        const transcribedText = await transcribeAudio(audioBlob);
                        setNewMessage(transcribedText);
                    } catch (error) {
                        console.error(error);
                        alert("Transcription failed. Please try again.");
                    } finally {
                        audioChunksRef.current = [];
                        setIsTranscribing(false);
                        stream.getTracks().forEach(track => track.stop()); // Release microphone
                    }
                };
                audioChunksRef.current = [];
                mediaRecorderRef.current.start();
                setIsRecording(true);
            } catch (error) {
                console.error("Error accessing microphone:", error);
                alert("Could not access microphone. Please check permissions.");
            }
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

    return (
        <div className="flex flex-col h-full bg-light">
            <div className="p-4 border-b bg-white/80 backdrop-blur-sm sticky top-0">
                 <h1 className="text-2xl font-bold text-dark">Group Chat</h1>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map(msg => (
                    <MessageItem key={msg.id} msg={msg} currentUser={currentUser} author={usersById.get(msg.authorId)} />
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
                        placeholder={isRecording ? 'Recording...' : isTranscribing ? 'Transcribing...' : 'Type a message...'}
                        className="flex-1 p-3 border border-gray-300 rounded-full focus:ring-2 focus:ring-primary focus:border-primary transition"
                        disabled={isRecording || isTranscribing}
                    />
                    <button type="button" onClick={handleToggleRecording} className={`p-3 rounded-full transition ${isRecording ? 'bg-red-500 text-white animate-pulse' : 'text-gray-500 hover:text-primary hover:bg-gray-100'}`}>
                        <MicrophoneIcon className="w-6 h-6" />
                    </button>
                    <button type="submit" className="bg-primary text-white rounded-full p-3 hover:bg-opacity-90 transition disabled:bg-gray-400" disabled={!newMessage.trim() && !image}>
                        <SendIcon className="w-6 h-6" />
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ChatPage;