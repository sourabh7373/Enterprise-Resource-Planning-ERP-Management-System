import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bell, CheckCheck } from 'lucide-react';

const NotificationList = () => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await axios.get('/api/notifications');
      setNotifications(res.data);
    } catch (error) {
      console.error('Error fetching notifications', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await axios.patch('/api/notifications/mark-all-read');
      fetchNotifications();
    } catch (error) {
      console.error('Error marking all as read', error);
    }
  };

  return (
    <div className="p-8 space-y-6 bg-[#0B1120] min-h-screen text-[#E2E8F0]">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-[#FFFFFF]">Notifications</h2>
          <p className="text-sm text-[#CBD5E1] mt-0.5">Manage your system alerts and notifications</p>
        </div>
        <button
          onClick={markAllAsRead}
          className="bg-[#1E3A5F] hover:bg-[#254675] text-[#38BDF8] border border-[#38BDF8]/30 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow flex items-center gap-2"
        >
          <CheckCheck size={16} /> Mark All as Read
        </button>
      </div>

      <div className="bg-[#0F172A] border border-[#334155] shadow-xl rounded-2xl p-6">
        {notifications.length === 0 ? (
          <div className="text-center py-12">
            <Bell size={48} className="mx-auto mb-3 text-[#94A3B8] opacity-50" />
            <h3 className="text-lg font-bold text-[#FFFFFF]">No Notifications Found</h3>
            <p className="text-sm text-[#CBD5E1] mt-1">You're all caught up! There are no unread or recent notifications.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map(n => (
              <div
                key={n._id}
                className={`p-4 rounded-xl transition-all border ${
                  n.isRead
                    ? 'bg-[#1E293B]/40 border-[#334155]/40 opacity-75'
                    : 'bg-[#1E3A5F] border-[#38BDF8]/40 shadow-md'
                }`}
              >
                <div className="flex justify-between items-start gap-3">
                  <div className="flex items-center gap-2">
                    <h4 className={`text-sm font-semibold ${n.isRead ? 'text-[#CBD5E1]' : 'text-[#FFFFFF]'}`}>
                      {n.title}
                    </h4>
                    {!n.isRead && (
                      <span className="h-2.5 w-2.5 bg-[#38BDF8] rounded-full inline-block shadow-sm"></span>
                    )}
                  </div>
                  <span className="text-xs text-[#94A3B8] font-medium shrink-0">
                    {new Date(n.createdAt).toLocaleString()}
                  </span>
                </div>
                <p className="text-sm text-[#F1F5F9] mt-2 font-normal leading-relaxed">
                  {n.message}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationList;
