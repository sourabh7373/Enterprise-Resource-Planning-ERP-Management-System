import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaBell } from 'react-icons/fa6';

const NotificationDropdown = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await axios.get('/api/notifications');
      setNotifications(res.data);
    } catch (error) {
      console.error('Error fetching notifications', error);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const res = await axios.get('/api/notifications/unread-count');
      setUnreadCount(res.data.count);
    } catch (error) {
      console.error('Error fetching unread count', error);
    }
  };

  const markAsRead = async (id) => {
    try {
      await axios.patch(`/api/notifications/${id}/read`);
      fetchNotifications();
      fetchUnreadCount();
    } catch (error) {
      console.error('Error marking as read', error);
    }
  };

  return (
    <div className="relative">
      <button onClick={() => setIsOpen(!isOpen)} className="relative p-2 text-[#CBD5E1] hover:text-[#FFFFFF] transition-colors">
        <FaBell className="text-xl" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold rounded-square h-4 w-4 flex items-center justify-center shadow-md">
            {unreadCount}
          </span>
        )}
      </button>
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-[#0F172A] border border-[#334155] shadow-2xl rounded-2xl p-4 z-50 max-h-96 overflow-y-auto text-[#E2E8F0]">
          <div className="flex justify-between items-center mb-3 pb-2 border-b border-[#334155]">
            <h3 className="font-bold text-sm text-[#FFFFFF]">Notifications</h3>
            {notifications.length > 0 && (
              <button
                onClick={async () => {
                  try {
                    await axios.patch('/api/notifications/mark-all-read');
                    fetchNotifications();
                    fetchUnreadCount();
                  } catch (e) {
                    console.error('Error marking all as read', e);
                  }
                }}
                className="text-xs font-semibold text-[#38BDF8] hover:text-[#60A5FA] transition-colors"
              >
                Mark all read
              </button>
            )}
          </div>
          {notifications.length === 0 ? (
            <p className="text-[#94A3B8] text-center py-6 text-xs">No notifications</p>
          ) : (
            <div className="space-y-2">
              {notifications.map(n => (
                <div
                  key={n._id}
                  onClick={() => markAsRead(n._id)}
                  className={`p-3 rounded-xl cursor-pointer transition-all border ${
                    n.isRead
                      ? 'bg-[#1E293B]/60 border-[#334155]/40 opacity-75 hover:opacity-100 hover:bg-[#1E293B]'
                      : 'bg-[#1E3A5F] border-[#38BDF8]/40 shadow-sm hover:bg-[#254675]'
                  }`}
                >
                  <div className="flex justify-between items-start gap-2">
                    <span className={`text-xs font-semibold ${n.isRead ? 'text-[#CBD5E1]' : 'text-[#FFFFFF]'}`}>
                      {n.title}
                    </span>
                    {!n.isRead && (
                      <span className="h-2 w-2 bg-[#38BDF8] rounded-full shrink-0 mt-1 shadow-sm"></span>
                    )}
                  </div>
                  <p className="text-xs text-[#F1F5F9] mt-1 line-clamp-2 font-normal leading-relaxed">
                    {n.message}
                  </p>
                  <span className="text-[10px] text-[#94A3B8] mt-1.5 block font-medium">
                    {new Date(n.createdAt).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
