
import React, { useState, useCallback } from 'react';
import { generatePostContent } from '../services/geminiService';
import { SparklesIcon } from './Icons';
import type { Post, User } from '../types';

interface CreatePostProps {
  currentUser: User;
  onClose: () => void;
  onAddPost: (post: Omit<Post, 'id' | 'createdAt'>) => void;
}

const CreatePost: React.FC<CreatePostProps> = ({ currentUser, onClose, onAddPost }) => {
  const [content, setContent] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleGenerateContent = async () => {
    if (!aiPrompt) return;
    setIsGenerating(true);
    try {
      const generatedText = await generatePostContent(aiPrompt);
      setContent(generatedText);
    } catch (error) {
      console.error(error);
      // You might want to show an error to the user
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    onAddPost({
      authorId: currentUser.id,
      content,
      imageUrl: image || undefined,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl transform transition-all" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-dark">Create a New Post</h2>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4">
            <textarea
              className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition"
              placeholder={`What's on your mind, ${currentUser.name.split(' ')[0]}?`}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
            ></textarea>
            
            <div className="p-4 bg-gray-50 rounded-lg space-y-2">
              <label className="text-sm font-semibold text-gray-600">✨ Generate with AI</label>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  className="flex-grow p-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-primary focus:border-primary"
                  placeholder="e.g., A post about our weekend teaching drive"
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                />
                <button
                  type="button"
                  onClick={handleGenerateContent}
                  disabled={isGenerating || !aiPrompt}
                  className="bg-primary text-white px-4 py-2 rounded-lg font-semibold flex items-center justify-center space-x-2 hover:bg-opacity-90 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  {isGenerating ? 'Generating...' : <><SparklesIcon /><span>Generate</span></>}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Upload Image (Optional)</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
              />
            </div>
            
            {image && <img src={image} alt="Preview" className="mt-4 rounded-lg max-h-48 w-auto object-cover" />}
          </div>
          <div className="p-6 bg-gray-50 rounded-b-2xl flex justify-end space-x-3">
            <button type="button" onClick={onClose} className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 transition">Cancel</button>
            <button type="submit" className="px-6 py-2 bg-secondary text-dark rounded-lg font-bold hover:opacity-90 transition">Post</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePost;
