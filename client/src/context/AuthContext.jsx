
import {
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';
import { io } from 'socket.io-client';
import API_URL from '../utils/api.js';

const AuthContext = createContext(null);

const dismissedPostAlertsKey = userId =>
  `nexus_dismissed_post_alerts_${userId}`;

const getDismissedPostAlertIds = userId => {
  if (!userId) return new Set();

  try {
    const stored = localStorage.getItem(dismissedPostAlertsKey(userId));
    const ids = stored ? JSON.parse(stored) : [];
    if (!Array.isArray(ids)) {
      throw new Error('Dismissed post alerts are not stored as a list.');
    }
    return new Set(ids.map(String));
  } catch (error) {
    console.error('Failed to read dismissed post alerts:', error);
    return new Set();
  }
};

const getStoredUser = () => {
  try {
    const raw = localStorage.getItem('nexus_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    localStorage.removeItem('nexus_user');
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(
    () => localStorage.getItem('nexus_token') || '',
  );

  const [user, setUser] = useState(getStoredUser);

  // Real-time notification queues
  const [userNotifications, setUserNotifications] = useState([]);
  const [adminNotifications, setAdminNotifications] = useState([]);
  const [commentReadStates, setCommentReadStates] = useState({});

  const isAuthenticated = Boolean(token && user && user.isVerified);
  const isAdmin = Boolean(isAuthenticated && user.role === 'admin');
  const isRegularUser = Boolean(isAuthenticated && user.role === 'user');

  useEffect(() => {
    if (!isRegularUser || !user?._id) return;

    fetch(`${API_URL}/api/blogs/recent`)
      .then(res => {
        if (!res.ok) throw new Error('Could not load recent post alerts.');
        return res.json();
      })
      .then(data => {
        const dismissedIds = getDismissedPostAlertIds(user._id);
        setUserNotifications(prev => {
          const existingIds = new Set(prev.map(notification => notification.id));
          const recentPosts = (data.blogs || [])
            .filter(
              post =>
                !existingIds.has(String(post._id)) &&
                !dismissedIds.has(String(post._id)),
            )
            .map(post => ({
              id: String(post._id),
              type: 'post',
              title: `Recent ${post.category} Story: ${post.title}`,
              slug: post.slug,
              createdAt: post.createdAt,
              read: false,
            }));

          return [...prev, ...recentPosts];
        });
      })
      .catch(error => {
        console.error('Failed to load recent post alerts:', error);
      });
  }, [isRegularUser, user?._id]);

  useEffect(() => {
    const socket = io(API_URL, {
      auth: token ? { token } : {},
    });

    // Public notification: available to all connected visitors
    socket.on('new_post_published', post => {
      const postId = String(post.id || post._id);
      if (getDismissedPostAlertIds(user?._id).has(postId)) return;

      setUserNotifications(prev => {
        if (prev.some(notification => notification.id === postId)) return prev;

        return [
          {
            id: postId,
            type: 'post',
            title: `New ${post.category} Story: ${post.title}`,
            slug: post.slug,
            createdAt: new Date().toISOString(),
            read: false,
          },
          ...prev,
        ];
      });
    });

    // Admin-only notifications
    if (isAdmin) {
      socket.on('new_subscriber', sub => {
        setAdminNotifications(prev => [
          {
            id: `sub-${sub._id || Date.now()}`,
            type: 'subscriber',
            title: `New Subscriber: ${sub.email}`,
            createdAt: sub.createdAt || new Date().toISOString(),
            read: false,
          },
          ...prev,
        ]);
      });

      socket.on('new_comment_posted', comment => {
        setAdminNotifications(prev => [
          {
            id: `cmt-${comment._id || Date.now()}`,
            type: 'comment',
            blogId: comment.blogId,
            commentId: comment._id,
            title: `${comment.name} commented on "${comment.blogTitle}"`,
            subtitle: comment.content,
            createdAt: comment.createdAt || new Date().toISOString(),
            read: false,
          },
          ...prev,
        ]);
      });

      socket.on(
        'comment_read_state_changed',
        ({ blogId, commentId, isRead }) => {
          const stateKey = `${blogId}:${commentId}`;

          setCommentReadStates(prev => ({
            ...prev,
            [stateKey]: isRead,
          }));

          setAdminNotifications(prev =>
            prev.map(notification =>
              notification.type === 'comment' &&
              String(notification.blogId) === String(blogId) &&
              String(notification.commentId) === String(commentId)
                ? { ...notification, read: isRead }
                : notification,
            ),
          );
        },
      );
    }

    return () => {
      socket.disconnect();
    };
  }, [token, isAdmin, user?._id]);

  const saveSession = (jwtToken, userObj) => {
    setToken(jwtToken);
    setUser(userObj);

    localStorage.setItem('nexus_token', jwtToken);
    localStorage.setItem('nexus_user', JSON.stringify(userObj));
  };

  const updateBookmarks = bookmarks => {
    if (!user) return;
    const updatedUser = { ...user, bookmarks };
    setUser(updatedUser);
    localStorage.setItem('nexus_user', JSON.stringify(updatedUser));
  };

  const logout = () => {
    setToken('');
    setUser(null);

    localStorage.removeItem('nexus_token');
    localStorage.removeItem('nexus_user');

    setAdminNotifications([]);
    setCommentReadStates({});
  };

  const clearNotifications = scope => {
    if (scope === 'user') {
      const userId = user?._id;
      if (!userId) {
        setUserNotifications([]);
        return;
      }

      const dismissedIds = getDismissedPostAlertIds(userId);
      userNotifications.forEach(notification =>
        dismissedIds.add(String(notification.id)),
      );

      try {
        localStorage.setItem(
          dismissedPostAlertsKey(userId),
          JSON.stringify([...dismissedIds]),
        );
        setUserNotifications([]);
      } catch (error) {
        console.error('Failed to save dismissed post alerts:', error);
      }
    }
    if (scope === 'admin') setAdminNotifications([]);
  };

  const value = {
    apiUrl: API_URL,
    token,
    user,

    isAuthenticated,
    isAdmin,
    isRegularUser,

    saveSession,
    updateBookmarks,
    logout,

    userNotifications,
    adminNotifications,
    commentReadStates,
    clearNotifications,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);
