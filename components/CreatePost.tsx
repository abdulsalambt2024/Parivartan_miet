
import React, { useState, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../constants';
import { Icons } from './Icons';
import { geminiService } from '../services/geminiService';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export default function CreatePost({ profile, onPostCreated, showNotification }) {
    const [content, setContent] = useState('');
    const [imageFile, setImageFile] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const fileInputRef = useRef(null);

    const handleImageChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setImageFile(e.target.files[0]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!content.trim() || !profile) return;

        setIsSubmitting(true);

        // Content Moderation
        const moderationResult = await geminiService.moderateContent(content);
        if (moderationResult === 'UNSAFE') {
            showNotification('Your post contains inappropriate content and cannot be published.', 'error');
            setIsSubmitting(false);
            return;
        }

        let imageUrl = null;
        if (imageFile) {
            const fileName = `${profile.id}/${Date.now()}-${imageFile.name}`;
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('post_images')
                .upload(fileName, imageFile);

            if (uploadError) {
                console.error('Error uploading image:', uploadError);
                showNotification('Failed to upload image.', 'error');
                setIsSubmitting(false);
                return;
            }

            const { data: urlData } = supabase.storage.from('post_images').getPublicUrl(uploadData.path);
            imageUrl = urlData.publicUrl;
        }

        const { error: insertError } = await supabase.from('posts').insert({
            content,
            profile_id: profile.id,
            image_url: imageUrl,
        });

        if (insertError) {
            console.error('Error creating post:', insertError);
            showNotification('Failed to create post.', 'error');
        } else {
            showNotification('Post created successfully!');
            setContent('');
            setImageFile(null);
            if(fileInputRef.current) fileInputRef.current.value = "";
            onPostCreated();
        }
        setIsSubmitting(false);
    };

    return (
        <div className="bg-card p-5 rounded-lg shadow-sm border border-border">
            <form onSubmit={handleSubmit}>
                <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Share something with the group..."
                    className="w-full p-2 bg-input border border-border rounded-md focus:ring-2 focus:ring-ring"
                    rows="3"
                    disabled={isSubmitting}
                ></textarea>
                <div className="flex justify-between items-center mt-3">
                    <div>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="hidden"
                            ref={fileInputRef}
                            disabled={isSubmitting}
                        />
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="p-2 text-muted-foreground hover:text-primary transition-colors"
                            aria-label="Add photo"
                            disabled={isSubmitting}
                        >
                            {Icons.PhotographIcon()}
                        </button>
                         {imageFile && <span className="text-sm text-muted-foreground ml-2">{imageFile.name}</span>}
                    </div>
                    <button
                        type="submit"
                        disabled={!content.trim() || isSubmitting}
                        className="px-4 py-2 bg-primary text-primary-foreground font-semibold rounded-md hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
                    >
                        {isSubmitting ? 'Posting...' : 'Post'}
                    </button>
                </div>
            </form>
        </div>
    );
}
