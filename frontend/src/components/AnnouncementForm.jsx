import React, { useState } from 'react';
import axios from 'axios';

const AnnouncementForm = ({ onAnnouncementCreated }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/announcements', { title, content });
      setTitle('');
      setContent('');
      if (onAnnouncementCreated) onAnnouncementCreated();
    } catch (err) {
      console.error('Error creating announcement', err);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 border rounded shadow bg-white">
      <h2 className="text-xl font-bold mb-4">Create Announcement</h2>
      <div className="mb-4">
        <label className="block mb-1">Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full p-2 border rounded"
          required
        />
      </div>
      <div className="mb-4">
        <label className="block mb-1">Content</label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full p-2 border rounded"
          required
        />
      </div>
      <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
        Post Announcement
      </button>
    </form>
  );
};

export default AnnouncementForm;
