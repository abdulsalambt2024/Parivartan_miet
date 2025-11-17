
import React, { useEffect, useState } from 'react';
import { Icons } from './Icons';

export default function NotificationToast({ message, type = 'success', onClose }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);
    const timer = setTimeout(() => {
      setVisible(false);
      // Allow time for fade-out animation before calling onClose
      setTimeout(onClose, 300); 
    }, 2700);

    return () => clearTimeout(timer);
  }, [message, type, onClose]);

  const getStyle = () => {
    switch(type) {
        case 'success':
            return {
                bgColor: 'bg-green-500',
                icon: Icons.GreenTickIcon('Success'),
            };
        case 'error':
            return {
                bgColor: 'bg-destructive',
                icon: Icons.XIcon('w-5 h-5'),
            };
        default: // info
             return {
                bgColor: 'bg-primary',
                icon: Icons.InfoIcon('w-5 h-5'),
             };
    }
  };

  const { bgColor, icon } = getStyle();

  return (
    <div
      className={`fixed bottom-5 right-5 flex items-center p-4 rounded-lg text-white shadow-lg transition-transform duration-300 ease-in-out ${bgColor} ${visible ? 'transform translate-y-0 opacity-100' : 'transform translate-y-10 opacity-0'}`}
      role="alert"
      aria-live="assertive"
    >
        <span className="mr-3" dangerouslySetInnerHTML={{ __html: icon }} />
        <p>{message}</p>
    </div>
  );
}
