import React, { useState, useEffect } from 'react';
import { Task, User, Role } from '../types';

interface CreateTaskProps {
  onClose: () => void;
  onSaveTask: (task: Omit<Task, 'id' | 'createdAt' | 'creatorId' | 'status'> | Task) => void;
  taskToEdit?: Task | null;
  users: User[];
}

const CreateTask: React.FC<CreateTaskProps> = ({ onClose, onSaveTask, taskToEdit, users }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [assigneeId, setAssigneeId] = useState<string | undefined>(undefined);

  const isEditing = !!taskToEdit;
  const memberUsers = users.filter(u => u.role !== Role.GUEST);

  useEffect(() => {
    if (isEditing) {
      setTitle(taskToEdit.title);
      setDescription(taskToEdit.description);
      setDueDate(new Date(taskToEdit.dueDate).toISOString().split('T')[0]);
      setAssigneeId(taskToEdit.assigneeId);
    }
  }, [taskToEdit, isEditing]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !dueDate) {
        alert("Please provide at least a title and a due date.");
        return;
    };
    
    const taskData = {
      title,
      description,
      dueDate: new Date(dueDate),
      assigneeId,
    };

    if (isEditing) {
        onSaveTask({ ...taskToEdit, ...taskData });
    } else {
        onSaveTask(taskData);
    }
    
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg transform transition-all" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-dark">{isEditing ? 'Edit Task' : 'Create New Task'}</h2>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
            <input
              type="text"
              placeholder="Task Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition"
              required
            />
            <textarea
              className="w-full h-24 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition"
              placeholder="Description (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            ></textarea>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                    <input
                        type="date"
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition"
                        required
                    />
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Assign To</label>
                     <select
                        value={assigneeId || ''}
                        onChange={(e) => setAssigneeId(e.target.value || undefined)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition bg-white"
                     >
                        <option value="">Unassigned</option>
                        {memberUsers.map(user => (
                            <option key={user.id} value={user.id}>{user.name}</option>
                        ))}
                     </select>
                </div>
            </div>
            
          </div>
          <div className="p-6 bg-gray-50 rounded-b-2xl flex justify-end space-x-3">
            <button type="button" onClick={onClose} className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 transition">Cancel</button>
            <button type="submit" className="px-6 py-2 bg-secondary text-dark rounded-lg font-bold hover:opacity-90 transition">{isEditing ? 'Save Changes' : 'Create Task'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTask;
