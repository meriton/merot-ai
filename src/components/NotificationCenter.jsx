import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { employeeAPI } from '../services/api';

function NotificationCenter() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    fetchUnreadCount();

    // Poll for new notifications every 30 seconds
    const interval = setInterval(() => {
      fetchUnreadCount();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchUnreadCount = async () => {
    try {
      const response = await employeeAPI.getUnreadNotificationCount();
      setUnreadCount(response.data.unread_count);
    } catch (err) {
      console.error('Failed to fetch unread count:', err);
    }
  };

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const response = await employeeAPI.getNotifications({ per_page: 10 });
      setNotifications(response.data.notifications);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationClick = async (notification) => {
    // Mark as read
    if (!notification.read) {
      try {
        await employeeAPI.markNotificationAsRead(notification.id);
        setUnreadCount(prev => Math.max(0, prev - 1));

        // Update local state
        setNotifications(notifications.map(n =>
          n.id === notification.id ? { ...n, read: true } : n
        ));
      } catch (err) {
        console.error('Failed to mark as read:', err);
      }
    }

    // Navigate to action URL
    if (notification.action_url) {
      setIsOpen(false);
      navigate(notification.action_url);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await employeeAPI.markAllNotificationsAsRead();
      setUnreadCount(0);
      setNotifications(notifications.map(n => ({ ...n, read: true })));
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'task_assigned':
        return (
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        );
      case 'review_feedback':
      case 'annotation_approved':
        return (
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'revision_requested':
      case 'annotation_rejected':
        return (
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        );
      case 'mention':
      case 'comment_reply':
        return (
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
          </svg>
        );
      default:
        return (
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        );
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'task_assigned':
        return '#3b82f6'; // blue
      case 'annotation_approved':
        return '#10b981'; // green
      case 'revision_requested':
      case 'annotation_rejected':
        return '#ef4444'; // red
      case 'review_feedback':
        return '#f59e0b'; // amber
      case 'mention':
      case 'comment_reply':
        return '#8b5cf6'; // purple
      default:
        return '#6b7280'; // gray
    }
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const then = new Date(timestamp);
    const seconds = Math.floor((now - then) / 1000);

    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return then.toLocaleDateString();
  };

  return (
    <div className="notification-center" ref={dropdownRef}>
      {/* Bell Icon Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="notification-bell"
        aria-label="Notifications"
      >
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="bell-icon">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unreadCount > 0 && (
          <span className="unread-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="notification-dropdown">
          <div className="dropdown-header">
            <h3>Notifications</h3>
            {unreadCount > 0 && (
              <button onClick={handleMarkAllAsRead} className="mark-all-read-btn">
                Mark all as read
              </button>
            )}
          </div>

          <div className="notifications-list">
            {loading ? (
              <div className="loading-state">
                <div className="spinner"></div>
                <p>Loading notifications...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="empty-state">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="empty-icon">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
                <p>No notifications</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`notification-item ${!notification.read ? 'unread' : ''}`}
                >
                  <div
                    className="notification-icon"
                    style={{ color: getNotificationColor(notification.type) }}
                  >
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="notification-content">
                    <div className="notification-title">{notification.title}</div>
                    <div className="notification-message">{notification.message}</div>
                    <div className="notification-time">{formatTimeAgo(notification.created_at)}</div>
                  </div>
                  {!notification.read && <div className="unread-dot"></div>}
                </div>
              ))
            )}
          </div>

          <div className="dropdown-footer">
            <button onClick={() => { setIsOpen(false); navigate('/employee/notifications'); }} className="view-all-btn">
              View All Notifications
            </button>
          </div>
        </div>
      )}

      <style>{`
        .notification-center {
          position: relative;
        }

        .notification-bell {
          position: relative;
          background: none;
          border: none;
          cursor: pointer;
          padding: 8px;
          border-radius: 8px;
          transition: background 0.2s;
        }

        .notification-bell:hover {
          background: rgba(255, 255, 255, 0.1);
        }

        .bell-icon {
          width: 24px;
          height: 24px;
          color: white;
        }

        .unread-badge {
          position: absolute;
          top: 4px;
          right: 4px;
          background: #ef4444;
          color: white;
          font-size: 10px;
          font-weight: 700;
          padding: 2px 5px;
          border-radius: 10px;
          min-width: 18px;
          text-align: center;
        }

        .notification-dropdown {
          position: absolute;
          top: calc(100% + 8px);
          right: 0;
          width: 380px;
          max-height: 500px;
          background: white;
          border-radius: 12px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
          z-index: 1000;
          display: flex;
          flex-direction: column;
        }

        .dropdown-header {
          padding: 16px 20px;
          border-bottom: 1px solid #e5e7eb;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .dropdown-header h3 {
          font-size: 18px;
          font-weight: 700;
          color: #1a1a1a;
          margin: 0;
        }

        .mark-all-read-btn {
          background: none;
          border: none;
          color: #667eea;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          padding: 4px 8px;
          border-radius: 4px;
          transition: background 0.2s;
        }

        .mark-all-read-btn:hover {
          background: #f0f2ff;
        }

        .notifications-list {
          flex: 1;
          overflow-y: auto;
          max-height: 400px;
        }

        .loading-state,
        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 40px 20px;
          color: #9ca3af;
        }

        .spinner {
          width: 32px;
          height: 32px;
          border: 3px solid #f3f4f6;
          border-top-color: #667eea;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
          margin-bottom: 12px;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .empty-icon {
          width: 48px;
          height: 48px;
          margin-bottom: 12px;
        }

        .loading-state p,
        .empty-state p {
          font-size: 14px;
          margin: 0;
        }

        .notification-item {
          display: flex;
          gap: 12px;
          padding: 16px 20px;
          border-bottom: 1px solid #f3f4f6;
          cursor: pointer;
          transition: background 0.2s;
          position: relative;
        }

        .notification-item:hover {
          background: #f9fafb;
        }

        .notification-item.unread {
          background: #f0f2ff;
        }

        .notification-item.unread:hover {
          background: #e5e7ff;
        }

        .notification-icon {
          flex-shrink: 0;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: currentColor;
          opacity: 0.1;
          border-radius: 10px;
        }

        .notification-icon svg {
          width: 20px;
          height: 20px;
          position: relative;
          z-index: 1;
        }

        .notification-content {
          flex: 1;
          min-width: 0;
        }

        .notification-title {
          font-size: 14px;
          font-weight: 600;
          color: #1a1a1a;
          margin-bottom: 4px;
        }

        .notification-message {
          font-size: 13px;
          color: #6b7280;
          line-height: 1.4;
          margin-bottom: 4px;
          overflow: hidden;
          text-overflow: ellipsis;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }

        .notification-time {
          font-size: 12px;
          color: #9ca3af;
        }

        .unread-dot {
          position: absolute;
          top: 24px;
          right: 20px;
          width: 8px;
          height: 8px;
          background: #667eea;
          border-radius: 50%;
        }

        .dropdown-footer {
          padding: 12px 20px;
          border-top: 1px solid #e5e7eb;
        }

        .view-all-btn {
          width: 100%;
          background: none;
          border: none;
          color: #667eea;
          font-size: 14px;
          font-weight: 600;
          padding: 8px;
          border-radius: 6px;
          cursor: pointer;
          transition: background 0.2s;
        }

        .view-all-btn:hover {
          background: #f0f2ff;
        }

        @media (max-width: 480px) {
          .notification-dropdown {
            width: calc(100vw - 32px);
            right: -100px;
          }
        }
      `}</style>
    </div>
  );
}

export default NotificationCenter;
