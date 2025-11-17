
import React, { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../constants';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export default function CreateEvent({ profile, onEventCreated, showNotification }) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [eventDate, setEventDate] = useState('');
    const [eventTime, setEventTime] = useState('');
    const [location, setLocation] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title.trim() || !description.trim() || !eventDate || !eventTime || !location.trim() || !profile) {
            showNotification('Please fill all fields.', 'error');
            return;
        }

        setIsSubmitting(true);

        const { error } = await supabase.from('events').insert({
            title,
            description,
            event_date: eventDate,
            event_time: eventTime,
            location,
            created_by: profile.id,
        });

        if (error) {
            console.error('Error creating event:', error);
            showNotification('Failed to create event.', 'error');
        } else {
            showNotification('Event created successfully!');
            setTitle('');
            setDescription('');
            setEventDate('');
            setEventTime('');
            setLocation('');
            onEventCreated();
        }
        setIsSubmitting(false);
    };

    return (
        <div className="bg-card p-5 rounded-lg shadow-sm border border-border">
            <h2 className="text-lg font-semibold mb-4">Create New Event</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <input
                    type="text"
                    placeholder="Event Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full p-2 bg-input border border-border rounded-md focus:ring-2 focus:ring-ring"
                    disabled={isSubmitting}
                />
                <textarea
                    placeholder="Event Description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full p-2 bg-input border border-border rounded-md focus:ring-2 focus:ring-ring"
                    rows="3"
                    disabled={isSubmitting}
                ></textarea>
                <div className="flex space-x-4">
                    <input
                        type="date"
                        value={eventDate}
                        onChange={(e) => setEventDate(e.target.value)}
                        className="w-full p-2 bg-input border border-border rounded-md focus:ring-2 focus:ring-ring"
                        disabled={isSubmitting}
                    />
                    <input
                        type="time"
                        value={eventTime}
                        onChange={(e) => setEventTime(e.target.value)}
                        className="w-full p-2 bg-input border border-border rounded-md focus:ring-2 focus:ring-ring"
                        disabled={isSubmitting}
                    />
                </div>
                <input
                    type="text"
                    placeholder="Location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full p-2 bg-input border border-border rounded-md focus:ring-2 focus:ring-ring"
                    disabled={isSubmitting}
                />
                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="px-4 py-2 bg-primary text-primary-foreground font-semibold rounded-md hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
                    >
                        {isSubmitting ? 'Creating...' : 'Create Event'}
                    </button>
                </div>
            </form>
        </div>
    );
}
