import React, { useEffect, useState } from 'react';
import type { AppNotification } from '../types';
import { TrophyIcon, AnnouncementIcon } from './Icons';

interface NotificationToastProps {
  notification: AppNotification;
  onClose: () => void;
}

const NotificationToast: React.FC<NotificationToastProps> = ({ notification, onClose }) => {
    const [isExiting, setIsExiting] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsExiting(true);
            const closeTimer = setTimeout(onClose, 300); // Allow time for exit animation
            return () => clearTimeout(closeTimer);
        }, 5000);

        return () => clearTimeout(timer);
    }, [onClose]);

    const handleClose = () => {
        setIsExiting(true);
        setTimeout(onClose, 300);
    };

    const isAchievement = notification.badge;

    return (
        <div 
            className={`
                bg-card text-card-foreground rounded-xl shadow-2xl p-4 flex items-start space-x-4 border-l-4
                ${isAchievement ? 'border-secondary' : 'border-sky-500'}
                transform transition-all duration-300 ease-in-out
                ${isExiting ? 'opacity-0 translate-x-full' : 'opacity-100 translate-x-0'}
            `}
            role="alert"
        >
            {notification.imageUrl && (
                <img src={notification.imageUrl} alt="Notification image" className="w-16 h-16 rounded-lg object-cover" />
            )}
            <div className={`flex-shrink-0 ${isAchievement ? 'text-secondary' : 'text-sky-500'}`}>
                {isAchievement ? <TrophyIcon className="w-8 h-8"/> : <AnnouncementIcon className="w-8 h-8"/>}
            </div>
            <div className="flex-grow">
                <p className="font-bold">{notification.title}</p>
                <p className="text-sm text-muted-foreground">{notification.content}</p>
            </div>
            <button onClick={handleClose} className="text-muted-foreground hover:text-foreground">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
        </div>
    );
};

export default NotificationToast;